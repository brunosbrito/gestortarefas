export interface CreateNonConformity {
  projectId: string;
  responsibleRncId: string;
  description: string;
  serviceOrderId: string;
  responsibleIdentification: string;
  dateOccurrence: string;
}

export interface NonConformity {
  id: string;
  description: string;
  responsibleIdentification: string;
  dateOccurrence: string;
  correctiveAction?: string;
  responsibleAction?: string;
  dateConclusion?: string;
  createdAt: string;
  updatedAt: string;
  images: RncImage[];
  workforce: Workforce[];
  materials: Material[];
  responsibleRNC: User;
  project: Project;
  serviceOrder: ServiceOrder;
}

export interface RncImage {
  id: string;
  url: string;
}

export interface Workforce {
  id: string;
  name: string;
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
