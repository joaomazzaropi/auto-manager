import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  email   = '';
  senha   = '';
  loading = false;
  erro    = '';

  submit() {
    this.erro = ''; this.loading = true;
    this.auth.login({ email: this.email, senha: this.senha }).subscribe({
      next: ()  => this.router.navigate(['/dashboard']),
      error: () => { this.erro = 'E-mail ou senha inválidos.'; this.loading = false; }
    });
  }
}
