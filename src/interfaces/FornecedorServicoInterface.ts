// Interface para Fornecedores de Serviços
export type CategoriaFornecedor =
  | 'jateamento_pintura'
  | 'usinagem'
  | 'transporte'
  | 'inspecao_solda'
  | 'montagem_externa'
  | 'outros';

export const CategoriaFornecedorLabels: Record<CategoriaFornecedor, string> = {
  jateamento_pintura: 'Jateamento / Pintura',
  usinagem: 'Usinagem',
  transporte: 'Transporte',
  inspecao_solda: 'Inspeção de Solda',
  montagem_externa: 'Montagem Externa',
  outros: 'Outros',
};

export const CategoriaFornecedorColors: Record<CategoriaFornecedor, string> = {
  jateamento_pintura: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  usinagem: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  transporte: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  inspecao_solda: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  montagem_externa: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  outros: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export interface FornecedorServicoInterface {
  id?: number;
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  contato?: string;
  telefone?: string;
  email?: string;

  // Categorias de serviço
  categorias: CategoriaFornecedor[];

  // Valores de Mão de Obra (aplicável a jateamento/pintura)
  valorJateamentoM2: number; // R$/m²
  valorPinturaM2: number;    // R$/m²

  observacoes?: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// DTO para criação/edição
export interface FornecedorServicoCreateDTO {
  nome: string;
  razaoSocial?: string;
  cnpj?: string;
  contato?: string;
  telefone?: string;
  email?: string;
  categorias: CategoriaFornecedor[];
  valorJateamentoM2: number;
  valorPinturaM2: number;
  observacoes?: string;
  ativo: boolean;
}

export interface FornecedorServicoUpdateDTO extends Partial<FornecedorServicoCreateDTO> {
  id: number;
}

// Filtros para pesquisa
export interface FornecedorServicoFiltros {
  busca?: string;
  categoria?: CategoriaFornecedor;
  ativo?: boolean;
}
