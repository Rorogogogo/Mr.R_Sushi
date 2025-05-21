using System.Text.Json.Serialization;
using System.Collections.Generic;
using System.Linq;
using MrRSushiApi.Models;

namespace MrRSushiApi.Models.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime ReservationTime { get; set; }
    public string? Address { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Unpaid";
    public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();

    // Static method to convert from Order to OrderDto
    public static OrderDto FromOrder(Order order)
    {
        var orderDto = new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerName = order.CustomerName,
            PhoneNumber = order.PhoneNumber,
            ReservationTime = order.ReservationTime,
            Address = order.Address,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            OrderItems = order.OrderItems.Select(oi => OrderItemDto.FromOrderItem(oi)).ToList()
        };
        
        return orderDto;
    }
} 