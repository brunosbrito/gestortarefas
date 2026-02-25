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

  // Status de viabilidade (objeto com status, label e class para Badge)
  const statusViabilidade = useMemo(() => {
    if (!orcamento) return { status: 'desconhecido', label: 'Desconhecido', class: 'bg-gray-100 text-gray-700 border-gray-300' };

    if (dre.lucroLiquido < 0) return { status: 'prejuizo', label: 'Prejuízo', class: 'bg-red-100 text-red-700 border-red-300' };
    if (dre.margemLiquida < 5) return { status: 'margem_baixa', label: 'Margem Baixa', class: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    if (dre.margemLiquida < 15) return { status: 'aceitavel', label: 'Aceitável', class: 'bg-blue-100 text-blue-700 border-blue-300' };
    return { status: 'bom', label: 'Viável', class: 'bg-green-100 text-green-700 border-green-300' };
  }, [dre, orcamento]);

  // Breakdown de composições (para DRE detalhado)
  const breakdownComposicoes = useMemo(() => {
    if (!orcamento || !orcamento.composicoes) return [];

    return orcamento.composicoes.map(comp => {
      const bdiValor = comp.bdi?.valor ?? 0;
      const bdiPercentual = comp.bdi?.percentual ?? 0;
      return {
        id: comp.id,
        nome: comp.nome,
        custoDirecto: comp.custoDirecto ?? 0,
        percentualCusto: valores.custoDirectoTotal > 0
          ? ((comp.custoDirecto ?? 0) / valores.custoDirectoTotal) * 100
          : 0,
        bdi: bdiValor,
        percentualBDI: valores.bdiTotal > 0
          ? (bdiValor / valores.bdiTotal) * 100
          : 0,
        bdiPercentual,
      };
    });
  }, [orcamento, valores]);

  return {
    valores,
    dre,
    alertas,
    statusViabilidade,
    breakdownComposicoes,
  };
};
