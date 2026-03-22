import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { OrdemService } from '../../services/ordem.service';
import { OrdemServico } from '../../models/models';

interface StatCard { label: string; value: number; icon: string; color: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 style="font-size:20px;font-weight:700;margin-bottom:20px">Dashboard</h2>

      <!-- Cards -->
      <div class="stats-grid">
        @for (s of stats; track s.label) {
          <div class="stat-card card">
            <div class="stat-icon" [style.background]="s.color + '22'"
                 [style.color]="s.color">{{ s.icon }}</div>
            <div>
              <div class="stat-value">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Últimas ordens abertas -->
      <div class="card" style="margin-top:24px">
        <h3 style="font-size:16px;font-weight:600;margin-bottom:16px">
          Ordens de Serviço Abertas
        </h3>

        @if (loading) {
          <p style="color:var(--text-muted)">Carregando...</p>
        } @else if (ordensAbertas.length === 0) {
          <div class="empty-state">Nenhuma ordem aberta 🎉</div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Cliente</th><th>Placa</th>
                  <th>Descrição</th><th>Valor Est.</th><th>Aberta em</th>
                </tr>
              </thead>
              <tbody>
                @for (o of ordensAbertas; track o.id) {
                  <tr>
                    <td>{{ o.id }}</td>
                    <td>{{ o.nomeCliente }}</td>
                    <td><code>{{ o.placaVeiculo }}</code></td>
                    <td>{{ o.descricao }}</td>
                    <td>{{ o.valorEstimado | currency:'BRL' }}</td>
                    <td>{{ o.abertaEm | date:'dd/MM/yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    .stat-card  { display:flex; align-items:center; gap:16px; }
    .stat-icon  { width:48px; height:48px; border-radius:10px;
                  display:flex; align-items:center; justify-content:center;
                  font-size:22px; flex-shrink:0; }
    .stat-value { font-size:26px; font-weight:700; line-height:1; }
    .stat-label { font-size:13px; color:var(--text-muted); margin-top:2px; }
    code { background:var(--bg); padding:2px 6px; border-radius:4px;
           font-family:monospace; font-size:13px; }
  `]
})
export class DashboardComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private ordemService   = inject(OrdemService);

  stats: StatCard[]        = [];
  ordensAbertas: OrdemServico[] = [];
  loading = true;

  ngOnInit() {
    forkJoin({
      clientes:  this.clienteService.listar({ tamanho: 1 }),
      todas:     this.ordemService.listar({ tamanho: 1 }),
      abertas:   this.ordemService.listar({ status: 'Aberta',      tamanho: 50 }),
      andamento: this.ordemService.listar({ status: 'EmAndamento', tamanho: 1  }),
    }).subscribe({
      next: ({ clientes, todas, abertas, andamento }) => {
        this.ordensAbertas = abertas.items;
        this.stats = [
          { label: 'Clientes',     value: clientes.total,   icon: '👥', color: '#1a56db' },
          { label: 'OS Abertas',   value: abertas.total,    icon: '📋', color: '#c27803' },
          { label: 'Em Andamento', value: andamento.total,  icon: '🔧', color: '#6d28d9' },
          { label: 'Total de OS',  value: todas.total,      icon: '📁', color: '#057a55' },
        ];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
