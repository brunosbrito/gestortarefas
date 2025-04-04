
export interface DashboardFilters {
  macroTaskId?: number | null;
  processId?: number | null;
  serviceOrderId?: string | null;
  period?: string | null;
}

export interface FilteredServiceOrder {
  id: string;
  serviceOrderNumber: string;
  description: string;
  projectName: string;
  status: string;
  activityCount: number;
}

export interface FilteredActivity {
  id: number;
  description: string;
  status: string;
  macroTask: string;
  macroTaskId?: number;
  process: string;
  processId?: number;
  serviceOrderNumber: string;
  serviceOrderId?: string;
  projectName: string;
}
