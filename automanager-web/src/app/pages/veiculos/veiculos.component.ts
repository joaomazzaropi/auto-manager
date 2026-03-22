import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeiculoService } from '../../services/ordem.service';
import { ClienteService } from '../../services/cliente.service';
import { Veiculo, CreateVeiculoDto, CreateClienteDto, Cliente } from '../../models/models';
import { MaskDirective } from '../../directives/mask.directive';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, MaskDirective],
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
                <tr><th>Placa</th><th>Marca / Modelo</th><th>Ano</th><th>Cor</th><th>Cliente</th><th></th></tr>
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

    @if (modalAberto) {
      <div class="modal-backdrop" (click)="fecharModal()">
        <div class="modal" style="max-width:520px" (click)="$event.stopPropagation()">
          <h3>Novo Veículo</h3>
          <div class="modal-form">

            <div class="form-group">
              <label>Placa</label>
              <input class="form-control" [(ngModel)]="form.placa"
                     placeholder="ABC-1234" appMask="placa" />
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="form-group">
                <label>Marca</label>
                <input class="form-control" [(ngModel)]="form.marca"
                       placeholder="Volkswagen" maxlength="40" />
              </div>
              <div class="form-group">
                <label>Modelo</label>
                <input class="form-control" [(ngModel)]="form.modelo"
                       placeholder="Gol" maxlength="40" />
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="form-group">
                <label>Ano</label>
                <input class="form-control" type="number" [(ngModel)]="form.ano"
                       [min]="1900" [max]="anoAtual + 1" />
              </div>
              <div class="form-group">
                <label>Cor</label>
                <input class="form-control" [(ngModel)]="form.cor"
                       placeholder="Prata" maxlength="30" />
              </div>
            </div>

            <!-- Proprietário -->
            <div class="form-group">
              <label>Proprietário</label>
              @if (clientes.length > 0) {
                <select class="form-control" [(ngModel)]="form.clienteId">
                  <option [ngValue]="0" disabled>Selecione um cliente</option>
                  @for (c of clientes; track c.id) {
                    <option [ngValue]="c.id">{{ c.nome }}</option>
                  }
                </select>
                <button class="link-btn" (click)="toggleNovoCliente()">
                  {{ criandoCliente ? '✕ Cancelar novo cliente' : '+ Cadastrar novo cliente' }}
                </button>
              } @else {
                <div class="aviso-cliente">
                  <span>⚠️ Nenhum cliente cadastrado.</span>
                  <button class="link-btn" (click)="toggleNovoCliente()">
                    {{ criandoCliente ? '✕ Cancelar' : 'Cadastrar agora' }}
                  </button>
                </div>
              }
            </div>

            <!-- Sub-formulário cliente inline -->
            @if (criandoCliente) {
              <div class="subform">
                <div class="subform-header">👤 Novo Cliente</div>
                <div class="form-group">
                  <label>Nome</label>
                  <input class="form-control" [(ngModel)]="formCliente.nome"
                         placeholder="Nome completo" maxlength="100" />
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                  <div class="form-group">
                    <label>CPF</label>
                    <input class="form-control" [(ngModel)]="formCliente.cpf"
                           placeholder="000.000.000-00" appMask="cpf" />
                  </div>
                  <div class="form-group">
                    <label>Telefone</label>
                    <input class="form-control" [(ngModel)]="formCliente.telefone"
                           placeholder="(00) 00000-0000" appMask="telefone" />
                  </div>
                </div>
                <div class="form-group">
                  <label>E-mail</label>
                  <input class="form-control" type="email" [(ngModel)]="formCliente.email"
                         placeholder="cliente@email.com" maxlength="100" />
                </div>
                @if (erroCliente) { <div class="alert alert-error">{{ erroCliente }}</div> }
                <button class="btn btn-primary btn-sm" style="margin-top:4px"
                        [disabled]="salvandoCliente" (click)="salvarCliente()">
                  {{ salvandoCliente ? 'Salvando...' : '✓ Salvar cliente e vincular' }}
                </button>
              </div>
            }

            @if (erro) { <div class="alert alert-error">{{ erro }}</div> }
          </div>

          <div class="modal-actions">
            <button class="btn btn-outline" (click)="fecharModal()">Cancelar</button>
            <button class="btn btn-primary" [disabled]="salvando || criandoCliente" (click)="salvar()">
              {{ salvando ? 'Salvando...' : 'Salvar Veículo' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    code { background:var(--bg); padding:2px 6px; border-radius:4px; font-family:monospace; font-size:13px; }
    .link-btn { background:none; border:none; color:var(--primary); font-size:13px;
                cursor:pointer; padding:4px 0; display:block; margin-top:6px; }
    .link-btn:hover { text-decoration:underline; }
    .aviso-cliente { display:flex; align-items:center; justify-content:space-between;
                     background:#fef3c7; border:1px solid #fcd34d; border-radius:var(--radius);
                     padding:10px 12px; font-size:13px; color:#92400e; }
    .aviso-cliente .link-btn { color:#92400e; margin:0; font-weight:600; }
    .subform { background:#f8fafc; border:1px solid var(--border); border-radius:var(--radius);
               padding:16px; display:flex; flex-direction:column; gap:12px; }
    .subform-header { font-size:13px; font-weight:600; color:var(--primary);
                      padding-bottom:8px; border-bottom:1px solid var(--border); }
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
  anoAtual    = new Date().getFullYear();

  criandoCliente  = false;
  salvandoCliente = false;
  erroCliente     = '';
  formCliente: CreateClienteDto = { nome: '', cpf: '', telefone: '', email: '' };

  form: CreateVeiculoDto = { placa: '', marca: '', modelo: '', ano: this.anoAtual, cor: '', clienteId: 0 };

  ngOnInit() { this.carregarClientes(); this.carregar(); }

  carregarClientes() {
    this.clienteSvc.listar({ tamanho: 100 }).subscribe(r => { this.clientes = r.items; });
  }

  carregar() {
    this.loading = true;
    this.veiculoSvc.listar().subscribe({ next: v => { this.veiculos = v; this.loading = false; } });
  }

  nomeCliente(id: number): string {
    return this.clientes.find(c => c.id === id)?.nome ?? '—';
  }

  abrirModal() {
    this.form = { placa: '', marca: '', modelo: '', ano: this.anoAtual, cor: '', clienteId: 0 };
    this.erro = '';
    this.criandoCliente = this.clientes.length === 0;
    this.formCliente    = { nome: '', cpf: '', telefone: '', email: '' };
    this.erroCliente    = '';
    this.modalAberto    = true;
  }

  fecharModal()      { this.modalAberto = false; this.criandoCliente = false; }

  toggleNovoCliente() {
    this.criandoCliente = !this.criandoCliente;
    this.formCliente    = { nome: '', cpf: '', telefone: '', email: '' };
    this.erroCliente    = '';
  }

  salvarCliente() {
    this.erroCliente = ''; this.salvandoCliente = true;
    this.clienteSvc.criar(this.formCliente).subscribe({
      next: (novo) => {
        this.clientes        = [...this.clientes, novo];
        this.form.clienteId  = novo.id;
        this.criandoCliente  = false;
        this.salvandoCliente = false;
      },
      error: (e) => {
        this.erroCliente     = e.error?.mensagem ?? 'Erro ao salvar cliente.';
        this.salvandoCliente = false;
      }
    });
  }

  salvar() {
    this.erro = ''; this.salvando = true;
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
