using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MrRSushiApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAddOnsJsonToCartItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AddOnsJson",
                table: "CartItems",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddOnsJson",
                table: "CartItems");
        }
    }
}
