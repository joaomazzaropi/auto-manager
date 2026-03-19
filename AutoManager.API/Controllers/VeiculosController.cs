using AutoManager.API.Data;
using AutoManager.API.DTOs;
using AutoManager.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VeiculosController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar() =>
        Ok(await db.Veiculos
            .AsNoTracking()
            .Select(v => new VeiculoDto(v.Id, v.Placa, v.Marca, v.Modelo, v.Ano, v.Cor, v.ClienteId))
            .ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var v = await db.Veiculos.AsNoTracking().FirstOrDefaultAsync(v => v.Id == id);
        return v is null ? NotFound() : Ok(new VeiculoDto(v.Id, v.Placa, v.Marca, v.Modelo, v.Ano, v.Cor, v.ClienteId));
    }

    [HttpPost]
    public async Task<IActionResult> Criar(CreateVeiculoDto dto)
    {
        if (await db.Veiculos.AnyAsync(v => v.Placa == dto.Placa.ToUpper()))
            return Conflict(new { mensagem = "Placa já cadastrada." });

        if (!await db.Clientes.AnyAsync(c => c.Id == dto.ClienteId))
            return NotFound(new { mensagem = "Cliente não encontrado." });

        var veiculo = new Veiculo
        {
            Placa     = dto.Placa.ToUpper(),
            Marca     = dto.Marca,
            Modelo    = dto.Modelo,
            Ano       = dto.Ano,
            Cor       = dto.Cor,
            ClienteId = dto.ClienteId
        };

        db.Veiculos.Add(veiculo);
        await db.SaveChangesAsync();

        var result = new VeiculoDto(veiculo.Id, veiculo.Placa, veiculo.Marca,
                                    veiculo.Modelo, veiculo.Ano, veiculo.Cor, veiculo.ClienteId);

        return CreatedAtAction(nameof(ObterPorId), new { id = veiculo.Id }, result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remover(int id)
    {
        var veiculo = await db.Veiculos.FindAsync(id);
        if (veiculo is null) return NotFound();

        db.Veiculos.Remove(veiculo);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
