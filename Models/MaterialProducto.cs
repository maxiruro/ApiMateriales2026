using System.ComponentModel.DataAnnotations;

namespace ApiMateriales2026MaximilianoRojas.Models
{
    public class MaterialProducto
    {
        [Key]
        public int MaterialProductoID {get; set;}
        public int MaterialID {get; set;}
        public int ProductoID {get; set;}
        public int Cantidad {get; set;}
        public decimal PrecioCostoUnitario {get; set;}

        public decimal Subtotal {get; set;}

        public virtual Material? Material {get; set;}
        public virtual Producto? Producto {get; set;}
    }

    // DTO agregado justo abajo en el mismo archivo
    public class MaterialProductoCreacionDTO
    {
        public int ProductoID { get; set; }
        public int MaterialID { get; set; }
        public int Cantidad { get; set; }
    }
}