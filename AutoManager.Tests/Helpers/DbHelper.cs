using AutoManager.API.Data;
using Microsoft.EntityFrameworkCore;

namespace AutoManager.Tests.Helpers;

public static class DbHelper
{
    /// <summary>
    /// Cria um AppDbContext isolado em memória para cada teste.
    /// Cada chamada gera um banco com nome único para evitar conflitos.
    /// </summary>
    public static AppDbContext CriarContexto(string? nome = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(nome ?? Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }
}
