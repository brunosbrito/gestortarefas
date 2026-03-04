// Catálogo de EPIs / EPCs

export interface EpiCatalogo {
  id: string;
  descricao: string;
  nomeResumido?: string;    // Apelido curto exibido na tabela (ex: "Botina Bico Aço - Tam. 42")
  unidade: string;          // 'un', 'par', 'cx', etc.
  ca: string;               // Certificado de Aprovação (ex: "45579")
  fabricante?: string;
  valorReferencia: number;  // Preço mínimo de referência
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CreateEpiCatalogo {
  descricao: string;
  nomeResumido?: string;
  unidade: string;
  ca: string;
  fabricante?: string;
  valorReferencia: number;
}

export type UpdateEpiCatalogo = Partial<CreateEpiCatalogo> & { id: string };

// Unidades comuns para EPI
export const EPI_UNIDADES = ['un', 'par', 'cx', 'kg', 'rolo', 'kit'] as const;
export type UnidadeEpi = typeof EPI_UNIDADES[number];

// Cabeçalhos da planilha modelo para importação/exportação
export const EPI_TEMPLATE_HEADERS = [
  'Descrição',
  'Unidade',
  'CA',
  'Fabricante',
  'Valor Referência (R$)',
] as const;
