using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMateriales2026MaximilianoRojas.Models;
using ApiMateriales2026MaximilianoRojas.ModelsViews; 

namespace ApiMateriales2026MaximilianoRojas.controller
{
    [ApiController]
     [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductosController(ApplicationDbContext context)
        {
            _context = context;
        }


        //GET: api/Productos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VistaProducto>>> GetProductos()
        {
            var productos = await _context.Productos
                .OrderBy(p => p.Descripcion)
                .Select(p => new VistaProducto
                {
                    ProductoID = p.ProductoID,
                    Descripcion = p.Descripcion,
                    CostoTotal = p.CostoTotal
                })
                .ToListAsync();

            return Ok(productos);
        }

        // GET: api/Productos/5(ID)
        [HttpGet("{id}")]
        public async Task<ActionResult<Producto>> GetProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
            {
                return NotFound();
            }

            return Ok(producto);
        }


        //PUT: api/Productos/5{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProducto(int id, Producto producto)
        {
            if (id != producto.ProductoID)
            {
                return BadRequest();
            }

            if (string.IsNullOrWhiteSpace(producto.Descripcion))
            {
                return BadRequest(new { mensaje = "La descripción es obligatoria" });
            }

            producto.Descripcion = producto.Descripcion?.Trim().ToUpper();

            var productoExiste = await _context.Productos.AnyAsync(p => p.Descripcion == producto.Descripcion && p.ProductoID != producto.ProductoID); 
            //AnyAsync() es más eficiente cuando solo necesitás saber si existe un registro, ya que no trae la entidad completa.

            if (productoExiste)
            {
                return Conflict(new { mensaje = "Ya existe ese Producto" });
            }

            _context.Entry(producto).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<Producto>> PostProducto (Producto producto)
        {
            if (string.IsNullOrWhiteSpace(producto.Descripcion))
            {
                return BadRequest(new { mensaje = "La descripción es obligatoria" });
            }

            producto.Descripcion = producto.Descripcion?.Trim().ToUpper();

            var productoExiste = await _context.Productos.AnyAsync(p => p.Descripcion == producto.Descripcion); 
            //AnyAsync() es más eficiente cuando solo necesitás saber si existe un registro, ya que no trae la entidad completa.

            if (productoExiste)
            {
                return Conflict(new { mensaje = "Ya existe ese Producto" });
            }

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProducto), new { id = producto.ProductoID }, producto);
        }

        // DELETE: api/Productos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProducto(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
            {
                return NotFound();
            }
            producto.Eliminado = true;
            
            await _context.SaveChangesAsync();

            return Ok();
        }

        private bool ProductoExists(int id)
        {
            return _context.Productos.Any(p => p.ProductoID == id);
        }

        [HttpPost("AgregarMaterial")]
        public async Task<IActionResult> AgregarMaterial([FromBody] MaterialProductoCreacionDTO dto)
        {
            // 1. Validar que la cantidad sea válida
            if (dto.Cantidad <= 0)
                return BadRequest("La cantidad debe ser mayor a 0.");

            // 2. Verificar que existan el Producto y el Material en la BD
            var producto = await _context.Productos.FindAsync(dto.ProductoID);
            if (producto == null)
                return NotFound("El producto especificado no existe.");

            var material = await _context.Materiales.FindAsync(dto.MaterialID);
            if (material == null)
                return NotFound("El material especificado no existe.");

            // 3. Crear el nuevo MaterialProducto calculando los importes
            // Asegúrate de que la entidad 'Material' tenga la propiedad del precio con el nombre correcto (ej. PrecioCosto o PrecioUnitario)
            decimal precioUnitario = material.PrecioCosto;
            decimal subtotal = dto.Cantidad * precioUnitario;

            var nuevoMaterialProducto = new MaterialProducto
            {
                ProductoID = dto.ProductoID,
                MaterialID = dto.MaterialID,
                Cantidad = dto.Cantidad,
                PrecioCostoUnitario = precioUnitario,
                Subtotal = subtotal
            };

            _context.MaterialesProducto.Add(nuevoMaterialProducto);
            await _context.SaveChangesAsync();

            // 4. Recalcular el PrecioCosto total del producto sumando todos sus materiales
            var totalCostoProducto = await _context.MaterialesProducto
                .Where(mp => mp.ProductoID == dto.ProductoID)
                .SumAsync(mp => mp.Subtotal);

            // 5. Actualizar el costo del producto y guardar cambios
            producto.CostoTotal = totalCostoProducto;
            await _context.SaveChangesAsync();

            return Ok(new { 
        mensaje = "Material agregado correctamente", 
        materialProductoID = nuevoMaterialProducto.MaterialProductoID,
        nuevoCostoProducto = producto.CostoTotal 
    });
        }

        [HttpGet("ObtenerMaterialesProducto/{productoId}")]
        public async Task<IActionResult> ObtenerMaterialesProducto(int productoId)
        {
            var listado = await _context.MaterialesProducto
                .Include(mp => mp.Material) // Necesario para acceder a la descripción del material
                .Where(mp => mp.ProductoID == productoId)
                .Select(mp => new
                {
                    mp.MaterialProductoID,
                    mp.MaterialID,
                    // Ajusta 'Descripcion' o 'Nombre' según la propiedad real en tu modelo Material
                    MaterialNombre = mp.Material != null ? mp.Material.Descripcion : "Sin descripción",
                    mp.PrecioCostoUnitario,
                    mp.Cantidad,
                    mp.Subtotal
                })
                .ToListAsync();

            return Ok(listado);
        }

        [HttpDelete("EliminarMaterialProducto/{materialProductoId}")]
        public async Task<IActionResult> EliminarMaterialProducto(int materialProductoId)
        {
            // 1. Buscar el registro del material en la relación MaterialProducto
            var materialProducto = await _context.MaterialesProducto.FindAsync(materialProductoId);

            if (materialProducto == null)
            {
                return NotFound("El detalle del material no fue encontrado.");
            }

            // 2. Guardar el ProductoID antes de borrar el registro
            int productoId = materialProducto.ProductoID;

            // 3. Eliminar el registro
            _context.MaterialesProducto.Remove(materialProducto);
            await _context.SaveChangesAsync();

            // 4. Recalcular el nuevo costo total del producto
            var totalCostoProducto = await _context.MaterialesProducto
                .Where(mp => mp.ProductoID == productoId)
                .SumAsync(mp => (decimal?)mp.Subtotal) ?? 0; // Si no quedan materiales, devuelve 0

            // 5. Actualizar el costo del producto principal
            var producto = await _context.Productos.FindAsync(productoId);
            if (producto != null)
            {
                producto.CostoTotal = totalCostoProducto;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                mensaje = "Material eliminado correctamente",
                nuevoCostoProducto = totalCostoProducto
            });
        }
    }
}