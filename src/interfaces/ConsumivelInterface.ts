/**
 * Interface para Consumíveis (Lixas, Discos, Eletrodos, EPI, etc.)
 * Utilizada para orçamentos de materiais de consumo
 */

export enum ConsumivelCategoria {
  LIXAS = 'lixas',
  DISCOS = 'discos',
  ELETRODOS = 'eletrodos',
  EPI = 'epi',
  FERRAMENTAS = 'ferramentas',
  OUTROS = 'outros',
}

export enum GrupoABC {
  A = 'A', // Grupo A: 80% do valor (alta prioridade)
  B = 'B', // Grupo B: 15% do valor (média prioridade)
  C = 'C', // Grupo C: 5% do valor (baixa prioridade)
}

export const ConsumivelCategoriaLabels: Record<ConsumivelCategoria, string> = {
  [ConsumivelCategoria.LIXAS]: 'Lixas',
  [ConsumivelCategoria.DISCOS]: 'Discos',
  [ConsumivelCategoria.ELETRODOS]: 'Eletrodos',
  [ConsumivelCategoria.EPI]: 'EPI',
  [ConsumivelCategoria.FERRAMENTAS]: 'Ferramentas',
  [ConsumivelCategoria.OUTROS]: 'Outros',
};

export const GrupoABCLabels: Record<GrupoABC, string> = {
  [GrupoABC.A]: 'Grupo A (80%)',
  [GrupoABC.B]: 'Grupo B (15%)',
  [GrupoABC.C]: 'Grupo C (5%)',
};

export interface ConsumivelInterface {
  id: number;
  codigo: string; // Ex: "LIXA-80", "DISCO-4.1/2"
  descricao: string; // Descrição completa
  categoria: ConsumivelCategoria;
  unidade: string; // 'un', 'kg', 'cx', 'pc'
  precoUnitario: number; // R$ por unidade
  fornecedor: string;
  grupoABC?: GrupoABC; // Classificação ABC (curva ABC)
  observacoes?: string;
  ativo: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConsumivelCreateDTO {
  codigo: string;
  descricao: string;
  categoria: ConsumivelCategoria;
  unidade: string;
  precoUnitario: number;
  fornecedor: string;
  grupoABC?: GrupoABC;
  observacoes?: string;
  ativo: boolean;
}

export interface ConsumivelUpdateDTO extends Partial<ConsumivelCreateDTO> {
  id: number;
}

export interface ConsumivelFiltros {
  busca?: string;
  categoria?: ConsumivelCategoria;
  fornecedor?: string;
  grupoABC?: GrupoABC;
  ativo?: boolean;
}
