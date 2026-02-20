import { Activity } from '@/interfaces/AtividadeInterface';
import { NormalizedActivity, ActivityStatistics } from '@/types/dashboard';
import { normalizeActivityStatus, ACTIVITY_STATUS } from '@/constants/activityStatus';

/**
 * Normaliza uma atividade vinda da API para o formato padronizado
 */
export const normalizeActivity = (activity: any): NormalizedActivity => {
  const status = normalizeActivityStatus(activity.status);
  
  // Calcular tempo total se disponível
  const totalTime = activity.totalTime || (activity.timePerUnit && activity.quantity 
    ? activity.timePerUnit * activity.quantity 
    : null);
  
  // Verificar se está atrasada
  const isDelayed = checkIfDelayed(activity, status);

  // Verificar se o início está atrasado (status Planejado mas data início prevista já passou)
  const isStartDelayed = checkIfStartDelayed(activity, status);

  // Calcular progresso
  const progress = calculateProgress(activity);
  
  return {
    id: activity.id,
    description: activity.description,
    status,
    observation: activity.observation,
    imageUrl: activity.imageUrl,
    fileUrl: activity.fileUrl,
    cod_sequencial: activity.cod_sequencial,

    // IDs normalizados
    macroTaskId: extractId(activity.macroTask),
    processId: extractId(activity.process),
    projectId: activity.projectId || activity.project?.id,
    serviceOrderId: activity.orderServiceId || activity.serviceOrder?.id,
    
    // Dados de tempo
    timePerUnit: activity.timePerUnit,
    quantity: activity.quantity,
    estimatedTime: activity.estimatedTime,
    actualTime: activity.actualTime,
    totalTime,
    
    // Datas normalizadas
    plannedStartDate: parseDate(activity.plannedStartDate),
    startDate: parseDate(activity.startDate),
    endDate: parseDate(activity.endDate),
    pauseDate: parseDate(activity.pauseDate),
    createdAt: parseDate(activity.createdAt) || new Date(),
    updatedAt: parseDate(activity.updatedAt) || new Date(),
    
    // Equipe normalizada
    team: normalizeTeam(activity.team || activity.collaborators),
    
    // Dados relacionados (desnormalizados)
    macroTask: extractName(activity.macroTask),
    process: extractName(activity.process),
    projectName: activity.project?.name || activity.projectName,
    serviceOrder: activity.serviceOrder ? {
      id: activity.serviceOrder.id,
      number: activity.serviceOrder.serviceOrderNumber || activity.serviceOrder.number,
      description: activity.serviceOrder.description
    } : undefined,
    
    // Métricas calculadas
    progress,
    isDelayed,
    isStartDelayed,
    isCompleted: status === ACTIVITY_STATUS.CONCLUIDA
  };
};

/**
 * Extrai ID de um objeto ou retorna o valor se já for um número
 */
const extractId = (value: any): number | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value?.id) return value.id;
  return undefined;
};

/**
 * Extrai nome de um objeto ou retorna o valor se já for uma string
 */
const extractName = (value: any): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value?.name) return value.name;
  return undefined;
};

/**
 * Converte string de data para objeto Date
 */
const parseDate = (dateStr: string | Date | undefined): Date | undefined => {
  if (!dateStr) return undefined;
  if (dateStr instanceof Date) return dateStr;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? undefined : parsed;
};

/**
 * Normaliza dados da equipe
 */
const normalizeTeam = (team: any): Array<{ collaboratorId: number; name: string }> | undefined => {
  if (!team) return undefined;
  
  if (Array.isArray(team)) {
    return team.map(member => ({
      collaboratorId: typeof member === 'object' ? member.id || member.collaboratorId : member,
      name: typeof member === 'object' ? member.name || member.colaboradorName || 'Colaborador' : 'Colaborador'
    }));
  }
  
  return undefined;
};

/**
 * Verifica se o início está atrasado (status Planejado mas data início prevista já passou)
 */
const checkIfStartDelayed = (activity: any, status: string): boolean => {
  if (status !== ACTIVITY_STATUS.PLANEJADO) return false;

  const plannedStartDate = parseDate(activity.plannedStartDate);
  if (!plannedStartDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return plannedStartDate < today;
};

/**
 * Verifica se uma atividade está atrasada
 */
const checkIfDelayed = (activity: any, status: string): boolean => {
  if (status === ACTIVITY_STATUS.CONCLUIDA) return false;
  if (status === ACTIVITY_STATUS.PARALIZADA) return true;
  
  const endDate = parseDate(activity.endDate);
  if (!endDate) return false;
  
  return new Date() > endDate;
};

/**
 * Calcula o progresso de uma atividade
 */
const calculateProgress = (activity: any): number => {
  if (activity.progress !== undefined) return activity.progress;
  
  const status = normalizeActivityStatus(activity.status);
  
  switch (status) {
    case ACTIVITY_STATUS.PLANEJADO:
      return 0;
    case ACTIVITY_STATUS.PENDENTE:
      return 10;
    case ACTIVITY_STATUS.EM_ANDAMENTO:
      return 50;
    case ACTIVITY_STATUS.CONCLUIDA:
      return 100;
    case ACTIVITY_STATUS.PARALIZADA:
      return activity.progress || 0;
    default:
      return 0;
  }
};

/**
 * Conta atividades por status
 */
export const countActivitiesByStatus = (activities: NormalizedActivity[]): ActivityStatistics => {
  const counts = activities.reduce((acc, activity) => {
    switch (activity.status) {
      case ACTIVITY_STATUS.PLANEJADO:
        acc.planejadas++;
        break;
      case ACTIVITY_STATUS.EM_ANDAMENTO:
        acc.emExecucao++;
        break;
      case ACTIVITY_STATUS.CONCLUIDA:
        acc.concluidas++;
        break;
      case ACTIVITY_STATUS.PARALIZADA:
        acc.paralizadas++;
        break;
    }
    return acc;
  }, {
    total: activities.length,
    planejadas: 0,
    emExecucao: 0,
    concluidas: 0,
    paralizadas: 0
  });
  
  return counts;
};

/**
 * Filtra atividades por múltiplos critérios
 */
export const filterActivities = (
  activities: NormalizedActivity[],
  filters: {
    macroTaskId?: number | null;
    processId?: number | null;
    projectId?: number | null;
    serviceOrderId?: number | null;
    collaboratorId?: number | null;
    status?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  }
): NormalizedActivity[] => {
  return activities.filter(activity => {
    // Filtro por tarefa macro
    if (filters.macroTaskId && activity.macroTaskId !== filters.macroTaskId) {
      return false;
    }
    
    // Filtro por processo
    if (filters.processId && activity.processId !== filters.processId) {
      return false;
    }
    
    // Filtro por projeto
    if (filters.projectId && activity.projectId !== filters.projectId) {
      return false;
    }
    
    // Filtro por ordem de serviço
    if (filters.serviceOrderId && activity.serviceOrderId !== filters.serviceOrderId) {
      return false;
    }
    
    // Filtro por colaborador
    if (filters.collaboratorId && activity.team) {
      const hasCollaborator = activity.team.some(
        member => member.collaboratorId === filters.collaboratorId
      );
      if (!hasCollaborator) return false;
    }
    
    // Filtro por status
    if (filters.status && activity.status !== filters.status) {
      return false;
    }
    
    // Filtro por data
    if (filters.startDate && activity.createdAt < filters.startDate) {
      return false;
    }
    
    if (filters.endDate && activity.createdAt > filters.endDate) {
      return false;
    }
    
    return true;
  });
};