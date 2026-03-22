import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, CreateClienteDto, PagedResult } from '../../models/models';
import { PaginacaoComponent } from '../../components/paginacao/paginacao.component';
import { MaskDirective } from '../../directives/mask.directive';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacaoComponent, MaskDirective],
  template: `
    <div>
      <div class="page-header">
        <h2>Clientes</h2>
        <button class="btn btn-primary" (click)="abrirModal()">+ Novo Cliente</button>
      </div>

      <!-- Filtros -->
      <div class="card filtros-card">
        <div class="filtros-grid">
          <div class="form-group">
            <label>Nome</label>
            <input class="form-control" [(ngModel)]="filtros.nome"
                   placeholder="Buscar por nome..." (keyup.enter)="buscar()" />
          </div>
          <div class="form-group">
            <label>CPF</label>
            <input class="form-control" [(ngModel)]="filtros.cpf"
                   placeholder="000.000.000-00" appMask="cpf" (keyup.enter)="buscar()" />
          </div>
          <div class="filtros-acoes">
            <button class="btn btn-primary" (click)="buscar()">Buscar</button>
            <button class="btn btn-outline" (click)="limpar()">Limpar</button>
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="card">
        @if (loading) {
          <p style="color:var(--text-muted)">Carregando...</p>
        } @else if (resultado.items.length === 0) {
          <div class="empty-state">Nenhum cliente encontrado.</div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th></th></tr>
              </thead>
              <tbody>
                @for (c of resultado.items; track c.id) {
                  <tr>
                    <td>{{ c.nome }}</td>
                    <td>{{ c.cpf }}</td>
                    <td>{{ c.telefone }}</td>
                    <td>{{ c.email }}</td>
                    <td style="display:flex;gap:8px;justify-content:flex-end">
                      <button class="btn btn-outline btn-sm" (click)="abrirModal(c)">Editar</button>
                      <button class="btn btn-danger btn-sm"  (click)="remover(c.id)">Remover</button>
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

    <!-- Modal -->
    @if (modalAberto) {
      <div class="modal-backdrop" (click)="fecharModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ editando ? 'Editar Cliente' : 'Novo Cliente' }}</h3>
          <div class="modal-form">
            <div class="form-group">
              <label>Nome</label>
              <input class="form-control" [(ngModel)]="form.nome"
                     placeholder="Nome completo" maxlength="100" />
            </div>
            <div class="form-group">
              <label>CPF</label>
              <input class="form-control" [(ngModel)]="form.cpf"
                     placeholder="000.000.000-00" appMask="cpf" />
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input class="form-control" [(ngModel)]="form.telefone"
                     placeholder="(00) 00000-0000" appMask="telefone" />
            </div>
            <div class="form-group">
              <label>E-mail</label>
              <input class="form-control" type="email" [(ngModel)]="form.email"
                     placeholder="cliente@email.com" maxlength="100" />
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
    .filtros-card { margin-bottom: 16px; padding: 16px 20px; }
    .filtros-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: flex-end; }
    .filtros-acoes { display: flex; gap: 8px; }
  `]
})
export class ClientesComponent implements OnInit {
  private svc = inject(ClienteService);

  resultado: PagedResult<Cliente> = { items: [], total: 0, pagina: 1, tamanhoPagina: 10, totalPaginas: 0 };
  filtros   = { nome: '', cpf: '' };
  pagina    = 1;
  loading   = true;

  modalAberto = false;
  editando: Cliente | null = null;
  salvando = false;
  erro = '';
  form: CreateClienteDto = { nome: '', cpf: '', telefone: '', email: '' };

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading = true;
    this.svc.listar({ ...this.filtros, pagina: this.pagina, tamanho: 10 }).subscribe({
      next: r => { this.resultado = r; this.loading = false; }
    });
  }

  buscar()                  { this.pagina = 1; this.carregar(); }
  limpar()                  { this.filtros = { nome: '', cpf: '' }; this.buscar(); }
  irParaPagina(p: number)   { this.pagina = p; this.carregar(); }

  abrirModal(c?: Cliente) {
    this.editando = c ?? null;
    this.form = c
      ? { nome: c.nome, cpf: c.cpf, telefone: c.telefone, email: c.email }
      : { nome: '', cpf: '', telefone: '', email: '' };
    this.erro = '';
    this.modalAberto = true;
  }

  fecharModal() { this.modalAberto = false; }

  salvar() {
    this.erro = ''; this.salvando = true;
    const op = this.editando
      ? this.svc.atualizar(this.editando.id, this.form)
      : this.svc.criar(this.form);

    op.subscribe({
      next: () => { this.fecharModal(); this.carregar(); this.salvando = false; },
      error: (e) => { this.erro = e.error?.mensagem ?? 'Erro ao salvar.'; this.salvando = false; }
    });
  }

  remover(id: number) {
    if (!confirm('Deseja remover este cliente?')) return;
    this.svc.remover(id).subscribe(() => this.carregar());
  }
}
