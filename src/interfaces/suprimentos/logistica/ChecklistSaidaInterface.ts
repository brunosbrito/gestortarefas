// Interface para Check-list de Saída (Pré-Viagem)
export type CombustivelNivel = 'cheio' | '3/4' | '1/2' | '1/4' | 'reserva';

export interface ChecklistSaidaItem {
  id: string;
  descricao: string;
  categoria: 'seguranca' | 'documentos' | 'mecanica' | 'limpeza' | 'outros';
  checked: boolean;
  observacao?: string;
}

export interface ChecklistSaida {
  id: number;

  // Veículo e Motorista
  veiculo_id: number;
  veiculo_placa?: string; // Denormalizado para facilitar exibição
  veiculo_modelo?: string;
  motorista_id: number;
  motorista_nome?: string; // Denormalizado

  // KM e Combustível
  km_inicial: number;
  combustivel_nivel: CombustivelNivel;

  // Destino (opcional)
  destino_id?: number;
  destino_nome?: string;
  destino_endereco?: string;

  // Check-list Items
  items: ChecklistSaidaItem[];

  // Fotos de Danos Pré-Existentes
  fotos_danos: string[]; // URLs ou Base64

  // Metadata
  observacoes?: string;
  data_hora_saida: string; // ISO 8601

  // Localização (opcional - GPS)
  localizacao?: {
    latitude: number;
    longitude: number;
  };

  // Status
  viagem_finalizada: boolean; // Se já tem check-list de retorno
  checklist_retorno_id?: number; // Link para o check-list de retorno

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ChecklistSaidaCreate extends Omit<ChecklistSaida, 'id' | 'veiculo_placa' | 'veiculo_modelo' | 'motorista_nome' | 'destino_nome' | 'destino_endereco' | 'viagem_finalizada' | 'checklist_retorno_id' | 'created_at' | 'updated_at'> {}

export interface ChecklistSaidaUpdate extends Partial<ChecklistSaidaCreate> {}

// Templates de Check-list por tipo de veículo
export const checklistTemplates = {
  carro: [
    { id: '1', descricao: 'Pneus em bom estado e calibrados?', categoria: 'seguranca' as const, checked: false },
    { id: '2', descricao: 'Luzes (farol, seta, freio) funcionando?', categoria: 'seguranca' as const, checked: false },
    { id: '3', descricao: 'CRLV, seguro e documentos no veículo?', categoria: 'documentos' as const, checked: false },
    { id: '4', descricao: 'Triângulo e extintor dentro da validade?', categoria: 'seguranca' as const, checked: false },
    { id: '5', descricao: 'Nível de óleo verificado?', categoria: 'mecanica' as const, checked: false },
    { id: '6', descricao: 'Freios funcionando corretamente?', categoria: 'seguranca' as const, checked: false },
    { id: '7', descricao: 'Vidros e espelhos limpos?', categoria: 'limpeza' as const, checked: false },
    { id: '8', descricao: 'Ar condicionado funcionando?', categoria: 'outros' as const, checked: false },
  ],
  empilhadeira: [
    { id: '1', descricao: 'Garfo em bom estado?', categoria: 'seguranca' as const, checked: false },
    { id: '2', descricao: 'Sistema hidráulico funcionando?', categoria: 'mecanica' as const, checked: false },
    { id: '3', descricao: 'Bateria carregada (se elétrica)?', categoria: 'mecanica' as const, checked: false },
    { id: '4', descricao: 'Freio de segurança funcionando?', categoria: 'seguranca' as const, checked: false },
    { id: '5', descricao: 'Luzes e buzina funcionando?', categoria: 'seguranca' as const, checked: false },
    { id: '6', descricao: 'Pneus em bom estado?', categoria: 'seguranca' as const, checked: false },
    { id: '7', descricao: 'Extintor dentro da validade?', categoria: 'seguranca' as const, checked: false },
  ],
  caminhao: [
    { id: '1', descricao: 'Pneus em bom estado (incluindo estepe)?', categoria: 'seguranca' as const, checked: false },
    { id: '2', descricao: 'Luzes e sinalização funcionando?', categoria: 'seguranca' as const, checked: false },
    { id: '3', descricao: 'Documentos do veículo e da carga?', categoria: 'documentos' as const, checked: false },
    { id: '4', descricao: 'Sistema de freios verificado?', categoria: 'seguranca' as const, checked: false },
    { id: '5', descricao: 'Carga amarrada/travada corretamente?', categoria: 'seguranca' as const, checked: false },
    { id: '6', descricao: 'Lonas e cintas em bom estado?', categoria: 'seguranca' as const, checked: false },
    { id: '7', descricao: 'Nível de óleo e água verificados?', categoria: 'mecanica' as const, checked: false },
    { id: '8', descricao: 'Tacógrafo funcionando (se aplicável)?', categoria: 'documentos' as const, checked: false },
  ],
};

// Helper para labels
export const combustivelNivelLabels: Record<CombustivelNivel, string> = {
  cheio: 'Cheio',
  '3/4': '3/4',
  '1/2': '1/2 (Metade)',
  '1/4': '1/4',
  reserva: 'Reserva',
};

export const checklistCategoriaLabels: Record<ChecklistSaidaItem['categoria'], string> = {
  seguranca: 'Segurança',
  documentos: 'Documentos',
  mecanica: 'Mecânica',
  limpeza: 'Limpeza',
  outros: 'Outros',
};
