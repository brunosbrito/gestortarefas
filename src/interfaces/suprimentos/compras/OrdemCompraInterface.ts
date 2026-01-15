// Interface para Ordens de Compra

export type OrdemCompraStatus =
  | 'rascunho'              // Em elaboração
  | 'aguardando_envio'      // Aguardando envio ao fornecedor
  | 'enviada'               // Enviada ao fornecedor
  | 'confirmada'            // Confirmada pelo fornecedor
  | 'parcialmente_recebida' // Recebimento parcial
  | 'recebida'              // Totalmente recebida
  | 'cancelada';            // Cancelada

export interface OrdemCompraItem {
  id?: number;
  ordem_compra_id?: number;
  requisicao_item_id?: number;
  cotacao_item_id?: number;

  descricao: string;
  especificacao?: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  valor_total: number;

  // Recebimento
  quantidade_recebida: number;
  data_recebimento?: string;

  observacoes?: string;
}

export interface OrdemCompra {
  id: number;
  numero: string;                    // Auto-gerado: OC-2026-001
  status: OrdemCompraStatus;

  // Origem
  requisicao_id?: number;
  requisicao_numero?: string;
  cotacao_id?: number;
  cotacao_numero?: string;

  // Fornecedor
  fornecedor_id: number;
  fornecedor_nome: string;
  fornecedor_cnpj?: string;
  fornecedor_endereco?: string;
  fornecedor_contato?: string;
  fornecedor_email?: string;
  fornecedor_telefone?: string;

  // Datas
  data_emissao: string;
  data_previsao_entrega: string;
  data_confirmacao?: string;
  data_recebimento?: string;

  // Items
  items: OrdemCompraItem[];

  // Valores
  valor_subtotal: number;
  valor_frete?: number;
  valor_desconto?: number;
  valor_total: number;

  // Condições Comerciais
  prazo_entrega: number;             // em dias
  forma_pagamento: string;
  condicoes_pagamento: string;

  // Entrega
  local_entrega: string;
  contato_recebimento: string;
  telefone_recebimento: string;

  // Observações
  observacoes?: string;
  observacoes_internas?: string;

  // Documentos
  arquivo_pdf?: string;

  // Auditoria
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface OrdemCompraCreate extends Omit<OrdemCompra, 'id' | 'numero' | 'created_at' | 'updated_at'> {}
export interface OrdemCompraUpdate extends Partial<OrdemCompraCreate> {}

// Labels e variantes para UI
export const ordemCompraStatusLabels: Record<OrdemCompraStatus, string> = {
  rascunho: 'Rascunho',
  aguardando_envio: 'Aguardando Envio',
  enviada: 'Enviada',
  confirmada: 'Confirmada',
  parcialmente_recebida: 'Parcialmente Recebida',
  recebida: 'Recebida',
  cancelada: 'Cancelada',
};

export const ordemCompraStatusVariants: Record<OrdemCompraStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  rascunho: 'outline',
  aguardando_envio: 'secondary',
  enviada: 'default',
  confirmada: 'default',
  parcialmente_recebida: 'default',
  recebida: 'default',
  cancelada: 'destructive',
};
