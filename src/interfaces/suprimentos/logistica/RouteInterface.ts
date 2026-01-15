// Interface para Rotas/Destinos
export interface Route {
  id: number;
  nome: string;
  descricao?: string;

  // Origem e Destino
  origem: string;
  destino: string;

  // Distância e tempo
  km_previsto: number; // Distância em KM
  tempo_medio: number; // Tempo médio em minutos

  // Custo estimado
  custo_estimado?: number; // Custo estimado da rota
  pedagios_quantidade?: number;
  pedagios_valor?: number;

  // Tipo de via
  tipo_via?: 'urbana' | 'rodovia' | 'mista';

  // Observações
  observacoes?: string;
  pontos_referencia?: string[]; // Pontos de referência/passagem

  // Status
  ativo: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface RouteCreate extends Omit<Route, 'id' | 'created_at' | 'updated_at'> {}

export interface RouteUpdate extends Partial<RouteCreate> {}

// Helper para labels
export const tipoViaLabels: Record<'urbana' | 'rodovia' | 'mista', string> = {
  urbana: 'Urbana',
  rodovia: 'Rodovia',
  mista: 'Mista',
};
