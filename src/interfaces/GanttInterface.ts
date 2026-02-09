export interface GanttTask {
  TaskID: number;
  TaskName: string;
  StartDate: Date | null;
  EndDate?: Date | null;
  Duration?: number;
  Progress: number;
  ParentID?: number;
  Predecessor?: string;
  Status: string;
  Collaborators?: string;
  ActivityId?: number;
  isGroup?: boolean;
  subtasks?: GanttTask[];
}

export type GanttGroupBy = 'obra' | 'tarefaMacro' | 'colaborador' | null;

export interface GanttTaskFields {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: string;
  progress: string;
  parentID: string;
  dependency: string;
}
