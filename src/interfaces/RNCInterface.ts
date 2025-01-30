export interface RNC {
  id: string;
  description: string;
  responsibleIdentification: string;
  dateOccurrence: string;
  correctiveAction?: string;
  responsibleAction?: string;
  dateConclusion?: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: number;
    name: string;
    type: 'Fabrica' | 'Obra' | 'Mineradora';
  };
  serviceOrder: {
    id: string;
    serviceOrderNumber: string;
    description: string;
  };
  responsibleRNC: {
    id: number;
    username: string;
  };
}

export interface CreateRNC {
  description: string;
  responsibleIdentification: string;
  dateOccurrence: string;
  projectId: number;
  serviceOrderId: string;
  responsibleRNCId: number;
}

export interface UpdateRNC {
  description?: string;
  responsibleIdentification?: string;
  dateOccurrence?: string;
  correctiveAction?: string;
  responsibleAction?: string;
  dateConclusion?: string;
  projectId?: number;
  serviceOrderId?: string;
  responsibleRNCId?: number;
}