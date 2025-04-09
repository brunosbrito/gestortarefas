
import { MacroTaskStatistic, ProcessStatistic, CollaboratorStatistic } from '@/interfaces/ActivityStatistics';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';

// Tipo para status de atividades
export interface ActivityStatusCounts {
  planejadas: number;
  emExecucao: number;
  concluidas: number;
  paralizadas: number;
}

export interface DashboardDataState {
  macroTaskStatistic: MacroTaskStatistic[];
  processStatistic: ProcessStatistic[];
  collaboratorStatistic: CollaboratorStatistic[];
  originalMacroTaskStatistic: MacroTaskStatistic[];
  originalProcessStatistic: ProcessStatistic[];
  originalCollaboratorStatistic: CollaboratorStatistic[];
  totalActivities: number;
  totalProjetos: number;
  totalServiceOrder: number;
  isLoading: boolean;
  allActivities: any[];
  activitiesByStatus: ActivityStatusCounts;
}

export interface DashboardDataActions {
  loadAllData: () => Promise<void>;
  applyPeriodFilter: (period: PeriodFilterType, obraId?: number | null, serviceOrderId?: number | null) => void;
  countActivitiesByStatus: (activities: any[]) => void;
}

export type DashboardData = DashboardDataState & DashboardDataActions;
