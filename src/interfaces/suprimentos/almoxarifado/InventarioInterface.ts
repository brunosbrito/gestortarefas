// Interface para Inventário de Estoque
export type InventarioStatus = 'em_andamento' | 'concluido' | 'ajustado';

export interface Inventario {
  id: number;
  codigo: string; // Ex: INV-2024-001
  descricao?: string;
  status: InventarioStatus;
  data_inicio: string;
  data_conclusao?: string;
  responsavel_id: number;
  responsavel_nome?: string;
  total_items: number;
  items_contados: number;
  total_divergencias: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventarioItem {
  id: number;
  inventario_id: number;
  item_id: number;
  item_codigo?: string;
  item_nome?: string;
  item_unidade?: string;
  estoque_sistema: number;
  quantidade_contada?: number;
  divergencia?: number; // Calculado: quantidade_contada - estoque_sistema
  localizacao?: string;
  observacoes?: string;
  contado: boolean;
  contado_por_id?: number;
  contado_por_nome?: string;
  data_contagem?: string;
  created_at: string;
  updated_at: string;
}

export type InventarioCreate = Omit<Inventario, 'id' | 'created_at' | 'updated_at' | 'total_items' | 'items_contados' | 'total_divergencias'>;
export type InventarioUpdate = Partial<InventarioCreate>;

export type InventarioItemCreate = Omit<InventarioItem, 'id' | 'created_at' | 'updated_at' | 'divergencia'>;
export type InventarioItemUpdate = Partial<InventarioItemCreate>;

export const inventarioStatusLabels: Record<InventarioStatus, string> = {
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  ajustado: 'Ajustado',
};

export const inventarioStatusVariants: Record<InventarioStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  em_andamento: 'secondary',
  concluido: 'default',
  ajustado: 'outline',
};

export const inventarioStatusIcons: Record<InventarioStatus, string> = {
  em_andamento: 'Clock',
  concluido: 'CheckCircle',
  ajustado: 'Settings',
};
