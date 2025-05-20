using Microsoft.EntityFrameworkCore;
using MrRSushiApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();

// Add SQLite
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=MrRSushi.db"));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", corsBuilder =>
    {
        corsBuilder.WithOrigins("http://localhost:5176") // Your frontend development URL
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
    // Keep a general policy for other cases if needed, or remove if only one policy is used
    options.AddPolicy("AllowAll", corsBuilder =>
    {
        corsBuilder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseDeveloperExceptionPage();
}
else
{
    // In production, you might want a more restrictive CORS policy
    // or rely on your reverse proxy (like Nginx) to handle CORS.
}

app.UseHttpsRedirection();

app.UseRouting(); // Explicitly add UseRouting

// Use the specific policy for development, or a more general one for production
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowSpecificOrigin");
}
else
{
    app.UseCors("AllowAll"); // Or your production-specific policy
}

app.UseAuthorization();

app.MapControllers();

// Initialize the database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating the database.");
    }
}

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
