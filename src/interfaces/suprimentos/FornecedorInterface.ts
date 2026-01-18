export type FornecedorTipo = 'material' | 'servico' | 'ambos';
export type FornecedorStatus = 'ativo' | 'inativo' | 'bloqueado';

export interface Fornecedor {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  inscricao_estadual?: string;
  tipo: FornecedorTipo;

  // Contato
  email?: string;
  telefone?: string;
  whatsapp?: string;
  contato_nome?: string;

  // Endereço
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;

  // Dados bancários
  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;

  // Avaliação
  rating?: number; // 0-5 estrelas
  observacoes?: string;

  // Status
  status: FornecedorStatus;

  // Timestamps
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface FornecedorCreate extends Omit<Fornecedor, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {}

export interface FornecedorUpdate extends Partial<FornecedorCreate> {}

export interface FornecedorFilters {
  search?: string;
  tipo?: FornecedorTipo;
  status?: FornecedorStatus;
  rating?: number;
}
