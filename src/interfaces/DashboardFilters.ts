
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';
import { ServiceOrder } from './ServiceOrderInterface';

export interface DashboardFilters {
  macroTaskId?: number | null;
  processId?: number | null;
  serviceOrderId?: number | null;
  period?: PeriodFilterType | string | null;
  obraId?: number | null;
  collaboratorId?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface FilteredServiceOrder {
  id: number | string;
  serviceOrderNumber: string;
  description: string;
  projectName: string;
  status: string;
  activityCount: number;
  createdAt?: string | Date;
}

export interface FilteredActivity {
  id: number;
  description: string;
  status: string;
  macroTask: string;
  macroTaskId?: number;
  process: string;
  processId?: number;
  serviceOrder: ServiceOrder;
  serviceOrderId?: number;
  projectId?: number;
  cod_sequencial?: number;
  projectName: string;
  totalTime?: number;
  estimatedTime?: number;
  team?: Array<{ collaboratorId: number; name: string }>;
  progress?: number;
  createdAt?: string | Date;
}
