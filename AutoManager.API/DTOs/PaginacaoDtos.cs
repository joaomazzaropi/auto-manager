namespace AutoManager.API.DTOs;

// ─── Resposta paginada genérica ───────────────────────────────────────────────
public record PagedResult<T>(
    IEnumerable<T> Items,
    int Total,
    int Pagina,
    int TamanhoPagina,
    int TotalPaginas
);

// ─── Parâmetros de query ──────────────────────────────────────────────────────
public record ClienteQueryParams
{
    public string? Nome     { get; init; }
    public string? Cpf      { get; init; }
    public int     Pagina   { get; init; } = 1;
    public int     Tamanho  { get; init; } = 10;
}

public record OrdemQueryParams
{
    public string? Status    { get; init; }
    public string? Cliente   { get; init; }
    public string? Placa     { get; init; }
    public int     Pagina    { get; init; } = 1;
    public int     Tamanho   { get; init; } = 10;
}

public record VeiculoQueryParams
{
    public string? Placa     { get; init; }
    public string? Modelo    { get; init; }
    public int     ClienteId { get; init; } = 0;
    public int     Pagina    { get; init; } = 1;
    public int     Tamanho   { get; init; } = 10;
}
