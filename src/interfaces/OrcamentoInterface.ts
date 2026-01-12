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
  pesoTotalProjeto?: number;         // CALDEIRARIA: Peso total em KG
  codigoProjeto?: string;            // CALDEIRARIA: Código do projeto (ex: M-15706)
  clienteNome?: string;              // CALDEIRARIA: Nome do cliente

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
  codigo?: string;                   // Código do item (ex: "MAT-001", "PERFIL-001")
  descricao: string;

  // Quantidades
  quantidade: number;
  unidade: string;                   // "kg", "h", "un", "m²", "m", etc.
  peso?: number;                     // Para materiais (kg)

  // CALDEIRARIA: Material e especificações
  material?: string;                 // ASTM A 36, ASTM A 572, ASTM A 106, etc.
  especificacao?: string;            // Ex: "CALANDRAR CILINDRICO", "SCH 40"

  // Valores
  valorUnitario: number;
  subtotal: number;                  // quantidade * valorUnitario
  percentual: number;                // % da composição

  // Análise ABC
  classeABC?: 'A' | 'B' | 'C';
  percentualAcumulado?: number;

  // Tipo específico e cálculo
  tipoItem: 'material' | 'mao_obra' | 'ferramenta' | 'consumivel' | 'outros';
  tipoCalculo?: 'kg' | 'hh' | 'un' | 'm2' | 'm';  // CALDEIRARIA: KG (material) ou HH (hora-homem)

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
  pesoTotalProjeto?: number;         // CALDEIRARIA
  codigoProjeto?: string;            // CALDEIRARIA
  clienteNome?: string;              // CALDEIRARIA
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
  material?: string;
  especificacao?: string;
}

// ============================================
// CATÁLOGO DE PRODUTOS/SERVIÇOS (Reutilizável)
// ============================================

export interface CatalogoProduto {
  id: string;
  codigo: string;                     // Código único do produto (ex: "PERFIL-W150", "CH-3/4-A36")
  nome: string;                       // Nome/descrição principal
  descricao: string;                  // Descrição completa
  categoria: 'perfil' | 'chapa' | 'tubo' | 'cantoneira' | 'servico' | 'mao_obra' | 'outro';

  // Especificações técnicas (CALDEIRARIA)
  material?: string;                  // ASTM A 36, ASTM A 572, ASTM A 106, etc.
  especificacao?: string;             // Dimensões, processos (ex: "W150 X 22,5 Kg/m", "SCH 40 Ø6")

  // Unidade e preço
  unidade: string;                    // kg, h, un, m, m², m³
  precoUnitarioPadrao: number;        // Preço padrão (pode ser editado no orçamento)

  // Tipo de cálculo
  tipoItem: ItemComposicao['tipoItem'];
  tipoCalculo: 'kg' | 'hh' | 'un' | 'm' | 'm2' | 'm3';

  // Peso específico (para cálculos)
  pesoPorUnidade?: number;            // kg/m, kg/m², etc.

  // Mão de obra (se aplicável)
  cargo?: string;                     // "Soldador", "Ajudante", "Pintor", etc.
  encargosPercentual?: number;        // 50.72% padrão

  // Metadata
  ativo: boolean;
  fornecedor?: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

export interface CreateCatalogoProduto {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CatalogoProduto['categoria'];
  material?: string;
  especificacao?: string;
  unidade: string;
  precoUnitarioPadrao: number;
  tipoItem: ItemComposicao['tipoItem'];
  tipoCalculo: CatalogoProduto['tipoCalculo'];
  pesoPorUnidade?: number;
  cargo?: string;
  encargosPercentual?: number;
  fornecedor?: string;
  observacoes?: string;
}

export interface UpdateCatalogoProduto extends Partial<CreateCatalogoProduto> {
  id: string;
  ativo?: boolean;
}
