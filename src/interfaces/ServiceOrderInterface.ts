export interface ServiceOrder {
  id: number;
  serviceOrderNumber: string;
  status: "em_andamento" | "concluida" | "pausada";
  description?: string;
  projectId: {
    id: number;
    name: string;
  };
  createdAt: string;
  startDate: string;
  updatedAt: string;
  notes?: string;
  assignedUser?: {
    id: number;
    username: string;
  };
}

export interface CreateServiceOrder {
  description?: string;
  projectId: number;
  status: "em_andamento" | "concluida" | "pausada";
  notes?: string;
  assignedUser?: number;
}