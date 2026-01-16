// Interface para Items do Almoxarifado
export type ItemCategoria =
  | 'materia_prima'
  | 'produto_acabado'
  | 'componente'
  | 'ferramenta'
  | 'epi'
  | 'consumivel'
  | 'outros';

export type ItemUnidade =
  | 'UN' // Unidade
  | 'KG' // Quilograma
  | 'M' // Metro
  | 'M2' // Metro quadrado
  | 'M3' // Metro cúbico
  | 'L' // Litro
  | 'CX' // Caixa
  | 'PCT' // Pacote
  | 'PC' // Peça
  | 'KIT' // Kit
  | 'PAR' // Par
  | 'RL' // Rolo
  | 'SC' // Saco
  | 'FD' // Fardo;

export interface Item {
  id: number;
  codigo: string; // Código único do item
  nome: string;
  descricao?: string;

  // Classificação
  categoria: ItemCategoria;
  unidade: ItemUnidade;

  // Estoque
  estoque_atual: number;
  estoque_minimo?: number;
  estoque_maximo?: number;

  // Localização
  localizacao?: string; // Ex: "Prateleira A3", "Galpão 2 - Setor B"

  // Valor
  valor_unitario?: number;

  // Status
  ativo: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ItemCreate extends Omit<Item, 'id' | 'created_at' | 'updated_at'> {}

export interface ItemUpdate extends Partial<ItemCreate> {}

// Labels para exibição
export const itemCategoriaLabels: Record<ItemCategoria, string> = {
  materia_prima: 'Matéria-Prima',
  produto_acabado: 'Produto Acabado',
  componente: 'Componente',
  ferramenta: 'Ferramenta',
  epi: 'EPI',
  consumivel: 'Consumível',
  outros: 'Outros',
};

export const itemUnidadeLabels: Record<ItemUnidade, string> = {
  UN: 'Unidade',
  KG: 'Quilograma',
  M: 'Metro',
  M2: 'Metro Quadrado',
  M3: 'Metro Cúbico',
  L: 'Litro',
  CX: 'Caixa',
  PCT: 'Pacote',
  PC: 'Peça',
  KIT: 'Kit',
  PAR: 'Par',
  RL: 'Rolo',
  SC: 'Saco',
  FD: 'Fardo',
};

// Variantes de Badge para categoria
export const itemCategoriaVariants: Record<ItemCategoria, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  materia_prima: 'default',
  produto_acabado: 'secondary',
  componente: 'outline',
  ferramenta: 'default',
  epi: 'secondary',
  consumivel: 'outline',
  outros: 'outline',
};
