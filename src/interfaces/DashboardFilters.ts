
export interface DashboardFilters {
  macroTaskId?: number | null;
  processId?: number | null;
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
  process: string;
  serviceOrderNumber: string;
  projectName: string;
}
