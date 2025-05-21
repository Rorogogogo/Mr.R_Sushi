using Microsoft.AspNetCore.Mvc;
using MrRSushiApi.Models.DTOs;

namespace MrRSushiApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<ApiResponseDto> Check()
    {
        return new ApiResponseDto
        {
            Success = true,
            Message = "API is healthy",
            Data = new
            {
                Time = DateTime.UtcNow,
                Version = "1.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            }
        };
    }
} 