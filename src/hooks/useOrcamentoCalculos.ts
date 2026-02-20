import { useMemo } from 'react';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import {
  calcularValoresOrcamento,
  calcularDRE,
  verificarAlertas,
} from '@/lib/calculosOrcamento';

/**
 * Hook customizado para cálculos reativos de orçamento
 * Recalcula automaticamente quando o orçamento muda
 */
export const useOrcamentoCalculos = (orcamento: Partial<Orcamento> | null) => {
  // Valores gerais do orçamento
  const valores = useMemo(() => {
    if (!orcamento) {
      return {
        custoDirectoTotal: 0,
        bdiTotal: 0,
        subtotal: 0,
        tributosTotal: 0,
        totalVenda: 0,
        bdiMedio: 0,
        custoPorM2: undefined,
      };
    }
    return calcularValoresOrcamento(orcamento);
  }, [orcamento]);

  // DRE (Demonstrativo de Resultado)
  const dre = useMemo(() => {
    if (!orcamento) {
      return {
        receitaLiquida: 0,
        lucroBruto: 0,
        margemBruta: 0,
        lucroLiquido: 0,
        margemLiquida: 0,
      };
    }
    return calcularDRE(orcamento);
  }, [orcamento]);

  // Alertas de viabilidade
  const alertas = useMemo(() => {
    if (!orcamento) return [];
    return verificarAlertas(orcamento);
  }, [orcamento]);

  // Status de viabilidade
  const statusViabilidade = useMemo(() => {
    if (!orcamento) return 'desconhecido';

    if (dre.lucroLiquido < 0) return 'prejuizo';
    if (dre.margemLiquida < 5) return 'margem-baixa';
    if (dre.margemLiquida >= 5 && dre.margemLiquida < 15) return 'aceitavel';
    return 'bom';
  }, [dre, orcamento]);

  // Breakdown de composições (para DRE detalhado)
  const breakdownComposicoes = useMemo(() => {
    if (!orcamento || !orcamento.composicoes) return [];

    return orcamento.composicoes.map(comp => ({
      id: comp.id,
      nome: comp.nome,
      custoDirecto: comp.custoDirecto,
      percentualCusto: valores.custoDirectoTotal > 0
        ? (comp.custoDirecto / valores.custoDirectoTotal) * 100
        : 0,
      bdi: comp.bdi.valor,
      percentualBDI: valores.bdiTotal > 0
        ? (comp.bdi.valor / valores.bdiTotal) * 100
        : 0,
      bdiPercentual: comp.bdi.percentual,
    }));
  }, [orcamento, valores]);

  return {
    valores,
    dre,
    alertas,
    statusViabilidade,
    breakdownComposicoes,
  };
};
