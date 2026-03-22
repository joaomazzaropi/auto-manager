import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <div class="auth-card card">
        <div class="auth-logo">
          <span class="logo-icon">🚗</span>
          <h1>AutoManager</h1>
          <p>Crie sua conta</p>
        </div>

        <div *ngIf="erro" class="alert alert-error">{{ erro }}</div>

        <form (ngSubmit)="submit()">
          <div class="form-group">
            <label>Nome</label>
            <input class="form-control" [(ngModel)]="nome" name="nome"
                   placeholder="Seu nome completo" maxlength="100" required />
          </div>
          <div class="form-group" style="margin-top:14px">
            <label>E-mail</label>
            <input class="form-control" type="email" [(ngModel)]="email"
                   name="email" placeholder="voce@email.com" maxlength="100" required />
          </div>
          <div class="form-group" style="margin-top:14px">
            <label>Senha</label>
            <input class="form-control" type="password" [(ngModel)]="senha"
                   name="senha" placeholder="Mínimo 6 caracteres"
                   minlength="6" maxlength="50" required />
          </div>
          <button class="btn btn-primary" style="width:100%;margin-top:20px"
                  type="submit" [disabled]="loading">
            {{ loading ? 'Criando conta...' : 'Criar conta' }}
          </button>
        </form>

        <p class="auth-link">Já tem conta? <a routerLink="/login">Entrar</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap  { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
    .auth-card  { width:100%; max-width:400px; }
    .auth-logo  { text-align:center; margin-bottom:28px; }
    .logo-icon  { font-size:40px; }
    .auth-logo h1 { font-size:24px; font-weight:700; margin-top:8px; color:var(--primary); }
    .auth-logo p  { font-size:13px; color:var(--text-muted); margin-top:4px; }
    .auth-link    { text-align:center; margin-top:20px; font-size:13px; color:var(--text-muted); }
    .auth-link a  { color:var(--primary); text-decoration:none; font-weight:500; }
  `]
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  nome = ''; email = ''; senha = '';
  loading = false; erro = '';

  submit() {
    this.erro = ''; this.loading = true;
    this.auth.register({ nome: this.nome, email: this.email, senha: this.senha }).subscribe({
      next: ()  => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.erro    = e.error?.mensagem ?? 'Erro ao criar conta.';
        this.loading = false;
      }
    });
  }
}
