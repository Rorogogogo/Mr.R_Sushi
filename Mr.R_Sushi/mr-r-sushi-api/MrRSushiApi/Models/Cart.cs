namespace MrRSushiApi.Models;

public class CartItem
{
    public int Id { get; set; }
    public int MenuItemId { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? AddOnsJson { get; set; } // To store serialized add-on data
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public MenuItem? MenuItem { get; set; }
} 