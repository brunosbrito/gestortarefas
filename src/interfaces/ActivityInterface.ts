// src/types/activity.ts
export interface Activity {
    id: number;
    description: string;
    status: 'Planejado' | 'Pendente' | 'Em andamento' | 'Concluída';
    observation?: string;
    imageUrl?: string;
    fileUrl?: string;
    macroTask?: string;
    process?: string;
    timePerUnit?: number;
    quantity?: number;
    estimatedTime?: number;
    actualTime?: number;
    startDate?: string;
    pauseDate?: string;
    createdAt: string;
    updatedAt: string;
    collaborators: number[];
  }
  