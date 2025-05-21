using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MrRSushiApi.Data;
using MrRSushiApi.Models;
using MrRSushiApi.Models.DTOs;
using MrRSushiApi.Services;
using System.Text.Json; // For JSON serialization
using System.Linq; // For OrderBy
using System.Collections.Generic; // For List<T>
using System.Threading.Tasks; // For Task<T>
using System; // For DateTime

namespace MrRSushiApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    
    public CartController(ApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }
    
    // 获取购物车
    [HttpGet("{sessionId}")]
    public async Task<ActionResult<ApiResponseDto<List<CartItemDto>>>> GetCartItems(string sessionId)
    {
        var cartItemsEntities = await _context.CartItems
            .Include(ci => ci.MenuItem)
            .Where(ci => ci.SessionId == sessionId)
            .ToListAsync();

        var cartItemDtos = cartItemsEntities.Select(ci => new CartItemDto
        {
            Id = ci.Id,
            MenuItemId = ci.MenuItemId,
            Quantity = ci.Quantity,
            MenuItem = ci.MenuItem,
            AddOns = !string.IsNullOrEmpty(ci.AddOnsJson) 
                       ? JsonSerializer.Deserialize<List<AddOnDto>>(ci.AddOnsJson) 
                       : new List<AddOnDto>(),
            SessionId = ci.SessionId
        }).ToList();
            
        return new ApiResponseDto<List<CartItemDto>>
        {
            Success = true,
            Data = cartItemDtos
        };
    }
    
    // 添加物品到购物车
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<CartItemDto>>> AddToCart([FromBody] AddToCartRequestDto requestDto)
    {
        string? requestAddOnsJson = requestDto.AddOns != null && requestDto.AddOns.Any() 
                                   ? JsonSerializer.Serialize(requestDto.AddOns.OrderBy(a => a.Name)) 
                                   : null;

        var existingItem = await _context.CartItems
            .FirstOrDefaultAsync(ci => ci.SessionId == requestDto.SessionId && 
                                     ci.MenuItemId == requestDto.MenuItemId &&
                                     ((string.IsNullOrEmpty(ci.AddOnsJson) && string.IsNullOrEmpty(requestAddOnsJson)) || ci.AddOnsJson == requestAddOnsJson));
            
        CartItem itemToSave;
        if (existingItem != null)
        {
            existingItem.Quantity += requestDto.Quantity;
            itemToSave = existingItem;
        }
        else
        {
            var newCartItem = new CartItem
            {
                SessionId = requestDto.SessionId,
                MenuItemId = requestDto.MenuItemId,
                Quantity = requestDto.Quantity,
                AddOnsJson = requestAddOnsJson,
                CreatedAt = DateTime.UtcNow
            };
            _context.CartItems.Add(newCartItem);
            itemToSave = newCartItem;
        }
        
        await _context.SaveChangesAsync();
        await _context.Entry(itemToSave).Reference(ci => ci.MenuItem).LoadAsync();

        var responseDto = new CartItemDto
        {
            Id = itemToSave.Id,
            MenuItemId = itemToSave.MenuItemId,
            Quantity = itemToSave.Quantity,
            MenuItem = itemToSave.MenuItem,
            AddOns = !string.IsNullOrEmpty(itemToSave.AddOnsJson)
                        ? JsonSerializer.Deserialize<List<AddOnDto>>(itemToSave.AddOnsJson)
                        : new List<AddOnDto>(),
            SessionId = itemToSave.SessionId
        };
            
        return new ApiResponseDto<CartItemDto>
        {
            Success = true,
            Data = responseDto,
            Message = "成功添加到购物车"
        };
    }

    // DTO for UpdateCartItem payload
    public class UpdateCartQuantityRequestDto
    {
        public int Quantity { get; set; }
        // If you ever need to update AddOns simultaneously, add them here
        // public List<AddOnDto>? AddOns { get; set; }
    }
    
    // 更新购物车项数量
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponseDto<CartItemDto>>> UpdateCartItem(int id, [FromBody] UpdateCartQuantityRequestDto requestDto)
    {
        var cartItemEntity = await _context.CartItems
                                     .Include(ci => ci.MenuItem) 
                                     .FirstOrDefaultAsync(ci => ci.Id == id);
        
        if (cartItemEntity == null)
        {
            return NotFound(new ApiResponseDto<CartItemDto> { Success = false, Message = "购物车项未找到" });
        }
        
        if (requestDto.Quantity <= 0)
        {
            _context.CartItems.Remove(cartItemEntity);
            await _context.SaveChangesAsync();
            return Ok(new ApiResponseDto<CartItemDto> { Success = true, Message = "物品已从购物车中移除" });
        }
        
        cartItemEntity.Quantity = requestDto.Quantity;
        await _context.SaveChangesAsync();

        var responseDto = new CartItemDto
        {
            Id = cartItemEntity.Id,
            MenuItemId = cartItemEntity.MenuItemId,
            Quantity = cartItemEntity.Quantity,
            MenuItem = cartItemEntity.MenuItem,
            AddOns = !string.IsNullOrEmpty(cartItemEntity.AddOnsJson)
                        ? JsonSerializer.Deserialize<List<AddOnDto>>(cartItemEntity.AddOnsJson)
                        : new List<AddOnDto>(),
            SessionId = cartItemEntity.SessionId
        };
            
        return Ok(new ApiResponseDto<CartItemDto> { Success = true, Data = responseDto, Message = "购物车已更新" });
    }
    
    // 清空购物车
    [HttpDelete("{sessionId}")]
    public async Task<ActionResult<ApiResponseDto>> ClearCart(string sessionId)
    {
        var cartItems = await _context.CartItems.Where(ci => ci.SessionId == sessionId).ToListAsync();
        _context.CartItems.RemoveRange(cartItems);
        await _context.SaveChangesAsync();
        return Ok(new ApiResponseDto { Success = true, Message = "购物车已清空" });
    }
    
    // 移除单个购物车项
    [HttpDelete("item/{id}")]
    public async Task<ActionResult<ApiResponseDto>> RemoveCartItem(int id)
    {
        var cartItem = await _context.CartItems.FindAsync(id);
        if (cartItem == null) return NotFound(new ApiResponseDto { Success = false, Message = "购物车项未找到" });
        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();
        return Ok(new ApiResponseDto { Success = true, Message = "物品已从购物车中移除" });
    }
    
    // Checkout endpoint - convert cart to order
    [HttpPost("{sessionId}/checkout")]
    public async Task<ActionResult<ApiResponseDto>> Checkout(string sessionId, [FromBody] OrderCheckoutDto orderRequest)
    {
        try
        {
            var cartItems = await _context.CartItems
                .Where(ci => ci.SessionId == sessionId)
                .Include(ci => ci.MenuItem)
                .ToListAsync();

            if (!cartItems.Any()) return BadRequest(new ApiResponseDto { Success = false, Message = "购物车为空" });

            // Generate order number using 01-99 loop format
            // Get the latest order number
            int lastOrderNumber = 0;
            var latestOrder = await _context.Orders
                .OrderByDescending(o => o.Id)
                .FirstOrDefaultAsync();
                
            if (latestOrder != null && int.TryParse(latestOrder.OrderNumber, out int parsedNumber))
            {
                lastOrderNumber = parsedNumber;
            }
            
            // Increment and loop between 01-99
            int newOrderNumber = (lastOrderNumber % 99) + 1;
            string orderNumber = newOrderNumber.ToString("00");  // Format as 01-99

            var order = new Order
            {
                CustomerName = orderRequest.CustomerName,
                PhoneNumber = orderRequest.PhoneNumber,
                ReservationTime = DateTime.Parse(orderRequest.ReservationTime.ToString("yyyy-MM-dd HH:mm:ss.ffffff")),
                OrderNumber = orderNumber,
                OrderDate = DateTime.UtcNow, // Simpler UTC assignment
                Status = "Pending",
                TotalAmount = cartItems.Sum(ci => 
                {
                    decimal itemTotal = ci.Quantity * decimal.Parse(ci.MenuItem.Price.Trim('元'));
                    if (!string.IsNullOrEmpty(ci.AddOnsJson)) 
                    {
                        var addOns = JsonSerializer.Deserialize<List<AddOnDto>>(ci.AddOnsJson);
                        itemTotal += addOns.Sum(a => a.Price * ci.Quantity);
                    }
                    return itemTotal;
                })
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync(); 

            foreach (var cartItem in cartItems)
            {
                _context.OrderItems.Add(new OrderItem
                {
                    OrderId = order.Id,
                    MenuItemId = cartItem.MenuItemId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = decimal.Parse(cartItem.MenuItem.Price.Trim('元')),
                    AddOnsJson = cartItem.AddOnsJson,
                    CompanionDetails = null
                });
            }
            await _context.SaveChangesAsync();
            
            // Load the complete order with items and menu items for the email
            await _context.Entry(order)
                .Collection(o => o.OrderItems)
                .LoadAsync();
                
            foreach (var orderItem in order.OrderItems)
            {
                await _context.Entry(orderItem)
                    .Reference(oi => oi.MenuItem)
                    .LoadAsync();
            }
            
            // Send email notification
            await _emailService.SendOrderConfirmationAsync(order);
            
            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            return Ok(new ApiResponseDto { Success = true, Message = "订单创建成功", Data = new { orderNumber } });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Checkout Error: {ex.ToString()}"); // Log full exception
            return StatusCode(500, new ApiResponseDto { Success = false, Message = "服务器错误，请稍后重试" });
        }
    }
} 