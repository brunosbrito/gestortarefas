// Interface para Manutenções de Veículos

export type ManutencaoStatus = 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';

export interface ManutencaoPeca {
  id?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

export interface Manutencao {
  id: number;
  veiculo_id: number;
  veiculo_placa?: string; // Denormalizado
  veiculo_modelo?: string; // Denormalizado

  // Tipo de Manutenção
  tipo_manutencao_id: number;
  tipo_manutencao_nome?: string; // Denormalizado

  // Fornecedor de Serviço
  fornecedor_servico_id?: number;
  fornecedor_servico_nome?: string; // Denormalizado

  // KM
  km_atual: number;
  proxima_manutencao_km?: number;

  // Status
  status: ManutencaoStatus;

  // Datas
  data_agendada?: string;
  data_inicio?: string;
  data_conclusao?: string;

  // Peças e Serviços
  pecas_trocadas: ManutencaoPeca[];

  // Custos
  custo_pecas: number;
  custo_mao_obra: number;
  custo_total: number;

  // Documentos
  fotos_documentos: string[]; // NF, ordem de serviço
  numero_nf?: string;

  // Descrição e Observações
  descricao: string;
  observacoes?: string;

  // Responsável
  responsavel_id?: number;
  responsavel_nome?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// Tipo para criar nova manutenção
export type ManutencaoCreate = Omit<
  Manutencao,
  'id' | 'veiculo_placa' | 'veiculo_modelo' | 'tipo_manutencao_nome' | 'fornecedor_servico_nome' | 'responsavel_nome' | 'created_at' | 'updated_at'
>;

// Tipo para atualizar manutenção
export type ManutencaoUpdate = Partial<ManutencaoCreate>;

// Labels para Status
export const manutencaoStatusLabels: Record<ManutencaoStatus, string> = {
  agendada: 'Agendada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

// Cores para Status (para badges)
export const manutencaoStatusVariants: Record<ManutencaoStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  agendada: 'outline',
  em_andamento: 'default',
  concluida: 'secondary',
  cancelada: 'destructive',
};
