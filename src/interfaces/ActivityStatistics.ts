
export interface MacroTaskStatistic {
  id: number;
  name: string;
  activityCount: number;
  estimatedHours: number;
  actualHours: number;
  hoursDifference: number;
  createdAt?: Date;
}

export interface ProcessStatistic {
  id: number;
  name: string;
  activityCount: number;
  estimatedHours: number;
  actualHours: number;
  hoursDifference: number;
  createdAt?: Date;
}

export interface CollaboratorStatistic {
  id: number;
  name: string;
  activityCount: number;
  hoursWorked: number;
  role: string;
  createdAt?: Date;
}

export interface ActivityStatistics {
  macroTasks: MacroTaskStatistic[];
  processes: ProcessStatistic[];
  collaborators: CollaboratorStatistic[];
}
