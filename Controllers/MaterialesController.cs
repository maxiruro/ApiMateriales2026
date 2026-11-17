using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMateriales2026MaximilianoRojas.Models;
using ApiMateriales2026MaximilianoRojas.ModelsViews;

namespace ApiMateriales2026MaximilianoRojas.controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaterialesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MaterialesController(ApplicationDbContext context)
        {
            _context = context;
        }

        //GET: api/Materiales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VistaMaterial>>> GetMateriales()
        {
            var materiales = await _context.Materiales
         .Include(m => m.Rubro)
         .Select(m => new VistaMaterial
         {
             MaterialID = m.MaterialID,
             Descripcion = m.Descripcion,
             RubroID = m.RubroID,
             RubroNombre = m.Rubro!.Descripcion,
             PrecioCosto = m.PrecioCosto
         })
         .ToListAsync();

            return Ok(materiales);
        }

        // GET: api/Materiales/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VistaMaterial>> GetMaterial(int id)
        {
            var material = await _context.Materiales.Include(m => m.Rubro).SingleOrDefaultAsync(m => m.MaterialID == id);

            if (material == null)
            {
                return NotFound();
            }

            var mostrarMaterial = new VistaMaterial
            {
                MaterialID = material.MaterialID,
                Descripcion = material.Descripcion,
                RubroID = material.RubroID,
                RubroNombre = material.Rubro?.Descripcion,
                PrecioCosto = material.PrecioCosto,
            };

            return Ok(mostrarMaterial);
        }

        // PUT: api/Materiales/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMaterial(int id, Material material)
        {
            if (id != material.MaterialID)
            {
                return BadRequest();
            }

            if (material.PrecioCosto <= 0)
            {
                return BadRequest("El precio de costo debe ser mayor a cero.");
            }

            // 1. Buscamos el material original incluyendo o sin incluir cosas, pero necesitamos su precio anterior
            var materialOriginal = await _context.Materiales
                .Where(m => m.MaterialID == id)
                .SingleOrDefaultAsync();

            if (materialOriginal == null)
            {
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(material.Descripcion))
            {
                return BadRequest(new { mensaje = "La descripción es obligatoria" });
            }

            material.Descripcion = material.Descripcion?.Trim().ToUpper();

            var existe = await _context.Materiales.AnyAsync(m =>
                m.Descripcion == material.Descripcion &&
                m.MaterialID != material.MaterialID);

            if (existe)
            {
                return Conflict(new { mensaje = "Ya existe ese Material." });
            }

            // Guardamos si el costo cambió para saber si debemos recalcular
            //bool costoCambio = materialOriginal.PrecioCosto != material.PrecioCosto;

            // Actualizamos las propiedades del material original
            materialOriginal.RubroID = material.RubroID;
            materialOriginal.Descripcion = material.Descripcion;
            materialOriginal.PrecioCosto = material.PrecioCosto;

            // 2. SI EL COSTO CAMBIÓ, hacemos el recálculo en cascada aquí mismo


            try
            {
                // 3. Se guarda todo de un solo golpe (Material actualizado + Productos recalculados)
                await _context.SaveChangesAsync();

                RecalcularProductosMateriales(material.MaterialID, material.PrecioCosto);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MaterialExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { mensaje = "Material actualizado y precios recalculados correctamente." });
        }

        public void RecalcularProductosMateriales(int MaterialID, decimal PrecioCosto)
        {
            // Buscamos todos los productos afectados por ese material
            var productosMaterial = _context.MaterialesProducto
                .Where(cp => cp.MaterialID == MaterialID)
                .ToList();

            foreach (var productoMaterial in productosMaterial)
            {
                productoMaterial.PrecioCostoUnitario = PrecioCosto;

                productoMaterial.Subtotal = PrecioCosto * productoMaterial.Cantidad;

            }
            _context.SaveChanges();

            var productosIDActualizar = _context.MaterialesProducto
                .Where(cp => cp.MaterialID == MaterialID)
                .Select(p => p.ProductoID)
                .ToList();

            foreach (var productoIDActualizar in productosIDActualizar)
            {
                decimal Importe = RecalcularCostoProducto(productoIDActualizar);
            }


        }

        public decimal RecalcularCostoProducto(int ProductoID)
        {
            // 1. Recalcular el nuevo costo total del producto
            var totalCostoProducto = _context.MaterialesProducto
                .Where(mp => mp.ProductoID == ProductoID)
                .Sum(mp => (decimal?)mp.Subtotal) ?? 0; // Si no quedan materiales, devuelve 0

            // 2. Actualizar el costo del producto principal
            var producto = _context.Productos.Where(p => p.ProductoID == ProductoID).SingleOrDefault();
            if (producto != null)
            {
                producto.CostoTotal = totalCostoProducto;
                //     // Mantener el porcentaje de ganancia existente
                producto.PrecioVenta = producto.CostoTotal + (producto.CostoTotal * producto.PorcentajeGanancia / 100);

                _context.SaveChanges();
            }

            return totalCostoProducto;

        }


        [HttpPost]
        public async Task<ActionResult<Material>> PostMaterial(Material material)
        {
            if (string.IsNullOrWhiteSpace(material.Descripcion))
            {
                return BadRequest(new { mensaje = "La descripción es obligatoria" });
            }

            if (material.PrecioCosto <= 0)
            {
                return BadRequest("El precio de costo debe ser mayor a cero.");
            }

            material.Descripcion = material.Descripcion?.Trim().ToUpper();

            var materialExiste = await _context.Materiales.AnyAsync(m => m.Descripcion == material.Descripcion);
            //AnyAsync() es más eficiente cuando solo necesitás saber si existe un registro, ya que no trae la entidad completa.

            if (materialExiste)
            {
                return Conflict(new { mensaje = "Ya existe ese Material" });
            }

            _context.Materiales.Add(material);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMaterial), new { id = material.MaterialID }, material);
        }

        // DELETE: api/Materiales/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var material = await _context.Materiales.FindAsync(id);
            if (material == null)
            {
                return NotFound();
            }
            material.Eliminado = true;

            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool MaterialExists(int id)
        {
            return _context.Materiales.Any(m => m.MaterialID == id);
        }

    }
}