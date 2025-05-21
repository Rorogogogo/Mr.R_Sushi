namespace MrRSushiApi.Models.DTOs;

public class ApiResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? Data { get; set; }
}

public class ApiResponseDto<T> : ApiResponseDto
{
    public T? Data { get; set; }
}

public class DataCollectionApiResponseDto<T> : ApiResponseDto
{
    public List<T>? Data { get; set; }
    public int TotalCount { get; set; }
} 