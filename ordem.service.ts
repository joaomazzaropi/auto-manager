import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  OrdemServico, CreateOrdemDto, UpdateStatusOrdemDto,
  Veiculo, CreateVeiculoDto, StatusOrdem
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

  listar(status?: StatusOrdem) {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<OrdemServico[]>(this.url, { params });
  }

  obter(id: number) { return this.http.get<OrdemServico>(`${this.url}/${id}`); }

  criar(dto: CreateOrdemDto) { return this.http.post<OrdemServico>(this.url, dto); }

  atualizarStatus(id: number, dto: UpdateStatusOrdemDto) {
    return this.http.patch<OrdemServico>(`${this.url}/${id}/status`, dto);
  }
}
