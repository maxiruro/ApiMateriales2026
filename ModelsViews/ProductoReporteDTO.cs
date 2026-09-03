// Subnivel: Materiales asociados al producto
public class MaterialProductoReporteDTO
{
    public string Descripcion { get; set; }           // De la tabla Materiales
    public decimal PrecioCostoUnitario { get; set; }  // De la tabla Materiales
    public decimal Cantidad { get; set; }            // De la tabla MaterialesProductos
    public decimal Subtotal { get; set; }            // De la tabla MaterialesProductos
}

// Nivel principal: Producto
public class ProductoReporteDTO
{
    public string Descripcion { get; set; }           // De la tabla Productos
    public decimal CostoTotal { get; set; }           // De la tabla Productos
    public decimal PorcentajeGanancia { get; set; } // De la tabla Productos
    public decimal PrecioVenta { get; set; }          // De la tabla Productos o calculado si aplica

    public List<MaterialProductoReporteDTO> ListadoMateriales { get; set; } = new List<MaterialProductoReporteDTO>();
}