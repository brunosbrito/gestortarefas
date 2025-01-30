export interface RNC {
  id: number;
  description: string;
  responsibleIdentification: string;
  dateOccurrence: string;
  projectId: number;
  serviceOrderId: string;
  responsibleRNCId: number;
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
  projectId?: number;
  serviceOrderId?: string;
  responsibleRNCId?: number;
}