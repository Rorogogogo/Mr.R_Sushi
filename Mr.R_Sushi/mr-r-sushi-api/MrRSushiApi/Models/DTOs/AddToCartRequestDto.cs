using System.Collections.Generic;
// Potentially add other necessary using statements, e.g., for AddOnDto if it's in a different namespace

namespace MrRSushiApi.Models.DTOs;

public class AddToCartRequestDto
{
    public string? SessionId { get; set; }
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
    public List<AddOnDto>? AddOns { get; set; } 
    // public List<string>? Companions { get; set; }
} 