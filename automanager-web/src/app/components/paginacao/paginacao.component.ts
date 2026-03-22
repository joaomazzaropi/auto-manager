import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacao',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPaginas > 1) {
      <div class="paginacao">
        <span class="info">
          {{ (pagina - 1) * tamanho + 1 }}–{{ min(pagina * tamanho, total) }} de {{ total }}
        </span>
        <div class="controles">
          <button class="btn btn-outline btn-sm"
                  [disabled]="pagina <= 1"
                  (click)="ir(pagina - 1)">‹ Anterior</button>

          @for (p of paginas(); track p) {
            <button class="btn btn-sm"
                    [class.btn-primary]="p === pagina"
                    [class.btn-outline]="p !== pagina"
                    (click)="ir(p)">{{ p }}</button>
          }

          <button class="btn btn-outline btn-sm"
                  [disabled]="pagina >= totalPaginas"
                  (click)="ir(pagina + 1)">Próxima ›</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .paginacao {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 14px 0 0;
      border-top: 1px solid var(--border);
      margin-top: 8px;
    }
    .info { font-size: 13px; color: var(--text-muted); }
    .controles { display: flex; gap: 6px; align-items: center; }
  `]
})
export class PaginacaoComponent {
  @Input() pagina       = 1;
  @Input() total        = 0;
  @Input() tamanho      = 10;
  @Input() totalPaginas = 1;
  @Output() paginaMudou = new EventEmitter<number>();

  ir(p: number) { this.paginaMudou.emit(p); }

  min(a: number, b: number) { return Math.min(a, b); }

  paginas(): number[] {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, this.pagina - delta);
      i <= Math.min(this.totalPaginas, this.pagina + delta);
      i++
    ) range.push(i);
    return range;
  }
}
