using AutoManager.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoManager.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Veiculo> Veiculos => Set<Veiculo>();
    public DbSet<OrdemServico> OrdensServico => Set<OrdemServico>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cliente>(e =>
        {
            e.HasIndex(c => c.Cpf).IsUnique();
        });

        modelBuilder.Entity<OrdemServico>(e =>
        {
            e.Property(o => o.Status).HasConversion<string>();
            e.Property(o => o.ValorEstimado).HasColumnType("decimal(10,2)");
            e.Property(o => o.ValorFinal).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<Veiculo>(e =>
        {
            e.HasIndex(v => v.Placa).IsUnique();
        });
    }
}
