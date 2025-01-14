export interface ServiceOrder {
  id: number;
  serviceOrderNumber: string;
  status: "em_andamento" | "concluida" | "pausada";
  description?: string;
  projectId: number;
  createdAt: string;
  startDate: string;
  updatedAt: string;
  notes?: string;
  assignedUser?: number;
}