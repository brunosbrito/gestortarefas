// Constantes padronizadas para status das atividades
export const ACTIVITY_STATUS = {
  PLANEJADO: 'Planejado',
  PENDENTE: 'Pendente', 
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  PARALIZADA: 'Paralizada'
} as const;

export type ActivityStatusType = typeof ACTIVITY_STATUS[keyof typeof ACTIVITY_STATUS];

// Mapeamento para normalizar status vindos da API
export const STATUS_MAPPING: Record<string, ActivityStatusType> = {
  'Planejado': ACTIVITY_STATUS.PLANEJADO,
  'Planejada': ACTIVITY_STATUS.PLANEJADO,
  'Planejadas': ACTIVITY_STATUS.PLANEJADO,
  'Pendente': ACTIVITY_STATUS.PENDENTE,
  'Pendentes': ACTIVITY_STATUS.PENDENTE,
  'Em andamento': ACTIVITY_STATUS.EM_ANDAMENTO,
  'Em execução': ACTIVITY_STATUS.EM_ANDAMENTO,
  'Concluída': ACTIVITY_STATUS.CONCLUIDA,
  'Concluídas': ACTIVITY_STATUS.CONCLUIDA,
  'Finalizada': ACTIVITY_STATUS.CONCLUIDA,
  'Finalizadas': ACTIVITY_STATUS.CONCLUIDA,
  'Paralizada': ACTIVITY_STATUS.PARALIZADA,
  'Paralisada': ACTIVITY_STATUS.PARALIZADA,
  'Paralizadas': ACTIVITY_STATUS.PARALIZADA,
  'Pausada': ACTIVITY_STATUS.PARALIZADA,
};

// Função para normalizar status
export const normalizeActivityStatus = (status: string): ActivityStatusType => {
  return STATUS_MAPPING[status] || ACTIVITY_STATUS.PLANEJADO;
};

// Cores para cada status (usando design system)
export const STATUS_COLORS = {
  [ACTIVITY_STATUS.PLANEJADO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ACTIVITY_STATUS.PENDENTE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ACTIVITY_STATUS.EM_ANDAMENTO]: 'bg-orange-100 text-orange-800 border-orange-200',
  [ACTIVITY_STATUS.CONCLUIDA]: 'bg-green-100 text-green-800 border-green-200',
  [ACTIVITY_STATUS.PARALIZADA]: 'bg-red-100 text-red-800 border-red-200',
};