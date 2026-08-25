using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace APIMateriales2026MaximilianoRojas.Migrations
{
    /// <inheritdoc />
    public partial class borradoDeClase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Materiales_MaterialesProducto_MaterialProductoID",
                table: "Materiales");

            migrationBuilder.DropForeignKey(
                name: "FK_Productos_MaterialesProducto_MaterialProductoID",
                table: "Productos");

            migrationBuilder.DropTable(
                name: "MaterialesProducto");

            migrationBuilder.DropIndex(
                name: "IX_Productos_MaterialProductoID",
                table: "Productos");

            migrationBuilder.DropIndex(
                name: "IX_Materiales_MaterialProductoID",
                table: "Materiales");

            migrationBuilder.DropColumn(
                name: "MaterialProductoID",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "MaterialProductoID",
                table: "Materiales");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaterialProductoID",
                table: "Productos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaterialProductoID",
                table: "Materiales",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MaterialesProducto",
                columns: table => new
                {
                    MaterialProductoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    MaterialID = table.Column<int>(type: "int", nullable: false),
                    PrecioCostoUnitario = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProductoID = table.Column<int>(type: "int", nullable: false),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaterialesProducto", x => x.MaterialProductoID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Productos_MaterialProductoID",
                table: "Productos",
                column: "MaterialProductoID");

            migrationBuilder.CreateIndex(
                name: "IX_Materiales_MaterialProductoID",
                table: "Materiales",
                column: "MaterialProductoID");

            migrationBuilder.AddForeignKey(
                name: "FK_Materiales_MaterialesProducto_MaterialProductoID",
                table: "Materiales",
                column: "MaterialProductoID",
                principalTable: "MaterialesProducto",
                principalColumn: "MaterialProductoID");

            migrationBuilder.AddForeignKey(
                name: "FK_Productos_MaterialesProducto_MaterialProductoID",
                table: "Productos",
                column: "MaterialProductoID",
                principalTable: "MaterialesProducto",
                principalColumn: "MaterialProductoID");
        }
    }
}
