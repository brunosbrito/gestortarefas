
import { TarefaMacro } from "./TarefaMacroInterface";
import { Processo } from "./ProcessoInterface";
import { Project } from "./RncInterface";
import { ServiceOrder } from "./ServiceOrderInterface";

export interface Activity {
  id: number;
  description: string;
  status: 'Planejadas' | 'Atrasadas' | 'Em execução' | 'Paralizadas' | 'Concluídas';
  observation?: string;
  imageUrl?: string;
  imageDescription?: string;
  fileUrl?: string;
  fileDescription?: string;
  macroTask?: string | TarefaMacro;
  process?: string | Processo;
  timePerUnit?: number;
  quantity?: number;
  estimatedTime?: string;
  actualTime?: number;
  plannedStartDate?: string;
  startDate?: string;
  endDate?: string;
  pauseDate?: string;
  createdAt: string;
  updatedAt: string;
  collaborators: number[];
  projectId: number;
  orderServiceId: number;
  createdBy: number;
  unidadeTempo?: string;
  project: Project,
  serviceOrder: ServiceOrder
}
