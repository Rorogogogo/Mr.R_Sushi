using Microsoft.EntityFrameworkCore;
using MrRSushiApi.Models;

namespace MrRSushiApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<CartItem> CartItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.MenuItem)
            .WithMany()
            .HasForeignKey(oi => oi.MenuItemId);
            
        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.MenuItem)
            .WithMany()
            .HasForeignKey(ci => ci.MenuItemId);

        // Seed data from Menu.tsx
        modelBuilder.Entity<MenuItem>().HasData(
            // Sushi items
            new MenuItem
            {
                Id = 1,
                Name = "招牌寿司",
                Price = "13元",
                Category = "sushi",
                Description = "Signature sushi with fresh ingredients and our special sauce",
                Featured = true,
                Image = "/images/sushi-signature.jpg"
            },
            new MenuItem
            {
                Id = 2,
                Name = "鸭蛋黄寿司",
                Price = "15元",
                Category = "sushi",
                Description = "Duck egg yolk sushi with rich flavor profile",
                Image = "/images/sushi-duck.jpg"
            },
            new MenuItem
            {
                Id = 3,
                Name = "培根寿司",
                Price = "15元",
                Category = "sushi",
                Description = "Crispy bacon sushi fusion dish"
            },
            new MenuItem
            {
                Id = 4,
                Name = "樱花寿司",
                Price = "15元",
                Category = "sushi",
                Description = "Cherry blossom inspired sushi with seasonal flavors",
                Featured = true,
                Image = "https://images.unsplash.com/photo-1556906782-5e232862b21e?q=80&w=300&auto=format&fit=crop"
            },
            new MenuItem
            {
                Id = 5,
                Name = "芝士寿司",
                Price = "16元",
                Category = "sushi",
                Description = "Cheese sushi with a perfect blend of flavors"
            },
            new MenuItem
            {
                Id = 6,
                Name = "鱼子酱寿司",
                Price = "16元",
                Category = "sushi",
                Description = "Premium fish roe sushi with exquisite taste"
            },
            new MenuItem
            {
                Id = 7,
                Name = "金枪鱼寿司",
                Price = "18元",
                Category = "sushi",
                Description = "Fresh tuna sushi, a classic favorite",
                Featured = true,
                Image = "https://images.unsplash.com/photo-1558985250-27a406d64cb3?q=80&w=300&auto=format&fit=crop"
            },
            new MenuItem
            {
                Id = 8,
                Name = "金枪鱼鱼子酱寿司",
                Price = "20元",
                Category = "sushi",
                Description = "Tuna with fish roe sushi, rich in flavor"
            },
            new MenuItem
            {
                Id = 9,
                Name = "金枪鱼鹌鹑蛋芝士寿司",
                Price = "22元",
                Category = "sushi",
                Description = "Tuna with quail egg and cheese sushi, premium taste"
            },
            new MenuItem
            {
                Id = 10,
                Name = "金枪鱼鹌鹑蛋芝士+鸭蛋黄寿司",
                Price = "24元",
                Category = "sushi",
                Description = "Tuna with quail egg, cheese and duck egg yolk sushi"
            },
            new MenuItem
            {
                Id = 11,
                Name = "金枪鱼鹌鹑蛋芝士+鸭蛋黄+培根寿司",
                Price = "26元",
                Category = "sushi",
                Description = "Our ultimate tuna combination sushi with all premium toppings",
                Featured = true,
                Image = "https://images.unsplash.com/photo-1562802378-063ec186a863?q=80&w=300&auto=format&fit=crop"
            },

            // Hand roll items
            new MenuItem
            {
                Id = 12,
                Name = "肉松手卷",
                Price = "7元",
                Category = "handroll",
                Description = "Meat floss hand roll with savory flavor",
                Featured = true,
                Image = "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=300&auto=format&fit=crop"
            },
            new MenuItem
            {
                Id = 13,
                Name = "火腿手卷",
                Price = "7元",
                Category = "handroll",
                Description = "Ham hand roll, a perfect quick bite"
            },
            new MenuItem
            {
                Id = 14,
                Name = "鱼子手卷",
                Price = "7元",
                Category = "handroll",
                Description = "Fish roe hand roll with premium roe"
            },
            new MenuItem
            {
                Id = 15,
                Name = "蟹棒手卷",
                Price = "7元",
                Category = "handroll",
                Description = "Crab stick hand roll, a classic choice",
                Featured = true,
                Image = "https://images.unsplash.com/photo-1540713304937-18ad930d3594?q=80&w=300&auto=format&fit=crop"
            },
            new MenuItem
            {
                Id = 16,
                Name = "芝士手卷",
                Price = "7元",
                Category = "handroll",
                Description = "Cheese hand roll with a creamy texture"
            },
            
            // Pancake items
            new MenuItem
            {
                Id = 17,
                Name = "杂粮煎饼",
                Price = "7元",
                Category = "pancake",
                Description = "单蛋 + 蔬菜 + 沙拉，健康美味",
                Featured = true,
                Image = "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop&q=60"
            },
            new MenuItem
            {
                Id = 18,
                Name = "火鸡面煎饼",
                Price = "12元",
                Category = "pancake",
                Description = "双蛋 + 蔬菜 + 火鸡面，美味搭配",
                Image = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=60"
            },
            new MenuItem
            {
                Id = 19,
                Name = "海苔肉松煎饼",
                Price = "13元",
                Category = "pancake",
                Description = "双蛋 + 蔬菜 + 海苔 + 肉松，经典组合",
                Image = "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=60"
            },
            new MenuItem
            {
                Id = 20,
                Name = "培根煎饼",
                Price = "14元",
                Category = "pancake",
                Description = "双蛋 + 蔬菜 + 培根，西式风味",
                Image = "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&auto=format&fit=crop&q=60"
            },
            new MenuItem
            {
                Id = 21,
                Name = "中式汉堡煎饼",
                Price = "16元",
                Category = "pancake",
                Description = "双蛋 + 蔬菜 + 肉松 + 火腿肉，创意十足",
                Image = "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=60"
            },
            new MenuItem
            {
                Id = 22,
                Name = "火焰芝士火鸡面煎饼",
                Price = "22元",
                Category = "pancake",
                Description = "双蛋 + 芝士 + 蔬菜 + 火鸡面，豪华美味",
                Featured = true,
                Image = "https://images.unsplash.com/photo-1598215439219-738c1b65700a?w=800&auto=format&fit=crop&q=60"
            },
            new MenuItem
            {
                Id = 23,
                Name = "火焰芝士海苔肉松煎饼",
                Price = "23元",
                Category = "pancake",
                Description = "双蛋 + 芝士 + 蔬菜 + 海苔 + 肉松，多层风味",
                Image = "https://images.unsplash.com/photo-1567982047351-76b6f93e88ee?w=800&auto=format&fit=crop&q=60"
            },
            new MenuItem
            {
                Id = 24,
                Name = "火焰芝士培根煎饼",
                Price = "24元",
                Category = "pancake",
                Description = "双蛋 + 芝士 + 蔬菜 + 培根，口感丰富",
                Featured = true,
                Image = "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&auto=format&fit=crop&q=60"
            },
            new MenuItem
            {
                Id = 25,
                Name = "火焰芝士火腿煎饼",
                Price = "26元",
                Category = "pancake",
                Description = "双蛋 + 芝士 + 蔬菜 + 肉松 + 火腿肉，奢华体验",
                Image = "https://images.unsplash.com/photo-1563381013529-1c922c80ac8d?w=800&auto=format&fit=crop&q=60"
            }
        );
    }
} 