import { TintaInterface } from './TintaInterface';
import { FornecedorServicoInterface } from './FornecedorServicoInterface';

// Interface para Composição de Pintura (resultado do cálculo)
export interface ComposicaoPinturaInterface {
  id?: number;

  // Dados de entrada
  pesoTotalKg: number;
  espessuraChapaMm: number;
  tipoGeometria: TipoGeometria;

  // Área calculada
  areaM2: number;

  // Sistema de pintura
  primer?: CamadaPintura;
  acabamento?: CamadaPintura;

  // Thinner
  thinner: {
    litros: number;
    precoLitro: number;
    custoTotal: number;
  };

  // Fornecedor de serviço
  fornecedorServico?: FornecedorServicoInterface;

  // Custos de MO
  custoJateamento: number;
  custoPintura: number;

  // Totais
  custoTotalMateriais: number; // tintas + thinner
  custoTotalMO: number; // jato + pintura
  custoTotal: number; // materiais + MO

  // Indicadores
  valorPorM2: number;
  valorPorKg: number;

  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CamadaPintura {
  tinta: TintaInterface;
  espessuraMicrons: number; // μm (EFS)
  numeroDemaos: number;
  espessuraTotalMicrons: number; // espessuraMicrons × numeroDemaos
  fatorPerdaPercentual: number; // %

  // Cálculos
  rendimentoTeoricoM2L: number; // RT = SV × 10 / EFS
  rendimentoPraticoM2L: number; // RP = RT - (RT × FP%)
  litrosNecessarios: number;
  custoTotal: number;
}

export enum TipoGeometria {
  CHAPA_PLANA = 'chapa_plana',
  PERFIL = 'perfil',
  ESTRUTURA_COMPLEXA = 'estrutura_complexa',
}

export const TipoGeometriaLabels: Record<TipoGeometria, string> = {
  [TipoGeometria.CHAPA_PLANA]: 'Chapa Plana',
  [TipoGeometria.PERFIL]: 'Perfil (Aprox.)',
  [TipoGeometria.ESTRUTURA_COMPLEXA]: 'Estrutura Complexa (Aprox.)',
};

/**
 * Constante de densidade do aço (kg/dm³)
 * Fonte: https://www.crifer.com.br/chapas-de-aco-como-fazer-o-calculo-de-peso/
 */
export const DENSIDADE_ACO = 7.85;

/**
 * Área específica aproximada (m²/ton) para perfis e estruturas complexas
 * Fonte: https://www.soloarquitectura.com/foros/threads/calcular-m2-pintura-con-kg-de-acero.40888/
 *
 * IMPORTANTE: Para chapa plana, usa cálculo direto baseado em densidade.
 * Para perfis e estruturas, estes são valores médios aproximados.
 *
 * O cálculo exato de perfis requer perímetro e peso específico de cada perfil (kg/m e m²/m).
 */
export const AreaEspecificaM2PorTon: Record<TipoGeometria, number> = {
  // Chapa plana: calculado direto usando densidade
  [TipoGeometria.CHAPA_PLANA]: 0,
  // Perfis I, H, U típicos: 35-50 m²/ton (média: 40)
  [TipoGeometria.PERFIL]: 40,
  // Estruturas complexas: 50-70 m²/ton (média: 60)
  [TipoGeometria.ESTRUTURA_COMPLEXA]: 60,
};

// DTO para criação do cálculo
export interface CalculoPinturaInputDTO {
  pesoTotalKg: number;
  espessuraChapaMm: number;
  tipoGeometria: TipoGeometria;

  // Primer (opcional)
  primerId?: number;
  primerEspessuraMicrons?: number;
  primerDemaos?: number;
  primerFatorPerda?: number;

  // Acabamento (opcional)
  acabamentoId?: number;
  acabamentoEspessuraMicrons?: number;
  acabamentoDemaos?: number;
  acabamentoFatorPerda?: number;

  // Thinner
  thinnerPrecoLitro: number;

  // Fornecedor
  fornecedorServicoId?: number;
}
