export interface Activity {
  id: number;
  description: string;
  status: 'Planejado' | 'Pendente' | 'Em andamento' | 'Concluída';
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
  pauseDate?: string;
  createdAt: string;
  updatedAt: string;
  collaborators: number[];
  projectId: number;
  orderServiceId: number;
}