using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MrRSushiApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMenuItemDescriptionsToChineseFor1to16 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 1,
                column: "Description",
                value: "使用新鲜食材和特制酱料制作的招牌寿司");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 2,
                column: "Description",
                value: "鸭蛋黄寿司，口感浓郁醇厚");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 3,
                column: "Description",
                value: "香脆培根寿司融合料理");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 4,
                column: "Description",
                value: "灵感来自樱花的时令风味寿司");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 5,
                column: "Description",
                value: "芝士寿司，完美融合各种风味");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 6,
                column: "Description",
                value: "优质鱼子酱寿司，口感精致");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 7,
                column: "Description",
                value: "新鲜金枪鱼寿司，经典之选");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 8,
                column: "Description",
                value: "金枪鱼搭配鱼子酱寿司，风味丰富");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 9,
                column: "Description",
                value: "金枪鱼搭配鹌鹑蛋和芝士寿司，高级口感");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 10,
                column: "Description",
                value: "金枪鱼搭配鹌鹑蛋、芝士和鸭蛋黄寿司");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 11,
                column: "Description",
                value: "我们终极金枪鱼组合寿司，搭配全部高级配料");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 12,
                column: "Description",
                value: "肉松手卷，口感鲜美可口");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 13,
                column: "Description",
                value: "火腿手卷，完美的快捷小食");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 14,
                column: "Description",
                value: "鱼子手卷，使用优质鱼子");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 15,
                column: "Description",
                value: "蟹棒手卷，经典之选");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 16,
                column: "Description",
                value: "芝士手卷，口感细腻奶香浓郁");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 1,
                column: "Description",
                value: "Signature sushi with fresh ingredients and our special sauce");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 2,
                column: "Description",
                value: "Duck egg yolk sushi with rich flavor profile");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 3,
                column: "Description",
                value: "Crispy bacon sushi fusion dish");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 4,
                column: "Description",
                value: "Cherry blossom inspired sushi with seasonal flavors");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 5,
                column: "Description",
                value: "Cheese sushi with a perfect blend of flavors");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 6,
                column: "Description",
                value: "Premium fish roe sushi with exquisite taste");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 7,
                column: "Description",
                value: "Fresh tuna sushi, a classic favorite");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 8,
                column: "Description",
                value: "Tuna with fish roe sushi, rich in flavor");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 9,
                column: "Description",
                value: "Tuna with quail egg and cheese sushi, premium taste");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 10,
                column: "Description",
                value: "Tuna with quail egg, cheese and duck egg yolk sushi");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 11,
                column: "Description",
                value: "Our ultimate tuna combination sushi with all premium toppings");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 12,
                column: "Description",
                value: "Meat floss hand roll with savory flavor");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 13,
                column: "Description",
                value: "Ham hand roll, a perfect quick bite");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 14,
                column: "Description",
                value: "Fish roe hand roll with premium roe");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 15,
                column: "Description",
                value: "Crab stick hand roll, a classic choice");

            migrationBuilder.UpdateData(
                table: "MenuItems",
                keyColumn: "Id",
                keyValue: 16,
                column: "Description",
                value: "Cheese hand roll with a creamy texture");
        }
    }
}
