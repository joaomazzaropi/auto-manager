import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdemService, VeiculoService } from '../../services/ordem.service';
import { OrdemServico, CreateOrdemDto, StatusOrdem, Veiculo } from '../../models/models';

@Component({
  selector: 'app-ordens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="page-header">
        <h2>Ordens de Serviço</h2>
        <button class="btn btn-primary" (click)="abrirModalNova()">+ Nova OS</button>
      </div>

      <!-- Filtro de status ──────────────────────────────── -->
      <div class="filtros card" style="margin-bottom:16px;padding:14px 20px">
        <span style="font-size:13px;font-weight:600;color:var(--text-muted)">Filtrar por status:</span>
        @for (s of statusOpcoes; track s.valor) {
          <button class="btn btn-sm"
                  [class.btn-primary]="filtroAtivo === s.valor"
                  [class.btn-outline]="filtroAtivo !== s.valor"
                  (click)="filtrar(s.valor)">
            {{ s.label }}
          </button>
        }
      </div>

      <div class="card">
        @if (loading) {
          <p style="color:var(--text-muted)">Carregando...</p>
        } @else if (ordens.length === 0) {
          <div class="empty-state">Nenhuma ordem encontrada.</div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Cliente</th><th>Placa</th>
                  <th>Descrição</th><th>Status</th><th>Valor Est.</th><th></th>
                </tr>
              </thead>
              <tbody>
                @for (o of ordens; track o.id) {
                  <tr>
                    <td>{{ o.id }}</td>
                    <td>{{ o.nomeCliente }}</td>
                    <td><code>{{ o.placaVeiculo }}</code></td>
                    <td>{{ o.descricao }}</td>
                    <td><span class="badge" [ngClass]="badgeClass(o.status)">{{ o.status }}</span></td>
                    <td>{{ o.valorEstimado | currency:'BRL' }}</td>
                    <td>
                      <button class="btn btn-outline btn-sm" (click)="abrirModalStatus(o)">
                        Atualizar
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    <!-- Modal: Nova OS ─────────────────────────────────── -->
    @if (modalNova) {
      <div class="modal-backdrop" (click)="fecharModais()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Nova Ordem de Serviço</h3>
          <div class="modal-form">
            <div class="form-group">
              <label>Veículo</label>
              <select class="form-control" [(ngModel)]="formNova.veiculoId">
                <option [ngValue]="0" disabled>Selecione um veículo</option>
                @for (v of veiculos; track v.id) {
                  <option [ngValue]="v.id">{{ v.placa }} — {{ v.modelo }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <input class="form-control" [(ngModel)]="formNova.descricao" placeholder="Ex: Troca de para-brisa dianteiro" />
            </div>
            <div class="form-group">
              <label>Valor Estimado (R$)</label>
              <input class="form-control" type="number" [(ngModel)]="formNova.valorEstimado" placeholder="0,00" />
            </div>
            <div class="form-group">
              <label>Observações</label>
              <input class="form-control" [(ngModel)]="formNova.observacoes" placeholder="Opcional" />
            </div>
            @if (erro) { <div class="alert alert-error">{{ erro }}</div> }
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" (click)="fecharModais()">Cancelar</button>
            <button class="btn btn-primary" [disabled]="salvando" (click)="criarOrdem()">
              {{ salvando ? 'Criando...' : 'Criar OS' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal: Atualizar Status ────────────────────────── -->
    @if (modalStatus) {
      <div class="modal-backdrop" (click)="fecharModais()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Atualizar Status — OS #{{ ordemSelecionada?.id }}</h3>
          <div class="modal-form">
            <div class="form-group">
              <label>Novo Status</label>
              <select class="form-control" [(ngModel)]="novoStatus">
                <option value="Aberta">Aberta</option>
                <option value="EmAndamento">Em Andamento</option>
                <option value="Concluida">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            @if (novoStatus === 'Concluida') {
              <div class="form-group">
                <label>Valor Final (R$)</label>
                <input class="form-control" type="number" [(ngModel)]="valorFinal" />
              </div>
            }
          </div>
          <div class="modal-actions">
            <button class="btn btn-outline" (click)="fecharModais()">Cancelar</button>
            <button class="btn btn-primary" [disabled]="salvando" (click)="atualizarStatus()">
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .filtros { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    code { background:var(--bg); padding:2px 6px; border-radius:4px;
           font-family:monospace; font-size:13px; }
  `]
})
export class OrdensComponent implements OnInit {
  private ordemSvc   = inject(OrdemService);
  private veiculoSvc = inject(VeiculoService);

  ordens: OrdemServico[] = [];
  veiculos: Veiculo[]    = [];
  loading    = true;
  filtroAtivo: StatusOrdem | undefined = undefined;

  modalNova   = false;
  modalStatus = false;
  salvando    = false;
  erro        = '';

  ordemSelecionada: OrdemServico | null = null;
  novoStatus: StatusOrdem = 'Aberta';
  valorFinal: number | undefined;

  formNova: CreateOrdemDto = { descricao: '', valorEstimado: 0, veiculoId: 0 };

  statusOpcoes = [
    { valor: undefined,       label: 'Todos'       },
    { valor: 'Aberta',        label: 'Abertas'      },
    { valor: 'EmAndamento',   label: 'Em Andamento' },
    { valor: 'Concluida',     label: 'Concluídas'   },
    { valor: 'Cancelada',     label: 'Canceladas'   },
  ] as { valor: StatusOrdem | undefined; label: string }[];

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading = true;
    this.ordemSvc.listar(this.filtroAtivo).subscribe({
      next: o => { this.ordens = o; this.loading = false; }
    });
  }

  filtrar(s: StatusOrdem | undefined) { this.filtroAtivo = s; this.carregar(); }

  abrirModalNova() {
    this.formNova = { descricao: '', valorEstimado: 0, veiculoId: 0 };
    this.erro = '';
    this.veiculoSvc.listar().subscribe(v => { this.veiculos = v; this.modalNova = true; });
  }

  abrirModalStatus(o: OrdemServico) {
    this.ordemSelecionada = o;
    this.novoStatus = o.status;
    this.valorFinal = o.valorFinal;
    this.modalStatus = true;
  }

  fecharModais() { this.modalNova = false; this.modalStatus = false; }

  criarOrdem() {
    this.erro = ''; this.salvando = true;
    this.ordemSvc.criar(this.formNova).subscribe({
      next: () => { this.fecharModais(); this.carregar(); this.salvando = false; },
      error: (e) => { this.erro = e.error?.mensagem ?? 'Erro ao criar OS.'; this.salvando = false; }
    });
  }

  atualizarStatus() {
    if (!this.ordemSelecionada) return;
    this.salvando = true;
    this.ordemSvc.atualizarStatus(this.ordemSelecionada.id, {
      status: this.novoStatus,
      valorFinal: this.valorFinal
    }).subscribe({
      next: () => { this.fecharModais(); this.carregar(); this.salvando = false; }
    });
  }

  badgeClass(status: StatusOrdem) {
    return {
      'badge-yellow': status === 'Aberta',
      'badge-blue':   status === 'EmAndamento',
      'badge-green':  status === 'Concluida',
      'badge-red':    status === 'Cancelada',
    };
  }
}
