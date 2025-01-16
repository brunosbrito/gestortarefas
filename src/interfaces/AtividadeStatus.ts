import { Colaborador } from './ColaboradorInterface';
import { ServiceOrder } from './ServiceOrderInterface';
import { User } from './UserInterface';

export interface AtividadeStatus {
  id: number;
  description: string;
  startDate: string;
  endDate: string | null;
  macroTask: string;
  process: string;
  collaborators: Colaborador[];
  serviceOrder: ServiceOrder;
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
}
