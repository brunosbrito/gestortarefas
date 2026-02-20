export interface GanttTask {
  Item?: number;
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
  // Campos adicionais
  MacroTask?: string;
  Process?: string;
  Project?: string;
  ServiceOrder?: string;
  EstimatedTime?: string;
  Quantity?: number;
  CompletedQuantity?: number;
  Observation?: string;
  CreatedBy?: string;
  CreatedAt?: string;
  CodSequencial?: number;
}

export type GanttGroupBy = 'obra' | 'tarefaMacro' | 'colaborador' | null;

export interface GanttColumnConfig {
  field: string;
  headerText: string;
  width: number;
  format?: string;
  textAlign?: 'Left' | 'Center' | 'Right';
  visible: boolean;
  required?: boolean;
  type?: 'string' | 'number' | 'date' | 'datetime' | 'boolean';
}

export const DEFAULT_GANTT_COLUMNS: GanttColumnConfig[] = [
  { field: 'Item', headerText: 'Item', width: 60, textAlign: 'Center', visible: true, required: true },
  { field: 'TaskName', headerText: 'Atividade', width: 250, visible: true, required: true },
  { field: 'StartDate', headerText: 'Início', width: 120, visible: true },
  { field: 'EndDate', headerText: 'Fim', width: 120, visible: true },
  { field: 'Duration', headerText: 'Dias', width: 70, textAlign: 'Center', visible: true },
  { field: 'Progress', headerText: '%', width: 60, textAlign: 'Center', visible: true },
  { field: 'Status', headerText: 'Status', width: 120, visible: true },
  { field: 'Collaborators', headerText: 'Colaboradores', width: 150, visible: false },
  { field: 'MacroTask', headerText: 'Tarefa Macro', width: 150, visible: false },
  { field: 'Process', headerText: 'Processo', width: 150, visible: false },
  { field: 'Project', headerText: 'Obra', width: 150, visible: false },
  { field: 'ServiceOrder', headerText: 'OS', width: 100, visible: false },
  { field: 'EstimatedTime', headerText: 'Tempo Estimado', width: 120, textAlign: 'Center', visible: false },
  { field: 'Quantity', headerText: 'Quantidade', width: 100, textAlign: 'Center', visible: false },
  { field: 'CompletedQuantity', headerText: 'Qtd Concluída', width: 110, textAlign: 'Center', visible: false },
  { field: 'Observation', headerText: 'Observação', width: 200, visible: false },
  { field: 'CreatedBy', headerText: 'Criado por', width: 130, visible: false },
  { field: 'CreatedAt', headerText: 'Data Criação', width: 120, visible: false },
  { field: 'CodSequencial', headerText: 'N. Atividade', width: 100, textAlign: 'Center', visible: false },
];

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
