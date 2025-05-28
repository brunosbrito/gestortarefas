import { Colaborador } from "./ColaboradorInterface";

export interface CreateNonConformity {
  projectId: string;
  responsibleRncId: string;
  description: string;
  serviceOrderId: string;
  responsibleIdentification: string;
  dateOccurrence: string;
  contractNumber?: string;
  contractDuration?: number;
  elapsedTime?: number;
  remainingTime?: number;
  location?: string;
  clientName?: string;
  workSchedule?: WorkSchedule;
  workforce?: CreateWorkforce[];
}

export interface NonConformity {
  id: string;
  description: string;
  responsibleIdentification: Colaborador;
  dateOccurrence: string;
  correctiveAction?: string;
  responsibleAction?: Colaborador;
  dateConclusion?: string;
  createdAt: string;
  updatedAt: string;
  contractNumber?: string;
  contractDuration?: number;
  elapsedTime?: number;
  remainingTime?: number;
  location?: string;
  clientName?: string;
  workSchedule?: WorkSchedule;
  images: RncImage[];
  workforce: Workforce[];
  materials: Material[];
  responsibleRNC: Colaborador;
  project: Project;
  serviceOrder: ServiceOrder;
}

export interface WorkSchedule {
  entryExit: string;
  interval: string;
}

export interface CreateWorkforce {
  name: string;
  role: string;
  entryExit: string;
  interval: string;
  hours: string;
}

export interface RncImage {
  id: string;
  url: string;
}

export interface Workforce {
  id: string;
  name: string;
  role: string;
  entryExit: string;
  interval: string;
  hours: string;
}

export interface Material {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface ServiceOrder {
  id: string;
  description: string;
}
