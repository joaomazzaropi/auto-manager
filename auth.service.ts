import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { LoginDto, RegisterDto, TokenDto } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'am_token';
  private readonly USER_KEY  = 'am_user';

  private _loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this._loggedIn.asObservable();

  login(dto: LoginDto) {
    return this.http.post<TokenDto>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(tap(res => this.saveSession(res)));
  }

  register(dto: RegisterDto) {
    return this.http.post<TokenDto>(`${environment.apiUrl}/auth/register`, dto)
      .pipe(tap(res => this.saveSession(res)));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): { nome: string; email: string } | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private saveSession(res: TokenDto) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({ nome: res.nome, email: res.email }));
    this._loggedIn.next(true);
  }
}
