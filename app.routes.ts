import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'login',    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },

  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'clientes',  loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent) },
      { path: 'veiculos',  loadComponent: () => import('./pages/veiculos/veiculos.component').then(m => m.VeiculosComponent) },
      { path: 'ordens',    loadComponent: () => import('./pages/ordens/ordens.component').then(m => m.OrdensComponent) },
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];
