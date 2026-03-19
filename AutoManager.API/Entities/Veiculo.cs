namespace AutoManager.API.Entities;

public class Veiculo
{
    public int Id { get; set; }
    public string Placa { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int Ano { get; set; }
    public string Cor { get; set; } = string.Empty;

    public int ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;

    public ICollection<OrdemServico> OrdensServico { get; set; } = [];
}
