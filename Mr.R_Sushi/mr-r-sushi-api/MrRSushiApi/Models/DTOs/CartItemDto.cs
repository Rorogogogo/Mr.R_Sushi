using System.Collections.Generic;

namespace MrRSushiApi.Models.DTOs;

public class CartItemDto
{
    public int Id { get; set; }
    public int MenuItemId { get; set; }
    public string? SessionId { get; set; }
    public int Quantity { get; set; }
    public MenuItem? MenuItem { get; set; } // Or MenuItemDto if you have one
    public List<AddOnDto>? AddOns { get; set; }
    // public List<string>? Companions { get; set; }
    // public DateTime CreatedAt { get; set; } // If needed by frontend
} 