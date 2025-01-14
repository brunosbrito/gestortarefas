export interface ServiceOrder {
  id: string;
  serviceOrderNumber: string;
  description: string;
  status: "em_andamento" | "concluida" | "pausada";
  notes: string;
  createdAt: string;
  startDate: string;
  updatedAt: string;
  projectId: {
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
  assignedUser: null | {
    username: string;
    id: number;
    name: string;
  };
}

export interface CreateServiceOrder {
  description: string;
  projectId: number;
  createdAt: string;
  status: "em_andamento" | "concluida" | "pausada";
  notes?: string;
  assignedUser: number;
}
