using AutoManager.API.Data;
using AutoManager.API.DTOs;
using AutoManager.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoManager.API.Services;

public interface IOrdemServicoService
{
    Task<IEnumerable<OrdemDto>> ListarAsync(string? status);
    Task<OrdemDto?> ObterPorIdAsync(int id);
    Task<OrdemDto> CriarAsync(CreateOrdemDto dto);
    Task<OrdemDto?> AtualizarStatusAsync(int id, UpdateStatusOrdemDto dto);
}

public class OrdemServicoService(AppDbContext db) : IOrdemServicoService
{
    public async Task<IEnumerable<OrdemDto>> ListarAsync(string? status)
    {
        var query = db.OrdensServico
            .AsNoTracking()
            .Include(o => o.Veiculo)
            .ThenInclude(v => v.Cliente)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<StatusOrdem>(status, true, out var statusEnum))
        {
            query = query.Where(o => o.Status == statusEnum);
        }

        return await query.Select(o => ToDto(o)).ToListAsync();
    }

    public async Task<OrdemDto?> ObterPorIdAsync(int id)
    {
        var ordem = await db.OrdensServico
            .AsNoTracking()
            .Include(o => o.Veiculo)
            .ThenInclude(v => v.Cliente)
            .FirstOrDefaultAsync(o => o.Id == id);

        return ordem is null ? null : ToDto(ordem);
    }

    public async Task<OrdemDto> CriarAsync(CreateOrdemDto dto)
    {
        var veiculo = await db.Veiculos
            .Include(v => v.Cliente)
            .FirstOrDefaultAsync(v => v.Id == dto.VeiculoId)
            ?? throw new KeyNotFoundException("Veículo não encontrado.");

        var ordem = new OrdemServico
        {
            Descricao = dto.Descricao,
            ValorEstimado = dto.ValorEstimado,
            Observacoes = dto.Observacoes,
            VeiculoId = dto.VeiculoId
        };

        db.OrdensServico.Add(ordem);
        await db.SaveChangesAsync();

        ordem.Veiculo = veiculo;
        return ToDto(ordem);
    }

    public async Task<OrdemDto?> AtualizarStatusAsync(int id, UpdateStatusOrdemDto dto)
    {
        var ordem = await db.OrdensServico
            .Include(o => o.Veiculo)
            .ThenInclude(v => v.Cliente)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (ordem is null) return null;

        if (!Enum.TryParse<StatusOrdem>(dto.Status, true, out var novoStatus))
            throw new ArgumentException($"Status '{dto.Status}' inválido.");

        ordem.Status = novoStatus;

        if (novoStatus == StatusOrdem.Concluida)
        {
            ordem.ConcluidaEm = DateTime.UtcNow;
            ordem.ValorFinal = dto.ValorFinal;
        }

        await db.SaveChangesAsync();
        return ToDto(ordem);
    }

    private static OrdemDto ToDto(OrdemServico o) =>
        new(
            o.Id,
            o.Descricao,
            o.Status.ToString(),
            o.ValorEstimado,
            o.ValorFinal,
            o.Observacoes,
            o.AbertaEm,
            o.ConcluidaEm,
            o.VeiculoId,
            o.Veiculo?.Placa ?? "",
            o.Veiculo?.Cliente?.Nome ?? ""
        );
}
