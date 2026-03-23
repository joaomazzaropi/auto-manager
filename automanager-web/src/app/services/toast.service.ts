import { Injectable, signal } from '@angular/core';

export interface Toast {
  id:      number;
  mensagem: string;
  tipo:    'success' | 'warning' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(mensagem: string, tipo: Toast['tipo'] = 'info', duracao = 4000) {
    const id = ++this.counter;
    this.toasts.update(t => [...t, { id, mensagem, tipo }]);
    setTimeout(() => this.remover(id), duracao);
  }

  remover(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
