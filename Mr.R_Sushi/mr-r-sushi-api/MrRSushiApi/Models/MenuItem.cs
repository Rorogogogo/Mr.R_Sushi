namespace MrRSushiApi.Models;

public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Price { get; set; } = string.Empty;
    public string? Image { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool Featured { get; set; }
    public bool IsAvailable { get; set; } = true;
} 