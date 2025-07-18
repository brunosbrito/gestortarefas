
export interface Colaborador {
  id: number;
  name: string;
  role: string;
  sector: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA';
  createdAt: string;
  updatedAt: string;
}

export interface CreateColaborador {
  name: string;
  role: string;
  sector: 'PRODUCAO' | 'ADMINISTRATIVO' | 'ENGENHARIA';
}
