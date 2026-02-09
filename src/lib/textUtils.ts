/**
 * Utilitários para padronização de textos
 */

// Lista de siglas e abreviações que devem permanecer em maiúsculo
const SIGLAS = [
  'MIG',
  'GLP',
  'ACO',
  'INOX',
  'MGM',
  'FS',
  'UN',
  'KG',
  'CL',
  'M2',
  'M3',
  'MM',
  'CM',
  'MO',
  'GR',
];

/**
 * Converte texto para Title Case (Primeira Letra Maiúscula)
 * Mantém siglas conhecidas em maiúsculo
 *
 * @param text - Texto a ser formatado
 * @returns Texto formatado em Title Case
 *
 * @example
 * toTitleCase('disco corte aco') // 'Disco Corte ACO'
 * toTitleCase('mistura mig') // 'Mistura MIG'
 * toTitleCase('ELETRODO MGM 6013 FS') // 'Eletrodo MGM 6013 FS'
 */
export const toTitleCase = (text: string): string => {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map((word) => {
      // Se a palavra é uma sigla conhecida, retorna em maiúsculo
      if (SIGLAS.includes(word.toUpperCase())) {
        return word.toUpperCase();
      }

      // Se a palavra contém números e letras (ex: "70S6", "6013"), mantém como estava
      if (/\d/.test(word) && /[a-zA-Z]/.test(word)) {
        return word.toUpperCase();
      }

      // Se é apenas número, mantém como está
      if (/^\d+$/.test(word)) {
        return word;
      }

      // Converte para Title Case (primeira letra maiúscula)
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Normaliza descrição de item para padronização
 * Remove espaços extras, converte para Title Case
 *
 * @param descricao - Descrição a ser normalizada
 * @returns Descrição normalizada
 */
export const normalizarDescricao = (descricao: string): string => {
  if (!descricao) return '';

  // Remove espaços extras
  const semEspacosExtras = descricao.trim().replace(/\s+/g, ' ');

  // Aplica Title Case
  return toTitleCase(semEspacosExtras);
};
