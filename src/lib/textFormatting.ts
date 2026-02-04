/**
 * Utilitários para formatação de texto
 * Padroniza a capitalização de textos no sistema
 */

/**
 * Converte texto para UPPER CASE (tudo maiúsculo)
 * Usado para: títulos, nomes de projetos, headlines
 */
export const toUpperCase = (text: string): string => {
  return text.toUpperCase().trim();
};

/**
 * Converte texto para Sentence case (primeira letra maiúscula)
 * Mantém siglas e nomes próprios conhecidos
 */
export const toSentenceCase = (text: string): string => {
  if (!text) return '';

  // Lista de siglas e palavras que devem permanecer em maiúscula
  const acronyms = [
    'ASTM', 'AWS', 'SAE', 'ISO', 'ABNT', 'NBR', 'API', 'ASME',
    'DIN', 'JIS', 'EN', 'GR', 'SCH', 'DN', 'NPS', 'PN',
    'BDI', 'ISS', 'ICMS', 'PIS', 'COFINS', 'IPI',
    'MO', 'RNC', 'OS', 'ART', 'EPI', 'EPC', 'NR',
    'US', 'LP', 'PM', 'END', 'SA', 'HM', 'HH',
  ];

  // Lista de preposições e artigos que devem ficar em minúscula (exceto no início)
  const lowercaseWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com', 'a', 'o'];

  // Divide o texto em palavras
  const words = text.toLowerCase().trim().split(/\s+/);

  return words
    .map((word, index) => {
      // Remove pontuação para verificação
      const cleanWord = word.replace(/[^\w]/g, '');

      // Verifica se é uma sigla conhecida
      const isAcronym = acronyms.some(
        acronym => cleanWord.toUpperCase() === acronym
      );

      if (isAcronym) {
        // Mantém a sigla em maiúscula, mas preserva pontuação
        return word.replace(cleanWord, cleanWord.toUpperCase());
      }

      // Se for preposição/artigo e não for a primeira palavra, mantém minúscula
      if (index > 0 && lowercaseWords.includes(cleanWord.toLowerCase())) {
        return word.toLowerCase();
      }

      // Capitaliza a primeira letra da palavra
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Converte texto para Title Case (Primeira Letra De Cada Palavra)
 * Usado raramente, apenas para casos específicos
 */
export const toTitleCase = (text: string): string => {
  if (!text) return '';

  const lowercaseWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com', 'a', 'o'];

  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      // Primeira palavra sempre maiúscula
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Preposições e artigos em minúscula
      if (lowercaseWords.includes(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Remove espaços extras e normaliza texto
 */
export const normalizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Detecta se o texto precisa de formatação
 */
export const needsFormatting = (text: string, format: 'upper' | 'sentence' | 'title'): boolean => {
  if (!text) return false;

  const normalized = normalizeText(text);

  switch (format) {
    case 'upper':
      return normalized !== toUpperCase(normalized);
    case 'sentence':
      return normalized !== toSentenceCase(normalized);
    case 'title':
      return normalized !== toTitleCase(normalized);
    default:
      return false;
  }
};

/**
 * Aplica formatação baseada no tipo de campo
 */
export const formatByFieldType = (
  text: string,
  fieldType: 'headline' | 'normal' | 'title'
): string => {
  switch (fieldType) {
    case 'headline':
      return toUpperCase(text);
    case 'normal':
      return toSentenceCase(text);
    case 'title':
      return toTitleCase(text);
    default:
      return normalizeText(text);
  }
};
