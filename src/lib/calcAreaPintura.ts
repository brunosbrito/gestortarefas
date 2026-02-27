/**
 * Cálculo de área de pintura por material estrutural
 *
 * Usa as mesmas fórmulas do MaterialPinturaService, mas a partir de um item
 * do catálogo de materiais (MaterialCatalogoCreateDTO) — sem depender de API.
 *
 * Retorna: areaM2PorMetroLinear (m²/m) para perfis/barras/tubos
 *          areaM2PorUnidade (m²/m²) para chapas (= 2,0: ambas as faces)
 *          0 para categorias sem pintura relevante (parafusos, etc.)
 */

import { MaterialCatalogoCreateDTO, MaterialCategoria } from '@/interfaces/MaterialCatalogoInterface';

/**
 * Calcula a área de pintura por unidade vendida, a partir das dimensões do catálogo.
 *
 * Para materiais em 'm':
 *   Retorna m²/m linear (perímetro da seção transversal em metros)
 *
 * Para materiais em 'm²' (chapas):
 *   Retorna 2,0 → ambas as faces pintadas (m² de tinta / m² de chapa)
 *
 * Para materiais sem pintura (parafusos):
 *   Retorna 0
 */
export function calcAreaM2PorUnidade(mat: MaterialCatalogoCreateDTO): number {
  const d = mat.dimensoes ?? {};

  switch (mat.categoria) {
    // ------------------------------------------------------------------
    // CANTONEIRA: perímetro = (aba1×2) + (aba2×2)
    // dimensoes: { altura (aba1), larguraMesa (aba2) }
    // ------------------------------------------------------------------
    case MaterialCategoria.CANTONEIRA: {
      const a1 = d.altura ?? 0;
      const a2 = d.larguraMesa ?? d.altura ?? 0;
      const perimMm = a1 * 2 + a2 * 2;
      return round4(perimMm / 1000);
    }

    // ------------------------------------------------------------------
    // BARRA REDONDA (FR): perímetro = diâmetro × 2 × π
    // dimensoes: { diametro }
    // ------------------------------------------------------------------
    case MaterialCategoria.BARRA_REDONDA: {
      const diam = d.diametro ?? 0;
      const perimMm = diam * 2 * Math.PI;
      return round4(perimMm / 1000);
    }

    // ------------------------------------------------------------------
    // BARRA CHATA: perímetro = 2 × (larguraMesa + espessuraMesa)
    // dimensoes: { larguraMesa, espessuraMesa }
    // ------------------------------------------------------------------
    case MaterialCategoria.BARRA_CHATA: {
      const larg = d.larguraMesa ?? 0;
      const esp = d.espessuraMesa ?? 0;
      const perimMm = 2 * (larg + esp);
      return round4(perimMm / 1000);
    }

    // ------------------------------------------------------------------
    // BARRA QUADRADA: perímetro = 4 × lado
    // dimensoes: { lado }
    // ------------------------------------------------------------------
    case MaterialCategoria.BARRA_QUADRADA: {
      const lado = d.lado ?? 0;
      const perimMm = 4 * lado;
      return round4(perimMm / 1000);
    }

    // ------------------------------------------------------------------
    // PERFIL I / PERFIL U: perímetro = (altura×2) + (larguraMesa×4) + (enrijecimento×4)
    // dimensoes: { altura, larguraMesa, [enrijecimento] }
    // ------------------------------------------------------------------
    case MaterialCategoria.PERFIL_I:
    case MaterialCategoria.PERFIL_U: {
      const alt = d.altura ?? 0;
      const mesa = d.larguraMesa ?? 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrij = (d as any).enrijecimento ?? 0;
      const perimMm = alt * 2 + mesa * 4 + enrij * 4;
      return round4(perimMm / 1000);
    }

    // ------------------------------------------------------------------
    // PERFIL W / PERFIL HP: perímetro ≈ altura × 6 (simplificação padrão)
    // dimensoes: { altura, larguraMesa }
    // ------------------------------------------------------------------
    case MaterialCategoria.PERFIL_W:
    case MaterialCategoria.PERFIL_HP: {
      const alt = d.altura ?? 0;
      const perimMm = alt * 6;
      return round4(perimMm / 1000);
    }

    // ------------------------------------------------------------------
    // TUBO QUADRADO (MET): perímetro = 4 × lado
    // dimensoes: { lado }
    // ------------------------------------------------------------------
    case MaterialCategoria.TUBO_QUADRADO: {
      const lado = d.lado ?? 0;
      const perimMm = 4 * lado;
      return round4(perimMm / 1000);
    }

    // ------------------------------------------------------------------
    // TUBO RETANGULAR (MET): perímetro = 2 × (larguraMesa + larguraB)
    // dimensoes: { larguraMesa, larguraB }
    // ------------------------------------------------------------------
    case MaterialCategoria.TUBO_RETANGULAR: {
      const l1 = d.larguraMesa ?? 0;
      const l2 = d.larguraB ?? 0;
      const perimMm = 2 * (l1 + l2);
      return round4(perimMm / 1000);
    }

    // ------------------------------------------------------------------
    // TUBO REDONDO (TB): perímetro = diâmetro × π ≈ diâmetro × 3
    // dimensoes: { diametro }
    // ------------------------------------------------------------------
    case MaterialCategoria.TUBO_REDONDO: {
      const diam = d.diametro ?? 0;
      const perimMm = diam * 3; // π ≈ 3 (MaterialPinturaService.PI_APPROX)
      return round4(perimMm / 1000);
    }

    // ------------------------------------------------------------------
    // CHAPA: unidade = m² → 2,0 m² de tinta por m² de chapa (ambas as faces)
    // dimensoes: { largura, comprimento, area }
    // ------------------------------------------------------------------
    case MaterialCategoria.CHAPA:
      return 2.0;

    // ------------------------------------------------------------------
    // TELHA: 1 face pintada por m²
    // ------------------------------------------------------------------
    case MaterialCategoria.TELHA_TRAPEZOIDAL:
    case MaterialCategoria.TELHA_ONDULADA:
    case MaterialCategoria.TELHA_MULTIONDA:
      return 1.0;

    // ------------------------------------------------------------------
    // PARAFUSOS e outros: sem área de pintura relevante
    // ------------------------------------------------------------------
    default:
      return 0;
  }
}

/**
 * Calcula o peso total em kg de um item do orçamento.
 * - Unidade 'm' ou 'ml': qty × pesoNominal(kg/m)
 * - Unidade 'kg'       : qty (já é kg)
 * - Unidade 'm²'       : qty × pesoNominal(kg/m²)
 * - Outros (un, pc)    : qty × peso (se informado)
 */
export function calcPesoTotalItem(
  quantidade: number,
  unidade: string,
  pesoNominal: number
): number {
  if (unidade === 'kg') return quantidade;
  if (pesoNominal > 0) return quantidade * pesoNominal;
  return 0;
}

// ---------- helpers internos ----------
function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}
