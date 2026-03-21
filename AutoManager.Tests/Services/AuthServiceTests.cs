using AutoManager.API.DTOs;
using AutoManager.API.Services;
using AutoManager.Tests.Helpers;
using FluentAssertions;
using Microsoft.Extensions.Configuration;

namespace AutoManager.Tests.Services;

public class AuthServiceTests
{
    private static AuthService CriarService()
    {
        var db = DbHelper.CriarContexto();

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"]            = "chave_secreta_para_testes_32_chars!!",
                ["Jwt:Issuer"]         = "AutoManager",
                ["Jwt:Audience"]       = "AutoManagerUsers",
                ["Jwt:ExpiresInHours"] = "8"
            })
            .Build();

        return new AuthService(db, config);
    }

    // ─── Register ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task Register_DeveRetornarToken_QuandoDadosValidos()
    {
        var service = CriarService();
        var dto = new RegisterDto("João", "joao@email.com", "senha123");

        var result = await service.RegisterAsync(dto);

        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrWhiteSpace();
        result.Nome.Should().Be("João");
        result.Email.Should().Be("joao@email.com");
    }

    [Fact]
    public async Task Register_DeveLancarExcecao_QuandoEmailJaCadastrado()
    {
        var service = CriarService();
        var dto = new RegisterDto("João", "joao@email.com", "senha123");

        await service.RegisterAsync(dto);

        var acao = () => service.RegisterAsync(dto);

        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*já cadastrado*");
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Login_DeveRetornarToken_QuandoCredenciaisCorretas()
    {
        var service = CriarService();
        await service.RegisterAsync(new RegisterDto("João", "joao@email.com", "senha123"));

        var result = await service.LoginAsync(new LoginDto("joao@email.com", "senha123"));

        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Login_DeveLancarExcecao_QuandoEmailNaoCadastrado()
    {
        var service = CriarService();

        var acao = () => service.LoginAsync(new LoginDto("inexistente@email.com", "senha123"));

        await acao.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Credenciais inválidas*");
    }

    [Fact]
    public async Task Login_DeveLancarExcecao_QuandoSenhaErrada()
    {
        var service = CriarService();
        await service.RegisterAsync(new RegisterDto("João", "joao@email.com", "senha123"));

        var acao = () => service.LoginAsync(new LoginDto("joao@email.com", "senha_errada"));

        await acao.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Credenciais inválidas*");
    }
}
