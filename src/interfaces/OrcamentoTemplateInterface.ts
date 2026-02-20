/**
 * Interface para Templates de Orçamento
 * Templates reutilizáveis para criar novos orçamentos rapidamente
 */

export interface OrcamentoTemplateInterface {
  id: number;
  nome: string; // Ex: "Galpão Industrial", "Cobertura Metálica"
  descricao: string; // Descrição detalhada
  categoria: TemplateCategoriaEnum; // Tipo de obra

  // Configurações padrão
  configuracoes: {
    bdi: number; // Padrão: 0.25 (25%)
    tributos: {
      iss: number; // Padrão: 0.03 (3%)
      simples: number; // Padrão: 0.118 (11.8%)
      total: number; // Calculado: iss + simples = 0.148 (14.8%)
    };
    encargos: number; // Padrão: 0.58724 (58.724%)
  };

  // Estrutura de composições (sem itens específicos)
  composicoesTemplate: ComposicaoTemplate[];

  // Metadata
  isTemplate: true; // Flag para identificar como template
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: number;
}

export interface ComposicaoTemplate {
  tipo: 'mobilizacao' | 'desmobilizacao' | 'mo_fabricacao' | 'mo_montagem' |
        'jato_pintura' | 'ferramentas' | 'consumiveis' | 'materiais';
  descricao: string; // Ex: "Mobilização Padrão", "MO Fabricação"
  bdiPercentual: number; // BDI específico desta composição
  enabled: boolean; // Se esta composição está habilitada no template
  ordem: number;
}

export enum TemplateCategoriaEnum {
  GALPAO_INDUSTRIAL = 'galpao_industrial',
  COBERTURA_METALICA = 'cobertura_metalica',
  MEZANINO = 'mezanino',
  ESCADA_PLATAFORMA = 'escada_plataforma',
  ESTRUTURA_APOIO = 'estrutura_apoio',
  REFORMA = 'reforma',
  OUTROS = 'outros',
}

export const TemplateCategoriaLabels: Record<TemplateCategoriaEnum, string> = {
  [TemplateCategoriaEnum.GALPAO_INDUSTRIAL]: 'Galpão Industrial',
  [TemplateCategoriaEnum.COBERTURA_METALICA]: 'Cobertura Metálica',
  [TemplateCategoriaEnum.MEZANINO]: 'Mezanino',
  [TemplateCategoriaEnum.ESCADA_PLATAFORMA]: 'Escada e Plataforma',
  [TemplateCategoriaEnum.ESTRUTURA_APOIO]: 'Estrutura de Apoio',
  [TemplateCategoriaEnum.REFORMA]: 'Reforma',
  [TemplateCategoriaEnum.OUTROS]: 'Outros',
};

// DTOs
export interface OrcamentoTemplateCreateDTO {
  nome: string;
  descricao: string;
  categoria: TemplateCategoriaEnum;
  configuracoes: OrcamentoTemplateInterface['configuracoes'];
  composicoesTemplate: ComposicaoTemplate[];
  ativo: boolean;
}

export interface OrcamentoTemplateUpdateDTO extends Partial<OrcamentoTemplateCreateDTO> {
  id: number;
}

// DTO para usar um template
export interface UsarTemplateDTO {
  templateId: number;
  nomeOrcamento: string;
  tipo: 'servico' | 'produto';
  areaTotalM2?: number;
  metrosLineares?: number;
  pesoTotalProjeto?: number;
  codigoProjeto?: string;
  clienteNome?: string;
}

// DTO para criar template a partir de orçamento
export interface CriarTemplateDeOrcamentoDTO {
  orcamentoId: string;
  nomeTemplate: string;
  descricaoTemplate: string;
  categoria: TemplateCategoriaEnum;
}
