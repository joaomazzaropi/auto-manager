namespace AutoManager.API.Entities;

public enum StatusOrdem
{
    Aberta,
    EmAndamento,
    Concluida,
    Cancelada
}

public class OrdemServico
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public StatusOrdem Status { get; set; } = StatusOrdem.Aberta;
    public decimal ValorEstimado { get; set; }
    public decimal? ValorFinal { get; set; }
    public string? Observacoes { get; set; }
    public DateTime AbertaEm { get; set; } = DateTime.UtcNow;
    public DateTime? ConcluidaEm { get; set; }

    public int VeiculoId { get; set; }
    public Veiculo Veiculo { get; set; } = null!;
}
