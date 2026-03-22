using AutoManager.API.DTOs;
using AutoManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdensServicoController(IOrdemServicoService ordemService) : ControllerBase
{
    /// <summary>
    /// Lista ordens de serviço com filtros e paginação.
    /// Parâmetros: status, cliente, placa, pagina (default 1), tamanho (default 10)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] OrdemQueryParams query) =>
        Ok(await ordemService.ListarAsync(query));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var ordem = await ordemService.ObterPorIdAsync(id);
        return ordem is null ? NotFound() : Ok(ordem);
    }

    [HttpPost]
    public async Task<IActionResult> Criar(CreateOrdemDto dto)
    {
        try
        {
            var ordem = await ordemService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = ordem.Id }, ordem);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> AtualizarStatus(int id, UpdateStatusOrdemDto dto)
    {
        try
        {
            var ordem = await ordemService.AtualizarStatusAsync(id, dto);
            return ordem is null ? NotFound() : Ok(ordem);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }
}
