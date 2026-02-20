/**
 * Interface para Mobilização e Desmobilização
 * Gerencia custos de mobilização de equipamentos, transporte, canteiro e desmobilização
 */

export enum TipoMobilizacao {
  MOBILIZACAO = 'mobilizacao',
  DESMOBILIZACAO = 'desmobilizacao',
}

export enum CategoriaMobilizacao {
  TRANSPORTE = 'transporte',
  MONTAGEM_CANTEIRO = 'montagem_canteiro',
  EQUIPAMENTOS = 'equipamentos',
  OUTROS = 'outros',
}

export const TipoMobilizacaoLabels: Record<TipoMobilizacao, string> = {
  [TipoMobilizacao.MOBILIZACAO]: 'Mobilização',
  [TipoMobilizacao.DESMOBILIZACAO]: 'Desmobilização',
};

export const CategoriaMobilizacaoLabels: Record<CategoriaMobilizacao, string> = {
  [CategoriaMobilizacao.TRANSPORTE]: 'Transporte',
  [CategoriaMobilizacao.MONTAGEM_CANTEIRO]: 'Montagem de Canteiro',
  [CategoriaMobilizacao.EQUIPAMENTOS]: 'Equipamentos',
  [CategoriaMobilizacao.OUTROS]: 'Outros',
};

export interface ItemMobilizacaoInterface {
  id: number;
  tipo: TipoMobilizacao;
  codigo: string; // Ex: "MOB-TRANSP-01", "DESMOB-EQUIP-02"
  descricao: string; // Descrição completa
  categoria: CategoriaMobilizacao;
  unidade: string; // 'un', 'vb' (verba), 'km', 'dia'
  precoUnitario: number; // R$ por unidade
  observacoes?: string;
  ativo: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ItemMobilizacaoCreateDTO {
  tipo: TipoMobilizacao;
  codigo: string;
  descricao: string;
  categoria: CategoriaMobilizacao;
  unidade: string;
  precoUnitario: number;
  observacoes?: string;
  ativo: boolean;
}

export interface ItemMobilizacaoUpdateDTO extends Partial<ItemMobilizacaoCreateDTO> {
  id: number;
}

export interface ItemMobilizacaoFiltros {
  busca?: string;
  tipo?: TipoMobilizacao;
  categoria?: CategoriaMobilizacao;
  ativo?: boolean;
}
