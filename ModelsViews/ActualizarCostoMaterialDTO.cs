using System.ComponentModel.DataAnnotations;

namespace TuProyecto.DTOs
{
    public class ActualizarCostoMaterialDto
    {
        [Required(ErrorMessage = "El nuevo costo es obligatorio.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El costo debe ser mayor a cero.")]
        public decimal NuevoCosto { get; set; }
    }
}