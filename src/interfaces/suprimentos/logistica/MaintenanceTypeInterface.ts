// Interface para Tipos de Manutenção
export type MaintenanceCategory = 'preventiva' | 'corretiva' | 'preditiva' | 'emergencial';
export type MaintenanceFrequency = 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual' | 'sob_demanda';

export interface MaintenanceType {
  id: number;
  nome: string;
  categoria: MaintenanceCategory;
  descricao?: string;

  // Periodicidade
  frequencia: MaintenanceFrequency;
  periodicidade_km?: number; // A cada X km (ex: 5000)
  periodicidade_dias?: number; // A cada X dias (ex: 30)

  // Checklist padrão
  checklist_items?: string[]; // Array de items do checklist

  // Custo estimado
  custo_estimado?: number;
  tempo_estimado?: number; // Em minutos

  // Status
  ativo: boolean;
  observacoes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTypeCreate extends Omit<MaintenanceType, 'id' | 'created_at' | 'updated_at'> {}

export interface MaintenanceTypeUpdate extends Partial<MaintenanceTypeCreate> {}

// Helper para labels
export const maintenanceCategoryLabels: Record<MaintenanceCategory, string> = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
  preditiva: 'Preditiva',
  emergencial: 'Emergencial',
};

export const maintenanceFrequencyLabels: Record<MaintenanceFrequency, string> = {
  diaria: 'Diária',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  bimestral: 'Bimestral',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
  sob_demanda: 'Sob Demanda',
};
