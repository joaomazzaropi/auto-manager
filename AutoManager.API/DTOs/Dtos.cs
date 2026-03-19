namespace AutoManager.API.DTOs;

// ─── Auth ────────────────────────────────────────────────────────────────────

public record RegisterDto(string Nome, string Email, string Senha);

public record LoginDto(string Email, string Senha);

public record TokenDto(string Token, string Nome, string Email);

// ─── Cliente ─────────────────────────────────────────────────────────────────

public record CreateClienteDto(
    string Nome,
    string Cpf,
    string Telefone,
    string Email
);

public record ClienteDto(
    int Id,
    string Nome,
    string Cpf,
    string Telefone,
    string Email,
    DateTime CriadoEm
);

// ─── Veiculo ─────────────────────────────────────────────────────────────────

public record CreateVeiculoDto(
    string Placa,
    string Marca,
    string Modelo,
    int Ano,
    string Cor,
    int ClienteId
);

public record VeiculoDto(
    int Id,
    string Placa,
    string Marca,
    string Modelo,
    int Ano,
    string Cor,
    int ClienteId
);

// ─── Ordem de Serviço ────────────────────────────────────────────────────────

public record CreateOrdemDto(
    string Descricao,
    decimal ValorEstimado,
    string? Observacoes,
    int VeiculoId
);

public record UpdateStatusOrdemDto(string Status, decimal? ValorFinal);

public record OrdemDto(
    int Id,
    string Descricao,
    string Status,
    decimal ValorEstimado,
    decimal? ValorFinal,
    string? Observacoes,
    DateTime AbertaEm,
    DateTime? ConcluidaEm,
    int VeiculoId,
    string PlacaVeiculo,
    string NomeCliente
);
