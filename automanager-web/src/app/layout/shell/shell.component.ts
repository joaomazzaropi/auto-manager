import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span>🚗</span>
          <strong>AutoManager</strong>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard"  routerLinkActive="active">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a routerLink="/clientes"   routerLinkActive="active">
            <span class="nav-icon">👥</span> Clientes
          </a>
          <a routerLink="/veiculos"   routerLinkActive="active">
            <span class="nav-icon">🚙</span> Veículos
          </a>
          <a routerLink="/ordens"     routerLinkActive="active">
            <span class="nav-icon">📋</span> Ordens de Serviço
          </a>
          <a routerLink="/relatorios" routerLinkActive="active">
            <span class="nav-icon">📈</span> Relatórios
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ inicial }}</div>
            <div>
              <div class="user-nome">{{ user?.nome }}</div>
              <div class="user-email">{{ user?.email }}</div>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">Sair</button>
        </div>
      </aside>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { display:flex; min-height:100vh; }
    .sidebar { width:240px; min-width:240px; background:#1e293b; color:#e2e8f0;
               display:flex; flex-direction:column; }
    .sidebar-logo { display:flex; align-items:center; gap:10px; padding:20px 20px 16px;
                    border-bottom:1px solid #334155; font-size:16px; font-weight:700; color:#fff; }
    .sidebar-logo span { font-size:22px; }
    .sidebar-nav { flex:1; padding:12px 10px; display:flex; flex-direction:column; gap:2px; }
    .sidebar-nav a { display:flex; align-items:center; gap:10px; padding:10px 12px;
                     border-radius:6px; text-decoration:none; color:#94a3b8;
                     font-size:14px; font-weight:500; transition:background .15s, color .15s; }
    .sidebar-nav a:hover  { background:#334155; color:#fff; }
    .sidebar-nav a.active { background:#1a56db; color:#fff; }
    .nav-icon { font-size:16px; }
    .sidebar-footer { padding:14px; border-top:1px solid #334155; }
    .user-info { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .user-avatar { width:34px; height:34px; border-radius:50%; background:#1a56db;
                   display:flex; align-items:center; justify-content:center;
                   font-weight:700; font-size:14px; color:#fff; flex-shrink:0; }
    .user-nome  { font-size:13px; font-weight:600; color:#e2e8f0; }
    .user-email { font-size:11px; color:#64748b; white-space:nowrap;
                  overflow:hidden; text-overflow:ellipsis; max-width:140px; }
    .btn-logout { width:100%; padding:7px; border-radius:6px; background:transparent;
                  border:1px solid #334155; color:#94a3b8; font-size:13px; cursor:pointer; }
    .btn-logout:hover { background:#334155; color:#fff; }
    .main-content { flex:1; padding:28px; overflow-y:auto; }
  `]
})
export class ShellComponent {
  private authService = inject(AuthService);
  user = this.authService.getUser();
  get inicial() { return this.user?.nome?.charAt(0).toUpperCase() ?? '?'; }
  logout() { this.authService.logout(); }
}
