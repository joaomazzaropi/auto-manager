using AutoManager.API.Data;
using AutoManager.API.DTOs;
using AutoManager.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoManager.API.Services;

public interface IOrdemServicoService
{
    Task<PagedResult<OrdemDto>> ListarAsync(OrdemQueryParams query);
    Task<OrdemDto?> ObterPorIdAsync(int id);
    Task<OrdemDto> CriarAsync(CreateOrdemDto dto);
    Task<OrdemDto?> AtualizarStatusAsync(int id, UpdateStatusOrdemDto dto);
}

public class OrdemServicoService(AppDbContext db) : IOrdemServicoService
{
    public async Task<PagedResult<OrdemDto>> ListarAsync(OrdemQueryParams query)
    {
        var q = db.OrdensServico
            .AsNoTracking()
            .Include(o => o.Veiculo)
            .ThenInclude(v => v.Cliente)
            .AsQueryable();

        // ── Filtros ──────────────────────────────────────────────────────────
        if (!string.IsNullOrWhiteSpace(query.Status) &&
            Enum.TryParse<StatusOrdem>(query.Status, true, out var statusEnum))
            q = q.Where(o => o.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(query.Cliente))
            q = q.Where(o => o.Veiculo.Cliente.Nome.ToLower()
                               .Contains(query.Cliente.ToLower()));

        if (!string.IsNullOrWhiteSpace(query.Placa))
            q = q.Where(o => o.Veiculo.Placa.Contains(query.Placa.ToUpper()));

        // ── Paginação ────────────────────────────────────────────────────────
        var total   = await q.CountAsync();
        var tamanho = Math.Clamp(query.Tamanho, 1, 100);
        var pagina  = Math.Max(query.Pagina, 1);

        var items = await q
            .OrderByDescending(o => o.AbertaEm)
            .Skip((pagina - 1) * tamanho)
            .Take(tamanho)
            .Select(o => ToDto(o))
            .ToListAsync();

        return new PagedResult<OrdemDto>(
            items, total, pagina, tamanho,
            (int)Math.Ceiling((double)total / tamanho));
    }

    public async Task<OrdemDto?> ObterPorIdAsync(int id)
    {
        var o = await db.OrdensServico
            .AsNoTracking()
            .Include(o => o.Veiculo).ThenInclude(v => v.Cliente)
            .FirstOrDefaultAsync(o => o.Id == id);

        return o is null ? null : ToDto(o);
    }

    public async Task<OrdemDto> CriarAsync(CreateOrdemDto dto)
    {
        var veiculo = await db.Veiculos
            .Include(v => v.Cliente)
            .FirstOrDefaultAsync(v => v.Id == dto.VeiculoId)
            ?? throw new KeyNotFoundException("Veículo não encontrado.");

        var ordem = new OrdemServico
        {
            Descricao      = dto.Descricao,
            ValorEstimado  = dto.ValorEstimado,
            Observacoes    = dto.Observacoes,
            VeiculoId      = dto.VeiculoId
        };

        db.OrdensServico.Add(ordem);
        await db.SaveChangesAsync();
        ordem.Veiculo = veiculo;
        return ToDto(ordem);
    }

    public async Task<OrdemDto?> AtualizarStatusAsync(int id, UpdateStatusOrdemDto dto)
    {
        var ordem = await db.OrdensServico
            .Include(o => o.Veiculo).ThenInclude(v => v.Cliente)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (ordem is null) return null;

        if (!Enum.TryParse<StatusOrdem>(dto.Status, true, out var novoStatus))
            throw new ArgumentException($"Status '{dto.Status}' inválido.");

        ordem.Status = novoStatus;

        if (novoStatus == StatusOrdem.Concluida)
        {
            ordem.ConcluidaEm = DateTime.UtcNow;
            ordem.ValorFinal  = dto.ValorFinal;
        }

        await db.SaveChangesAsync();
        return ToDto(ordem);
    }

    private static OrdemDto ToDto(OrdemServico o) =>
        new(o.Id, o.Descricao, o.Status.ToString(), o.ValorEstimado,
            o.ValorFinal, o.Observacoes, o.AbertaEm, o.ConcluidaEm,
            o.VeiculoId, o.Veiculo?.Placa ?? "", o.Veiculo?.Cliente?.Nome ?? "");
}
