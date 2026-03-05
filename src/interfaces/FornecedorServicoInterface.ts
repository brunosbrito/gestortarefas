// Enum de tipos de fornecedor (compatível com backend)
export enum TipoFornecedor {
  MATERIAL = 'material',
  SERVICO = 'servico',
  EQUIPAMENTO = 'equipamento',
  CONSUMIVEL = 'consumivel',
  TINTA = 'tinta',
  LOCACAO = 'locacao',
}

export const TipoFornecedorLabels: Record<TipoFornecedor, string> = {
  [TipoFornecedor.MATERIAL]: 'Material',
  [TipoFornecedor.SERVICO]: 'Serviço',
  [TipoFornecedor.EQUIPAMENTO]: 'Equipamento',
  [TipoFornecedor.CONSUMIVEL]: 'Consumível',
  [TipoFornecedor.TINTA]: 'Tinta',
  [TipoFornecedor.LOCACAO]: 'Locação',
};

export const TipoFornecedorColors: Record<TipoFornecedor, string> = {
  [TipoFornecedor.MATERIAL]: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  [TipoFornecedor.SERVICO]: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  [TipoFornecedor.EQUIPAMENTO]: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  [TipoFornecedor.CONSUMIVEL]: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  [TipoFornecedor.TINTA]: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  [TipoFornecedor.LOCACAO]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

// Interface principal do Fornecedor (compatível com backend)
export interface FornecedorInterface {
  id?: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  tipo: TipoFornecedor;
  inscricaoEstadual?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  contatoNome?: string;
  contatoTelefone?: string;
  prazoEntregaDias?: number;
  condicaoPagamento?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// DTO para criação
export interface CreateFornecedorDTO {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  tipo: TipoFornecedor;
  inscricaoEstadual?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  contatoNome?: string;
  contatoTelefone?: string;
  prazoEntregaDias?: number;
  condicaoPagamento?: string;
  observacoes?: string;
  ativo?: boolean;
}

// DTO para atualização
export interface UpdateFornecedorDTO extends Partial<CreateFornecedorDTO> {}

// Filtros para pesquisa
export interface FornecedorFiltros {
  busca?: string;
  tipo?: TipoFornecedor;
  ativo?: boolean;
}

// Helper para exibir nome do fornecedor (nomeFantasia ou razaoSocial)
export const getNomeFornecedor = (fornecedor: FornecedorInterface): string => {
  return fornecedor.nomeFantasia || fornecedor.razaoSocial;
};
