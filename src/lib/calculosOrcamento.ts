import { Orcamento, ComposicaoCustos, ItemComposicao } from '@/interfaces/OrcamentoInterface';

/**
 * Calcula o subtotal de um item de composição
 */
export const calcularSubtotalItem = (item: Partial<ItemComposicao>): number => {
  const quantidade = item.quantidade || 0;
  const valorUnitario = item.valorUnitario || 0;
  return quantidade * valorUnitario;
};

/**
 * Calcula o percentual de um item em relação ao custo direto da composição
 */
export const calcularPercentualItem = (item: Partial<ItemComposicao>, custoDirectoComposicao: number): number => {
  if (custoDirectoComposicao === 0) return 0;
  const subtotal = calcularSubtotalItem(item);
  return (subtotal / custoDirectoComposicao) * 100;
};

/**
 * Calcula o custo direto de uma composição (soma de todos os itens)
 */
export const calcularCustoDirectoComposicao = (itens: ItemComposicao[]): number => {
  return itens.reduce((total, item) => total + item.subtotal, 0);
};

/**
 * Calcula o valor do BDI de uma composição
 */
export const calcularBDIComposicao = (custoDirecto: number, percentualBDI: number): number => {
  return custoDirecto * (percentualBDI / 100);
};

/**
 * Calcula o subtotal de uma composição (custo direto + BDI)
 */
export const calcularSubtotalComposicao = (custoDirecto: number, valorBDI: number): number => {
  return custoDirecto + valorBDI;
};

/**
 * Calcula o percentual de uma composição em relação ao custo direto total do orçamento
 */
export const calcularPercentualComposicao = (custoDirectoComposicao: number, custoDirectoTotal: number): number => {
  if (custoDirectoTotal === 0) return 0;
  return (custoDirectoComposicao / custoDirectoTotal) * 100;
};

/**
 * Calcula a análise ABC de itens de uma composição
 * Classificação:
 * - Grupo A: até 80% acumulado
 * - Grupo B: de 80% a 95% acumulado
 * - Grupo C: acima de 95% acumulado
 */
export const calcularAnaliseABC = (itens: ItemComposicao[]): {
  itensClassificados: ItemComposicao[];
  grupoA: { total: number; percentual: number };
  grupoB: { total: number; percentual: number };
  grupoC: { total: number; percentual: number };
} => {
  // Ordenar itens por valor decrescente
  const itensOrdenados = [...itens].sort((a, b) => b.subtotal - a.subtotal);

  // Calcular total
  const total = itensOrdenados.reduce((sum, item) => sum + item.subtotal, 0);

  let acumulado = 0;
  let totalA = 0;
  let totalB = 0;
  let totalC = 0;

  const itensClassificados = itensOrdenados.map(item => {
    acumulado += item.subtotal;
    const percentualAcumulado = (acumulado / total) * 100;

    let classeABC: 'A' | 'B' | 'C';
    if (percentualAcumulado <= 80) {
      classeABC = 'A';
      totalA += item.subtotal;
    } else if (percentualAcumulado <= 95) {
      classeABC = 'B';
      totalB += item.subtotal;
    } else {
      classeABC = 'C';
      totalC += item.subtotal;
    }

    return {
      ...item,
      classeABC,
      percentualAcumulado,
    };
  });

  return {
    itensClassificados,
    grupoA: { total: totalA, percentual: (totalA / total) * 100 },
    grupoB: { total: totalB, percentual: (totalB / total) * 100 },
    grupoC: { total: totalC, percentual: (totalC / total) * 100 },
  };
};

/**
 * Calcula todos os valores de um orçamento
 */
export const calcularValoresOrcamento = (orcamento: Partial<Orcamento>): {
  custoDirectoTotal: number;
  bdiTotal: number;
  subtotal: number;
  tributosTotal: number;
  totalVenda: number;
  bdiMedio: number;
  custoPorM2?: number;
} => {
  const composicoes = orcamento.composicoes || [];

  // Custo direto total
  const custoDirectoTotal = composicoes.reduce((total, comp) => total + comp.custoDirecto, 0);

  // BDI total
  const bdiTotal = composicoes.reduce((total, comp) => total + comp.bdi.valor, 0);

  // Subtotal (custo direto + BDI)
  const subtotal = custoDirectoTotal + bdiTotal;

  // Tributos
  const tributos = orcamento.tributos || { temISS: false, aliquotaISS: 0, aliquotaSimples: 11.8 };
  const aliquotaISS = tributos.temISS ? tributos.aliquotaISS : 0;
  const aliquotaTotal = aliquotaISS + tributos.aliquotaSimples;
  const tributosTotal = subtotal * (aliquotaTotal / 100);

  // Total de venda
  const totalVenda = subtotal + tributosTotal;

  // BDI médio
  const bdiMedio = custoDirectoTotal > 0 ? (bdiTotal / custoDirectoTotal) * 100 : 0;

  // Custo por m²
  const custoPorM2 = orcamento.areaTotalM2 && orcamento.areaTotalM2 > 0
    ? totalVenda / orcamento.areaTotalM2
    : undefined;

  return {
    custoDirectoTotal,
    bdiTotal,
    subtotal,
    tributosTotal,
    totalVenda,
    bdiMedio,
    custoPorM2,
  };
};

/**
 * Calcula o DRE (Demonstrativo de Resultado do Exercício)
 */
export const calcularDRE = (orcamento: Partial<Orcamento>): {
  receitaLiquida: number;
  lucroBruto: number;
  margemBruta: number;
  lucroLiquido: number;
  margemLiquida: number;
} => {
  const valores = calcularValoresOrcamento(orcamento);

  // Receita líquida = Total venda - Tributos
  const receitaLiquida = valores.totalVenda - valores.tributosTotal;

  // Lucro bruto = Receita líquida - Custos diretos
  const lucroBruto = receitaLiquida - valores.custoDirectoTotal;

  // Margem bruta = (Lucro bruto / Receita líquida) * 100
  const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

  // Lucro líquido = Lucro bruto - BDI
  const lucroLiquido = lucroBruto - valores.bdiTotal;

  // Margem líquida = (Lucro líquido / Total venda) * 100
  const margemLiquida = valores.totalVenda > 0 ? (lucroLiquido / valores.totalVenda) * 100 : 0;

  return {
    receitaLiquida,
    lucroBruto,
    margemBruta,
    lucroLiquido,
    margemLiquida,
  };
};

/**
 * Verifica alertas de viabilidade do orçamento
 */
export const verificarAlertas = (orcamento: Partial<Orcamento>): {
  tipo: 'erro' | 'alerta' | 'info';
  mensagem: string;
}[] => {
  const alertas: { tipo: 'erro' | 'alerta' | 'info'; mensagem: string }[] = [];
  const dre = calcularDRE(orcamento);
  const valores = calcularValoresOrcamento(orcamento);

  // Prejuízo
  if (dre.lucroLiquido < 0) {
    alertas.push({
      tipo: 'erro',
      mensagem: `PREJUÍZO: Lucro líquido negativo (${dre.lucroLiquido.toFixed(2)})`,
    });
  }

  // Margem líquida muito baixa
  if (dre.margemLiquida > 0 && dre.margemLiquida < 5) {
    alertas.push({
      tipo: 'alerta',
      mensagem: `Margem líquida muito baixa (${dre.margemLiquida.toFixed(1)}%)`,
    });
  }

  // BDI médio muito baixo
  if (valores.bdiMedio < 15) {
    alertas.push({
      tipo: 'alerta',
      mensagem: `BDI médio abaixo do mínimo recomendado (${valores.bdiMedio.toFixed(1)}%)`,
    });
  }

  // BDI fora do padrão (verifica composições individuais)
  const composicoes = orcamento.composicoes || [];
  composicoes.forEach(comp => {
    const bdiPadrao = comp.tipo === 'ferramentas' ? 10 : 25;
    const desvio = Math.abs(comp.bdi.percentual - bdiPadrao);

    if (desvio > 3) {
      alertas.push({
        tipo: 'alerta',
        mensagem: `BDI de "${comp.nome}" (${comp.bdi.percentual}%) diverge do padrão (${bdiPadrao}%)`,
      });
    }
  });

  return alertas;
};

/**
 * Calcula encargos sociais para mão de obra
 * Percentual padrão: 50.72%
 */
export const calcularEncargos = (valorBase: number, percentual: number = 50.72): number => {
  return valorBase * (percentual / 100);
};
