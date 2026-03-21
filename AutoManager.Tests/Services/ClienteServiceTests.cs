using AutoManager.API.DTOs;
using AutoManager.API.Services;
using AutoManager.Tests.Helpers;
using FluentAssertions;

namespace AutoManager.Tests.Services;

public class ClienteServiceTests
{
    private static ClienteService CriarService() =>
        new ClienteService(DbHelper.CriarContexto());

    // ─── Criar ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Criar_DeveRetornarClienteComId_QuandoDadosValidos()
    {
        var service = CriarService();
        var dto = new CreateClienteDto("Maria Silva", "123.456.789-00", "(21) 99999-0000", "maria@email.com");

        var result = await service.CriarAsync(dto);

        result.Id.Should().BeGreaterThan(0);
        result.Nome.Should().Be("Maria Silva");
        result.Cpf.Should().Be("123.456.789-00");
    }

    [Fact]
    public async Task Criar_DeveLancarExcecao_QuandoCpfDuplicado()
    {
        var service = CriarService();
        var dto = new CreateClienteDto("Maria", "123.456.789-00", "(21) 99999-0000", "maria@email.com");

        await service.CriarAsync(dto);

        var acao = () => service.CriarAsync(
            new CreateClienteDto("Outro Nome", "123.456.789-00", "(21) 88888-0000", "outro@email.com"));

        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*CPF já cadastrado*");
    }

    // ─── Listar ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task Listar_DeveRetornarTodosOsClientes()
    {
        var service = CriarService();
        await service.CriarAsync(new CreateClienteDto("Maria", "111.111.111-11", "(21) 1111-1111", "a@a.com"));
        await service.CriarAsync(new CreateClienteDto("João",  "222.222.222-22", "(21) 2222-2222", "b@b.com"));

        var result = await service.ListarAsync();

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task Listar_DeveRetornarListaVazia_QuandoNaoHaClientes()
    {
        var service = CriarService();

        var result = await service.ListarAsync();

        result.Should().BeEmpty();
    }

    // ─── ObterPorId ───────────────────────────────────────────────────────────

    [Fact]
    public async Task ObterPorId_DeveRetornarCliente_QuandoIdExiste()
    {
        var service = CriarService();
        var criado = await service.CriarAsync(
            new CreateClienteDto("Maria", "123.456.789-00", "(21) 99999-0000", "maria@email.com"));

        var result = await service.ObterPorIdAsync(criado.Id);

        result.Should().NotBeNull();
        result!.Nome.Should().Be("Maria");
    }

    [Fact]
    public async Task ObterPorId_DeveRetornarNull_QuandoIdNaoExiste()
    {
        var service = CriarService();

        var result = await service.ObterPorIdAsync(999);

        result.Should().BeNull();
    }

    // ─── Atualizar ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Atualizar_DeveAlterarDados_QuandoClienteExiste()
    {
        var service = CriarService();
        var criado = await service.CriarAsync(
            new CreateClienteDto("Maria", "123.456.789-00", "(21) 99999-0000", "maria@email.com"));

        var result = await service.AtualizarAsync(criado.Id,
            new CreateClienteDto("Maria Souza", "123.456.789-00", "(21) 77777-0000", "maria.souza@email.com"));

        result.Should().NotBeNull();
        result!.Nome.Should().Be("Maria Souza");
        result.Telefone.Should().Be("(21) 77777-0000");
    }

    [Fact]
    public async Task Atualizar_DeveRetornarNull_QuandoClienteNaoExiste()
    {
        var service = CriarService();

        var result = await service.AtualizarAsync(999,
            new CreateClienteDto("X", "000.000.000-00", "(00) 0000-0000", "x@x.com"));

        result.Should().BeNull();
    }

    // ─── Remover ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task Remover_DeveRetornarTrue_QuandoClienteExiste()
    {
        var service = CriarService();
        var criado = await service.CriarAsync(
            new CreateClienteDto("Maria", "123.456.789-00", "(21) 99999-0000", "maria@email.com"));

        var result = await service.RemoverAsync(criado.Id);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task Remover_DeveRetornarFalse_QuandoClienteNaoExiste()
    {
        var service = CriarService();

        var result = await service.RemoverAsync(999);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task Remover_DeveReduzirListagem_AposExclusao()
    {
        var service = CriarService();
        var criado = await service.CriarAsync(
            new CreateClienteDto("Maria", "123.456.789-00", "(21) 99999-0000", "maria@email.com"));

        await service.RemoverAsync(criado.Id);
        var lista = await service.ListarAsync();

        lista.Should().BeEmpty();
    }
}
