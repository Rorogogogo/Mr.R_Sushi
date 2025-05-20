using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MrRSushiApi.Data;
using MrRSushiApi.Models;
using MrRSushiApi.Models.DTOs;

namespace MrRSushiApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public MenuController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<DataCollectionApiResponseDto<MenuItem>>> GetMenuItems()
    {
        var menuItems = await _context.MenuItems.ToListAsync();
        
        return new DataCollectionApiResponseDto<MenuItem>
        {
            Success = true,
            Data = menuItems,
            TotalCount = menuItems.Count
        };
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponseDto<MenuItem>>> GetMenuItem(int id)
    {
        var menuItem = await _context.MenuItems.FindAsync(id);
        
        if (menuItem == null)
        {
            return NotFound(new ApiResponseDto
            {
                Success = false,
                Message = "菜品未找到"
            });
        }
        
        return new ApiResponseDto<MenuItem>
        {
            Success = true,
            Data = menuItem
        };
    }
    
    [HttpGet("category/{category}")]
    public async Task<ActionResult<DataCollectionApiResponseDto<MenuItem>>> GetMenuItemsByCategory(string category)
    {
        var menuItems = await _context.MenuItems
            .Where(m => m.Category == category)
            .ToListAsync();
            
        return new DataCollectionApiResponseDto<MenuItem>
        {
            Success = true,
            Data = menuItems,
            TotalCount = menuItems.Count
        };
    }
    
    [HttpGet("featured")]
    public async Task<ActionResult<DataCollectionApiResponseDto<MenuItem>>> GetFeaturedItems()
    {
        var menuItems = await _context.MenuItems
            .Where(m => m.Featured)
            .ToListAsync();
            
        return new DataCollectionApiResponseDto<MenuItem>
        {
            Success = true,
            Data = menuItems,
            TotalCount = menuItems.Count
        };
    }
} 