import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeiculoService } from '../../services/ordem.service';
import { ClienteService } from '../../services/cliente.service';
import { Veiculo, CreateVeiculoDto, Cliente } from '../../models/models';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="page-header">
        <h2>Veículos</h2>
        <button class="btn btn-primary" (click)="abrirModal()">+ Novo Veículo</button>
      </div>

      <div class="card">
        @if (loading) {
          <p style="color:var(--text-muted)">Carregando...</p>
        } @else if (veiculos.length === 0) {
          <div class="empty-state">Nenhum veículo cadastrado ainda.</div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Placa</th><th>Marca / Modelo</th><th>Ano</th>
                  <th>Cor</th><th>Cliente</th><th></th>
                </tr>
              </thead>
              <tbody>
                @for (v of veiculos; track v.id) {
                  <tr>
                    <td><code>{{ v.placa }}</code></td>
                    <td>{{ v.marca }} {{ v.modelo }}</td>
                    <td>{{ v.ano }}</td>
                    <td>{{ v.cor }}</td>
                    <td>{{ nomeCliente(v.clienteId) }}</td>
                    <td style="text-align:right">
                      <button class="btn btn-danger btn-sm" (click)="remover(v.id)">Remover</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    <!-- Modal ──────────────────────────────────────────── -->
    @if (modalAberto) {
      <div class="modal-backdrop" (click)="fecharModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Novo Veículo</h3>
          <div class="modal-form">
            <div class="form-group">
              <label>Placa</label>
              <input class="form-control" [(ngModel)]="form.placa"
                     placeholder="ABC-1234" style="text-transform:uppercase" />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="form-group">
                <label>Marca</label>
                <input class="form-control" [(ngModel)]="form.marca" placeholder="Volkswagen" />
              </div>
              <div class="form-group">
                <label>Modelo</label>
                <input class="form-control" [(ngModel)]="form.modelo" placeholder="Gol" />
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="form-group">
                <label>Ano</label>
                <input class="form-control" type="number" [(ngModel)]="form.ano" placeholder="2020" />
              </div>
              <div class="form-group">
                <label>Cor</label>
                <input class="form-control" [(ngModel)]="form.cor" placeholder="Prata" />
              </div>
            </div>
            <div class="form-group">
              <label>Proprietário</label>
              <select class="form-control" [(ngModel)]="form.clienteId">
                <option [ngValue]="0" disabled>Selecione um cliente</option>
                @for (c of clientes; track c.id) {
                  <option [ngValue]="c.id">{{ c.nome }}</option>
                }
              </select>
            </div>
            @if (erro) { <div class="alert alert-error">{{ erro }}</div> }
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" (click)="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" [disabled]="salvando" (click)="salvar()">
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    code { background:var(--bg); padding:2px 6px; border-radius:4px;
           font-family:monospace; font-size:13px; }
  `]
})
export class VeiculosComponent implements OnInit {
  private veiculoSvc = inject(VeiculoService);
  private clienteSvc = inject(ClienteService);

  veiculos: Veiculo[] = [];
  clientes: Cliente[] = [];
  loading     = true;
  modalAberto = false;
  salvando    = false;
  erro        = '';

  form: CreateVeiculoDto = { placa: '', marca: '', modelo: '', ano: new Date().getFullYear(), cor: '', clienteId: 0 };

  ngOnInit() {
    this.clienteSvc.listar().subscribe(c => { this.clientes = c; });
    this.carregar();
  }

  carregar() {
    this.loading = true;
    this.veiculoSvc.listar().subscribe({ next: v => { this.veiculos = v; this.loading = false; } });
  }

  nomeCliente(id: number): string {
    return this.clientes.find(c => c.id === id)?.nome ?? '—';
  }

  abrirModal() {
    this.form = { placa: '', marca: '', modelo: '', ano: new Date().getFullYear(), cor: '', clienteId: 0 };
    this.erro = '';
    this.modalAberto = true;
  }

  fecharModal() { this.modalAberto = false; }

  salvar() {
    this.erro = ''; this.salvando = true;
    this.form.placa = this.form.placa.toUpperCase();
    this.veiculoSvc.criar(this.form).subscribe({
      next: () => { this.fecharModal(); this.carregar(); this.salvando = false; },
      error: (e) => { this.erro = e.error?.mensagem ?? 'Erro ao salvar.'; this.salvando = false; }
    });
  }

  remover(id: number) {
    if (!confirm('Deseja remover este veículo?')) return;
    this.veiculoSvc.remover(id).subscribe(() => this.carregar());
  }
}
