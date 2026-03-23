import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [ngClass]="'toast-' + t.tipo">
          <span class="toast-icon">{{ icone(t.tipo) }}</span>
          <span class="toast-msg">{{ t.mensagem }}</span>
          <button class="toast-close" (click)="toast.remover(t.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,.15);
      font-size: 14px;
      font-weight: 500;
      min-width: 280px;
      max-width: 400px;
      animation: slideIn .2s ease;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }

    .toast-success { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
    .toast-warning { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .toast-error   { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .toast-info    { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }

    .toast-icon  { font-size: 16px; flex-shrink: 0; }
    .toast-msg   { flex: 1; }
    .toast-close { background: none; border: none; cursor: pointer;
                   font-size: 12px; opacity: .6; padding: 0; }
    .toast-close:hover { opacity: 1; }
  `]
})
export class ToastComponent {
  toast = inject(ToastService);

  icone(tipo: string): string {
    const map: Record<string, string> = {
      success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️'
    };
    return map[tipo] ?? 'ℹ️';
  }
}
