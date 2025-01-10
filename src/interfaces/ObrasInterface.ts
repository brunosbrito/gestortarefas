export interface Obra {
  id?: number;
  name: string;
  groupNumber: string;
  client: string;
  address: string;
  startDate: string;
  endDate?: string;  // O campo 'endDate' é opcional
  observation?: string;  // O campo 'observation' também é opcional
  status: string;
}