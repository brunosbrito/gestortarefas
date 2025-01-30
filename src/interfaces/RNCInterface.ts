export interface CreateRNC {
  description: string;
  responsibleIdentification: string;
  dateOccurrence: string;
  projectId: number;
  serviceOrderId: string;
  responsibleRNCId: number;
}

export interface RNC extends CreateRNC {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  correctiveAction?: string;
  responsibleAction?: string;
  dateConclusion?: Date;
}