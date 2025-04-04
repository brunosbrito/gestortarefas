
export interface MacroTaskStatistic {
  macroTaskId?: number;
  macroTask: string;
  activityCount: number;
  estimatedHours: number;
  actualHours: number;
  hoursDifference: number;
  createdAt?: Date;
}

export interface ProcessStatistic {
  processId?: number;
  process: string;
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
