import { Directive, HostListener, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMask]',
  standalone: true
})
export class MaskDirective {

  @Input('appMask') tipo: 'cpf' | 'telefone' | 'placa' = 'cpf';

  private control = inject(NgControl, { optional: true });

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const masked = this.aplicarMascara(input.value);
    input.value = masked;
    this.control?.control?.setValue(masked, { emitEvent: false });
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const max = this.tamanhoMaximo();
    // bloqueia digitação além do limite (exceto teclas de controle)
    if (
      input.value.length >= max &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)
    ) {
      event.preventDefault();
    }
  }

  private aplicarMascara(valor: string): string {
    const nums = valor.replace(/\D/g, '');
    switch (this.tipo) {
      case 'cpf':      return this.mascaraCpf(nums);
      case 'telefone': return this.mascaraTelefone(nums);
      case 'placa':    return this.mascaraPlaca(valor);
      default:         return valor;
    }
  }

  // 000.000.000-00
  private mascaraCpf(n: string): string {
    n = n.slice(0, 11);
    if (n.length <= 3)  return n;
    if (n.length <= 6)  return `${n.slice(0,3)}.${n.slice(3)}`;
    if (n.length <= 9)  return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6)}`;
    return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9,11)}`;
  }

  // (00) 00000-0000
  private mascaraTelefone(n: string): string {
    n = n.slice(0, 11);
    if (n.length <= 2)  return n.length ? `(${n}` : '';
    if (n.length <= 7)  return `(${n.slice(0,2)}) ${n.slice(2)}`;
    return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
  }

  // AAA-0000 ou AAA0A00 (Mercosul)
  private mascaraPlaca(v: string): string {
    const upper = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (upper.length <= 3) return upper;
    return `${upper.slice(0,3)}-${upper.slice(3,7)}`;
  }

  private tamanhoMaximo(): number {
    switch (this.tipo) {
      case 'cpf':      return 14; // 000.000.000-00
      case 'telefone': return 15; // (00) 00000-0000
      case 'placa':    return 8;  // AAA-0000
      default:         return 999;
    }
  }
}
