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
    // Equivalente PL/SQL:
    //   SELECT Status,
    //          COUNT(*)              AS Quantidade,
    //          SUM(ValorEstimado)    AS ValorEstimadoTotal,
    //          COALESCE(SUM(ValorFinal), 0) AS ValorFinalTotal
    //   FROM OrdensServico
    //   GROUP BY Status
    //   ORDER BY Quantidade DESC
    public async Task<IEnumerable<RelatorioStatusDto>> ResumoByStatusAsync()
    {
        var resultado = await db.OrdensServico
            .GroupBy(o => o.Status)
            .Select(g => new RelatorioStatusDto(
                g.Key.ToString(),
                g.Count(),
                g.Sum(o => o.ValorEstimado),
                g.Sum(o => o.ValorFinal ?? 0)
            ))
            .OrderByDescending(r => r.Quantidade)
            .ToListAsync();

        return resultado;
    }

    // ─── 2. Resumo por Período (últimos N meses) ──────────────────────────────
    // Equivalente PL/SQL:
    //   SELECT STRFTIME('%Y-%m', AbertaEm)   AS Periodo,
    //          COUNT(*)                       AS OrdensAbertas,
    //          SUM(CASE WHEN Status = 'Concluida' THEN 1 ELSE 0 END) AS OrdensConcluidas,
    //          COALESCE(SUM(CASE WHEN Status = 'Concluida' THEN ValorFinal ELSE 0 END), 0) AS Faturamento
    //   FROM OrdensServico
    //   WHERE AbertaEm >= DATE('now', '-N months')
    //   GROUP BY Periodo
    //   ORDER BY Periodo DESC
    public async Task<IEnumerable<RelatorioPeriodoDto>> ResumoByPeriodoAsync(int meses)
    {
        var corte = DateTime.UtcNow.AddMonths(-meses);

        var resultado = await db.OrdensServico
            .Where(o => o.AbertaEm >= corte)
            .GroupBy(o => new { o.AbertaEm.Year, o.AbertaEm.Month })
            .Select(g => new RelatorioPeriodoDto(
                $"{g.Key.Year}-{g.Key.Month:D2}",
                g.Count(),
                g.Count(o => o.Status.ToString() == "Concluida"),
                g.Sum(o => o.Status.ToString() == "Concluida" ? (o.ValorFinal ?? 0) : 0)
            ))
            .OrderByDescending(r => r.Periodo)
            .ToListAsync();

        return resultado;
    }

    // ─── 3. Ranking de Clientes ───────────────────────────────────────────────
    // Equivalente PL/SQL:
    //   SELECT c.Nome,
    //          COUNT(os.Id)          AS TotalOrdens,
    //          SUM(CASE WHEN os.Status = 'Concluida' THEN 1 ELSE 0 END) AS OrdensConcluidas,
    //          COALESCE(SUM(os.ValorFinal), 0) AS TotalFaturado
    //   FROM Clientes c
    //   JOIN Veiculos v   ON v.ClienteId = c.Id
    //   JOIN OrdensServico os ON os.VeiculoId = v.Id
    //   GROUP BY c.Id, c.Nome
    //   ORDER BY TotalFaturado DESC
    //   FETCH FIRST :top ROWS ONLY
    public async Task<IEnumerable<RelatorioClienteDto>> RankingClientesAsync(int top)
    {
        var resultado = await db.Clientes
            .Select(c => new RelatorioClienteDto(
                c.Nome,
                c.Veiculos.SelectMany(v => v.OrdensServico).Count(),
                c.Veiculos.SelectMany(v => v.OrdensServico)
                           .Count(o => o.Status.ToString() == "Concluida"),
                c.Veiculos.SelectMany(v => v.OrdensServico)
                           .Sum(o => o.ValorFinal ?? 0)
            ))
            .Where(r => r.TotalOrdens > 0)
            .OrderByDescending(r => r.TotalFaturado)
            .Take(top)
            .ToListAsync();

        return resultado;
    }

    // ─── 4. Veículos mais atendidos ───────────────────────────────────────────
    // Equivalente PL/SQL:
    //   SELECT v.Placa, v.Modelo, c.Nome,
    //          COUNT(os.Id)          AS TotalOrdens,
    //          COALESCE(SUM(os.ValorFinal), 0) AS TotalFaturado
    //   FROM Veiculos v
    //   JOIN Clientes c ON c.Id = v.ClienteId
    //   JOIN OrdensServico os ON os.VeiculoId = v.Id
    //   GROUP BY v.Id, v.Placa, v.Modelo, c.Nome
    //   ORDER BY TotalOrdens DESC
    //   FETCH FIRST :top ROWS ONLY
    public async Task<IEnumerable<RelatorioVeiculoDto>> VeiculosMaisAtendidosAsync(int top)
    {
        var resultado = await db.Veiculos
            .Include(v => v.Cliente)
            .Include(v => v.OrdensServico)
            .Where(v => v.OrdensServico.Any())
            .Select(v => new RelatorioVeiculoDto(
                v.Placa,
                $"{v.Marca} {v.Modelo}",
                v.Cliente.Nome,
                v.OrdensServico.Count(),
                v.OrdensServico.Sum(o => o.ValorFinal ?? 0)
            ))
            .OrderByDescending(r => r.TotalOrdens)
            .Take(top)
            .ToListAsync();

        return resultado;
    }
}
