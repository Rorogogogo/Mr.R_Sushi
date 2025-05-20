using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MrRSushiApi.Data;
using MrRSushiApi.Models;
using MrRSushiApi.Models.DTOs;
using System.Globalization;

namespace MrRSushiApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public CartController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    // 获取购物车
    [HttpGet("{sessionId}")]
    public async Task<ActionResult<ApiResponseDto<List<CartItem>>>> GetCartItems(string sessionId)
    {
        var cartItems = await _context.CartItems
            .Include(ci => ci.MenuItem)
            .Where(ci => ci.SessionId == sessionId)
            .ToListAsync();
            
        return new ApiResponseDto<List<CartItem>>
        {
            Success = true,
            Data = cartItems
        };
    }
    
    // 添加物品到购物车
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<CartItem>>> AddToCart(CartItem cartItem)
    {
        var existingItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.SessionId == cartItem.SessionId && ci.MenuItemId == cartItem.MenuItemId);
            
        if (existingItem != null)
        {
            // 如果已存在相同物品，增加数量
            existingItem.Quantity += cartItem.Quantity;
            _context.CartItems.Update(existingItem);
        }
        else
        {
            // 否则添加新物品
            _context.CartItems.Add(cartItem);
        }
        
        await _context.SaveChangesAsync();
        
        // 获取完整的购物车项，包括MenuItem
        int idToFind = existingItem != null ? existingItem.Id : cartItem.Id;
        var savedItem = await _context.CartItems
            .Include(ci => ci.MenuItem)
            .FirstOrDefaultAsync(ci => ci.Id == idToFind);
            
        return new ApiResponseDto<CartItem>
        {
            Success = true,
            Data = savedItem,
            Message = "成功添加到购物车"
        };
    }
    
    // 更新购物车项数量
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<CartItem>>> UpdateCartItem(int id, [FromBody] int quantity)
    {
        var cartItem = await _context.CartItems.FindAsync(id);
        
        if (cartItem == null)
        {
            return NotFound(new ApiResponseDto
            {
                Success = false,
                Message = "购物车项未找到"
            });
        }
        
        if (quantity <= 0)
        {
            // 移除购物车项
            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
            
            return new ApiResponseDto<CartItem>
            {
                Success = true,
                Message = "物品已从购物车中移除"
            };
        }
        
        cartItem.Quantity = quantity;
        await _context.SaveChangesAsync();
        
        // 获取包含MenuItem的完整购物车项
        var updatedItem = await _context.CartItems
            .Include(ci => ci.MenuItem)
            .FirstOrDefaultAsync(ci => ci.Id == id);
            
        return new ApiResponseDto<CartItem>
        {
            Success = true,
            Data = updatedItem,
            Message = "购物车已更新"
        };
    }
    
    // 清空购物车
    [HttpDelete("{sessionId}")]
    public async Task<ActionResult<ApiResponseDto>> ClearCart(string sessionId)
    {
        var cartItems = await _context.CartItems
            .Where(ci => ci.SessionId == sessionId)
            .ToListAsync();
            
        _context.CartItems.RemoveRange(cartItems);
        await _context.SaveChangesAsync();
        
        return new ApiResponseDto
        {
            Success = true,
            Message = "购物车已清空"
        };
    }
    
    // 移除单个购物车项
    [HttpDelete("item/{id}")]
    public async Task<ActionResult<ApiResponseDto>> RemoveCartItem(int id)
    {
        var cartItem = await _context.CartItems.FindAsync(id);
        
        if (cartItem == null)
        {
            return NotFound(new ApiResponseDto
            {
                Success = false,
                Message = "购物车项未找到"
            });
        }
        
        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();
        
        return new ApiResponseDto
        {
            Success = true,
            Message = "物品已从购物车中移除"
        };
    }
    
    // Checkout endpoint - convert cart to order
    [HttpPost("{sessionId}/checkout")]
    public async Task<ActionResult<ApiResponseDto<Order>>> Checkout(string sessionId, [FromBody] List<CartItemDto> cartItems)
    {
        if (cartItems == null || !cartItems.Any())
        {
            return BadRequest(new ApiResponseDto
            {
                Success = false,
                Message = "购物车为空"
            });
        }
        
        try
        {
            // Create a new order with an order number (01-99)
            Random random = new Random();
            string orderNumber = random.Next(1, 100).ToString("00");
            
            var order = new Order
            {
                OrderNumber = orderNumber,
                CustomerName = "Online Customer", // Default name for online orders
                PhoneNumber = "",                 // Can be updated later
                OrderDate = DateTime.UtcNow,
                Status = "Pending",               // Match the status values from OrderController
                OrderItems = new List<OrderItem>()
            };
            
            decimal totalAmount = 0;
            
            // Convert cart items to order items
            foreach (var cartItem in cartItems)
            {
                // Fetch the menu item for accurate pricing
                var menuItem = await _context.MenuItems.FindAsync(cartItem.MenuItemId);
                if (menuItem == null)
                {
                    return BadRequest(new ApiResponseDto
                    {
                        Success = false,
                        Message = $"菜品ID {cartItem.MenuItemId} 不存在"
                    });
                }
                
                // Convert price string like "15元" to decimal
                decimal unitPrice = 0;
                if (menuItem.Price != null)
                {
                    string priceStr = menuItem.Price.Trim('元');
                    if (decimal.TryParse(priceStr, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal price))
                    {
                        unitPrice = price;
                    }
                }
                
                // Add companion prices for pancakes
                decimal companionPrice = 0;
                string? companionDetails = null;
                
                if (cartItem.Companions != null && cartItem.Companions.Any())
                {
                    var companionPrices = new Dictionary<string, decimal>
                    {
                        { "加海苔", 3 },
                        { "加肉松", 4 },
                        { "加火腿肉", 6 },
                        { "加培根", 7 }
                    };
                    
                    foreach (var companion in cartItem.Companions)
                    {
                        if (companionPrices.TryGetValue(companion, out decimal price))
                        {
                            companionPrice += price;
                        }
                    }
                    
                    // Store companion details as comma-separated string
                    companionDetails = string.Join(", ", cartItem.Companions);
                }
                
                // Create new order item
                var orderItem = new OrderItem
                {
                    MenuItemId = cartItem.MenuItemId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = unitPrice + companionPrice, // Include companion prices
                    CompanionDetails = companionDetails // Use the CompanionDetails field
                };
                
                order.OrderItems.Add(orderItem);
                totalAmount += orderItem.UnitPrice * orderItem.Quantity;
            }
            
            order.TotalAmount = totalAmount;
            
            // Save the order
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            
            // Clear the cart
            var userCartItems = await _context.CartItems
                .Where(ci => ci.SessionId == sessionId)
                .ToListAsync();
                
            _context.CartItems.RemoveRange(userCartItems);
            await _context.SaveChangesAsync();
            
            return new ApiResponseDto<Order>
            {
                Success = true,
                Data = order,
                Message = "订单创建成功"
            };
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ApiResponseDto
            {
                Success = false,
                Message = "订单创建失败: " + ex.Message
            });
        }
    }
    
    // Add CartItemDto class to properly deserialize cart items from frontend
    public class CartItemDto
    {
        public int Id { get; set; }
        public int MenuItemId { get; set; }
        public int Quantity { get; set; }
        public List<string>? Companions { get; set; }
    }
} 