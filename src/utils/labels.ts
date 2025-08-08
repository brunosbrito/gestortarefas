// Utilitários de rótulos e normalização para Registro de Ponto
// Padroniza códigos (sem acentos, MAIÚSCULO) e exibe labels com acentuação

export type SetorCode = 'PRODUCAO' | 'ENGENHARIA' | 'ADMINISTRATIVO'
export type TypeRegisterCode = SetorCode | 'FALTA'
export type StatusCode = 'PRESENTE' | 'FALTA'

const stripDiacritics = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const toKey = (v: string) => stripDiacritics(v).toUpperCase().trim()

export const normalizeSetorCode = (input?: string | null): SetorCode | undefined => {
  if (!input) return undefined
  const k = toKey(input)
  if (k.startsWith('PRODUC')) return 'PRODUCAO'
  if (k.startsWith('ENGENH')) return 'ENGENHARIA'
  if (k.startsWith('ADMIN')) return 'ADMINISTRATIVO'
  if (k === 'PRODUCAO') return 'PRODUCAO'
  if (k === 'ENGENHARIA') return 'ENGENHARIA'
  if (k === 'ADMINISTRATIVO') return 'ADMINISTRATIVO'
  return undefined
}

export const normalizeTypeRegisterCode = (
  input?: string | null
): TypeRegisterCode | undefined => {
  if (!input) return undefined
  const k = toKey(input)
  if (k === 'FALTA') return 'FALTA'
  return normalizeSetorCode(input)
}

export const setorLabel = (input?: string | null): string => {
  const code = normalizeSetorCode(input)
  switch (code) {
    case 'PRODUCAO':
      return 'Produção'
    case 'ENGENHARIA':
      return 'Engenharia'
    case 'ADMINISTRATIVO':
      return 'Administrativo'
    default:
      return input ?? ''
  }
}

export const typeRegisterLabel = (input?: string | null): string => {
  const code = normalizeTypeRegisterCode(input)
  if (code === 'FALTA') return 'Falta'
  return setorLabel(code)
}

export const statusLabel = (input?: string | null): string => {
  if (!input) return ''
  const k = toKey(input)
  if (k === 'PRESENTE') return 'Presente'
  if (k === 'FALTA') return 'Falta'
  return input
}

export const isProducao = (input?: string | null) => normalizeSetorCode(input) === 'PRODUCAO'
