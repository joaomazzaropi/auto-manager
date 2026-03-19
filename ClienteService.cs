using AutoManager.API.Data;
using AutoManager.API.DTOs;
using AutoManager.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoManager.API.Services;

public interface IClienteService
{
    Task<IEnumerable<ClienteDto>> ListarAsync();
    Task<ClienteDto?> ObterPorIdAsync(int id);
    Task<ClienteDto> CriarAsync(CreateClienteDto dto);
    Task<ClienteDto?> AtualizarAsync(int id, CreateClienteDto dto);
    Task<bool> RemoverAsync(int id);
}

public class ClienteService(AppDbContext db) : IClienteService
{
    public async Task<IEnumerable<ClienteDto>> ListarAsync() =>
        await db.Clientes
            .AsNoTracking()
            .Select(c => ToDto(c))
            .ToListAsync();

    public async Task<ClienteDto?> ObterPorIdAsync(int id)
    {
        var cliente = await db.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        return cliente is null ? null : ToDto(cliente);
    }

    public async Task<ClienteDto> CriarAsync(CreateClienteDto dto)
    {
        if (await db.Clientes.AnyAsync(c => c.Cpf == dto.Cpf))
            throw new InvalidOperationException("CPF já cadastrado.");

        var cliente = new Cliente
        {
            Nome = dto.Nome,
            Cpf = dto.Cpf,
            Telefone = dto.Telefone,
            Email = dto.Email
        };

        db.Clientes.Add(cliente);
        await db.SaveChangesAsync();
        return ToDto(cliente);
    }

    public async Task<ClienteDto?> AtualizarAsync(int id, CreateClienteDto dto)
    {
        var cliente = await db.Clientes.FindAsync(id);
        if (cliente is null) return null;

        cliente.Nome = dto.Nome;
        cliente.Cpf = dto.Cpf;
        cliente.Telefone = dto.Telefone;
        cliente.Email = dto.Email;

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
