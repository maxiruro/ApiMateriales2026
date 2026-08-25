using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiMateriales2026MaximilianoRojas.Models;
using ApiMateriales2026MaximilianoRojas.ModelsViews;

namespace ApiMateriales2026MaximilianoRojas.controller
{
    [ApiController]
     [Route("api/[controller]")]
    public class RubrosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RubrosController(ApplicationDbContext context)
        {
            _context = context;
        }


        //GET: api/Rubros
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VistaRubro>>> GetRubros()
        {
           var rubros = await _context.Rubros
               .OrderBy(r => r.Descripcion)
               .Select(r => new VistaRubro
               {
                   RubroID = r.RubroID,
                   Descripcion = r.Descripcion
               })
               .ToListAsync();

            return Ok(rubros);
        }

        // GET: api/Rubros/5(ID)
        [HttpGet("{id}")]
        public async Task<ActionResult<Rubro>> GetRubro(int id)
        {
            var rubro = await _context.Rubros.FindAsync(id);

            if (rubro == null)
            {
                return NotFound();
            }

            return Ok(rubro);
        }

        //PUT: api/Rubros/5{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRubro(int id, Rubro rubro)
        {
            if (id != rubro.RubroID)
            {
                return BadRequest();
            }

            if (string.IsNullOrWhiteSpace(rubro.Descripcion))
            {
                return BadRequest(new { mensaje = "La descripción es obligatoria" });
            }

            rubro.Descripcion = rubro.Descripcion?.Trim().ToUpper();

            var rubroExiste = await _context.Rubros.AnyAsync(r => r.Descripcion == rubro.Descripcion && r.RubroID != rubro.RubroID); 
            //AnyAsync() es más eficiente cuando solo necesitás saber si existe un registro, ya que no trae la entidad completa.

            if (rubroExiste)
            {
                return Conflict(new { mensaje = "Ya existe ese Rubro" });
            }

            _context.Entry(rubro).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RubroExists(id))
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
        public async Task<ActionResult<Rubro>> PostRubro (Rubro rubro)
        {
            if (string.IsNullOrWhiteSpace(rubro.Descripcion))
            {
                return BadRequest(new { mensaje = "La descripción es obligatoria" });
            }

            rubro.Descripcion = rubro.Descripcion?.Trim().ToUpper();

            var rubroExiste = await _context.Rubros.AnyAsync(r => r.Descripcion == rubro.Descripcion); 
            //AnyAsync() es más eficiente cuando solo necesitás saber si existe un registro, ya que no trae la entidad completa.

            if (rubroExiste)
            {
                return Conflict(new { mensaje = "Ya existe ese Rubro" });
            }

            _context.Rubros.Add(rubro);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRubro", new { id = rubro.RubroID }, rubro);
        }

        // DELETE: api/Rubros/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRubro(int id)
        {
            var rubro = await _context.Rubros.FindAsync(id);
            if (rubro == null)
            {
                return NotFound();
            }

            // 1. Valido si existen materiales asociados a este Rubro
            bool tieneMateriales = await _context.Materiales
                .AnyAsync(m => m.RubroID == id && !m.Eliminado);

            if (tieneMateriales)
            {
                // Retornamos un 400 Bad Request con un mensaje descriptivo
                return BadRequest(new { message = "No se puede eliminar el rubro porque tiene materiales asociados." });
            }
            rubro.Eliminado = true;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Rubro eliminado correctamente." });
        }

        private bool RubroExists(int id)
        {
            return _context.Rubros.Any(r => r.RubroID == id);
        }
    }
}