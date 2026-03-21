using AutoManager.API.Data;
using AutoManager.API.DTOs;
using AutoManager.API.Entities;
using AutoManager.API.Services;
using AutoManager.Tests.Helpers;
using FluentAssertions;

namespace AutoManager.Tests.Services;

public class OrdemServicoServiceTests
{
    // ─── Seed ─────────────────────────────────────────────────────────────────
    // Cria um contexto já populado com 1 cliente e 1 veículo prontos para uso.

    private static (AppDbContext db, int veiculoId) CriarContextoComDados()
    {
        var db = DbHelper.CriarContexto();

        var cliente = new Cliente
        {
            Nome = "Carlos", Cpf = "111.111.111-11",
            Telefone = "(21) 91111-1111", Email = "carlos@email.com"
        };
        db.Clientes.Add(cliente);
        db.SaveChanges();

        var veiculo = new Veiculo
        {
            Placa = "ABC-1234", Marca = "VW", Modelo = "Gol",
            Ano = 2020, Cor = "Prata", ClienteId = cliente.Id
        };
        db.Veiculos.Add(veiculo);
        db.SaveChanges();

        return (db, veiculo.Id);
    }

    private static OrdemServicoService CriarService(AppDbContext db) =>
        new OrdemServicoService(db);

    // ─── Criar ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Criar_DeveRetornarOrdem_QuandoVeiculoExiste()
    {
        var (db, veiculoId) = CriarContextoComDados();
        var service = CriarService(db);

        var result = await service.CriarAsync(new CreateOrdemDto(
            "Troca de para-brisa", 800.00m, null, veiculoId));

        result.Id.Should().BeGreaterThan(0);
        result.Status.Should().Be("Aberta");
        result.ValorEstimado.Should().Be(800.00m);
        result.PlacaVeiculo.Should().Be("ABC-1234");
        result.NomeCliente.Should().Be("Carlos");
    }

    [Fact]
    public async Task Criar_DeveLancarExcecao_QuandoVeiculoNaoExiste()
    {
        var (db, _) = CriarContextoComDados();
        var service = CriarService(db);

        var acao = () => service.CriarAsync(new CreateOrdemDto(
            "Troca de vidro", 500m, null, veiculoId: 999));

        await acao.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*Veículo não encontrado*");
    }

    // ─── Listar ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task Listar_DeveRetornarTodasAsOrdens_SemFiltro()
    {
        var (db, veiculoId) = CriarContextoComDados();
        var service = CriarService(db);

        await service.CriarAsync(new CreateOrdemDto("OS 1", 100m, null, veiculoId));
        await service.CriarAsync(new CreateOrdemDto("OS 2", 200m, null, veiculoId));

        var result = await service.ListarAsync(status: null);

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task Listar_DeveRetornarApenasOrdensAbertas_QuandoFiltradoPorStatus()
    {
        var (db, veiculoId) = CriarContextoComDados();
        var service = CriarService(db);

        var os1 = await service.CriarAsync(new CreateOrdemDto("OS 1", 100m, null, veiculoId));
        await service.CriarAsync(new CreateOrdemDto("OS 2", 200m, null, veiculoId));

        await service.AtualizarStatusAsync(os1.Id, new UpdateStatusOrdemDto("Concluida", 100m));

        var abertas = await service.ListarAsync("Aberta");

        abertas.Should().HaveCount(1);
        abertas.First().Descricao.Should().Be("OS 2");
    }

    // ─── ObterPorId ───────────────────────────────────────────────────────────

    [Fact]
    public async Task ObterPorId_DeveRetornarOrdem_QuandoIdExiste()
    {
        var (db, veiculoId) = CriarContextoComDados();
        var service = CriarService(db);
        var criada = await service.CriarAsync(new CreateOrdemDto("Troca de vidro", 500m, null, veiculoId));

        var result = await service.ObterPorIdAsync(criada.Id);

        result.Should().NotBeNull();
        result!.Descricao.Should().Be("Troca de vidro");
    }

    [Fact]
    public async Task ObterPorId_DeveRetornarNull_QuandoIdNaoExiste()
    {
        var (db, _) = CriarContextoComDados();
        var service = CriarService(db);

        var result = await service.ObterPorIdAsync(999);

        result.Should().BeNull();
    }

    // ─── AtualizarStatus ──────────────────────────────────────────────────────

    [Fact]
    public async Task AtualizarStatus_DeveAlterarStatus_QuandoOrdemExiste()
    {
        var (db, veiculoId) = CriarContextoComDados();
        var service = CriarService(db);
        var criada = await service.CriarAsync(new CreateOrdemDto("Troca de vidro", 500m, null, veiculoId));

        var result = await service.AtualizarStatusAsync(criada.Id,
            new UpdateStatusOrdemDto("EmAndamento", null));

        result!.Status.Should().Be("EmAndamento");
    }

    [Fact]
    public async Task AtualizarStatus_DevePreencherConcluidaEm_QuandoStatusForConcluida()
    {
        var (db, veiculoId) = CriarContextoComDados();
        var service = CriarService(db);
        var criada = await service.CriarAsync(new CreateOrdemDto("Troca de vidro", 500m, null, veiculoId));

        var result = await service.AtualizarStatusAsync(criada.Id,
            new UpdateStatusOrdemDto("Concluida", 480m));

        result!.Status.Should().Be("Concluida");
        result.ValorFinal.Should().Be(480m);
        result.ConcluidaEm.Should().NotBeNull();
    }

    [Fact]
    public async Task AtualizarStatus_DeveLancarExcecao_QuandoStatusInvalido()
    {
        var (db, veiculoId) = CriarContextoComDados();
        var service = CriarService(db);
        var criada = await service.CriarAsync(new CreateOrdemDto("Troca de vidro", 500m, null, veiculoId));

        var acao = () => service.AtualizarStatusAsync(criada.Id,
            new UpdateStatusOrdemDto("StatusInexistente", null));

        await acao.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task AtualizarStatus_DeveRetornarNull_QuandoOrdemNaoExiste()
    {
        var (db, _) = CriarContextoComDados();
        var service = CriarService(db);

        var result = await service.AtualizarStatusAsync(999,
            new UpdateStatusOrdemDto("EmAndamento", null));

        result.Should().BeNull();
    }
}
