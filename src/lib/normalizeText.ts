/**
 * Normaliza texto removendo acentos e convertendo para minúsculas
 *
 * Útil para buscas case-insensitive e sem distinção de acentuação
 *
 * @example
 * ```ts
 * normalizeText('Estrutura Metálica') // 'estrutura metalica'
 * normalizeText('Orçamento') // 'orcamento'
 * normalizeText('São Paulo') // 'sao paulo'
 * ```
 *
 * @param text - Texto a ser normalizado
 * @returns Texto normalizado (sem acentos, minúsculas)
 */
export const normalizeText = (text: string): string => {
  return text
    .normalize('NFD') // Decompõe caracteres acentuados (á → a + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove marcas diacríticas
    .toLowerCase() // Converte para minúsculas
    .trim(); // Remove espaços extras
};

/**
 * Verifica se um texto contém uma substring, ignorando acentos e case
 *
 * @example
 * ```ts
 * containsNormalized('Estrutura Metálica', 'metalica') // true
 * containsNormalized('Orçamento', 'orcamento') // true
 * containsNormalized('São Paulo', 'sao') // true
 * ```
 *
 * @param text - Texto onde buscar
 * @param search - Termo de busca
 * @returns true se encontrou, false caso contrário
 */
export const containsNormalized = (text: string, search: string): boolean => {
  return normalizeText(text).includes(normalizeText(search));
};
