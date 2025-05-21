using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MrRSushiApi.Data;
using MrRSushiApi.Models;
using MrRSushiApi.Models.DTOs;
using MrRSushiApi.Services;
using System.Globalization;

namespace MrRSushiApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    
    public OrderController(ApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }
    
    [HttpGet]
    public async Task<ActionResult<DataCollectionApiResponseDto<OrderDto>>> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.MenuItem)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
            
        var orderDtos = orders.Select(OrderDto.FromOrder).ToList();
            
        return new DataCollectionApiResponseDto<OrderDto>
        {
            Success = true,
            Data = orderDtos,
            TotalCount = orderDtos.Count
        };
    }
    
    // Get orders by date (for admin)
    [HttpGet("bydate/{date}")]
    public async Task<ActionResult<DataCollectionApiResponseDto<OrderDto>>> GetOrdersByDate(string date)
    {
        if (!DateTime.TryParse(date, out DateTime parsedDate))
        {
            return BadRequest(new ApiResponseDto
            {
                Success = false,
                Message = "日期格式无效"
            });
        }
        
        // Get orders for the specified date (UTC)
        var startDate = DateTime.SpecifyKind(parsedDate.Date, DateTimeKind.Utc);
        var endDate = startDate.AddDays(1);
        
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.OrderDate >= startDate && o.OrderDate < endDate)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
            
        // Calculate total amount (excluding Pending orders)
        decimal totalAmount = orders
            .Where(o => o.Status != "Pending" && o.Status != "Unpaid")
            .Sum(o => o.TotalAmount);

        var orderDtos = orders.Select(OrderDto.FromOrder).ToList();
            
        return new DataCollectionApiResponseDto<OrderDto>
        {
            Success = true,
            Data = orderDtos,
            TotalCount = orderDtos.Count,
            Message = $"今日总收入: {totalAmount}元"
        };
    }
    
    // Get today's orders (for admin)
    [HttpGet("today")]
    public async Task<ActionResult<DataCollectionApiResponseDto<OrderDto>>> GetTodaysOrders()
    {
        // Get today's date in UTC
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.MenuItem)
            .Where(o => o.OrderDate >= today && o.OrderDate < tomorrow)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
            
        // Calculate total amount (excluding Pending orders)
        decimal totalAmount = orders
            .Where(o => o.Status != "Pending" && o.Status != "Unpaid")
            .Sum(o => o.TotalAmount);

        var orderDtos = orders.Select(OrderDto.FromOrder).ToList();
            
        return new DataCollectionApiResponseDto<OrderDto>
        {
            Success = true,
            Data = orderDtos,
            TotalCount = orderDtos.Count,
            Message = $"今日总收入: {totalAmount}元"
        };
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<OrderDto>>> GetOrder(int id)
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

        var orderDto = OrderDto.FromOrder(order);
        
        return new ApiResponseDto<OrderDto>
        {
            Success = true,
            Data = orderDto
        };
    }
    
    [HttpPost]
    public async Task<ActionResult<ApiResponseDto<OrderDto>>> CreateOrder(Order order)
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
        
        // Generate a random order number if not provided
        if (string.IsNullOrEmpty(order.OrderNumber))
        {
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
            order.OrderNumber = newOrderNumber.ToString("00");  // Format as 01-99
        }
        
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Load the related entities for the response
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

        var orderDto = OrderDto.FromOrder(order);
        
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new ApiResponseDto<OrderDto>
        {
            Success = true,
            Data = orderDto,
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
        
        // Validate status - updated for custom statuses
        var validStatuses = new[] { "Pending", "Paid", "Completed", "Cancelled", "Unpaid", "已确认付款", "已取货" };
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
    
    // Delete an order (for admin)
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponseDto>> DeleteOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);
            
        if (order == null)
        {
            return NotFound(new ApiResponseDto
            {
                Success = false,
                Message = "订单未找到"
            });
        }
        
        // Remove order items first
        _context.OrderItems.RemoveRange(order.OrderItems);
        
        // Then remove the order
        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        
        return new ApiResponseDto
        {
            Success = true,
            Message = "订单已删除"
        };
    }
} 