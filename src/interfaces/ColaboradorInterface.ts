
export interface Colaborador {
  id: number;
  name: string;
  role: string;
  pricePerHour: number;
}

export interface CreateColaborador {
  name: string;
  role: string;
  pricePerHour: number;
}
