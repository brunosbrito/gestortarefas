/**
 * FASE 4 PCP: Pipeline de Projetos Interface
 * MPS adaptado para ETO (Engineer To Order) - Projetos Únicos
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

// ============================================
// TIPOS BASE
// ============================================

export type StatusPipeline =
  | 'lead'                // Oportunidade identificada
  | 'proposta'            // Proposta enviada ao cliente
  | 'negociacao'          // Em negociação
  | 'vendido'             // Proposta aceita, aguardando execução
  | 'em_execucao'         // Projeto em andamento
  | 'concluido'           // Projeto finalizado
  | 'cancelado'           // Cancelado antes ou durante execução
  | 'perdido';            // Proposta não aceita

export type PrioridadeProjeto = 'baixa' | 'media' | 'alta' | 'critica';

export type TipoProjeto =
  | 'estrutura_metalica'
  | 'caldeiraria'
  | 'montagem'
  | 'manutencao'
  | 'outro';

// ============================================
// PROJETO NO PIPELINE
// ============================================

export interface ProjetoPipeline {
  id: string;
  codigo: string;                      // Ex: "M-15706", "PROJ-2026-001"
  nome: string;
  clienteNome: string;
  clienteId?: number;

  // Status e classificação
  status: StatusPipeline;
  prioridade: PrioridadeProjeto;
  tipoProjeto: TipoProjeto;

  // Datas
  dataIdentificacao: string;           // Quando o lead foi identificado
  dataProposta?: string;               // Quando a proposta foi enviada
  dataVenda?: string;                  // Quando foi vendido
  dataInicioDesejada?: string;         // Data desejada de início
  dataInicioPlanejada?: string;        // Data planejada (após análise de capacidade)
  dataInicioReal?: string;             // Data real de início
  dataFimPrevista?: string;            // Data de conclusão prevista
  dataFimReal?: string;                // Data real de conclusão

  // Esforço e capacidade
  horasEstimadas: number;              // Horas totais estimadas do projeto
  horasRealizadas?: number;            // Horas já executadas (se em andamento)
  pesoEstimadoKg?: number;             // Para projetos de caldeiraria

  // Valores
  valorEstimado: number;               // Valor estimado da proposta
  valorVendido?: number;               // Valor vendido de fato
  margemEstimada?: number;             // % de margem estimada

  // Probabilidade (para leads e propostas)
  probabilidadeFechamento?: number;    // 0-100% - Chance de fechar negócio

  // Capacidade e viabilidade
  analiseCapacidade?: AnaliseViabilidadeCapacidade;

  // Vínculo com outros módulos
  propostaId?: number;                 // ID da proposta comercial
  orcamentoId?: string;                // ID do orçamento (QQP)
  obraId?: number;                     // ID da obra (quando iniciado)

  // Metadata
  observacoes?: string;
  responsavel?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ANÁLISE DE VIABILIDADE DE CAPACIDADE
// ============================================

export interface AnaliseViabilidadeCapacidade {
  viavel: boolean;
  taxaUtilizacaoResultante: number;    // % de utilização após adicionar este projeto
  mensagem: string;
  dataIdealInicio?: string;            // Se não viável, quando seria ideal
  recomendacoes: RecomendacaoCapacidade[];
}

export interface RecomendacaoCapacidade {
  tipo: 'contratar' | 'postergar' | 'realocar' | 'horas_extras' | 'subcontratar';
  descricao: string;
  impacto: 'baixo' | 'medio' | 'alto';
  custoEstimado?: number;
}

// ============================================
// DASHBOARD PIPELINE
// ============================================

export interface DashboardPipeline {
  kpis: KPIsPipeline;
  projetos: ProjetoPipeline[];
  timelineFutura: TimelinePipeline[];
  analiseCapacidadeFutura: AnaliseCapacidadePipeline;
  funil: FunilConversao;
}

export interface KPIsPipeline {
  // Quantidade de projetos por status
  totalLeads: number;
  totalPropostas: number;
  totalVendidos: number;
  totalEmExecucao: number;
  totalConcluidos: number;
  totalCancelados: number;

  // Valores
  valorTotalPipeline: number;          // Soma de todos os projetos (ponderado por probabilidade)
  valorVendidoAguardando: number;      // Projetos vendidos aguardando execução
  valorEmExecucao: number;             // Projetos em andamento

  // Taxas de conversão
  taxaConversaoPropostaVenda: number;  // % de propostas que viraram venda
  taxaConversaoLeadProposta: number;   // % de leads que viraram proposta

  // Capacidade
  horasTotaisEmPipeline: number;       // Soma de horas de todos os projetos ativos
  capacidadeDisponivel: number;        // Horas disponíveis nos próximos 3 meses
  capacidadeUtilizada: number;         // Horas já alocadas
  taxaOcupacaoFutura: number;          // % de ocupação prevista
}

export interface TimelinePipeline {
  mes: string;                         // '2026-03', '2026-04'
  projetos: {
    projetoId: string;
    nome: string;
    status: StatusPipeline;
    horasAlocadas: number;
  }[];
  capacidadeDisponivel: number;
  capacidadeNecessaria: number;
  taxaUtilizacao: number;              // %
  ehGargalo: boolean;                  // Se > 90%
}

export interface AnaliseCapacidadePipeline {
  periodoInicio: string;
  periodoFim: string;
  capacidadeTotalPeriodo: number;      // Horas disponíveis no período
  demandaTotalPipeline: number;        // Horas necessárias (pipeline)
  folga: number;                       // Capacidade - Demanda
  taxaUtilizacao: number;              // %
  mesesComGargalo: string[];           // Meses com > 90% utilização
  projetosEmRisco: ProjetoEmRisco[];   // Projetos que podem não ser viáveis
}

export interface ProjetoEmRisco {
  projetoId: string;
  nome: string;
  motivo: string;
  impacto: 'baixo' | 'medio' | 'alto';
  sugestoes: string[];
}

export interface FunilConversao {
  leads: number;
  propostas: number;
  vendidos: number;
  emExecucao: number;
  concluidos: number;

  // Taxas de conversão entre estágios
  conversaoLeadProposta: number;       // %
  conversaoPropostaVenda: number;      // %
  conversaoVendaExecucao: number;      // %
  conversaoExecucaoConclusao: number;  // %
}

// ============================================
// SIMULAÇÃO DE ACEITAR NOVO PROJETO
// ============================================

export interface SimulacaoNovoProjeto {
  projetoNome: string;
  horasEstimadas: number;
  dataInicioDesejada: string;
  dataFimDesejada: string;
  valorEstimado?: number;

  // Resultado da simulação
  resultado: ResultadoSimulacao;
}

export interface ResultadoSimulacao {
  viavel: boolean;
  taxaUtilizacaoAtual: number;
  taxaUtilizacaoComNovo: number;
  impacto: number;                     // Diferença em % de utilização
  mensagem: string;

  // Se não viável
  dataIdealInicio?: string;            // Quando seria viável
  alternativas: AlternativaSimulacao[];
}

export interface AlternativaSimulacao {
  tipo: 'postergar' | 'reduzir_escopo' | 'contratar' | 'subcontratar' | 'realocar';
  descricao: string;
  viavel: boolean;
  custoEstimado?: number;
  impactoCapacidade: number;           // Nova taxa de utilização
}

// ============================================
// FILTROS E REQUESTS
// ============================================

export interface FiltroPipeline {
  status?: StatusPipeline[];
  prioridade?: PrioridadeProjeto[];
  tipoProjeto?: TipoProjeto[];
  clienteId?: number;
  responsavel?: string;
  dataInicioMin?: string;
  dataInicioMax?: string;
  valorMin?: number;
  valorMax?: number;
  probabilidadeMin?: number;           // Filtrar por probabilidade de fechamento
}

export interface RequestDashboardPipeline {
  filtro?: FiltroPipeline;
  periodoAnalise?: {
    inicio: string;
    fim: string;
  };
  incluirConcluidos?: boolean;         // Incluir projetos já concluídos
  incluirCancelados?: boolean;
}

// ============================================
// MOVIMENTAÇÃO NO PIPELINE
// ============================================

export interface MovimentacaoPipeline {
  projetoId: string;
  statusOrigem: StatusPipeline;
  statusDestino: StatusPipeline;
  data: string;
  observacao?: string;
  usuarioId?: number;
}

// ============================================
// INTEGRAÇÃO COM PROPOSTAS COMERCIAIS
// ============================================

export interface PropostaParaPipeline {
  propostaId: number;
  numero: string;
  clienteNome: string;
  valorTotal: number;
  dataEnvio: string;
  status: 'enviada' | 'aprovada' | 'rejeitada' | 'em_negociacao';

  // Dados para criar projeto no pipeline
  horasEstimadas?: number;             // Calculado do orçamento
  dataInicioDesejada?: string;
  observacoes?: string;
}

// ============================================
// RELATÓRIOS
// ============================================

export interface RelatorioPipeline {
  periodo: {
    inicio: string;
    fim: string;
  };

  // Resumo quantitativo
  quantidades: {
    novosLeads: number;
    propostasEnviadas: number;
    propostasGanhas: number;
    propostasPerdidas: number;
    projetosIniciados: number;
    projetosConcluidos: number;
  };

  // Resumo financeiro
  financeiro: {
    valorTotalPropostas: number;
    valorTotalVendas: number;
    valorTotalExecutado: number;
    margemMediaRealizada: number;
    ticketMedio: number;
  };

  // Desempenho
  desempenho: {
    taxaConversao: number;
    tempoMedioLeadProposta: number;    // Dias
    tempoMedioPropostaVenda: number;   // Dias
    tempoMedioVendaInicio: number;     // Dias
    tempoMedioExecucao: number;        // Dias
  };

  // Top insights
  insights: {
    tipoProjetoMaisLucrativo: TipoProjeto;
    mesComMaisVendas: string;
    clienteMaisValioso: string;
    gargalosPrevistos: string[];
  };
}

// ============================================
// HISTÓRICO
// ============================================

export interface HistoricoProjeto {
  projetoId: string;
  eventos: EventoPipeline[];
}

export interface EventoPipeline {
  id: string;
  tipo: 'mudanca_status' | 'alteracao_data' | 'alteracao_valor' | 'observacao';
  descricao: string;
  statusAnterior?: StatusPipeline;
  statusNovo?: StatusPipeline;
  data: string;
  usuarioNome?: string;
}
