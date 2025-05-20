using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MrRSushiApi.Data;
using MrRSushiApi.Models;
using MrRSushiApi.Models.DTOs;
using System.Globalization;

namespace MrRSushiApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public OrderController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<DataCollectionApiResponseDto<Order>>> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.MenuItem)
            .ToListAsync();
            
        return new DataCollectionApiResponseDto<Order>
        {
            Success = true,
            Data = orders,
            TotalCount = orders.Count
        };
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<Order>>> GetOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == id);
            
        if (order == null)
        {
            return NotFound(new ApiResponseDto
            {
                Success = false,
                Message = "订单未找到"
            });
        }
        
        return new ApiResponseDto<Order>
        {
            Success = true,
            Data = order
        };
    }
    
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<Order>>> CreateOrder(Order order)
    {
        // Fetch menu items for validation and to get correct prices
        var menuItemIds = order.OrderItems.Select(oi => oi.MenuItemId).ToList();
        var menuItems = await _context.MenuItems
            .Where(mi => menuItemIds.Contains(mi.Id))
            .ToDictionaryAsync(mi => mi.Id);
            
        // Validate menu items and set correct prices
        foreach (var orderItem in order.OrderItems)
        {
            if (!menuItems.TryGetValue(orderItem.MenuItemId, out var menuItem))
            {
                return BadRequest(new ApiResponseDto
                {
                    Success = false,
                    Message = $"菜品ID {orderItem.MenuItemId} 不存在"
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
            
            orderItem.UnitPrice = unitPrice;
        }
        
        // Calculate total amount
        order.TotalAmount = order.OrderItems.Sum(oi => oi.UnitPrice * oi.Quantity);
        
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new ApiResponseDto<Order>
        {
            Success = true,
            Data = order,
            Message = "订单创建成功"
        });
    }
    
    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponseDto>> UpdateOrderStatus(int id, [FromBody] string status)
    {
        var order = await _context.Orders.FindAsync(id);
        
        if (order == null)
        {
            return NotFound(new ApiResponseDto
            {
                Success = false,
                Message = "订单未找到"
            });
        }
        
        // Validate status
        var validStatuses = new[] { "Pending", "Preparing", "Ready", "Delivered", "Cancelled" };
        if (!validStatuses.Contains(status))
        {
            return BadRequest(new ApiResponseDto
            {
                Success = false,
                Message = "状态无效"
            });
        }
        
        order.Status = status;
        await _context.SaveChangesAsync();
        
        return new ApiResponseDto
        {
            Success = true,
            Message = "订单状态已更新"
        };
    }
} 