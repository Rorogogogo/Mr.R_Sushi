namespace MrRSushiApi.Models.DTOs;

public class UpdateCartQuantityRequestDto
{
    public int Quantity { get; set; }
    // public List<AddOnDto>? AddOns { get; set; } // If you add this, ensure CartController uses it
} 