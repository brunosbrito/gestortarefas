
import { Colaborador } from './ColaboradorInterface';
import { ServiceOrder } from './ServiceOrderInterface';
import { User } from './UserInterface';
import { Processo } from './ProcessoInterface';
import { TarefaMacro } from './TarefaMacroInterface';

export interface AtividadeStatus {
  id: number;
  description: string;
  startDate: string;
  endDate: string | null;
  macroTask: string | TarefaMacro;
  process: string | Processo;
  collaborators: Colaborador[];
  serviceOrder: ServiceOrder;
  estimatedTime: string;
  pauseDate: string;
  createdAt: string;
  cod_sequencial: number;
  project: {
    id: number;
    name: string;
    groupNumber: number;
    client: string;
    address: string;
    startDate: string;
    endDate: string | null;
    observation: string;
    status: string;
  };
  createdBy: User;
  status: 'Planejadas' | 'Em execução' | 'Concluídas' | 'Paralizadas';
  totalTime: number;
  originalStartDate: string;
  quantity: number;
  completedQuantity: number;
  timePerUnit?: number;
  unidadeTempo?: 'minutos' | 'horas';
  observation?: string;
  imageUrl?: string;
  imageDescription?: string;
  fileUrl?: string;
  fileDescription?: string;
  images: {
    id: number;
    imageName: string;
    imagePath: string;
    description: string;
  }[];
}
