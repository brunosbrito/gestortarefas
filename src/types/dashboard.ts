import { ActivityStatusType } from '@/constants/activityStatus';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';

// Tipos centralizados para o dashboard
export interface DashboardFilters {
  macroTaskId?: number | null;
  processId?: number | null;
  serviceOrderId?: number | null;
  obraId?: number | null;
  collaboratorId?: number | null;
  period?: PeriodFilterType;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface ActivityStatistics {
  total: number;
  planejadas: number;
  emExecucao: number;
  concluidas: number;
  paralizadas: number;
  atrasadas: number;
}

export interface DashboardState {
  // Dados primários
  activities: NormalizedActivity[];
  projects: any[];
  serviceOrders: any[];
  
  // Estatísticas
  statistics: {
    macroTasks: any[];
    processes: any[];
    collaborators: any[];
  };
  
  // Contadores
  totals: {
    activities: number;
    projects: number;
    serviceOrders: number;
  };
  
  // Status das atividades
  activityStatus: ActivityStatistics;
  
  // Estados de loading
  loading: {
    data: boolean;
    statistics: boolean;
    filtered: boolean;
  };
  
  // Filtros aplicados
  filters: DashboardFilters;
  
  // Dados filtrados
  filteredData: {
    activities: NormalizedActivity[];
    projects: any[];
    serviceOrders: any[];
  };
  
  // Cache para evitar recálculos
  lastUpdated: Date;
}

export interface NormalizedActivity {
  id: number;
  description: string;
  status: ActivityStatusType;
  observation?: string;
  imageUrl?: string;
  fileUrl?: string;
  
  // IDs relacionados (normalizados)
  macroTaskId?: number;
  processId?: number;
  projectId: number;
  serviceOrderId: number;
  cod_sequencial?: number;
  
  // Dados de tempo
  timePerUnit?: number;
  quantity?: number;
  estimatedTime?: number;
  actualTime?: number;
  totalTime?: number;
  
  // Datas
  plannedStartDate?: Date;
  startDate?: Date;
  endDate?: Date;
  pauseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Equipe
  team?: Array<{
    collaboratorId: number;
    name: string;
  }>;
  
  // Dados relacionados (desnormalizados para facilitar)
  macroTask?: string;
  process?: string;
  projectName?: string;
  serviceOrder?: {
    id: number;
    number: string;
    description: string;
  };
  
  // Métricas calculadas
  progress?: number;
  isDelayed?: boolean;
  isStartDelayed?: boolean;
  isCompleted?: boolean;
}

export interface FilterOptions {
  macroTasks: Array<{ id: number; name: string }>;
  processes: Array<{ id: number; name: string }>;
  collaborators: Array<{ id: number; name: string }>;
  projects: Array<{ id: number; name: string }>;
  serviceOrders: Array<{ id: number; number: string; description: string }>;
}