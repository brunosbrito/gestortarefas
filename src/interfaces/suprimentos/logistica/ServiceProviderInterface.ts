// Interface para Fornecedores de Serviços
export type ServiceProviderType = 'oficina' | 'borracharia' | 'funilaria' | 'eletrica' | 'mecanica' | 'seguradora' | 'despachante' | 'outros';

export interface ServiceProvider {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj?: string; // Opcional para pessoa física
  cpf?: string; // Para pessoa física

  // Tipo de serviço
  tipo: ServiceProviderType;

  // Contato
  telefone: string;
  email?: string;
  contato_nome?: string; // Nome do responsável/contato

  // Endereço
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;

  // Avaliação
  rating?: number; // 1-5 estrelas

  // Status
  ativo: boolean;
  credenciado: boolean; // Se é credenciado/homologado pela empresa

  // Especialidades
  especialidades?: string[]; // Array de especialidades (ex: ["Troca de óleo", "Alinhamento"])

  // Informações comerciais
  prazo_pagamento?: number; // Em dias
  desconto_padrao?: number; // Percentual

  // Observações
  observacoes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ServiceProviderCreate extends Omit<ServiceProvider, 'id' | 'created_at' | 'updated_at'> {}

export interface ServiceProviderUpdate extends Partial<ServiceProviderCreate> {}

// Helper para labels
export const serviceProviderTypeLabels: Record<ServiceProviderType, string> = {
  oficina: 'Oficina Mecânica',
  borracharia: 'Borracharia',
  funilaria: 'Funilaria e Pintura',
  eletrica: 'Elétrica Automotiva',
  mecanica: 'Mecânica Geral',
  seguradora: 'Seguradora',
  despachante: 'Despachante',
  outros: 'Outros Serviços',
};
