using AutoManager.API.DTOs;
using AutoManager.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientesController(IClienteService clienteService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar() =>
        Ok(await clienteService.ListarAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var cliente = await clienteService.ObterPorIdAsync(id);
        return cliente is null ? NotFound() : Ok(cliente);
    }

    [HttpPost]
    public async Task<IActionResult> Criar(CreateClienteDto dto)
    {
        try
        {
            var cliente = await clienteService.CriarAsync(dto);
            return CreatedAtAction(nameof(ObterPorId), new { id = cliente.Id }, cliente);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensagem = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, CreateClienteDto dto)
    {
        var cliente = await clienteService.AtualizarAsync(id, dto);
        return cliente is null ? NotFound() : Ok(cliente);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remover(int id)
    {
        var removido = await clienteService.RemoverAsync(id);
        return removido ? NoContent() : NotFound();
    }
}
