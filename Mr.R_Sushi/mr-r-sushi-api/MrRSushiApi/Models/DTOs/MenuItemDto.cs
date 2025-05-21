using MrRSushiApi.Models; // For MenuItem entity
using System.Globalization; // For CultureInfo.InvariantCulture (may not be needed if Price is string)

namespace MrRSushiApi.Models.DTOs
{
    public class MenuItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Price { get; set; } 
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool Featured { get; set; }
        public string? Image { get; set; }

        public static MenuItemDto? FromMenuItem(MenuItem? menuItem)
        {
            if (menuItem == null) return null;

            return new MenuItemDto
            {
                Id = menuItem.Id,
                Name = menuItem.Name,
                Price = menuItem.Price, // Direct assignment, assuming entity Price is string
                Category = menuItem.Category,
                Description = menuItem.Description,
                Featured = menuItem.Featured,
                Image = menuItem.Image
            };
        }
    }
} 