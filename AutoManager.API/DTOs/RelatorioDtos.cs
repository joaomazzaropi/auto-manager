namespace AutoManager.API.DTOs;

// ─── OS por Status ────────────────────────────────────────────────────────────
public record RelatorioStatusDto(
    string Status,
    int Quantidade,
    decimal ValorEstimadoTotal,
    decimal ValorFinalTotal
);

// ─── OS por Período ───────────────────────────────────────────────────────────
public record RelatorioPeriodoDto(
    string Periodo,        // ex: "2026-03"
    int OrdensAbertas,
    int OrdensConcluidas,
    decimal FaturamentoRealizado
);

// ─── Ranking de Clientes ──────────────────────────────────────────────────────
public record RelatorioClienteDto(
    string NomeCliente,
    int TotalOrdens,
    int OrdensConcluidas,
    decimal TotalFaturado
);

// ─── Veículos mais atendidos ──────────────────────────────────────────────────
public record RelatorioVeiculoDto(
    string Placa,
    string Modelo,
    string NomeCliente,
    int TotalOrdens,
    decimal TotalFaturado
);
