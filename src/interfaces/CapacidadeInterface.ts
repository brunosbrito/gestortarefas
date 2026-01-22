/**
 * FASE 3 PCP: Capacidade Produtiva Multi-Projeto
 * Interfaces para análise de capacidade de recursos (colaboradores, máquinas, centros de trabalho)
 * Sistema: Gestor Master - GMX Soluções Industriais
 *
 * Conceito ETO (Engineer To Order):
 * - Capacidade analisada para múltiplos projetos simultâneos
 * - Identificação de gargalos e conflitos de alocação
 * - Sugestões de nivelamento e otimização
 */

// ============================================
// TIPOS DE RECURSOS
// ============================================

/**
 * Tipo de recurso produtivo
 */
export type TipoRecurso = 'colaborador' | 'maquina' | 'equipamento' | 'centro_trabalho';

/**
 * Tipo de especialização (para colaboradores)
 */
export type TipoEspecializacao =
  | 'soldador'
  | 'montador'
  | 'caldeireiro'
  | 'pintor'
  | 'engenheiro'
  | 'projetista'
  | 'auxiliar'
  | 'operador_maquina'
  | 'gerente_projeto';

// ============================================
// CALENDÁRIO E DISPONIBILIDADE
// ============================================

/**
 * Turno de trabalho
 */
export interface Turno {
  /** ID do turno */
  id: string;
  /** Nome do turno (ex: "Manhã", "Tarde", "Noturno") */
  nome: string;
  /** Hora de início (formato HH:mm) */
  horaInicio: string;
  /** Hora de fim (formato HH:mm) */
  horaFim: string;
  /** Horas totais do turno */
  horasTotais: number;
  /** Dias da semana (0=Domingo, 1=Segunda, ..., 6=Sábado) */
  diasSemana: number[];
}

/**
 * Feriado ou dia não útil
 */
export interface DiaNaoUtil {
  /** Data do feriado (formato ISO 8601) */
  data: string;
  /** Descrição do feriado */
  descricao: string;
  /** Tipo de feriado */
  tipo: 'feriado_nacional' | 'feriado_estadual' | 'feriado_municipal' | 'ponto_facultativo' | 'parada_manutencao';
}

/**
 * Calendário de trabalho
 */
export interface CalendarioTrabalho {
  /** ID do calendário */
  id: string;
  /** Nome do calendário */
  nome: string;
  /** Turnos de trabalho */
  turnos: Turno[];
  /** Feriados e dias não úteis */
  diasNaoUteis: DiaNaoUtil[];
  /** Horas padrão por dia útil */
  horasPadraoDia: number;
  /** Dias úteis por semana (geralmente 5 ou 6) */
  diasUteisSemana: number;
  /** Horas totais por semana */
  horasTotaisSemana: number;
}

// ============================================
// RECURSOS PRODUTIVOS
// ============================================

/**
 * Recurso produtivo (colaborador, máquina, equipamento)
 */
export interface RecursoProdutivo {
  /** ID do recurso */
  id: number;
  /** Nome do recurso */
  nome: string;
  /** Tipo de recurso */
  tipo: TipoRecurso;
  /** Especialização (se colaborador) */
  especializacao?: TipoEspecializacao;
  /** Centro de trabalho ao qual pertence */
  centroTrabalhoId?: string;
  /** Calendário de trabalho */
  calendarioId?: string;
  /** Horas disponíveis por semana */
  horasDisponiveisSemana: number;
  /** Horas disponíveis por mês */
  horasDisponiveisMes: number;
  /** Valor/hora (custo) */
  valorHora?: number;
  /** Está ativo? */
  ativo: boolean;
  /** Data de cadastro */
  dataCadastro: string;
  /** Observações */
  observacoes?: string;
}

/**
 * Centro de trabalho (agrupamento de recursos)
 */
export interface CentroTrabalho {
  /** ID do centro de trabalho */
  id: string;
  /** Nome do centro (ex: "Setor de Soldagem", "Caldeiraria") */
  nome: string;
  /** Descrição */
  descricao?: string;
  /** Tipo de operação principal */
  tipoOperacao: 'soldagem' | 'montagem' | 'caldeiraria' | 'pintura' | 'usinagem' | 'corte' | 'dobra' | 'administrativo';
  /** Recursos alocados a este centro */
  recursosIds: number[];
  /** Localização física */
  localizacao?: string;
  /** Responsável pelo centro */
  responsavelId?: number;
  /** Capacidade total (soma de todos os recursos) em horas/semana */
  capacidadeTotalSemana: number;
}

// ============================================
// ALOCAÇÃO E DEMANDA
// ============================================

/**
 * Alocação de recurso em uma tarefa
 */
export interface AlocacaoRecurso {
  /** ID da alocação */
  id: string;
  /** ID do recurso */
  recursoId: number;
  /** Nome do recurso */
  recursoNome: string;
  /** Tipo do recurso */
  recursoTipo: TipoRecurso;
  /** ID do projeto */
  projetoId: number;
  /** Nome do projeto */
  projetoNome: string;
  /** ID da tarefa de cronograma */
  tarefaCronogramaId?: number;
  /** Descrição da tarefa */
  tarefaDescricao?: string;
  /** Data de início da alocação */
  dataInicio: string;
  /** Data de fim da alocação */
  dataFim: string;
  /** Horas alocadas (total) */
  horasAlocadas: number;
  /** Percentual de alocação (0-100) */
  percentualAlocacao: number;
  /** Status da alocação */
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
}

/**
 * Demanda de recurso (agregada por período)
 */
export interface DemandaRecurso {
  /** ID do recurso */
  recursoId: number;
  /** Nome do recurso */
  recursoNome: string;
  /** Tipo do recurso */
  recursoTipo: TipoRecurso;
  /** Período de referência (formato ISO 8601 - primeira data do período) */
  periodoInicio: string;
  /** Período fim */
  periodoFim: string;
  /** Tipo de período */
  tipoPeriodo: 'semanal' | 'mensal' | 'customizado';
  /** Horas disponíveis no período */
  horasDisponiveis: number;
  /** Horas alocadas (planejadas) no período */
  horasAlocadas: number;
  /** Horas extras necessárias (se ultrapassar disponível) */
  horasExtras: number;
  /** Taxa de utilização (%) */
  taxaUtilizacao: number;
  /** É gargalo? (utilização > 90%) */
  ehGargalo: boolean;
  /** Projetos que demandam este recurso */
  projetosDemandantes: {
    projetoId: number;
    projetoNome: string;
    horasDemandadas: number;
    percentualDemanda: number;
  }[];
  /** Alocações no período */
  alocacoes: AlocacaoRecurso[];
}

// ============================================
// CONFLITOS E SOBRECARGA
// ============================================

/**
 * Conflito de alocação (mesmo recurso em múltiplos projetos simultaneamente)
 */
export interface ConflitoAlocacao {
  /** ID do conflito */
  id: string;
  /** ID do recurso em conflito */
  recursoId: number;
  /** Nome do recurso */
  recursoNome: string;
  /** Tipo do recurso */
  recursoTipo: TipoRecurso;
  /** Período do conflito - início */
  periodoInicio: string;
  /** Período do conflito - fim */
  periodoFim: string;
  /** Horas disponíveis no período */
  horasDisponiveis: number;
  /** Horas demandadas (total de alocações) */
  horasDemandadas: number;
  /** Déficit (demanda - disponível) */
  deficit: number;
  /** Taxa de sobrecarga (%) */
  taxaSobrecarga: number;
  /** Projetos em conflito */
  projetosEmConflito: {
    projetoId: number;
    projetoNome: string;
    tarefaCronogramaId?: number;
    tarefaDescricao?: string;
    horasDemandadas: number;
    /**
     * NOTA CORREÇÃO #8: Tipo prioridade é 'critica' aqui (módulo Capacidade),
     * mas MRPInterface usa 'urgente' (alinhado com RequisicoesService).
     * Ambos são corretos para seus respectivos domínios.
     * Usar mapping explícito se necessário integrar: 'critica' → 'urgente'
     */
    prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  }[];
  /** Gravidade do conflito */
  gravidade: 'critica' | 'alta' | 'media' | 'baixa';
  /** Sugestão de resolução */
  sugestaoResolucao: 'contratar_temporario' | 'realocar_tarefa' | 'estender_prazo' | 'dividir_recursos' | 'hora_extra';
  /** Data de detecção */
  dataDeteccao: string;
  /** Status */
  status: 'pendente' | 'em_resolucao' | 'resolvido' | 'ignorado';
}

/**
 * Sobrecarga de centro de trabalho
 */
export interface SobrecargaCentroTrabalho {
  /** ID do centro de trabalho */
  centroTrabalhoId: string;
  /** Nome do centro */
  centroTrabalhoNome: string;
  /** Período de referência - início */
  periodoInicio: string;
  /** Período fim */
  periodoFim: string;
  /** Capacidade total (soma recursos) em horas */
  capacidadeTotal: number;
  /** Demanda total (soma alocações) em horas */
  demandaTotal: number;
  /** Taxa de utilização (%) */
  taxaUtilizacao: number;
  /** É gargalo? */
  ehGargalo: boolean;
  /** Recursos com sobrecarga */
  recursosSobrecarregados: {
    recursoId: number;
    recursoNome: string;
    taxaUtilizacao: number;
    horasExtrasNecessarias: number;
  }[];
  /** Projetos que demandam este centro */
  projetosDemandantes: {
    projetoId: number;
    projetoNome: string;
    horasDemandadas: number;
  }[];
}

// ============================================
// ANÁLISE DE CAPACIDADE
// ============================================

/**
 * Análise de capacidade por recurso
 */
export interface AnaliseCapacidadeRecurso {
  /** Recurso analisado */
  recurso: RecursoProdutivo;
  /** Período de análise - início */
  periodoInicio: string;
  /** Período fim */
  periodoFim: string;
  /** Horas disponíveis no período */
  horasDisponiveis: number;
  /** Horas alocadas */
  horasAlocadas: number;
  /** Horas livres */
  horasLivres: number;
  /** Taxa de utilização (%) */
  taxaUtilizacao: number;
  /** É gargalo? */
  ehGargalo: boolean;
  /** Quantidade de projetos alocados */
  quantidadeProjetos: number;
  /** Demanda por período (semanal) */
  demandaPorPeriodo: DemandaRecurso[];
  /** Conflitos detectados */
  conflitos: ConflitoAlocacao[];
  /** Sugestões de otimização */
  sugestoes: string[];
}

/**
 * Análise de capacidade consolidada (multi-projeto)
 */
export interface AnaliseCapacidadeConsolidada {
  /** Data da análise */
  dataAnalise: string;
  /** Período de análise - início */
  periodoInicio: string;
  /** Período fim */
  periodoFim: string;
  /** Tipo de período */
  tipoPeriodo: 'semanal' | 'mensal' | 'trimestral';
  /** Total de recursos analisados */
  totalRecursos: number;
  /** Total de projetos ativos */
  totalProjetos: number;
  /** Total de horas disponíveis (todos recursos) */
  totalHorasDisponiveis: number;
  /** Total de horas alocadas */
  totalHorasAlocadas: number;
  /** Taxa de utilização geral (%) */
  taxaUtilizacaoGeral: number;
  /** Recursos por tipo */
  recursosPorTipo: {
    tipo: TipoRecurso;
    quantidade: number;
    horasDisponiveis: number;
    horasAlocadas: number;
    taxaUtilizacao: number;
  }[];
  /** Análise por recurso individual */
  analisesPorRecurso: AnaliseCapacidadeRecurso[];
  /** Centros de trabalho */
  centrosTrabalho: CentroTrabalho[];
  /** Sobrecargas detectadas */
  sobrecargas: SobrecargaCentroTrabalho[];
  /** Conflitos detectados */
  conflitos: ConflitoAlocacao[];
  /** Gargalos (recursos com utilização > 90%) */
  gargalos: {
    recursoId: number;
    recursoNome: string;
    recursoTipo: TipoRecurso;
    taxaUtilizacao: number;
    horasExtrasNecessarias: number;
  }[];
}

// ============================================
// DASHBOARD E RELATÓRIOS
// ============================================

/**
 * KPIs do Dashboard de Capacidade
 */
export interface DashboardCapacidadeKPIs {
  /** Data de atualização */
  dataAtualizacao: string;
  /** Taxa de utilização geral (%) */
  taxaUtilizacaoGeral: number;
  /** Quantidade de gargalos detectados */
  quantidadeGargalos: number;
  /** Quantidade de conflitos ativos */
  quantidadeConflitos: number;
  /** Total de horas extras necessárias */
  horasExtrasTotais: number;
  /** Custo estimado de horas extras */
  custoHorasExtras: number;
  /** Recursos ociosos (utilização < 50%) */
  recursosOciosos: number;
  /** Recursos em utilização ideal (50-90%) */
  recursosUtilizacaoIdeal: number;
  /** Recursos sobrecarregados (> 90%) */
  recursosSobrecarregados: number;
  /** Percentual de recursos sobrecarregados */
  percentualSobrecarregados: number;
}

/**
 * Timeline de capacidade (evolução no tempo)
 */
export interface TimelineCapacidade {
  /** Data/período */
  data: string;
  /** Horas disponíveis no período */
  horasDisponiveis: number;
  /** Horas alocadas no período */
  horasAlocadas: number;
  /** Taxa de utilização (%) */
  taxaUtilizacao: number;
  /** Quantidade de gargalos */
  quantidadeGargalos: number;
  /** Quantidade de projetos ativos */
  quantidadeProjetos: number;
}

/**
 * Dashboard de Capacidade Produtiva
 */
export interface DashboardCapacidade {
  /** Data de geração */
  dataGeracao: string;
  /** Período de análise */
  periodoInicio: string;
  periodoFim: string;
  /** KPIs principais */
  kpis: DashboardCapacidadeKPIs;
  /** Análise consolidada */
  analiseConsolidada: AnaliseCapacidadeConsolidada;
  /** Timeline (evolução diária/semanal) */
  timeline: TimelineCapacidade[];
  /** Top 10 recursos mais utilizados */
  recursosTopUtilizacao: {
    recursoId: number;
    recursoNome: string;
    recursoTipo: TipoRecurso;
    taxaUtilizacao: number;
    horasAlocadas: number;
    quantidadeProjetos: number;
  }[];
  /** Top 10 recursos ociosos */
  recursosOciosos: {
    recursoId: number;
    recursoNome: string;
    recursoTipo: TipoRecurso;
    taxaUtilizacao: number;
    horasLivres: number;
  }[];
  /** Capacidade por centro de trabalho */
  capacidadePorCentro: {
    centroTrabalhoId: string;
    centroTrabalhoNome: string;
    capacidadeTotal: number;
    demandaTotal: number;
    taxaUtilizacao: number;
    ehGargalo: boolean;
  }[];
  /** Capacidade por projeto */
  capacidadePorProjeto: {
    projetoId: number;
    projetoNome: string;
    horasTotaisAlocadas: number;
    quantidadeRecursos: number;
    percentualCapacidadeTotal: number;
  }[];
}

// ============================================
// SUGESTÕES DE OTIMIZAÇÃO
// ============================================

/**
 * Sugestão de nivelamento de recursos
 */
export interface SugestaoNivelamento {
  /** ID da sugestão */
  id: string;
  /** Tipo de ação */
  tipo: 'realocar_recurso' | 'estender_prazo' | 'contratar_temporario' | 'hora_extra' | 'terceirizar';
  /** Prioridade */
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  /** Descrição da sugestão */
  descricao: string;
  /** Recurso afetado */
  recursoId?: number;
  recursoNome?: string;
  /** Projeto afetado */
  projetoId?: number;
  projetoNome?: string;
  /** Tarefa afetada */
  tarefaCronogramaId?: number;
  tarefaDescricao?: string;
  /** Impacto esperado */
  impacto: {
    reducaoGargalos: number;
    reducaoConflitos: number;
    reducaoHorasExtras: number;
    economiaEstimada?: number;
  };
  /** Ações recomendadas */
  acoesRecomendadas: string[];
  /** Data de criação */
  dataCriacao: string;
  /** Status */
  status: 'pendente' | 'em_analise' | 'aprovada' | 'implementada' | 'rejeitada';
}

// ============================================
// SIMULAÇÃO DE CENÁRIOS
// ============================================

/**
 * Cenário de simulação (e se adicionar projeto X?)
 */
export interface CenarioSimulacao {
  /** ID do cenário */
  id: string;
  /** Nome do cenário */
  nome: string;
  /** Descrição */
  descricao: string;
  /** Projetos adicionados na simulação */
  projetosAdicionados: {
    projetoId: number;
    projetoNome: string;
    horasEstimadas: number;
    dataInicioPrevisao: string;
    dataFimPrevisao: string;
  }[];
  /** Resultado da simulação */
  resultado: {
    viavel: boolean;
    taxaUtilizacaoResultante: number;
    novosGargalos: number;
    novosConflitos: number;
    horasExtrasNecessarias: number;
    custoAdicional: number;
    mensagem: string;
  };
  /** Data da simulação */
  dataSimulacao: string;
}

// ============================================
// REQUEST E FILTROS
// ============================================

/**
 * Request para análise de capacidade
 */
export interface AnaliseCapacidadeRequest {
  /** Período de análise - início (opcional, padrão: hoje) */
  periodoInicio?: string;
  /** Período de análise - fim (opcional, padrão: +90 dias) */
  periodoFim?: string;
  /** Tipo de período para agregação */
  tipoPeriodo?: 'semanal' | 'mensal' | 'trimestral';
  /** Filtrar por IDs de recursos específicos */
  recursoIds?: number[];
  /** Filtrar por tipo de recurso */
  tipoRecurso?: TipoRecurso[];
  /** Filtrar por IDs de projetos */
  projetoIds?: number[];
  /** Filtrar por centros de trabalho */
  centroTrabalhoIds?: string[];
  /** Incluir apenas recursos ativos */
  apenasAtivos?: boolean;
  /** Incluir apenas gargalos */
  apenasGargalos?: boolean;
  /** Incluir sugestões de otimização */
  incluirSugestoes?: boolean;
}

/**
 * Resposta de simulação de novo projeto
 */
export interface SimulacaoNovoProjeto {
  /** Viável adicionar o projeto? */
  viavel: boolean;
  /** Taxa de utilização resultante (%) */
  taxaUtilizacaoResultante: number;
  /** Gargalos que serão criados */
  gargalosCriados: {
    recursoId: number;
    recursoNome: string;
    taxaUtilizacaoAtual: number;
    taxaUtilizacaoFutura: number;
  }[];
  /** Conflitos que serão criados */
  conflitosCriados: ConflitoAlocacao[];
  /** Recursos disponíveis para alocar */
  recursosDisponiveis: {
    recursoId: number;
    recursoNome: string;
    horasLivres: number;
  }[];
  /** Data ideal para início (se não viável agora) */
  dataIdealInicio?: string;
  /** Mensagem descritiva */
  mensagem: string;
  /** Sugestões */
  sugestoes: string[];
}
