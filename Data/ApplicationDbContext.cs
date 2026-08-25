using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace ApiMateriales2026MaximilianoRojas.Models
{

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>

{

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)

        : base(options)

    {

    }

 

    // Agrega tus DbSet aquí
    public DbSet<Material> Materiales {get; set;}
    public DbSet<Producto> Productos {get; set;}
    public DbSet<Rubro> Rubros {get; set;}
    public DbSet<MaterialProducto> MaterialesProducto {get; set;}

    //Global Query Filters para filtrar directamente todos los booleanos true, de esta manera nos ahorramos filtrar en cada método

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Rubro>()
        .HasQueryFilter(r => !r.Eliminado);

    modelBuilder.Entity<Material>()
        .HasQueryFilter(m => !m.Eliminado);

    modelBuilder.Entity<Producto>()
        .HasQueryFilter(p => !p.Eliminado);
}

}
}