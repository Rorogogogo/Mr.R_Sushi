namespace MrRSushiApi.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }  // 保持为decimal以便计算
    public string? CompanionDetails { get; set; } // 存储煎饼伴侣信息
    
    // Navigation properties
    public Order? Order { get; set; }
    public MenuItem? MenuItem { get; set; }
} 