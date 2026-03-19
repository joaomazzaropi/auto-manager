using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoManager.API.Data;
using AutoManager.API.DTOs;
using AutoManager.API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AutoManager.API.Services;

public interface IAuthService
{
    Task<TokenDto> RegisterAsync(RegisterDto dto);
    Task<TokenDto> LoginAsync(LoginDto dto);
}

public class AuthService(AppDbContext db, IConfiguration config) : IAuthService
{
    public async Task<TokenDto> RegisterAsync(RegisterDto dto)
    {
        if (await db.Usuarios.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("E-mail já cadastrado.");

        var usuario = new Usuario
        {
            Nome = dto.Nome,
            Email = dto.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha)
        };

        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();

        return GerarToken(usuario);
    }

    public async Task<TokenDto> LoginAsync(LoginDto dto)
    {
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new UnauthorizedAccessException("Credenciais inválidas.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
            throw new UnauthorizedAccessException("Credenciais inválidas.");

        return GerarToken(usuario);
    }

    private TokenDto GerarToken(Usuario usuario)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Key"]!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Email, usuario.Email)
        };

        var expira = DateTime.UtcNow.AddHours(
            double.Parse(config["Jwt:ExpiresInHours"]!));

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: expira,
            signingCredentials: creds
        );

        return new TokenDto(
            new JwtSecurityTokenHandler().WriteToken(token),
            usuario.Nome,
            usuario.Email
        );
    }
}
