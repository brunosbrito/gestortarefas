// Interface para Movimentações do Almoxarifado
export type MovimentacaoTipo = 'entrada' | 'saida' | 'transferencia';

export interface Movimentacao {
  id: number;
  tipo: MovimentacaoTipo;

  // Item
  item_id: number;
  item_codigo?: string;
  item_nome?: string;
  item_unidade?: string;

  // Quantidade
  quantidade: number;

  // Origem/Destino (para transferências)
  localizacao_origem?: string;
  localizacao_destino?: string;

  // Responsável
  responsavel_id: number;
  responsavel_nome?: string;

  // Motivo/Observações
  motivo?: string;
  observacoes?: string;

  // Documento de referência (NF, Requisição, OS, etc)
  documento_tipo?: string; // 'nota_fiscal', 'requisicao', 'ordem_servico', 'outros'
  documento_numero?: string;

  // Data
  data_movimentacao: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface MovimentacaoCreate
  extends Omit<Movimentacao, 'id' | 'created_at' | 'updated_at' | 'item_codigo' | 'item_nome' | 'item_unidade' | 'responsavel_nome'> {}

export interface MovimentacaoUpdate extends Partial<MovimentacaoCreate> {}

// Labels para exibição
export const movimentacaoTipoLabels: Record<MovimentacaoTipo, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  transferencia: 'Transferência',
};

export const movimentacaoDocumentoTipoLabels: Record<string, string> = {
  nota_fiscal: 'Nota Fiscal',
  requisicao: 'Requisição',
  ordem_servico: 'Ordem de Serviço',
  outros: 'Outros',
};

// Variantes de Badge para tipo
export const movimentacaoTipoVariants: Record<MovimentacaoTipo, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  entrada: 'default',
  saida: 'destructive',
  transferencia: 'secondary',
};

// Ícones sugeridos por tipo
export const movimentacaoTipoIcons: Record<MovimentacaoTipo, string> = {
  entrada: 'ArrowDown', // ou 'Download'
  saida: 'ArrowUp', // ou 'Upload'
  transferencia: 'ArrowLeftRight', // ou 'RefreshCw'
};
