// ============================================
// ORÇAMENTO (QQP) - Composição de Custos
// ============================================

export interface Orcamento {
  id: string;
  numero: string;                    // Auto-gerado: AAAA-XXX
  nome: string;                      // Nome do orçamento

  // Dados do projeto
  areaTotalM2?: number;
  metrosLineares?: number;

  // Composições de custos (core do orçamento)
  composicoes: ComposicaoCustos[];

  // Configurações de tributos
  tributos: {
    temISS: boolean;
    aliquotaISS: number;             // Padrão: 3% (editável)
    aliquotaSimples: number;         // Padrão: 11.8% (editável)
  };

  // Valores calculados (derivados automaticamente)
  custoDirectoTotal: number;
  bdiTotal: number;
  subtotal: number;                  // custoDirecto + BDI
  tributosTotal: number;
  totalVenda: number;

  // DRE calculado
  dre: {
    receitaLiquida: number;
    lucroBruto: number;
    margemBruta: number;             // %
    lucroLiquido: number;
    margemLiquida: number;           // %
  };

  // Indicadores
  custoPorM2?: number;
  bdiMedio: number;                  // %

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

// Composição de Custos (Mobilização, MO Fabricação, etc.)
export interface ComposicaoCustos {
  id: string;
  orcamentoId: string;
  nome: string;                      // "Mobilização Padrão", "MO Fabricação"
  tipo: 'mobilizacao' | 'desmobilizacao' | 'mo_fabricacao' | 'mo_montagem' |
        'jato_pintura' | 'ferramentas' | 'consumiveis' | 'materiais';

  // Itens da composição (materiais, mão de obra, etc.)
  itens: ItemComposicao[];

  // BDI específico desta composição (editável)
  bdi: {
    percentual: number;              // Editável: 25% (materiais), 10% (ferramentas)
    valor: number;                   // Calculado: custoDirecto * percentual
  };

  // Valores calculados
  custoDirecto: number;              // Soma dos itens
  subtotal: number;                  // custoDirecto + BDI
  percentualDoTotal: number;         // % em relação ao custo direto total

  // Análise ABC (se aplicável)
  analiseABC?: {
    grupoA: { total: number; percentual: number; };
    grupoB: { total: number; percentual: number; };
    grupoC: { total: number; percentual: number; };
  };

  ordem: number;                     // Ordem de exibição
}

// Item de Composição (linha individual)
export interface ItemComposicao {
  id: string;
  composicaoId: string;

  // Identificação
  codigo?: string;                   // Código do item (ex: "MAT-001")
  descricao: string;

  // Quantidades
  quantidade: number;
  unidade: string;                   // "kg", "h", "un", "m²", etc.
  peso?: number;                     // Para materiais (kg)

  // Valores
  valorUnitario: number;
  subtotal: number;                  // quantidade * valorUnitario
  percentual: number;                // % da composição

  // Análise ABC
  classeABC?: 'A' | 'B' | 'C';
  percentualAcumulado?: number;

  // Tipo específico
  tipoItem: 'material' | 'mao_obra' | 'ferramenta' | 'consumivel' | 'outros';

  // Para Mão de Obra: cargo e encargos
  cargo?: string;                    // "Soldador", "Ajudante", etc.
  encargos?: {
    percentual: number;              // 50.72%
    valor: number;
  };

  ordem: number;
}

// Template de Composição (reutilizável)
export interface TemplateComposicao {
  id: string;
  nome: string;
  tipo: ComposicaoCustos['tipo'];
  bdiPadrao: number;
  itensModelo: Omit<ItemComposicao, 'id' | 'composicaoId'>[];
  ativo: boolean;
}

// DTOs para criação/atualização
export interface CreateOrcamento {
  nome: string;
  areaTotalM2?: number;
  metrosLineares?: number;
  tributos?: {
    temISS: boolean;
    aliquotaISS: number;
    aliquotaSimples: number;
  };
}

export interface UpdateOrcamento extends Partial<CreateOrcamento> {
  id: string;
}

export interface CreateComposicao {
  orcamentoId: string;
  nome: string;
  tipo: ComposicaoCustos['tipo'];
  bdiPercentual: number;
  ordem?: number;
}

export interface UpdateComposicao extends Partial<CreateComposicao> {
  id: string;
}

export interface CreateItemComposicao {
  composicaoId: string;
  codigo?: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  peso?: number;
  valorUnitario: number;
  tipoItem: ItemComposicao['tipoItem'];
  cargo?: string;
  ordem?: number;
}

export interface UpdateItemComposicao extends Partial<CreateItemComposicao> {
  id: string;
}

// Dados para importação CSV
export interface ItemCSV {
  codigo?: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  peso?: number;
  valorUnitario: number;
  tipoItem?: ItemComposicao['tipoItem'];
}
