using AutoManager.API.Data;
using AutoManager.API.DTOs;
using AutoManager.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoManager.API.Services;

public interface IClienteService
{
    Task<PagedResult<ClienteDto>> ListarAsync(ClienteQueryParams query);
    Task<ClienteDto?> ObterPorIdAsync(int id);
    Task<ClienteDto> CriarAsync(CreateClienteDto dto);
    Task<ClienteDto?> AtualizarAsync(int id, CreateClienteDto dto);
    Task<bool> RemoverAsync(int id);
}

public class ClienteService(AppDbContext db) : IClienteService
{
    public async Task<PagedResult<ClienteDto>> ListarAsync(ClienteQueryParams query)
    {
        var q = db.Clientes.AsNoTracking().AsQueryable();

        // ── Filtros ──────────────────────────────────────────────────────────
        if (!string.IsNullOrWhiteSpace(query.Nome))
            q = q.Where(c => c.Nome.ToLower().Contains(query.Nome.ToLower()));

        if (!string.IsNullOrWhiteSpace(query.Cpf))
            q = q.Where(c => c.Cpf.Contains(query.Cpf));

        // ── Paginação ────────────────────────────────────────────────────────
        var total   = await q.CountAsync();
        var tamanho = Math.Clamp(query.Tamanho, 1, 100);
        var pagina  = Math.Max(query.Pagina, 1);

        var items = await q
            .OrderBy(c => c.Nome)
            .Skip((pagina - 1) * tamanho)
            .Take(tamanho)
            .Select(c => ToDto(c))
            .ToListAsync();

        return new PagedResult<ClienteDto>(
            items, total, pagina, tamanho,
            (int)Math.Ceiling((double)total / tamanho));
    }

    public async Task<ClienteDto?> ObterPorIdAsync(int id)
    {
        var c = await db.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        return c is null ? null : ToDto(c);
    }

    public async Task<ClienteDto> CriarAsync(CreateClienteDto dto)
    {
        if (await db.Clientes.AnyAsync(c => c.Cpf == dto.Cpf))
            throw new InvalidOperationException("CPF já cadastrado.");

        var cliente = new Cliente
        {
            Nome = dto.Nome, Cpf = dto.Cpf,
            Telefone = dto.Telefone, Email = dto.Email
        };

        db.Clientes.Add(cliente);
        await db.SaveChangesAsync();
        return ToDto(cliente);
    }

    public async Task<ClienteDto?> AtualizarAsync(int id, CreateClienteDto dto)
    {
        var cliente = await db.Clientes.FindAsync(id);
        if (cliente is null) return null;

        cliente.Nome     = dto.Nome;
        cliente.Cpf      = dto.Cpf;
        cliente.Telefone = dto.Telefone;
        cliente.Email    = dto.Email;

        await db.SaveChangesAsync();
        return ToDto(cliente);
    }

    public async Task<bool> RemoverAsync(int id)
    {
        var cliente = await db.Clientes.FindAsync(id);
        if (cliente is null) return false;

        db.Clientes.Remove(cliente);
        await db.SaveChangesAsync();
        return true;
    }

    private static ClienteDto ToDto(Cliente c) =>
        new(c.Id, c.Nome, c.Cpf, c.Telefone, c.Email, c.CriadoEm);
}
