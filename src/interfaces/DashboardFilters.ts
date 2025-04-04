import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';
import { ServiceOrder } from './ServiceOrderInterface';

export interface DashboardFilters {
  macroTaskId?: number | null;
  processId?: number | null;
  serviceOrderId?: number | null; // ✅ Agora é number | null
  period?: PeriodFilterType | string | null;
  obraId?: number | null;
}

export interface FilteredServiceOrder {
  id: number | string; // ✅ Pode ser number ou string para maior compatibilidade
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
  serviceOrderId?: number; // ✅ Agora é number para manter a consistência
  projectName: string;
  createdAt?: string | Date;
}
