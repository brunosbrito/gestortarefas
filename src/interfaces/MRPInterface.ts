/**
 * FASE 2 PCP: MRP - Material Requirements Planning
 * Interfaces para cálculo de necessidades multi-projeto com pegging (rastreabilidade de demanda)
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

// ============================================
// PEGGING - Rastreabilidade de Demanda
// ============================================

/**
 * Origem da necessidade de material (pegging)
 * Rastreia de onde veio a demanda
 */
export interface OrigemNecessidade {
  /** ID do projeto/obra */
  projetoId: number;
  /** Nome do projeto */
  projetoNome: string;
  /** ID da Service Order */
  osId: number;
  /** Número da OS */
  osNumero: string;
  /** ID da atividade que demanda o material */
  atividadeId: number;
  /** Descrição da atividade */
  atividadeDescricao: string;
  /** ID do item de composição do orçamento */
  itemComposicaoId: string;
  /** Quantidade demandada nesta origem */
  quantidadeDemandada: number;
  /** Data necessária para execução */
  dataNecessidade: string;
  /** Prioridade (baseada em cronograma crítico) */
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
}

// ============================================
// NECESSIDADES DE MATERIAIS
// ============================================

/**
 * Necessidade individual de material (por projeto)
 */
export interface NecessidadeMaterial {
  /** ID único da necessidade */
  id: string;
  /** Código do material (ex: MAT-CH-001) */
  codigoMaterial: string;
  /** Descrição do material */
  descricaoMaterial: string;
  /** Unidade de medida */
  unidade: string;
  /** Tipo do item (material, consumivel, mao_obra) */
  tipoItem: 'material' | 'consumivel' | 'mao_obra' | 'servico' | 'equipamento';
  /** Material ASTM (se aplicável) */
  material?: string;
  /** Especificação técnica */
  especificacao?: string;
  /** Classe ABC (priorização) */
  classeABC?: 'A' | 'B' | 'C';

  // Quantidades
  /** Quantidade bruta necessária */
  quantidadeBruta: number;
  /** Estoque disponível atual */
  estoqueDisponivel: number;
  /** Quantidade em pedidos abertos (compra/fabricação) */
  quantidadeEmPedido: number;
  /** Quantidade líquida necessária (bruta - estoque - pedidos) */
  quantidadeLiquida: number;

  // Custos
  /** Valor unitário estimado */
  valorUnitario: number;
  /** Valor total da necessidade (líquida × unitário) */
  valorTotal: number;

  // Origem da demanda (pegging)
  /** Lista de origens que demandam este material */
  origens: OrigemNecessidade[];

  // Datas
  /** Data mais próxima que o material é necessário */
  dataNecessidadeMaisProxima: string;
  /** Lead time estimado do fornecedor (dias) */
  leadTime?: number;
  /** Data sugerida para pedido (considerando lead time) */
  dataSugeridaPedido?: string;

  // Status
  /** Status da necessidade */
  status: 'critica' | 'atendida' | 'parcial' | 'pendente';
  /** Tem conflito com outros projetos? */
  temConflito: boolean;
}

/**
 * Necessidade consolidada (agregada de múltiplos projetos)
 */
export interface NecessidadeConsolidada {
  /** Código do material */
  codigoMaterial: string;
  /** Descrição do material */
  descricaoMaterial: string;
  /** Unidade de medida */
  unidade: string;
  /** Tipo do item */
  tipoItem: 'material' | 'consumivel' | 'mao_obra' | 'servico' | 'equipamento';
  /** Material ASTM */
  material?: string;
  /** Especificação */
  especificacao?: string;
  /** Classe ABC */
  classeABC?: 'A' | 'B' | 'C';

  // Quantidades consolidadas
  /** Total bruto de TODOS os projetos */
  quantidadeBrutaTotal: number;
  /** Estoque disponível (único para todos) */
  estoqueDisponivel: number;
  /** Quantidade em pedidos */
  quantidadeEmPedido: number;
  /** Total líquido necessário */
  quantidadeLiquidaTotal: number;

  // Custos consolidados
  /** Valor unitário médio */
  valorUnitario: number;
  /** Valor total consolidado */
  valorTotalConsolidado: number;

  // Breakdown por projeto
  /** Lista de projetos que demandam este material */
  projetosOrigem: {
    projetoId: number;
    projetoNome: string;
    quantidadeDemandada: number;
    dataNecessidade: string;
    osIds: number[];
  }[];

  // Consolidação de origens (pegging completo)
  /** Todas as origens agregadas */
  origensConsolidadas: OrigemNecessidade[];

  // Datas
  /** Data mais próxima considerando TODOS os projetos */
  dataNecessidadeMaisProxima: string;
  /** Lead time */
  leadTime?: number;
  /** Data sugerida para pedido consolidado */
  dataSugeridaPedido?: string;

  // Status e Conflitos
  /** Status geral */
  status: 'critica' | 'atendida' | 'parcial' | 'pendente';
  /** Conflitos detectados */
  conflitos: ConflitoProjetos[];
}

/**
 * Conflito quando múltiplos projetos precisam do mesmo material na mesma data
 */
export interface ConflitoProjetos {
  /** ID do conflito */
  id: string;
  /** Código do material em conflito */
  codigoMaterial: string;
  /** Data do conflito */
  dataConflito: string;
  /** Quantidade total demandada nesta data */
  quantidadeTotalDemandada: number;
  /** Estoque disponível para esta data */
  estoqueDisponivel: number;
  /** Déficit (demanda - estoque) */
  deficit: number;
  /** Projetos em conflito */
  projetosEmConflito: {
    projetoId: number;
    projetoNome: string;
    osId: number;
    osNumero: string;
    quantidadeSolicitada: number;
    prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  }[];
  /** Sugestão de resolução */
  sugestaoResolucao: 'comprar_mais' | 'reprogramar_projeto' | 'dividir_estoque';
}

// ============================================
// SUGESTÕES DE COMPRA/FABRICAÇÃO
// ============================================

/**
 * Sugestão de ação para atender necessidade
 */
export interface SugestaoCompra {
  /** ID da sugestão */
  id: string;
  /** Tipo de ação */
  tipo: 'comprar' | 'fabricar' | 'transferir' | 'antecipar_pedido';
  /** Código do material */
  codigoMaterial: string;
  /** Descrição do material */
  descricaoMaterial: string;
  /** Quantidade sugerida */
  quantidadeSugerida: number;
  /** Unidade */
  unidade: string;
  /** Valor unitário */
  valorUnitario: number;
  /** Valor total da sugestão */
  valorTotal: number;
  /** Classe ABC */
  classeABC?: 'A' | 'B' | 'C';

  // Justificativa
  /** Por que esta ação é necessária */
  justificativa: string;
  /** Urgência */
  urgencia: 'critica' | 'alta' | 'media' | 'baixa';
  /** Data até quando precisa ser executada */
  prazoLimite: string;
  /** Lead time para fornecedor (dias) */
  leadTime?: number;

  // Origem da demanda
  /** Quais projetos serão atendidos */
  projetosAtendidos: {
    projetoId: number;
    projetoNome: string;
    quantidadeAtendida: number;
  }[];
  /** Referências de pegging */
  origens: OrigemNecessidade[];

  // Consolidação
  /** Esta sugestão atende múltiplos projetos? */
  ehConsolidada: boolean;
  /** Quantidade de projetos atendidos */
  quantidadeProjetos: number;

  // Fornecedor/Produção
  /** Fornecedor sugerido (se compra) */
  fornecedorSugerido?: string;
  /** Centro de trabalho (se fabricação) */
  centroTrabalho?: string;

  // Status
  /** Status da sugestão */
  status: 'pendente' | 'aprovada' | 'em_execucao' | 'concluida' | 'cancelada';
  /** Data de criação da sugestão */
  dataCriacao: string;
  /** Requisição gerada? */
  requisicaoId?: number;
}

// ============================================
// RELATÓRIOS E ANÁLISES MRP
// ============================================

/**
 * Relatório MRP completo
 */
export interface RelatorioMRP {
  /** ID do relatório */
  id: string;
  /** Data de geração */
  dataGeracao: string;
  /** Tipo de relatório */
  tipo: 'por_projeto' | 'consolidado' | 'critico';

  // KPIs Gerais
  /** Total de itens necessários */
  totalItens: number;
  /** Total de itens críticos (falta de estoque) */
  itensCriticos: number;
  /** Valor total necessário */
  valorTotalNecessario: number;
  /** Quantidade de projetos analisados */
  quantidadeProjetos: number;
  /** Quantidade de conflitos detectados */
  quantidadeConflitos: number;

  // Necessidades
  /** Necessidades individuais (se por projeto) - Serializável para JSON */
  necessidadesPorProjeto?: { projetoId: number; necessidades: NecessidadeMaterial[] }[];
  /** Necessidades consolidadas (se consolidado) */
  necessidadesConsolidadas?: NecessidadeConsolidada[];

  // Conflitos
  /** Lista de conflitos detectados */
  conflitos: ConflitoProjetos[];

  // Sugestões
  /** Lista de sugestões de ação */
  sugestoes: SugestaoCompra[];
  /** Total a comprar */
  valorTotalCompras: number;
  /** Total a fabricar */
  valorTotalFabricacao: number;

  // Filtros aplicados
  /** Filtros usados na geração */
  filtros: {
    projetoIds?: number[];
    dataInicio?: string;
    dataFim?: string;
    classeABC?: ('A' | 'B' | 'C')[];
    apenasItensComFalta?: boolean;
  };
}

/**
 * Dashboard MRP - KPIs agregados
 */
export interface DashboardMRP {
  /** Data de atualização */
  dataAtualizacao: string;

  // KPIs Principais
  kpis: {
    /** Total de materiais necessários */
    totalMateriaisNecessarios: number;
    /** Itens em falta (estoque insuficiente) */
    itensEmFalta: number;
    /** Percentual de itens em falta */
    percentualFalta: number;
    /** Valor total de compras necessárias */
    valorTotalCompras: number;
    /** Quantidade de sugestões pendentes */
    sugestoesPendentes: number;
    /** Quantidade de conflitos entre projetos */
    conflitosAtivos: number;
    /** Prazo médio de entrega (dias) */
    prazoMedioEntrega: number;
  };

  // Breakdown por Classe ABC
  porClasseABC: {
    classeA: {
      quantidade: number;
      valor: number;
      percentualValor: number;
    };
    classeB: {
      quantidade: number;
      valor: number;
      percentualValor: number;
    };
    classeC: {
      quantidade: number;
      valor: number;
      percentualValor: number;
    };
  };

  // Breakdown por Projeto
  porProjeto: {
    projetoId: number;
    projetoNome: string;
    totalItens: number;
    itensCriticos: number;
    valorTotal: number;
  }[];

  // Itens mais críticos (top 10)
  itensMaisCriticos: {
    codigoMaterial: string;
    descricao: string;
    quantidadeFaltante: number;
    valorFaltante: number;
    prazoLimite: string;
    quantidadeProjetos: number;
  }[];

  // Timeline de necessidades (próximos 90 dias)
  timelineNecessidades: {
    data: string;
    quantidadeItens: number;
    valorTotal: number;
    itensCriticos: number;
  }[];
}

// ============================================
// INTEGRAÇÃO COM MÓDULOS EXISTENTES
// ============================================

/**
 * Request para calcular necessidades
 */
export interface CalculoMRPRequest {
  /** IDs dos projetos a analisar (vazio = todos ativos) */
  projetoIds?: number[];
  /** Considerar apenas atividades planejadas até esta data */
  dataLimite?: string;
  /** Filtrar por classe ABC */
  classeABC?: ('A' | 'B' | 'C')[];
  /** Incluir apenas itens com falta? */
  apenasItensComFalta?: boolean;
  /** Consolidar necessidades de múltiplos projetos? */
  consolidar: boolean;
}

/**
 * Integração com Almoxarifado (módulo existente)
 */
export interface ItemEstoqueIntegracao {
  /** ID do item no estoque */
  itemEstoqueId: number;
  /** Código do material */
  codigo: string;
  /** Descrição */
  descricao: string;
  /** Quantidade atual em estoque */
  quantidadeAtual: number;
  /** Estoque mínimo */
  estoqueMinimo: number;
  /** Estoque máximo */
  estoqueMaximo: number;
  /** Quantidade reservada (alocada mas não consumida) */
  quantidadeReservada: number;
  /** Quantidade disponível (atual - reservada) */
  quantidadeDisponivel: number;
  /** Localização no almoxarifado */
  localizacao?: string;
}

/**
 * Integração com Requisições de Compra (módulo existente)
 */
export interface RequisicaoCompraIntegracao {
  /** Origem: MRP gerado automaticamente */
  origemMRP: true;
  /** ID da sugestão MRP que gerou esta requisição */
  sugestaoMRPId: string;
  /** IDs das OSs que demandam este material */
  osIds: number[];
  /** IDs dos projetos beneficiados */
  projetoIds: number[];
  /** Data de necessidade (mais próxima) */
  dataNecessidade: string;
  /** Justificativa (vinda do MRP) */
  justificativa: string;
  /** Prioridade - Alinhado com RequisicaoPrioridade do sistema de Suprimentos */
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa';
}
