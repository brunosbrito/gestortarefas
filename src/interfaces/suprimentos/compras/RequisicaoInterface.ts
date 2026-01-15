// Interface para Requisições de Compra

export type RequisicaoStatus =
  | 'rascunho'      // Em elaboração
  | 'pendente'      // Aguardando aprovação
  | 'aprovada'      // Aprovada, pode cotar
  | 'reprovada'     // Reprovada
  | 'em_cotacao'    // Em processo de cotação
  | 'cotada'        // Cotação finalizada
  | 'cancelada';    // Cancelada

export type RequisicaoPrioridade = 'baixa' | 'media' | 'alta' | 'urgente';

export interface RequisicaoItem {
  id?: number;
  requisicao_id?: number;
  descricao: string;
  especificacao?: string;
  quantidade: number;
  unidade: string;
  data_necessidade: string;
  centro_custo_id?: number;
  centro_custo_nome?: string;
  observacoes?: string;
}

export interface Requisicao {
  id: number;
  numero: string;                    // Auto-gerado: REQ-2026-001
  status: RequisicaoStatus;

  // Solicitante
  solicitante_id: number;
  solicitante_nome: string;

  // Centro de Custo / Obra
  centro_custo_id?: number;
  centro_custo_nome?: string;
  obra_id?: number;
  obra_nome?: string;

  // Dados da Requisição
  data_requisicao: string;
  data_necessidade: string;
  prioridade: RequisicaoPrioridade;

  // Items
  items: RequisicaoItem[];

  // Justificativa
  justificativa: string;
  observacoes?: string;

  // Aprovação
  aprovador_id?: number;
  aprovador_nome?: string;
  data_aprovacao?: string;
  motivo_reprovacao?: string;

  // Auditoria
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface RequisicaoCreate extends Omit<Requisicao, 'id' | 'numero' | 'created_at' | 'updated_at'> {}
export interface RequisicaoUpdate extends Partial<RequisicaoCreate> {}

// Labels e variantes para UI
export const requisicaoStatusLabels: Record<RequisicaoStatus, string> = {
  rascunho: 'Rascunho',
  pendente: 'Pendente Aprovação',
  aprovada: 'Aprovada',
  reprovada: 'Reprovada',
  em_cotacao: 'Em Cotação',
  cotada: 'Cotada',
  cancelada: 'Cancelada',
};

export const requisicaoStatusVariants: Record<RequisicaoStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  rascunho: 'outline',
  pendente: 'secondary',
  aprovada: 'default',
  reprovada: 'destructive',
  em_cotacao: 'default',
  cotada: 'default',
  cancelada: 'destructive',
};

export const requisicaoPrioridadeLabels: Record<RequisicaoPrioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const requisicaoPrioridadeVariants: Record<RequisicaoPrioridade, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  baixa: 'outline',
  media: 'secondary',
  alta: 'default',
  urgente: 'destructive',
};
