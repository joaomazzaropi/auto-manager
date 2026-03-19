import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente, CreateClienteDto } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private url  = `${environment.apiUrl}/clientes`;

  listar()                              { return this.http.get<Cliente[]>(this.url); }
  obter(id: number)                     { return this.http.get<Cliente>(`${this.url}/${id}`); }
  criar(dto: CreateClienteDto)          { return this.http.post<Cliente>(this.url, dto); }
  atualizar(id: number, dto: CreateClienteDto) { return this.http.put<Cliente>(`${this.url}/${id}`, dto); }
  remover(id: number)                   { return this.http.delete(`${this.url}/${id}`); }
}
