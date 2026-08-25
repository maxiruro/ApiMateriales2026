using System.ComponentModel.DataAnnotations;

namespace ApiMateriales2026MaximilianoRojas.Models
{
    public class Material
    {
        [Key]
        public int MaterialID {get; set;}
        public string? Descripcion {get; set;}
        public int RubroID {get; set;}
        public decimal PrecioCosto {get; set;}
        public bool Eliminado {get; set;}

        public virtual Rubro? Rubro {get; set;}
        public virtual ICollection<MaterialProducto>? MaterialesProducto {get; set;}
    }
}