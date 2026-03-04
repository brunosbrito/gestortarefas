/**
 * Converte um valor de tempo para horas numéricas.
 *
 * Aceita:
 *   - número:   8 → 8, 2.5 → 2.5
 *   - string numérica pura: "8" → 8, "2.5" → 2.5
 *   - formato "Xh":     "8h" → 8
 *   - formato "XhYmin": "8h30min" → 8.5
 *   - formato "XhY":    "8h30" → 8.5
 *
 * Retorna 0 para valores nulos, undefined ou inválidos.
 */
export const parseTimeToHours = (timeValue: string | number | null | undefined): number => {
  if (timeValue === null || timeValue === undefined) return 0;

  // Já é número
  if (typeof timeValue === 'number') return isNaN(timeValue) ? 0 : timeValue;

  // String numérica pura (ex: "8", "2.5")
  const num = parseFloat(timeValue);
  if (!isNaN(num) && !timeValue.includes('h')) return num;

  // Formato "Xh" ou "XhYmin" ou "XhY"
  const match = timeValue.match(/(\d+)h(?:\s*(\d+)(?:min)?)?/);
  if (!match) return 0;

  const hours = parseInt(match[1], 10) || 0;
  const minutes = match[2] ? parseInt(match[2], 10) / 60 : 0;
  return hours + minutes;
};
