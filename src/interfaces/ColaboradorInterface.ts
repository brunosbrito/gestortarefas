
export interface Colaborador {
  id: number;
  name: string;
  role: string;
  sector?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateColaborador {
  name: string;
  role: string;
  sector?: string;
}
