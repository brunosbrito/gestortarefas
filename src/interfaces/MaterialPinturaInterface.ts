/**
 * Interface para Materiais - Cálculo de Área de Pintura
 * Focado em dimensões e cálculo automático de área superficial
 * para orçamentos de jateamento e pintura
 */

/**
 * Tipos de materiais para cálculo de pintura
 */
export enum TipoMaterialPintura {
  FR = 'FR',   // Ferro Redondo
  UE = 'UE',   // Perfil U Enrijecido
  US = 'US',   // Perfil U Simples
  CH = 'CH',   // Chapa
  W = 'W',     // Viga W
  L = 'L',     // Cantoneira
  MET = 'MET', // Metalon (Tubo Quadrado/Retangular)
  TB = 'TB',   // Tubo Redondo
}

/**
 * Labels amigáveis para cada tipo de material
 */
export const TipoMaterialPinturaLabels: Record<TipoMaterialPintura, string> = {
  [TipoMaterialPintura.FR]: 'Ferro Redondo',
  [TipoMaterialPintura.UE]: 'Perfil U Enrijecido',
  [TipoMaterialPintura.US]: 'Perfil U Simples',
  [TipoMaterialPintura.CH]: 'Chapa',
  [TipoMaterialPintura.W]: 'Viga W',
  [TipoMaterialPintura.L]: 'Cantoneira',
  [TipoMaterialPintura.MET]: 'Metalon',
  [TipoMaterialPintura.TB]: 'Tubo Redondo',
};

/**
 * Descrições detalhadas de cada tipo
 */
export const TipoMaterialPinturaDescricoes: Record<TipoMaterialPintura, string> = {
  [TipoMaterialPintura.FR]: 'Barra circular de aço (ferro redondo)',
  [TipoMaterialPintura.UE]: 'Perfil U com enrijecimento nas abas',
  [TipoMaterialPintura.US]: 'Perfil U sem enrijecimento',
  [TipoMaterialPintura.CH]: 'Chapa plana de aço',
  [TipoMaterialPintura.W]: 'Viga de abas largas (Wide Flange)',
  [TipoMaterialPintura.L]: 'Cantoneira de abas iguais ou desiguais',
  [TipoMaterialPintura.MET]: 'Tubo estrutural quadrado ou retangular',
  [TipoMaterialPintura.TB]: 'Tubo circular de aço',
};

/**
 * Interface principal para Material de Pintura
 */
export interface MaterialPinturaInterface {
  id: number;
  codigo: string; // Ex: "FR-19", "UE-200x75x20"
  descricao: string; // Ex: "Ferro Redondo Ø19mm", "Perfil U Enrijecido 200x75x20x3mm"
  tipo: TipoMaterialPintura;

  // Dimensões (em mm) - variam conforme o tipo
  // Usar apenas os campos relevantes para cada tipo

  diametro?: number;       // Para FR, TB
  altura?: number;         // Para UE, US, W, CH
  largura?: number;        // Para CH, MET (lado2 se retangular)
  aba?: number;            // Para UE, US (se abas iguais)
  aba1?: number;           // Para L (cantoneira)
  aba2?: number;           // Para L (cantoneira)
  enrijecimento?: number;  // Para UE
  lado?: number;           // Para MET (se quadrado)
  espessura?: number;      // Espessura da parede/chapa

  // Dados calculados automaticamente
  perimetroM: number;           // Perímetro em metros (calculado)
  areaM2PorMetroLinear: number; // Área por metro linear (calculado)

  // Dados opcionais
  pesoKgPorMetro?: number; // Peso por metro linear
  fornecedor?: string;
  observacoes?: string;
  ativo: boolean;

  // Timestamps
  criadoEm?: string;
  atualizadoEm?: string;
}

/**
 * DTO para criação/atualização de material
 */
export interface MaterialPinturaDTO {
  codigo: string;
  descricao: string;
  tipo: TipoMaterialPintura;

  // Dimensões (conforme tipo)
  diametro?: number;
  altura?: number;
  largura?: number;
  aba?: number;
  aba1?: number;
  aba2?: number;
  enrijecimento?: number;
  lado?: number;
  espessura?: number;

  // Opcionais
  pesoKgPorMetro?: number;
  fornecedor?: string;
  observacoes?: string;
}

/**
 * Constante PI para cálculos
 */
export const PI = 3.14159265359;

/**
 * Aproximação de PI usada nas planilhas (π ≈ 3)
 */
export const PI_APPROX = 3;

/**
 * Parâmetros de filtro para listagem
 */
export interface MaterialPinturaFiltros {
  tipo?: TipoMaterialPintura;
  busca?: string; // Busca por código ou descrição
  ativo?: boolean;
}

/**
 * Helper: Campos obrigatórios por tipo de material
 */
export const CamposObrigatoriosPorTipo: Record<TipoMaterialPintura, string[]> = {
  [TipoMaterialPintura.FR]: ['diametro'],
  [TipoMaterialPintura.UE]: ['altura', 'aba', 'enrijecimento', 'espessura'],
  [TipoMaterialPintura.US]: ['altura', 'aba', 'espessura'],
  [TipoMaterialPintura.CH]: ['largura', 'altura', 'espessura'],
  [TipoMaterialPintura.W]: ['altura'],
  [TipoMaterialPintura.L]: ['aba1', 'aba2'],
  [TipoMaterialPintura.MET]: ['espessura'], // lado OU largura+altura
  [TipoMaterialPintura.TB]: ['diametro'],
};

/**
 * Helper: Placeholder de exemplo por tipo
 */
export const ExemplosPorTipo: Record<TipoMaterialPintura, string> = {
  [TipoMaterialPintura.FR]: 'Ø19mm',
  [TipoMaterialPintura.UE]: '200×75×20mm, esp. 3mm',
  [TipoMaterialPintura.US]: '100×50mm, esp. 3mm',
  [TipoMaterialPintura.CH]: '200×300mm, esp. 8mm',
  [TipoMaterialPintura.W]: 'Altura 200mm',
  [TipoMaterialPintura.L]: '40×120mm',
  [TipoMaterialPintura.MET]: '150×150mm (quadrado) ou 100×50mm (retangular)',
  [TipoMaterialPintura.TB]: 'Ø141mm',
};

/**
 * Helper: Nome dos campos por tipo (para labels do formulário)
 */
export const NomesCamposPorTipo: Record<TipoMaterialPintura, Record<string, string>> = {
  [TipoMaterialPintura.FR]: {
    diametro: 'Diâmetro (mm)',
  },
  [TipoMaterialPintura.UE]: {
    altura: 'Altura (mm)',
    aba: 'Aba (mm)',
    enrijecimento: 'Enrijecimento (mm)',
    espessura: 'Espessura (mm)',
  },
  [TipoMaterialPintura.US]: {
    altura: 'Altura (mm)',
    aba: 'Aba (mm)',
    espessura: 'Espessura (mm)',
  },
  [TipoMaterialPintura.CH]: {
    largura: 'Largura (mm)',
    altura: 'Altura (mm)',
    espessura: 'Espessura (mm)',
  },
  [TipoMaterialPintura.W]: {
    altura: 'Altura (mm)',
  },
  [TipoMaterialPintura.L]: {
    aba1: 'Aba 1 (mm)',
    aba2: 'Aba 2 (mm)',
  },
  [TipoMaterialPintura.MET]: {
    lado: 'Lado (mm) - se quadrado',
    largura: 'Lado 1 (mm) - se retangular',
    altura: 'Lado 2 (mm) - se retangular',
    espessura: 'Espessura (mm)',
  },
  [TipoMaterialPintura.TB]: {
    diametro: 'Diâmetro (mm)',
  },
};
