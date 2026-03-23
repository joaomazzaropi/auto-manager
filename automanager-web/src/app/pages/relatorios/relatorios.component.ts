import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  RelatorioService, RelatorioStatus,
  RelatorioPeriodo, RelatorioCliente, RelatorioVeiculo
} from '../../services/relatorio.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="page-header">
        <h2>Relatórios</h2>
        <div style="display:flex;gap:8px;align-items:center">
          <label style="font-size:13px;color:var(--text-muted)">Período:</label>
          <select class="form-control" style="width:140px" [(ngModel)]="meses" (change)="carregar()">
            <option [ngValue]="3">Últimos 3 meses</option>
            <option [ngValue]="6">Últimos 6 meses</option>
            <option [ngValue]="12">Último ano</option>
          </select>
        </div>
      </div>

      @if (loading) {
        <p style="color:var(--text-muted)">Carregando relatórios...</p>
      } @else {

        <!-- 1. Resumo por Status ──────────────────────────────────────── -->
        <div class="relatorio-grid">
          @for (s of porStatus; track s.status) {
            <div class="card status-card">
              <div class="status-badge" [ngClass]="badgeStatus(s.status)">{{ s.status }}</div>
              <div class="status-qtd">{{ s.quantidade }} OS</div>
              <div class="status-valores">
                <div>
                  <span class="label">Estimado</span>
                  <span>{{ s.valorEstimadoTotal | currency:'BRL' }}</span>
                </div>
                <div>
                  <span class="label">Realizado</span>
                  <span class="valor-realizado">{{ s.valorFinalTotal | currency:'BRL' }}</span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- 2. Faturamento por Mês ────────────────────────────────────── -->
        <div class="card" style="margin-top:20px">
          <h3 class="section-title">📅 Faturamento por Mês</h3>
          @if (porPeriodo.length === 0) {
            <div class="empty-state">Sem dados no período selecionado.</div>
          } @else {
            <!-- Barra visual -->
            <div class="barras">
              @for (p of porPeriodo; track p.periodo) {
                <div class="barra-item">
                  <div class="barra-wrap">
                    <div class="barra-fill"
                         [style.height.%]="alturaRelativa(p.faturamentoRealizado)"
                         title="{{ p.faturamentoRealizado | currency:'BRL' }}">
                    </div>
                  </div>
                  <div class="barra-label">{{ formatarPeriodo(p.periodo) }}</div>
                  <div class="barra-valor">{{ p.faturamentoRealizado | currency:'BRL':'symbol':'1.0-0' }}</div>
                </div>
              }
            </div>

            <div class="table-wrap" style="margin-top:16px">
              <table>
                <thead>
                  <tr>
                    <th>Mês</th><th>OS Abertas</th><th>OS Concluídas</th><th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of porPeriodo; track p.periodo) {
                    <tr>
                      <td>{{ formatarPeriodo(p.periodo) }}</td>
                      <td>{{ p.ordensAbertas }}</td>
                      <td>{{ p.ordensConcluidas }}</td>
                      <td><strong>{{ p.faturamentoRealizado | currency:'BRL' }}</strong></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- 3. Ranking de Clientes ───────────────────────────────────── -->
        <div class="card" style="margin-top:20px">
          <h3 class="section-title">🏆 Ranking de Clientes</h3>
          @if (rankingClientes.length === 0) {
            <div class="empty-state">Sem dados disponíveis.</div>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Cliente</th><th>Total OS</th>
                    <th>Concluídas</th><th>Total Faturado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of rankingClientes; track c.nomeCliente; let i = $index) {
                    <tr>
                      <td>
                        @if (i === 0) { 🥇 }
                        @else if (i === 1) { 🥈 }
                        @else if (i === 2) { 🥉 }
                        @else { {{ i + 1 }} }
                      </td>
                      <td><strong>{{ c.nomeCliente }}</strong></td>
                      <td>{{ c.totalOrdens }}</td>
                      <td>{{ c.ordensConcluidas }}</td>
                      <td><strong>{{ c.totalFaturado | currency:'BRL' }}</strong></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- 4. Veículos mais atendidos ───────────────────────────────── -->
        <div class="card" style="margin-top:20px;margin-bottom:32px">
          <h3 class="section-title">🚙 Veículos Mais Atendidos</h3>
          @if (veiculos.length === 0) {
            <div class="empty-state">Sem dados disponíveis.</div>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Placa</th><th>Modelo</th><th>Proprietário</th>
                    <th>Atendimentos</th><th>Total Faturado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (v of veiculos; track v.placa) {
                    <tr>
                      <td><code>{{ v.placa }}</code></td>
                      <td>{{ v.modelo }}</td>
                      <td>{{ v.nomeCliente }}</td>
                      <td>{{ v.totalOrdens }}</td>
                      <td><strong>{{ v.totalFaturado | currency:'BRL' }}</strong></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

      }
    </div>
  `,
  styles: [`
    .relatorio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }

    .status-card { display:flex; flex-direction:column; gap:10px; }
    .status-qtd  { font-size:28px; font-weight:700; }
    .status-valores { display:flex; flex-direction:column; gap:4px; font-size:13px; }
    .status-valores .label { color:var(--text-muted); margin-right:6px; }
    .valor-realizado { font-weight:600; color:var(--success); }

    .section-title { font-size:16px; font-weight:600; margin-bottom:16px; }

    /* Gráfico de barras */
    .barras {
      display: flex; align-items: flex-end; gap: 12px;
      height: 140px; padding: 0 8px;
      border-bottom: 2px solid var(--border);
    }
    .barra-item  { display:flex; flex-direction:column; align-items:center; flex:1; }
    .barra-wrap  { width:100%; flex:1; display:flex; align-items:flex-end; }
    .barra-fill  {
      width: 100%; min-height: 4px;
      background: var(--primary); border-radius: 4px 4px 0 0;
      transition: height .3s ease;
      cursor: pointer;
    }
    .barra-fill:hover { background: var(--primary-dark); }
    .barra-label { font-size:11px; color:var(--text-muted); margin-top:6px; }
    .barra-valor { font-size:11px; font-weight:600; color:var(--text); }

    code { background:var(--bg); padding:2px 6px; border-radius:4px;
           font-family:monospace; font-size:13px; }
  `]
})
export class RelatoriosComponent implements OnInit {
  private svc = inject(RelatorioService);

  loading         = true;
  meses           = 6;
  porStatus:       RelatorioStatus[]  = [];
  porPeriodo:      RelatorioPeriodo[] = [];
  rankingClientes: RelatorioCliente[] = [];
  veiculos:        RelatorioVeiculo[] = [];

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading = true;
    forkJoin({
      status:   this.svc.porStatus(),
      periodo:  this.svc.porPeriodo(this.meses),
      clientes: this.svc.rankingClientes(),
      veiculos: this.svc.veiculosMaisAtendidos(),
    }).subscribe({
      next: ({ status, periodo, clientes, veiculos }) => {
        this.porStatus       = status;
        this.porPeriodo      = periodo;
        this.rankingClientes = clientes;
        this.veiculos        = veiculos;
        this.loading         = false;
      },
      error: () => { this.loading = false; }
    });
  }

  alturaRelativa(valor: number): number {
    const max = Math.max(...this.porPeriodo.map(p => p.faturamentoRealizado), 1);
    return Math.max((valor / max) * 100, 4);
  }

  formatarPeriodo(periodo: string): string {
    const [ano, mes] = periodo.split('-');
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${meses[+mes - 1]}/${ano.slice(2)}`;
  }

  badgeStatus(status: string): object {
    return {
      'badge badge-yellow': status === 'Aberta',
      'badge badge-blue':   status === 'EmAndamento',
      'badge badge-green':  status === 'Concluida',
      'badge badge-red':    status === 'Cancelada',
    };
  }
}
