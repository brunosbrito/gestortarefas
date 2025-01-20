export type AtividadeStatus = 'não iniciada' | 'em andamento' | 'concluída' | 'pausada' | 'cancelada';

export interface Activity {
  id: number;
  description: string;
  status: AtividadeStatus;
  observation?: string;
  imageUrl?: string;
  imageDescription?: string;
  fileUrl?: string;
  fileDescription?: string;
  macroTask?: string;
  process?: string;
  timePerUnit?: number;
  quantity?: number;
  estimatedTime?: string;
  actualTime?: number;
  startDate?: string;
  endDate?: string;
  pauseDate?: string;
  createdAt: string;
  updatedAt: string;
  collaborators: number[] | { id: number; name: string; role: string }[];
  projectId: number;
  orderServiceId: number;
  createdBy: number;
}