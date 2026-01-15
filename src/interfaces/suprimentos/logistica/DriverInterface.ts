// Interfaces para Motoristas - Logística

export type DriverStatus = 'ativo' | 'inativo' | 'ferias' | 'afastado';
export type CNHCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'AB' | 'AC' | 'AD' | 'AE';

export interface Driver {
  id: number;
  nome: string;
  cpf: string;

  // CNH
  cnh_numero: string;
  cnh_categoria: CNHCategory;
  cnh_validade: string;

  // Contato
  telefone: string;
  email?: string;

  // Status
  status: DriverStatus;
  observacoes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface DriverCreate extends Omit<Driver, 'id' | 'created_at' | 'updated_at'> {}

export interface DriverUpdate extends Partial<DriverCreate> {}
