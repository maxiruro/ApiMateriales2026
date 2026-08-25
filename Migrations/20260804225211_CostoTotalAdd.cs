using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace APIMateriales2026MaximilianoRojas.Migrations
{
    /// <inheritdoc />
    public partial class CostoTotalAdd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CostoTotal",
                table: "Productos",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CostoTotal",
                table: "Productos");
        }
    }
}
