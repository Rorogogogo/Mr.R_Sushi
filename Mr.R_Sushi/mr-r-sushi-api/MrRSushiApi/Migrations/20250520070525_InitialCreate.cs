using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MrRSushiApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MenuItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Price = table.Column<string>(type: "TEXT", nullable: false),
                    Image = table.Column<string>(type: "TEXT", nullable: true),
                    Category = table.Column<string>(type: "TEXT", nullable: false),
                    Featured = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsAvailable = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MenuItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OrderNumber = table.Column<string>(type: "TEXT", nullable: false),
                    CustomerName = table.Column<string>(type: "TEXT", nullable: false),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: false),
                    ReservationTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Address = table.Column<string>(type: "TEXT", nullable: true),
                    OrderDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CartItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MenuItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    SessionId = table.Column<string>(type: "TEXT", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CartItems_MenuItems_MenuItemId",
                        column: x => x.MenuItemId,
                        principalTable: "MenuItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OrderId = table.Column<int>(type: "INTEGER", nullable: false),
                    MenuItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "TEXT", nullable: false),
                    CompanionDetails = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_MenuItems_MenuItemId",
                        column: x => x.MenuItemId,
                        principalTable: "MenuItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "MenuItems",
                columns: new[] { "Id", "Category", "Description", "Featured", "Image", "IsAvailable", "Name", "Price" },
                values: new object[,]
                {
                    { 1, "sushi", "Signature sushi with fresh ingredients and our special sauce", true, "/images/sushi-signature.jpg", true, "招牌寿司", "13元" },
                    { 2, "sushi", "Duck egg yolk sushi with rich flavor profile", false, "/images/sushi-duck.jpg", true, "鸭蛋黄寿司", "15元" },
                    { 3, "sushi", "Crispy bacon sushi fusion dish", false, null, true, "培根寿司", "15元" },
                    { 4, "sushi", "Cherry blossom inspired sushi with seasonal flavors", true, "https://images.unsplash.com/photo-1556906782-5e232862b21e?q=80&w=300&auto=format&fit=crop", true, "樱花寿司", "15元" },
                    { 5, "sushi", "Cheese sushi with a perfect blend of flavors", false, null, true, "芝士寿司", "16元" },
                    { 6, "sushi", "Premium fish roe sushi with exquisite taste", false, null, true, "鱼子酱寿司", "16元" },
                    { 7, "sushi", "Fresh tuna sushi, a classic favorite", true, "https://images.unsplash.com/photo-1558985250-27a406d64cb3?q=80&w=300&auto=format&fit=crop", true, "金枪鱼寿司", "18元" },
                    { 8, "sushi", "Tuna with fish roe sushi, rich in flavor", false, null, true, "金枪鱼鱼子酱寿司", "20元" },
                    { 9, "sushi", "Tuna with quail egg and cheese sushi, premium taste", false, null, true, "金枪鱼鹌鹑蛋芝士寿司", "22元" },
                    { 10, "sushi", "Tuna with quail egg, cheese and duck egg yolk sushi", false, null, true, "金枪鱼鹌鹑蛋芝士+鸭蛋黄寿司", "24元" },
                    { 11, "sushi", "Our ultimate tuna combination sushi with all premium toppings", true, "https://images.unsplash.com/photo-1562802378-063ec186a863?q=80&w=300&auto=format&fit=crop", true, "金枪鱼鹌鹑蛋芝士+鸭蛋黄+培根寿司", "26元" },
                    { 12, "handroll", "Meat floss hand roll with savory flavor", true, "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=300&auto=format&fit=crop", true, "肉松手卷", "7元" },
                    { 13, "handroll", "Ham hand roll, a perfect quick bite", false, null, true, "火腿手卷", "7元" },
                    { 14, "handroll", "Fish roe hand roll with premium roe", false, null, true, "鱼子手卷", "7元" },
                    { 15, "handroll", "Crab stick hand roll, a classic choice", true, "https://images.unsplash.com/photo-1540713304937-18ad930d3594?q=80&w=300&auto=format&fit=crop", true, "蟹棒手卷", "7元" },
                    { 16, "handroll", "Cheese hand roll with a creamy texture", false, null, true, "芝士手卷", "7元" },
                    { 17, "pancake", "单蛋 + 蔬菜 + 沙拉，健康美味", true, "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop&q=60", true, "杂粮煎饼", "7元" },
                    { 18, "pancake", "双蛋 + 蔬菜 + 火鸡面，美味搭配", false, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=60", true, "火鸡面煎饼", "12元" },
                    { 19, "pancake", "双蛋 + 蔬菜 + 海苔 + 肉松，经典组合", false, "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=60", true, "海苔肉松煎饼", "13元" },
                    { 20, "pancake", "双蛋 + 蔬菜 + 培根，西式风味", false, "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&auto=format&fit=crop&q=60", true, "培根煎饼", "14元" },
                    { 21, "pancake", "双蛋 + 蔬菜 + 肉松 + 火腿肉，创意十足", false, "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=60", true, "中式汉堡煎饼", "16元" },
                    { 22, "pancake", "双蛋 + 芝士 + 蔬菜 + 火鸡面，豪华美味", true, "https://images.unsplash.com/photo-1598215439219-738c1b65700a?w=800&auto=format&fit=crop&q=60", true, "火焰芝士火鸡面煎饼", "22元" },
                    { 23, "pancake", "双蛋 + 芝士 + 蔬菜 + 海苔 + 肉松，多层风味", false, "https://images.unsplash.com/photo-1567982047351-76b6f93e88ee?w=800&auto=format&fit=crop&q=60", true, "火焰芝士海苔肉松煎饼", "23元" },
                    { 24, "pancake", "双蛋 + 芝士 + 蔬菜 + 培根，口感丰富", true, "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&auto=format&fit=crop&q=60", true, "火焰芝士培根煎饼", "24元" },
                    { 25, "pancake", "双蛋 + 芝士 + 蔬菜 + 肉松 + 火腿肉，奢华体验", false, "https://images.unsplash.com/photo-1563381013529-1c922c80ac8d?w=800&auto=format&fit=crop&q=60", true, "火焰芝士火腿煎饼", "26元" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_MenuItemId",
                table: "CartItems",
                column: "MenuItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_MenuItemId",
                table: "OrderItems",
                column: "MenuItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "MenuItems");

            migrationBuilder.DropTable(
                name: "Orders");
        }
    }
}
