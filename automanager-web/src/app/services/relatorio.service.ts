import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface RelatorioStatus {
  status: string;
  quantidade: number;
  valorEstimadoTotal: number;
  valorFinalTotal: number;
}

export interface RelatorioPeriodo {
  periodo: string;
  ordensAbertas: number;
  ordensConcluidas: number;
  faturamentoRealizado: number;
}

export interface RelatorioCliente {
  nomeCliente: string;
  totalOrdens: number;
  ordensConcluidas: number;
  totalFaturado: number;
}

export interface RelatorioVeiculo {
  placa: string;
  modelo: string;
  nomeCliente: string;
  totalOrdens: number;
  totalFaturado: number;
}

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private http = inject(HttpClient);
  private url  = `${environment.apiUrl}/relatorios`;

  porStatus()                         { return this.http.get<RelatorioStatus[]>(`${this.url}/status`); }
  porPeriodo(meses = 6)               { return this.http.get<RelatorioPeriodo[]>(`${this.url}/periodo`, { params: new HttpParams().set('meses', meses) }); }
  rankingClientes(top = 10)           { return this.http.get<RelatorioCliente[]>(`${this.url}/clientes`, { params: new HttpParams().set('top', top) }); }
  veiculosMaisAtendidos(top = 10)     { return this.http.get<RelatorioVeiculo[]>(`${this.url}/veiculos`, { params: new HttpParams().set('top', top) }); }
}
