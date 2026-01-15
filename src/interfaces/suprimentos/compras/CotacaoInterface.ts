// Interface para Cotações
import { RequisicaoItem } from './RequisicaoInterface';

export type CotacaoStatus =
  | 'aguardando'    // Aguardando respostas dos fornecedores
  | 'em_analise'    // Analisando propostas
  | 'finalizada'    // Cotação finalizada
  | 'cancelada';    // Cancelada

export interface CotacaoFornecedorItem {
  id?: string;                       // UUID para items dinâmicos
  cotacao_fornecedor_id?: number;
  requisicao_item_id: number;
  requisicao_item_descricao?: string;

  valor_unitario?: number;
  valor_total?: number;
  marca?: string;
  observacoes?: string;
}

export interface CotacaoFornecedor {
  id?: number;
  cotacao_id?: number;
  fornecedor_id: number;
  fornecedor_nome: string;
  fornecedor_cnpj?: string;
  fornecedor_contato?: string;
  fornecedor_email?: string;
  fornecedor_telefone?: string;

  // Dados da Proposta
  data_envio?: string;
  data_resposta?: string;
  respondeu: boolean;

  // Items cotados
  items: CotacaoFornecedorItem[];

  // Condições Comerciais
  prazo_entrega?: number;            // em dias
  forma_pagamento?: string;
  condicoes_pagamento?: string;
  validade_proposta?: number;        // em dias
  observacoes?: string;

  // Documentos
  arquivo_proposta?: string;
}

export interface Cotacao {
  id: number;
  numero: string;                    // Auto-gerado: COT-2026-001
  status: CotacaoStatus;

  // Requisição de origem
  requisicao_id: number;
  requisicao_numero: string;
  requisicao_items: RequisicaoItem[];

  // Datas
  data_abertura: string;
  data_limite_resposta: string;
  data_finalizacao?: string;

  // Fornecedores
  fornecedores: CotacaoFornecedor[];

  // Observações
  observacoes?: string;

  // Auditoria
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CotacaoCreate extends Omit<Cotacao, 'id' | 'numero' | 'created_at' | 'updated_at'> {}
export interface CotacaoUpdate extends Partial<CotacaoCreate> {}

// Labels e variantes para UI
export const cotacaoStatusLabels: Record<CotacaoStatus, string> = {
  aguardando: 'Aguardando Respostas',
  em_analise: 'Em Análise',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

export const cotacaoStatusVariants: Record<CotacaoStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  aguardando: 'secondary',
  em_analise: 'default',
  finalizada: 'default',
  cancelada: 'destructive',
};
