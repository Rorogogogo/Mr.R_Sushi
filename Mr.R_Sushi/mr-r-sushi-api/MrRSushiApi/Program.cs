using Microsoft.EntityFrameworkCore;
using MrRSushiApi.Data;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configure JSON serialization to handle circular references
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Add SQLite
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register email service
builder.Services.AddScoped<MrRSushiApi.Services.IEmailService, MrRSushiApi.Services.EmailService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", corsBuilder =>
    {
        corsBuilder.WithOrigins(
                "http://localhost:5173",
                "https://localhost:5173", 
                "https://sushi.jobjourney.me")
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
