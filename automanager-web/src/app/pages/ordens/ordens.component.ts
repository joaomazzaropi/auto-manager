import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdemService, VeiculoService } from '../../services/ordem.service';
import { OrdemServico, CreateOrdemDto, StatusOrdem, Veiculo, PagedResult } from '../../models/models';
import { PaginacaoComponent } from '../../components/paginacao/paginacao.component';

@Component({
  selector: 'app-ordens',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent],
  template: `
    <div>
      <div class="page-header">
        <h2>Ordens de Serviço</h2>
        <button class="btn btn-primary" (click)="abrirModalNova()">+ Nova OS</button>
      </div>

      <!-- Filtros ─────────────────────────────────────── -->
      <div class="card filtros-card">
        <div class="filtros-grid">
          <div class="form-group">
            <label>Status</label>
            <select class="form-control" [(ngModel)]="filtros.status">
              <option value="">Todos</option>
              <option value="Aberta">Aberta</option>
              <option value="EmAndamento">Em Andamento</option>
              <option value="Concluida">Concluída</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <div class="form-group">
            <label>Cliente</label>
            <input class="form-control" [(ngModel)]="filtros.cliente"
                   placeholder="Nome do cliente..." (keyup.enter)="buscar()" />
          </div>
          <div class="form-group">
            <label>Placa</label>
            <input class="form-control" [(ngModel)]="filtros.placa"
                   placeholder="ABC-1234" (keyup.enter)="buscar()" />
          </div>
          <div class="filtros-acoes">
            <button class="btn btn-primary" (click)="buscar()">Buscar</button>
            <button class="btn btn-outline" (click)="limpar()">Limpar</button>
          </div>
        </div>
      </div>

      <!-- Tabela ──────────────────────────────────────── -->
      <div class="card">
        @if (loading) {
          <p style="color:var(--text-muted)">Carregando...</p>
        } @else if (resultado.items.length === 0) {
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
                @for (o of resultado.items; track o.id) {
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

          <app-paginacao
            [pagina]="resultado.pagina"
            [total]="resultado.total"
            [tamanho]="resultado.tamanhoPagina"
            [totalPaginas]="resultado.totalPaginas"
            (paginaMudou)="irParaPagina($event)" />
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
              <input class="form-control" [(ngModel)]="formNova.descricao"
                     placeholder="Ex: Troca de para-brisa dianteiro" />
            </div>
            <div class="form-group">
              <label>Valor Estimado (R$)</label>
              <input class="form-control" type="number" [(ngModel)]="formNova.valorEstimado" />
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
    .filtros-card { margin-bottom: 16px; padding: 16px 20px; }
    .filtros-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: flex-end; }
    .filtros-acoes { display: flex; gap: 8px; }
    code { background:var(--bg); padding:2px 6px; border-radius:4px; font-family:monospace; font-size:13px; }
  `]
})
export class OrdensComponent implements OnInit {
  private ordemSvc   = inject(OrdemService);
  private veiculoSvc = inject(VeiculoService);

  resultado: PagedResult<OrdemServico> = { items: [], total: 0, pagina: 1, tamanhoPagina: 10, totalPaginas: 0 };
  filtros   = { status: '', cliente: '', placa: '' };
  pagina    = 1;
  veiculos: Veiculo[] = [];
  loading   = true;

  modalNova   = false;
  modalStatus = false;
  salvando    = false;
  erro        = '';

  ordemSelecionada: OrdemServico | null = null;
  novoStatus: StatusOrdem = 'Aberta';
  valorFinal: number | undefined;

  formNova: CreateOrdemDto = { descricao: '', valorEstimado: 0, veiculoId: 0 };

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading = true;
    const query = {
      status:  this.filtros.status  || undefined,
      cliente: this.filtros.cliente || undefined,
      placa:   this.filtros.placa   || undefined,
      pagina:  this.pagina,
      tamanho: 10
    };
    this.ordemSvc.listar(query).subscribe({
      next: r => { this.resultado = r; this.loading = false; }
    });
  }

  buscar()                  { this.pagina = 1; this.carregar(); }
  limpar()                  { this.filtros = { status: '', cliente: '', placa: '' }; this.buscar(); }
  irParaPagina(p: number)   { this.pagina = p; this.carregar(); }

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
      status: this.novoStatus, valorFinal: this.valorFinal
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
