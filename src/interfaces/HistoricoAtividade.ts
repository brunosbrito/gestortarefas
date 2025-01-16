import { User } from './UserInterface';

export interface HistoricoAtividade {
  id: number;
  status: string;
  description: string;
  changedBy: User;
  timestamp: Date;
}
