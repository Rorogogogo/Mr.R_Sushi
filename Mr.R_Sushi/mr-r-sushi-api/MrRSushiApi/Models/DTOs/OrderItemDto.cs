using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using MrRSushiApi.Models; // For OrderItem entity

namespace MrRSushiApi.Models.DTOs
{
    public class OrderItemDto
    {
        // Properties from the version previously in OrderDto.cs
        public int Id { get; set; } // Assuming this is the OrderItem's own Id
        public int OrderId { get; set; }
        // MenuItemId is already present from the other definition
        public string? CompanionDetails { get; set; }
        // MenuItemDto is already present from the other definition

        // Properties from the standalone OrderItemDto.cs we were modifying
        public int MenuItemId { get; set; } // This was already here, ensure it's not duplicated if merging manually
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } // Price of the main item, excluding add-ons
        public string? MenuItemName { get; set; } // For convenience, can be populated from MenuItem.Name
        
        public MenuItemDto? MenuItem { get; set; } // From the version in OrderDto.cs, maps to MenuItem entity
        public List<AddOnDto> AddOns { get; set; } = new List<AddOnDto>();

        public static OrderItemDto FromOrderItem(OrderItem orderItem)
        {
            var dto = new OrderItemDto
            {
                Id = orderItem.Id,
                OrderId = orderItem.OrderId,
                MenuItemId = orderItem.MenuItemId,
                Quantity = orderItem.Quantity,
                UnitPrice = orderItem.UnitPrice, // This should be the base price
                CompanionDetails = orderItem.CompanionDetails,
                MenuItem = orderItem.MenuItem != null ? MenuItemDto.FromMenuItem(orderItem.MenuItem) : null,
                MenuItemName = orderItem.MenuItem?.Name // Populate MenuItemName
            };

            if (!string.IsNullOrEmpty(orderItem.AddOnsJson))
            {
                try
                {
                    dto.AddOns = JsonSerializer.Deserialize<List<AddOnDto>>(orderItem.AddOnsJson) ?? new List<AddOnDto>();
                }
                catch (JsonException /* ex */)
                {
                    // Log error or handle, for now, initialize to empty list
                    dto.AddOns = new List<AddOnDto>();
                }
            }
            else
            {
                dto.AddOns = new List<AddOnDto>();
            }
            
            return dto;
        }
    }
} 