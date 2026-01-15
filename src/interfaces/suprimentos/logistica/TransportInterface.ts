// Interfaces para Transportadoras - Logística

export interface Transportadora {
  id: number;
  razao_social: string;
  cnpj: string;

  // Contato
  telefone: string;
  email?: string;
  endereco?: string;

  // Avaliação
  rating?: number; // 1-5 estrelas

  // Observações
  observacoes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface TransportadoraCreate
  extends Omit<Transportadora, 'id' | 'created_at' | 'updated_at'> {}

export interface TransportadoraUpdate extends Partial<TransportadoraCreate> {}
