import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Cliente, CreateClienteDto, ClienteQuery, PagedResult } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private url  = `${environment.apiUrl}/clientes`;

  listar(query: ClienteQuery = {}) {
    let params = new HttpParams();
    if (query.nome)    params = params.set('nome',    query.nome);
    if (query.cpf)     params = params.set('cpf',     query.cpf);
    if (query.pagina)  params = params.set('pagina',  query.pagina);
    if (query.tamanho) params = params.set('tamanho', query.tamanho);
    return this.http.get<PagedResult<Cliente>>(this.url, { params });
  }

  obter(id: number)                            { return this.http.get<Cliente>(`${this.url}/${id}`); }
  criar(dto: CreateClienteDto)                 { return this.http.post<Cliente>(this.url, dto); }
  atualizar(id: number, dto: CreateClienteDto) { return this.http.put<Cliente>(`${this.url}/${id}`, dto); }
  remover(id: number)                          { return this.http.delete(`${this.url}/${id}`); }
}
