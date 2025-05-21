using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MrRSushiApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAddOnsJsonToOrderItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AddOnsJson",
                table: "OrderItems",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddOnsJson",
                table: "OrderItems");
        }
    }
}
