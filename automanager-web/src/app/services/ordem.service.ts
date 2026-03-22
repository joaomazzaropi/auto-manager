import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  OrdemServico, CreateOrdemDto, UpdateStatusOrdemDto, OrdemQuery, PagedResult,
  Veiculo, CreateVeiculoDto
} from '../models/models';
import { environment } from '../../environments/environment';

// ─── Veículo ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class VeiculoService {
  private http = inject(HttpClient);
  private url  = `${environment.apiUrl}/veiculos`;

  listar()                        { return this.http.get<Veiculo[]>(this.url); }
  obter(id: number)               { return this.http.get<Veiculo>(`${this.url}/${id}`); }
  criar(dto: CreateVeiculoDto)    { return this.http.post<Veiculo>(this.url, dto); }
  remover(id: number)             { return this.http.delete(`${this.url}/${id}`); }
}

// ─── Ordem de Serviço ─────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class OrdemService {
  private http = inject(HttpClient);
  private url  = `${environment.apiUrl}/ordensservico`;

  listar(query: OrdemQuery = {}) {
    let params = new HttpParams();
    if (query.status)  params = params.set('status',  query.status);
    if (query.cliente) params = params.set('cliente', query.cliente);
    if (query.placa)   params = params.set('placa',   query.placa);
    if (query.pagina)  params = params.set('pagina',  query.pagina!);
    if (query.tamanho) params = params.set('tamanho', query.tamanho!);
    return this.http.get<PagedResult<OrdemServico>>(this.url, { params });
  }

  obter(id: number) { return this.http.get<OrdemServico>(`${this.url}/${id}`); }
  criar(dto: CreateOrdemDto) { return this.http.post<OrdemServico>(this.url, dto); }

  atualizarStatus(id: number, dto: UpdateStatusOrdemDto) {
    return this.http.patch<OrdemServico>(`${this.url}/${id}/status`, dto);
  }
}
