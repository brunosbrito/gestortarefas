// Interface para Catálogo de Tintas (Primer, Acabamento)
export interface TintaInterface {
  id?: number;
  codigo: string;
  descricao: string;
  tipo: TipoTinta;
  solidosVolume: number; // % (SV)
  precoLitro: number; // R$/litro
  fornecedor: string;
  observacoes?: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum TipoTinta {
  PRIMER = 'primer',
  ACABAMENTO = 'acabamento',
}

export const TipoTintaLabels: Record<TipoTinta, string> = {
  [TipoTinta.PRIMER]: 'Primer (Fundo)',
  [TipoTinta.ACABAMENTO]: 'Acabamento',
};

// DTO para criação/edição
export interface TintaCreateDTO {
  codigo: string;
  descricao: string;
  tipo: TipoTinta;
  solidosVolume: number;
  precoLitro: number;
  fornecedor: string;
  observacoes?: string;
  ativo: boolean;
}

export interface TintaUpdateDTO extends Partial<TintaCreateDTO> {
  id: number;
}

// Filtros para pesquisa
export interface TintaFiltros {
  busca?: string;
  tipo?: TipoTinta;
  fornecedor?: string;
  ativo?: boolean;
}
