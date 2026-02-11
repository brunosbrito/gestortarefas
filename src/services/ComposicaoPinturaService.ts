import {
  ComposicaoPinturaInterface,
  CamadaPintura,
  DENSIDADE_ACO,
  AreaEspecificaM2PorTon,
  TipoGeometria,
  CalculoPinturaInputDTO,
} from '@/interfaces/ComposicaoPinturaInterface';
import { TintaInterface } from '@/interfaces/TintaInterface';
import { FornecedorServicoInterface } from '@/interfaces/FornecedorServicoInterface';

/**
 * Service para cálculos de composição de pintura
 */
class ComposicaoPinturaService {
  /**
   * Calcula a área (m²) a partir do peso e espessura
   *
   * FÓRMULA CORRETA:
   * Para CHAPA PLANA:
   *   Volume (m³) = Peso (kg) / Densidade (kg/m³)
   *   Área (m²) = Volume (m³) / Espessura (m)
   *   Área (m²) = Peso (kg) / (7.85 × Espessura (mm))
   *
   * Para PERFIS e ESTRUTURAS COMPLEXAS:
   *   Usa área específica aproximada (m²/ton) baseada em geometria típica
   *   Área (m²) = Peso (kg) × AreaEspecifica (m²/ton) / 1000
   *
   * Referências:
   * - https://www.crifer.com.br/chapas-de-aco-como-fazer-o-calculo-de-peso/
   * - https://www.soloarquitectura.com/foros/threads/calcular-m2-pintura-con-kg-de-acero.40888/
   */
  calcularArea(pesoKg: number, espessuraMm: number, tipoGeometria: TipoGeometria): number {
    let area: number;

    if (tipoGeometria === TipoGeometria.CHAPA_PLANA) {
      // Cálculo direto usando densidade do aço
      // Área = Peso / (Densidade × Espessura)
      area = pesoKg / (DENSIDADE_ACO * espessuraMm);
    } else {
      // Para perfis e estruturas complexas, usa área específica aproximada
      // Conversão: kg → ton, então × m²/ton
      const areaEspecifica = AreaEspecificaM2PorTon[tipoGeometria];
      area = (pesoKg / 1000) * areaEspecifica;
    }

    return Math.round(area * 100) / 100; // 2 casas decimais
  }

  /**
   * Calcula os valores de uma camada de pintura (primer ou acabamento)
   */
  calcularCamada(
    tinta: TintaInterface,
    areaM2: number,
    espessuraMicrons: number,
    numeroDemaos: number,
    fatorPerdaPercentual: number
  ): CamadaPintura {
    // Espessura total considerando número de demãos
    const espessuraTotalMicrons = espessuraMicrons * numeroDemaos;

    // RT = SV × 10 / EFS
    const rendimentoTeoricoM2L = (tinta.solidosVolume * 10) / espessuraTotalMicrons;

    // RP = RT - (RT × FP%)
    const perdaDecimal = fatorPerdaPercentual / 100;
    const rendimentoPraticoM2L = rendimentoTeoricoM2L - rendimentoTeoricoM2L * perdaDecimal;

    // Litros = Área / RP
    const litrosNecessarios = areaM2 / rendimentoPraticoM2L;

    // Custo = Litros × Preço/Litro
    const custoTotal = litrosNecessarios * tinta.precoLitro;

    return {
      tinta,
      espessuraMicrons,
      numeroDemaos,
      espessuraTotalMicrons,
      fatorPerdaPercentual,
      rendimentoTeoricoM2L: Math.round(rendimentoTeoricoM2L * 100) / 100,
      rendimentoPraticoM2L: Math.round(rendimentoPraticoM2L * 100) / 100,
      litrosNecessarios: Math.round(litrosNecessarios * 100) / 100,
      custoTotal: Math.round(custoTotal * 100) / 100,
    };
  }

  /**
   * Calcula o thinner necessário (80% do total de tintas)
   */
  calcularThinner(
    litrosPrimer: number,
    litrosAcabamento: number,
    precoLitro: number
  ): { litros: number; precoLitro: number; custoTotal: number } {
    const totalLitrosTintas = litrosPrimer + litrosAcabamento;
    const litrosThinner = totalLitrosTintas * 0.8;
    const custoTotal = litrosThinner * precoLitro;

    return {
      litros: Math.round(litrosThinner * 100) / 100,
      precoLitro,
      custoTotal: Math.round(custoTotal * 100) / 100,
    };
  }

  /**
   * Calcula a composição completa de pintura
   */
  calcularComposicao(
    input: CalculoPinturaInputDTO,
    primerTinta?: TintaInterface,
    acabamentoTinta?: TintaInterface,
    fornecedor?: FornecedorServicoInterface
  ): ComposicaoPinturaInterface {
    // 1. Calcular área
    const areaM2 = this.calcularArea(
      input.pesoTotalKg,
      input.espessuraChapaMm,
      input.tipoGeometria
    );

    // 2. Calcular camadas de pintura
    let primer: CamadaPintura | undefined;
    let acabamento: CamadaPintura | undefined;

    if (primerTinta && input.primerEspessuraMicrons && input.primerDemaos && input.primerFatorPerda !== undefined) {
      primer = this.calcularCamada(
        primerTinta,
        areaM2,
        input.primerEspessuraMicrons,
        input.primerDemaos,
        input.primerFatorPerda
      );
    }

    if (acabamentoTinta && input.acabamentoEspessuraMicrons && input.acabamentoDemaos && input.acabamentoFatorPerda !== undefined) {
      acabamento = this.calcularCamada(
        acabamentoTinta,
        areaM2,
        input.acabamentoEspessuraMicrons,
        input.acabamentoDemaos,
        input.acabamentoFatorPerda
      );
    }

    // 3. Calcular thinner
    const litrosPrimer = primer?.litrosNecessarios || 0;
    const litrosAcabamento = acabamento?.litrosNecessarios || 0;

    const thinner = this.calcularThinner(
      litrosPrimer,
      litrosAcabamento,
      input.thinnerPrecoLitro
    );

    // 4. Calcular custos de MO
    const custoJateamento = fornecedor
      ? areaM2 * fornecedor.valorJateamentoM2
      : 0;

    const custoPintura = fornecedor
      ? areaM2 * fornecedor.valorPinturaM2
      : 0;

    // 5. Calcular totais
    const custoTotalMateriais =
      (primer?.custoTotal || 0) +
      (acabamento?.custoTotal || 0) +
      thinner.custoTotal;

    const custoTotalMO = custoJateamento + custoPintura;

    const custoTotal = custoTotalMateriais + custoTotalMO;

    const valorPorM2 = areaM2 > 0 ? custoTotal / areaM2 : 0;
    const valorPorKg = input.pesoTotalKg > 0 ? custoTotal / input.pesoTotalKg : 0;

    return {
      pesoTotalKg: input.pesoTotalKg,
      espessuraChapaMm: input.espessuraChapaMm,
      tipoGeometria: input.tipoGeometria,
      areaM2,
      primer,
      acabamento,
      thinner,
      fornecedorServico: fornecedor,
      custoJateamento: Math.round(custoJateamento * 100) / 100,
      custoPintura: Math.round(custoPintura * 100) / 100,
      custoTotalMateriais: Math.round(custoTotalMateriais * 100) / 100,
      custoTotalMO: Math.round(custoTotalMO * 100) / 100,
      custoTotal: Math.round(custoTotal * 100) / 100,
      valorPorM2: Math.round(valorPorM2 * 100) / 100,
      valorPorKg: Math.round(valorPorKg * 100) / 100,
    };
  }
}

export default new ComposicaoPinturaService();
