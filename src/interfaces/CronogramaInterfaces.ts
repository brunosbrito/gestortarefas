/**
 * Interfaces do Módulo de Cronogramas
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas e Gestão de Projetos
 */

import { Obra } from './ObrasInterface';
import { Activity } from './AtividadeInterface';
import { Colaborador } from './ColaboradorInterface';

// ============================================================================
// CRONOGRAMA PRINCIPAL
// ============================================================================

export interface Cronograma {
  id: string;
  nome: string;
  descricao?: string;

  // Relacionamento com Obra
  projectId: string;
  project?: Obra;

  // Datas
  dataInicio: string; // formato: YYYY-MM-DD
  dataFim: string;
  dataPrevisaoConclusao?: string;

  // Status
  status: 'planejamento' | 'ativo' | 'pausado' | 'concluido' | 'cancelado';

  // Progresso
  progressoGeral: number; // 0-100

  // Responsável
  responsavel?: Colaborador;
  responsavelId?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  tarefas?: TarefaCronograma[];
}

// ============================================================================
// TAREFA DO CRONOGRAMA
// ============================================================================

export interface TarefaCronograma {
  id: string;
  cronogramaId: string;

  // Informações básicas
  nome: string;
  descricao?: string;

  // Tipo de tarefa
  tipo: 'manual' | 'atividade' | 'inspecao' | 'certificado' | 'marco';

  // Relacionamentos (dependendo do tipo)
  atividadeId?: number; // Se tipo = 'atividade'
  atividade?: Activity;
  inspecaoId?: string; // Se tipo = 'inspecao'
  certificadoId?: string; // Se tipo = 'certificado'

  // Datas planejadas
  dataInicioPlanejada: string;
  dataFimPlanejada: string;

  // Datas reais
  dataInicioReal?: string;
  dataFimReal?: string;

  // Duração
  duracao: number; // quantidade
  unidadeTempo: 'horas' | 'dias' | 'semanas';

  // Status
  status: 'planejada' | 'em_andamento' | 'atrasada' | 'concluida' | 'cancelada' | 'bloqueada';

  // Bloqueio (se status = 'bloqueada')
  motivoBloqueio?: string;
  rncBloqueioId?: string;

  // Progresso
  progresso: number; // 0-100
  progressoFonte: 'manual' | 'automatico'; // manual ou sincronizado de atividade

  // Responsável
  responsavel?: Colaborador;
  responsavelId?: string;

  // Milestone
  isMilestone: boolean; // true = marco (duração = 0)

  // Prioridade
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';

  // Caminho Crítico (Fase 3)
  isCritico?: boolean;
  folga?: number; // em dias

  // Hierarquia
  ordem: number;
  nivel: number;
  tarefaPaiId?: string;
  eap?: string; // Estrutura Analítica do Projeto (ex: 1.1.2)

  // Recursos/Equipe
  equipe?: string; // Nome da equipe/disciplina (ex: "Caldeiraria", "Soldagem")

  // Relacionamentos
  dependencias?: Dependencia[];
  recursos?: RecursoCronograma[];

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// DEPENDÊNCIA ENTRE TAREFAS
// ============================================================================

export interface Dependencia {
  id: string;

  // Tarefa anterior (predecessora)
  tarefaAnteriorId: string;
  tarefaAnterior?: TarefaCronograma;

  // Tarefa posterior (sucessora)
  tarefaPosteriorId: string;
  tarefaPosterior?: TarefaCronograma;

  // Tipo de dependência
  tipo: 'fim_inicio' | 'inicio_inicio' | 'fim_fim' | 'inicio_fim';

  // Folga (lag/lead)
  folga: number; // positivo = atraso, negativo = antecipação (em dias)

  createdAt: string;
}

// ============================================================================
// RECURSO / ALOCAÇÃO
// ============================================================================

export interface RecursoCronograma {
  id: string;
  tarefaId: string;

  // Colaborador alocado
  colaboradorId: number;
  colaborador?: Colaborador;

  // Alocação
  percentualAlocacao: number; // 0-100 (ex: 50% = meio período)

  // Horas
  horasEstimadas?: number;
  horasReais?: number;

  // Papel na tarefa
  papel?: string; // ex: "Soldador", "Pintor", "Supervisor"

  createdAt: string;
}

// ============================================================================
// DASHBOARD / MÉTRICAS
// ============================================================================

export interface DashboardCronograma {
  cronogramaId: string;

  // Totalizadores de tarefas
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasEmAndamento: number;
  tarefasAtrasadas: number;
  tarefasBloqueadas: number;

  // Progresso geral
  progressoGeral: number; // 0-100

  // Timeline
  diasDecorridos: number;
  diasTotais: number;

  // Recursos
  colaboradoresAlocados: number;

  // Tarefas críticas (prazo próximo)
  tarefasCriticasProximas: TarefaCronograma[];

  // Alertas
  alertas: AlertaCronograma[];
}

export interface AlertaCronograma {
  id: string;
  cronogramaId: string;
  tarefaId?: string;

  tipo: 'tarefa_vencida' | 'prazo_proximo' | 'dependencia_atrasada' | 'recurso_sobrecarregado' | 'rnc_bloqueio';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';

  titulo: string;
  descricao: string;

  dataGeracao: string;
  lido: boolean;
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateCronograma {
  nome: string;
  descricao?: string;
  projectId: string;
  dataInicio: string;
  dataFim: string;
  responsavelId?: string;
}

export interface UpdateCronograma {
  nome?: string;
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
  status?: 'planejamento' | 'ativo' | 'pausado' | 'concluido' | 'cancelado';
  responsavelId?: string;
}

export interface CreateTarefaCronograma {
  cronogramaId: string;
  nome: string;
  descricao?: string;
  tipo: 'manual' | 'atividade' | 'inspecao' | 'certificado' | 'marco';
  atividadeId?: number;
  inspecaoId?: string;
  certificadoId?: string;
  dataInicioPlanejada: string;
  dataFimPlanejada: string;
  duracao: number;
  unidadeTempo: 'horas' | 'dias' | 'semanas';
  responsavelId?: string;
  isMilestone: boolean;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  ordem: number;
  nivel: number;
  tarefaPaiId?: string;
}

export interface UpdateTarefaCronograma {
  nome?: string;
  descricao?: string;
  dataInicioPlanejada?: string;
  dataFimPlanejada?: string;
  dataInicioReal?: string;
  dataFimReal?: string;
  duracao?: number;
  status?: 'planejada' | 'em_andamento' | 'atrasada' | 'concluida' | 'cancelada' | 'bloqueada';
  motivoBloqueio?: string;
  rncBloqueioId?: string;
  progresso?: number;
  responsavelId?: string;
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica';
}

export interface CreateDependencia {
  tarefaAnteriorId: string;
  tarefaPosteriorId: string;
  tipo: 'fim_inicio' | 'inicio_inicio' | 'fim_fim' | 'inicio_fim';
  folga: number;
}

// ============================================================================
// IMPORTAÇÃO DE ATIVIDADES
// ============================================================================

export interface ImportacaoAtividades {
  cronogramaId: string;
  projectId: string;
  serviceOrderIds: number[]; // IDs das OS para importar
  atividadeIds?: number[]; // IDs específicos das atividades a importar (opcional)
  configuracao: {
    criarDependencias: boolean; // Criar dependências automáticas (sequencial)
    mapearResponsaveis: boolean; // Mapear colaboradores das atividades
    sincronizarProgresso: boolean; // Ativar sincronização automática
  };
}

export interface ResultadoImportacao {
  sucesso: boolean;
  tarefasImportadas: number;
  tarefasCriadas: string[]; // IDs das tarefas criadas
  erros?: string[];
  avisos?: string[];
}

// ============================================================================
// FILTROS
// ============================================================================

export interface FiltrosCronograma {
  projectId?: string;
  status?: 'planejamento' | 'ativo' | 'pausado' | 'concluido' | 'cancelado';
  responsavelId?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface FiltrosTarefa {
  cronogramaId?: string;
  tipo?: 'manual' | 'atividade' | 'inspecao' | 'certificado' | 'marco';
  status?: 'planejada' | 'em_andamento' | 'atrasada' | 'concluida' | 'cancelada' | 'bloqueada';
  responsavelId?: string;
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica';
  isMilestone?: boolean;
}
