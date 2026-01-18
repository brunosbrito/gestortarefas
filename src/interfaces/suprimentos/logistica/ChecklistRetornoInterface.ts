// Interface para Check-list de Retorno (pós-viagem)
import { ChecklistSaidaItem, CombustivelNivel, combustivelNivelLabels, checklistCategoriaLabels } from './ChecklistSaidaInterface';

export interface ChecklistRetorno {
  id: number;
  checklist_saida_id: number;
  viagem_id?: number;

  // Dados denormalizados para exibição
  veiculo_id?: number;
  veiculo_placa?: string;
  veiculo_modelo?: string;
  motorista_id?: number;
  motorista_nome?: string;

  // KM
  km_final: number;
  km_rodado?: number; // Calculado automaticamente: km_final - km_inicial

  // Combustível
  combustivel_nivel: CombustivelNivel;

  // Check-list items (mesmo formato que saída)
  items: ChecklistSaidaItem[];

  // Danos e Limpeza
  novos_danos: boolean;
  fotos_danos: string[];
  limpeza_ok: boolean;

  // Observações
  observacoes?: string;

  // Data e Hora
  data_hora_retorno: string;

  // Localização (opcional, se mobile tiver GPS)
  localizacao?: {
    lat: number;
    lng: number;
  };

  // Metadata
  created_at: string;
  updated_at: string;
}

// Tipo para criar novo check-list de retorno
export type ChecklistRetornoCreate = Omit<
  ChecklistRetorno,
  'id' | 'km_rodado' | 'veiculo_id' | 'veiculo_placa' | 'veiculo_modelo' | 'motorista_id' | 'motorista_nome' | 'created_at' | 'updated_at'
>;

// Tipo para atualizar check-list de retorno
export type ChecklistRetornoUpdate = Partial<ChecklistRetornoCreate>;

// Re-exportar labels necessários
export { combustivelNivelLabels, checklistCategoriaLabels };
