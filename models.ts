// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginDto       { email: string; senha: string; }
export interface RegisterDto    { nome: string; email: string; senha: string; }
export interface TokenDto       { token: string; nome: string; email: string; }

// ─── Cliente ──────────────────────────────────────────────────────────────────
export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  criadoEm: string;
}

export interface CreateClienteDto {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}

// ─── Veículo ──────────────────────────────────────────────────────────────────
export interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  clienteId: number;
}

export interface CreateVeiculoDto {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  clienteId: number;
}

// ─── Ordem de Serviço ─────────────────────────────────────────────────────────
export type StatusOrdem = 'Aberta' | 'EmAndamento' | 'Concluida' | 'Cancelada';

export interface OrdemServico {
  id: number;
  descricao: string;
  status: StatusOrdem;
  valorEstimado: number;
  valorFinal?: number;
  observacoes?: string;
  abertaEm: string;
  concluidaEm?: string;
  veiculoId: number;
  placaVeiculo: string;
  nomeCliente: string;
}

export interface CreateOrdemDto {
  descricao: string;
  valorEstimado: number;
  observacoes?: string;
  veiculoId: number;
}

export interface UpdateStatusOrdemDto {
  status: StatusOrdem;
  valorFinal?: number;
}
