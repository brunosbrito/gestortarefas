/**
 * GESTÃO DE PROCESSOS - INTERFACES
 * Módulo de ferramentas de gestão e melhoria de processos
 *
 * Ferramentas implementadas:
 * 1. Priorização de Problemas (Matriz GUT)
 * 2. Desdobramento de Problemas
 * 3. PDCA (Plan-Do-Check-Act)
 * 4. Metas SMART
 * 5. Plano de Ação 5W2H
 */

// ==========================================
// TIPOS E ENUMS BASE
// ==========================================

/**
 * Status do documento no workflow de aprovação
 */
export type StatusDocumentoGP =
  | 'rascunho'
  | 'aguardando_aprovacao'
  | 'aprovado'
  | 'rejeitado';

/**
 * Tipo de vinculação do documento
 */
export type TipoVinculacaoGP =
  | 'obra'      // Vinculado a um projeto/obra
  | 'setor'     // Vinculado a um setor/departamento
  | 'independente'; // Não vinculado

/**
 * Status de execução de ações (usado em PDCA e 5W2H)
 */
export type StatusAcaoGP =
  | 'pendente'
  | 'em_andamento'
  | 'concluida'
  | 'verificada';

/**
 * Escala GUT (1-5)
 */
export type EscalaGUT = 1 | 2 | 3 | 4 | 5;

/**
 * Fases do PDCA
 */
export type FasePDCA = 'plan' | 'do' | 'check' | 'act';

/**
 * Status geral do ciclo PDCA
 */
export type StatusPDCA =
  | 'planejamento'
  | 'execucao'
  | 'verificacao'
  | 'acao'
  | 'concluido'
  | 'cancelado';

/**
 * Critérios SMART
 */
export type CriterioSMART =
  | 'specific'    // Específico
  | 'measurable'  // Mensurável
  | 'attainable'  // Atingível
  | 'relevant'    // Relevante
  | 'timeBound';  // Temporal

// ==========================================
// INTERFACE BASE
// ==========================================

/**
 * Interface base para todos os documentos de Gestão de Processos
 */
export interface DocumentoBaseGP {
  id: string;

  // Identificação
  codigo: string; // Código único do documento (ex: GP-PRI-2024-001)
  titulo: string;
  descricao: string;

  // Vinculação
  tipoVinculacao: TipoVinculacaoGP;
  obraId?: string; // Se vinculado a obra
  obraNome?: string;
  setorId?: string; // Se vinculado a setor
  setorNome?: string;

  // Workflow de Aprovação
  status: StatusDocumentoGP;
  criadoPorId: string;
  criadoPorNome: string;
  aprovadorId?: string;
  aprovadorNome?: string;
  dataAprovacao?: string;
  motivoRejeicao?: string;

  // Auditoria
  createdAt: string;
  updatedAt: string;

  // Relacionamentos (opcional)
  documentoOrigemId?: string; // ID do documento que gerou este
  documentoOrigemTipo?: string; // Tipo do documento origem
}

// ==========================================
// 1. PRIORIZAÇÃO DE PROBLEMAS (MATRIZ GUT)
// ==========================================

/**
 * Critérios da Matriz GUT
 */
export interface CriteriosGUT {
  gravidade: EscalaGUT; // 1-5: Impacto do problema
  urgencia: EscalaGUT;  // 1-5: Prazo para resolver
  tendencia: EscalaGUT; // 1-5: Tendência de piorar
}

/**
 * Resultado da análise GUT
 */
export interface ResultadoGUT {
  pontuacao: number; // G × U × T (1-125)
  ranking?: number; // Posição no ranking geral
  classificacao: 'baixa' | 'media' | 'alta' | 'critica'; // Baseado na pontuação
}

/**
 * Priorização de Problema usando Matriz GUT
 */
export interface PriorizacaoProblema extends DocumentoBaseGP {
  // Identificação do Problema
  problema: string;
  area: string;
  responsavelId: string;
  responsavelNome: string;

  // Matriz GUT
  criterios: CriteriosGUT;
  resultado: ResultadoGUT;

  // Justificativas
  justificativaGravidade: string;
  justificativaUrgencia: string;
  justificativaTendencia: string;

  // Decisão
  acaoImediata: boolean;
  observacoes?: string;
}

// ==========================================
// 2. DESDOBRAMENTO DE PROBLEMAS
// ==========================================

/**
 * Causa identificada na análise
 */
export interface CausaProblema {
  id: string;
  descricao: string;
  tipo: 'primaria' | 'secundaria' | 'terciaria';
  nivel: number; // Nível hierárquico (1, 2, 3...)
  parentId?: string; // ID da causa pai
  porQueOcorre: string;
  evidencias?: string;
}

/**
 * Efeito/Consequência do problema
 */
export interface EfeitoProblema {
  id: string;
  descricao: string;
  gravidade: 'baixa' | 'media' | 'alta';
  area: string; // Área afetada
  impacto: string;
}

/**
 * Desdobramento de Problema
 */
export interface DesdobramentoProblema extends DocumentoBaseGP {
  // Problema
  problema: string;
  situacaoAtual: string;

  // Análise de Causas (árvore hierárquica)
  causas: CausaProblema[];
  causaRaiz?: string; // ID da causa raiz identificada

  // Análise de Efeitos
  efeitos: EfeitoProblema[];

  // Conclusões
  conclusao: string;
  proximasAcoes?: string;

  // Relacionamento com Priorização
  priorizacaoId?: string;
}

// ==========================================
// 3. PDCA (PLAN-DO-CHECK-ACT)
// ==========================================

/**
 * Fase PLAN (Planejar)
 */
export interface PDCAPlan {
  // Identificação do Problema
  problema: string;
  metaEsperada: string;
  indicador: string;
  valorAtual?: number;
  valorMeta?: number;

  // Análise
  causaRaiz: string;
  analiseMetodo?: string; // Método usado (5 Porquês, Ishikawa, etc.)

  // Plano de Ação
  acoes: string[]; // Lista de ações planejadas
  responsaveis: string[];
  prazo: string;
  recursos?: string;
}

/**
 * Fase DO (Executar)
 */
export interface PDCADo {
  // Execução
  dataInicio: string;
  dataFim?: string;
  statusExecucao: StatusAcaoGP;

  // Ações executadas
  acoesRealizadas: string[];
  evidencias?: string[]; // URLs de evidências/documentos

  // Desvios
  desvios?: string;
  medidasCorretivas?: string;
}

/**
 * Fase CHECK (Verificar)
 */
export interface PDCACheck {
  // Medição
  dataVerificacao: string;
  valorAlcancado?: number;
  metaAtingida: boolean;

  // Análise de Resultados
  resultadosObtidos: string;
  comparacaoMeta: string;

  // Análise de Eficácia
  eficaz: boolean;
  justificativa: string;

  // Evidências
  evidencias?: string[];
}

/**
 * Fase ACT (Agir)
 */
export interface PDCAAct {
  // Decisão
  tipo: 'padronizar' | 'melhorar' | 'novo_ciclo';

  // Padronização (se eficaz)
  documentosPadrao?: string[];
  treinamentosRealizados?: string[];
  procedimentosAtualizados?: string[];

  // Melhoria Contínua (se não eficaz)
  problemasRemanescentes?: string;
  novoCicloNecessario?: boolean;

  // Lições Aprendidas
  licoesAprendidas: string;
  observacoes?: string;
}

/**
 * Ciclo PDCA completo
 */
export interface PDCA extends DocumentoBaseGP {
  // Identificação
  numeroCiclo: number; // Número do ciclo (1, 2, 3...)
  objetivo: string;

  // Status geral
  statusPDCA: StatusPDCA;
  faseAtual: FasePDCA;

  // Fases
  plan?: PDCAPlan;
  do?: PDCADo;
  check?: PDCACheck;
  act?: PDCAAct;

  // Relacionamentos
  desdobramentoId?: string;
  cicloAnteriorId?: string; // Se for iteração
  proximoCicloId?: string;

  // Timeline
  dataInicioPlanejamento?: string;
  dataFimCiclo?: string;
}

// ==========================================
// 4. METAS SMART
// ==========================================

/**
 * Critério SMART detalhado
 */
export interface CriterioSMARTDetalhado {
  criterio: CriterioSMART;
  atendido: boolean;
  descricao: string;
  evidencia?: string;
}

/**
 * Milestone da meta
 */
export interface MilestoneMeta {
  id: string;
  descricao: string;
  dataPrevisao: string;
  dataConclusao?: string;
  status: StatusAcaoGP;
  responsavelId: string;
  responsavelNome: string;
}

/**
 * Revisão periódica da meta
 */
export interface RevisaoMeta {
  id: string;
  data: string;
  revisorId: string;
  revisorNome: string;
  progresso: number; // 0-100%
  situacao: string;
  observacoes: string;
  ajustesNecessarios?: string;
}

/**
 * Meta SMART
 */
export interface MetaSMART extends DocumentoBaseGP {
  // Meta
  meta: string;
  contexto: string;

  // Critérios SMART
  criterios: CriterioSMARTDetalhado[];

  // S - Specific (Específico)
  especifico: {
    oQue: string; // O que será alcançado
    quem: string; // Quem é responsável
    onde?: string; // Onde será realizado
  };

  // M - Measurable (Mensurável)
  mensuravel: {
    indicador: string;
    unidadeMedida: string;
    valorAtual: number;
    valorMeta: number;
    formaAcompanhamento: string;
  };

  // A - Attainable (Atingível)
  atingivel: {
    recursos: string[];
    viabilidade: string;
    limitacoes?: string;
  };

  // R - Relevant (Relevante)
  relevante: {
    alinhamentoEstrategico: string;
    beneficios: string[];
    impacto: string;
  };

  // T - Time-bound (Temporal)
  temporal: {
    dataInicio: string;
    dataFim: string;
    milestones: MilestoneMeta[];
  };

  // Acompanhamento
  progresso: number; // 0-100%
  revisoes: RevisaoMeta[];

  // Relacionamentos
  desdobramentoId?: string;
  pdcaId?: string;
}

// ==========================================
// 5. PLANO DE AÇÃO 5W2H
// ==========================================

/**
 * Ação individual do plano 5W2H
 */
export interface Acao5W2H {
  id: string;

  // 5W
  oQue: string;      // What - O que será feito
  porque: string;    // Why - Por que será feito
  quemId: string;    // Who - Quem fará
  quemNome?: string;
  quando: string;    // When - Quando será feito (data)
  onde: string;      // Where - Onde será feito

  // 2H
  como: string;      // How - Como será feito
  quantoCusta?: number; // How Much - Quanto custará

  // Status
  status: StatusAcaoGP;
  progresso?: number; // 0-100%

  // Evidências
  evidencias?: string[];
  observacoes?: string;

  // Datas
  dataInicio?: string;
  dataConclusao?: string;
}

/**
 * Plano de Ação 5W2H
 */
export interface PlanoAcao5W2H extends DocumentoBaseGP {
  // Identificação
  objetivo: string;
  contexto: string;

  // Ações
  acoes: Acao5W2H[];

  // Resumo
  custoTotal?: number;
  prazoInicio?: string;
  prazoFim?: string;

  // Progresso geral
  progressoGeral: number; // 0-100%
  acoesCompletadas: number;
  acoesTotal: number;

  // Relacionamentos
  pdcaId?: string;
  metaId?: string;
  priorizacaoId?: string;

  // Monitoramento
  ultimaAtualizacao?: string;
  observacoesGerais?: string;
}

// ==========================================
// DASHBOARD E ESTATÍSTICAS
// ==========================================

/**
 * Estatísticas do Dashboard
 */
export interface DashboardGestaoProcessos {
  // Totais por ferramenta
  totalPriorizacoes: number;
  totalDesdobramentos: number;
  totalPDCAs: number;
  totalMetas: number;
  totalPlanos5W2H: number;

  // Status de aprovação
  aguardandoAprovacao: number;
  aprovados: number;
  rejeitados: number;
  rascunhos: number;

  // PDCAs
  pdcasPorFase: {
    planejamento: number;
    execucao: number;
    verificacao: number;
    acao: number;
    concluido: number;
  };

  // Metas
  metasNosPrazos: number;
  metasAtrasadas: number;
  metasAtingidas: number;

  // Ações 5W2H
  acoesPendentes: number;
  acoesEmAndamento: number;
  acoesConcluidas: number;

  // Vinculações
  porObra: number;
  porSetor: number;
  independentes: number;

  // Timeline
  criadosUltimos30Dias: number;
  concluidosUltimos30Dias: number;
}

/**
 * Item da fila de aprovação
 */
export interface ItemFilaAprovacao {
  id: string;
  tipo: 'priorizacao' | 'desdobramento' | 'pdca' | 'meta' | 'plano5w2h';
  codigo: string;
  titulo: string;
  criadoPorNome: string;
  dataCriacao: string;
  dataSubmissao: string;
  prioridade?: 'baixa' | 'media' | 'alta';
}

/**
 * Filtros do Dashboard
 */
export interface FiltrosDashboardGP {
  dataInicio?: string;
  dataFim?: string;
  tipoVinculacao?: TipoVinculacaoGP;
  obraId?: string;
  setorId?: string;
  status?: StatusDocumentoGP;
  criadoPorId?: string;
}

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

/**
 * DTO para criação de Priorização
 */
export type CreatePriorizacaoDTO = Omit<PriorizacaoProblema,
  'id' | 'codigo' | 'createdAt' | 'updatedAt' | 'resultado'
>;

/**
 * DTO para criação de Desdobramento
 */
export type CreateDesdobramentoDTO = Omit<DesdobramentoProblema,
  'id' | 'codigo' | 'createdAt' | 'updatedAt'
>;

/**
 * DTO para criação de PDCA
 */
export type CreatePDCADTO = Omit<PDCA,
  'id' | 'codigo' | 'createdAt' | 'updatedAt' | 'numeroCiclo'
>;

/**
 * DTO para criação de Meta SMART
 */
export type CreateMetaSMARTDTO = Omit<MetaSMART,
  'id' | 'codigo' | 'createdAt' | 'updatedAt' | 'progresso' | 'revisoes'
>;

/**
 * DTO para criação de Plano 5W2H
 */
export type CreatePlanoAcao5W2HDTO = Omit<PlanoAcao5W2H,
  'id' | 'codigo' | 'createdAt' | 'updatedAt' | 'progressoGeral' | 'acoesCompletadas' | 'acoesTotal'
>;

/**
 * DTO para aprovação de documento
 */
export interface AprovacaoDTO {
  documentoId: string;
  aprovadorId: string;
  aprovadorNome: string;
  aprovado: boolean;
  motivoRejeicao?: string;
}

/**
 * DTO para atualização de status de ação
 */
export interface AtualizacaoStatusAcaoDTO {
  acaoId: string;
  status: StatusAcaoGP;
  progresso?: number;
  evidencias?: string[];
  observacoes?: string;
}
