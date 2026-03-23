using AutoManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RelatoriosController(IRelatorioService relatorioService) : ControllerBase
{
    /// <summary>Quantidade e valores agrupados por status da OS</summary>
    [HttpGet("status")]
    public async Task<IActionResult> PorStatus() =>
        Ok(await relatorioService.ResumoByStatusAsync());

    /// <summary>Ordens abertas, concluídas e faturamento por mês. Parâmetro: ?meses=6</summary>
    [HttpGet("periodo")]
    public async Task<IActionResult> PorPeriodo([FromQuery] int meses = 6) =>
        Ok(await relatorioService.ResumoByPeriodoAsync(meses));

    /// <summary>Clientes com mais OS e maior faturamento. Parâmetro: ?top=10</summary>
    [HttpGet("clientes")]
    public async Task<IActionResult> RankingClientes([FromQuery] int top = 10) =>
        Ok(await relatorioService.RankingClientesAsync(top));

    /// <summary>Veículos com mais atendimentos. Parâmetro: ?top=10</summary>
    [HttpGet("veiculos")]
    public async Task<IActionResult> VeiculosMaisAtendidos([FromQuery] int top = 10) =>
        Ok(await relatorioService.VeiculosMaisAtendidosAsync(top));
}
