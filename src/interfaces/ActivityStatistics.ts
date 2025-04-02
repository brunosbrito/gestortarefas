
export interface MacroTaskStatistic {
  id: number;
  name: string;
  activityCount: number;
  estimatedHours: number;
  actualHours: number;
  hoursDifference: number;
}

export interface ProcessStatistic {
  id: number;
  name: string;
  activityCount: number;
  estimatedHours: number;
  actualHours: number;
  hoursDifference: number;
}

export interface CollaboratorStatistic {
  id: number;
  name: string;
  activityCount: number;
  hoursWorked: number;
  role: string;
}

export interface ActivityStatistics {
  macroTasks: MacroTaskStatistic[];
  processes: ProcessStatistic[];
  collaborators: CollaboratorStatistic[];
}
