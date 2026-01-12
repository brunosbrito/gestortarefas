/**
 * Formata um valor numérico para moeda brasileira (BRL) ou dólar (USD)
 * @param value - Valor numérico a ser formatado
 * @param moeda - Moeda para formatação ('BRL' ou 'USD')
 * @returns String formatada como moeda
 */
export const formatCurrency = (value: number, moeda: 'BRL' | 'USD' = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda,
  }).format(value);
};

/**
 * Formata um valor numérico como percentual
 * @param value - Valor numérico (ex: 25 para 25%)
 * @param decimals - Número de casas decimais (padrão: 1)
 * @returns String formatada como percentual
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Converte string de moeda para número
 * @param value - String no formato de moeda (ex: "R$ 1.234,56")
 * @returns Valor numérico
 */
export const parseCurrency = (value: string): number => {
  // Remove R$, espaços e pontos (separadores de milhar)
  const cleaned = value.replace(/[R$\s.]/g, '');
  // Substitui vírgula por ponto
  const withDot = cleaned.replace(',', '.');
  return parseFloat(withDot) || 0;
};
