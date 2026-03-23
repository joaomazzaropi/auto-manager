using AutoManager.API.Data;
using AutoManager.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AutoManager.API.Services;

public interface IRelatorioService
{
    Task<IEnumerable<RelatorioStatusDto>>   ResumoByStatusAsync();
    Task<IEnumerable<RelatorioPeriodoDto>>  ResumoByPeriodoAsync(int meses);
    Task<IEnumerable<RelatorioClienteDto>>  RankingClientesAsync(int top);
    Task<IEnumerable<RelatorioVeiculoDto>>  VeiculosMaisAtendidosAsync(int top);
}

public class RelatorioService(AppDbContext db) : IRelatorioService
{
    // ─── 1. Resumo por Status ─────────────────────────────────────────────────
    public async Task<IEnumerable<RelatorioStatusDto>> ResumoByStatusAsync()
    {
        var ordens = await db.OrdensServico.AsNoTracking().ToListAsync();

        return ordens
            .GroupBy(o => o.Status.ToString())
            .Select(g => new RelatorioStatusDto(
                g.Key,
                g.Count(),
                g.Sum(o => o.ValorEstimado),
                g.Sum(o => o.ValorFinal ?? 0)
            ))
            .OrderByDescending(r => r.Quantidade);
    }

    // ─── 2. Resumo por Período ────────────────────────────────────────────────
    public async Task<IEnumerable<RelatorioPeriodoDto>> ResumoByPeriodoAsync(int meses)
    {
        var corte  = DateTime.UtcNow.AddMonths(-meses);
        var ordens = await db.OrdensServico
            .AsNoTracking()
            .Where(o => o.AbertaEm >= corte)
            .ToListAsync();

        return ordens
            .GroupBy(o => $"{o.AbertaEm.Year}-{o.AbertaEm.Month:D2}")
            .Select(g => new RelatorioPeriodoDto(
                g.Key,
                g.Count(),
                g.Count(o => o.Status.ToString() == "Concluida"),
                g.Where(o => o.Status.ToString() == "Concluida")
                 .Sum(o => o.ValorFinal ?? 0)
            ))
            .OrderByDescending(r => r.Periodo);
    }

    // ─── 3. Ranking de Clientes ───────────────────────────────────────────────
    public async Task<IEnumerable<RelatorioClienteDto>> RankingClientesAsync(int top)
    {
        var dados = await db.Clientes
            .AsNoTracking()
            .Include(c => c.Veiculos)
            .ThenInclude(v => v.OrdensServico)
            .ToListAsync();

        return dados
            .Select(c =>
            {
                var ordens = c.Veiculos.SelectMany(v => v.OrdensServico).ToList();
                return new RelatorioClienteDto(
                    c.Nome,
                    ordens.Count,
                    ordens.Count(o => o.Status.ToString() == "Concluida"),
                    ordens.Sum(o => o.ValorFinal ?? 0)
                );
            })
            .Where(r => r.TotalOrdens > 0)
            .OrderByDescending(r => r.TotalFaturado)
            .Take(top);
    }

    // ─── 4. Veículos mais atendidos ───────────────────────────────────────────
    public async Task<IEnumerable<RelatorioVeiculoDto>> VeiculosMaisAtendidosAsync(int top)
    {
        var dados = await db.Veiculos
            .AsNoTracking()
            .Include(v => v.Cliente)
            .Include(v => v.OrdensServico)
            .Where(v => v.OrdensServico.Any())
            .ToListAsync();

        return dados
            .Select(v => new RelatorioVeiculoDto(
                v.Placa,
                $"{v.Marca} {v.Modelo}",
                v.Cliente.Nome,
                v.OrdensServico.Count,
                v.OrdensServico.Sum(o => o.ValorFinal ?? 0)
            ))
            .OrderByDescending(r => r.TotalOrdens)
            .Take(top);
    }
}
