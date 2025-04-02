
export interface MacroTaskStatistic {
  id: number;
  macroTask: string;
  activityCount: number;
  estimatedHours: number;
  actualHours: number;
  hoursDifference: number;
}

export interface ProcessStatistic {
  id: number;
  process: string;
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

