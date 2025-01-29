export interface Obra {
  id?: number;
  name: string;
  groupNumber: string;
  client: string;
  address: string;
  startDate: string;
  endDate?: string;
  observation?: string;
  status: 'em_andamento' | 'finalizado' | 'interrompido';
  type: 'Fabrica' | 'Obra' | 'Mineradora';
}
