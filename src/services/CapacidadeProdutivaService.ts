/**
 * FASE 3 PCP: Capacidade Produtiva Multi-Projeto
 * Service para análise de capacidade de recursos e identificação de gargalos
 * Sistema: Gestor Master - GMX Soluções Industriais
 *
 * Funcionalidades:
 * - Cálculo de horas disponíveis vs necessárias por recurso
 * - Identificação de gargalos (utilização > 90%)
 * - Detecção de conflitos de alocação
 * - Sugestões de nivelamento e otimização
 * - Simulação de impacto de novos projetos
 * - Análise consolidada multi-projeto
 */

import {
  TipoRecurso,
  TipoEspecializacao,
  RecursoProdutivo,
  CentroTrabalho,
  CalendarioTrabalho,
  Turno,
  DiaNaoUtil,
  AlocacaoRecurso,
  DemandaRecurso,
  ConflitoAlocacao,
  SobrecargaCentroTrabalho,
  AnaliseCapacidadeRecurso,
  AnaliseCapacidadeConsolidada,
  DashboardCapacidade,
  DashboardCapacidadeKPIs,
  TimelineCapacidade,
  SugestaoNivelamento,
  CenarioSimulacao,
  AnaliseCapacidadeRequest,
  SimulacaoNovoProjeto,
} from '@/interfaces/CapacidadeInterface';
import ProcessService from '@/services/ProcessService';
import TarefaMacroService from '@/services/TarefaMacroService';
import { getAllActivities } from '@/services/ActivityService';

// ============================================
// SERVICE CLASS
// ============================================

class CapacidadeProdutivaServiceClass {
  private useMock = true; // IMPORTANTE: Frontend-only, mock mode ativado

  // ============================================
  // MOCK DATA - Calendários
  // ============================================

  private mockCalendarios: CalendarioTrabalho[] = [
    {
      id: 'cal-001',
      nome: 'Calendário Padrão - Produção',
      turnos: [
        {
          id: 'turno-001',
          nome: 'Turno Diurno',
          horaInicio: '07:00',
          horaFim: '17:00',
          horasTotais: 9, // 9h (1h almoço deduzida)
          diasSemana: [1, 2, 3, 4, 5], // Segunda a Sexta
        },
      ],
      diasNaoUteis: [
        { data: '2026-01-01', descricao: 'Confraternização Universal', tipo: 'feriado_nacional' },
        { data: '2026-02-16', descricao: 'Carnaval', tipo: 'feriado_nacional' },
        { data: '2026-02-17', descricao: 'Carnaval', tipo: 'feriado_nacional' },
        { data: '2026-04-03', descricao: 'Sexta-feira Santa', tipo: 'feriado_nacional' },
        { data: '2026-04-21', descricao: 'Tiradentes', tipo: 'feriado_nacional' },
        { data: '2026-05-01', descricao: 'Dia do Trabalho', tipo: 'feriado_nacional' },
        { data: '2026-09-07', descricao: 'Independência do Brasil', tipo: 'feriado_nacional' },
        { data: '2026-10-12', descricao: 'Nossa Senhora Aparecida', tipo: 'feriado_nacional' },
        { data: '2026-11-02', descricao: 'Finados', tipo: 'feriado_nacional' },
        { data: '2026-11-15', descricao: 'Proclamação da República', tipo: 'feriado_nacional' },
        { data: '2026-12-25', descricao: 'Natal', tipo: 'feriado_nacional' },
      ],
      horasPadraoDia: 9,
      diasUteisSemana: 5,
      horasTotaisSemana: 45, // 9h × 5 dias
    },
    {
      id: 'cal-002',
      nome: 'Calendário Estendido - 6 dias',
      turnos: [
        {
          id: 'turno-002',
          nome: 'Turno Estendido',
          horaInicio: '07:00',
          horaFim: '17:00',
          horasTotais: 9,
          diasSemana: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
        },
      ],
      diasNaoUteis: [
        { data: '2026-01-01', descricao: 'Confraternização Universal', tipo: 'feriado_nacional' },
        // Mesmos feriados...
      ],
      horasPadraoDia: 9,
      diasUteisSemana: 6,
      horasTotaisSemana: 54, // 9h × 6 dias
    },
  ];

  // ============================================
  // MOCK DATA - Centros de Trabalho
  // ============================================

  private mockCentrosTrabalho: CentroTrabalho[] = [
    {
      id: 'ct-001',
      nome: 'Setor de Soldagem',
      descricao: 'Soldadores e equipamentos de solda',
      tipoOperacao: 'soldagem',
      recursosIds: [1, 2, 3], // Será preenchido com IDs de recursos
      localizacao: 'Pavilhão A - Área 1',
      responsavelId: 1,
      capacidadeTotalSemana: 135, // 3 soldadores × 45h
    },
    {
      id: 'ct-002',
      nome: 'Setor de Montagem',
      descricao: 'Montadores e auxiliares',
      tipoOperacao: 'montagem',
      recursosIds: [4, 5, 6, 7],
      localizacao: 'Pavilhão B - Área 2',
      responsavelId: 2,
      capacidadeTotalSemana: 180, // 4 montadores × 45h
    },
    {
      id: 'ct-003',
      nome: 'Caldeiraria',
      descricao: 'Caldeireiros e corte',
      tipoOperacao: 'caldeiraria',
      recursosIds: [8, 9],
      localizacao: 'Pavilhão A - Área 3',
      responsavelId: 1,
      capacidadeTotalSemana: 90, // 2 caldeireiros × 45h
    },
    {
      id: 'ct-004',
      nome: 'Pintura',
      descricao: 'Pintores e equipamentos',
      tipoOperacao: 'pintura',
      recursosIds: [10],
      localizacao: 'Pavilhão C',
      responsavelId: 3,
      capacidadeTotalSemana: 45, // 1 pintor × 45h
    },
  ];

  // ============================================
  // MOCK DATA - Recursos Produtivos
  // ============================================

  private mockRecursos: RecursoProdutivo[] = [
    // Soldadores (CT-001)
    {
      id: 1,
      nome: 'João Silva - Soldador',
      tipo: 'colaborador',
      especializacao: 'soldador',
      centroTrabalhoId: 'ct-001',
      calendarioId: 'cal-001',
      horasDisponiveisSemana: 45,
      horasDisponiveisMes: 180, // ~4 semanas
      valorHora: 35.0,
      ativo: true,
      dataCadastro: '2024-01-10',
    },
    {
      id: 2,
      nome: 'Carlos Mendes - Soldador',
      tipo: 'colaborador',
      especializacao: 'soldador',
      centroTrabalhoId: 'ct-001',
      calendarioId: 'cal-001',
      horasDisponiveisSemana: 45,
      horasDisponiveisMes: 180,
      valorHora: 38.0,
      ativo: true,
      dataCadastro: '2023-06-15',
    },
    {
      id: 3,
      nome: 'Pedro Oliveira - Soldador',
      tipo: 'colaborador',
      especializacao: 'soldador',
      centroTrabalhoId: 'ct-001',
      calendarioId: 'cal-001',
      horasDisponiveisSemana: 45,
      horasDisponiveisMes: 180,
      valorHora: 32.0,
      ativo: true,
      dataCadastro: '2025-03-01',
    },
    // Montadores (CT-002)
    {
      id: 4,
      nome: 'Ana Costa - Montador',
      tipo: 'colaborador',
      especializacao: 'montador',
      centroTrabalhoId: 'ct-002',
      calendarioId: 'cal-001',
      horasDisponiveisSemana: 45,
      horasDisponiveisMes: 180,
      valorHora: 28.0,
      ativo: true,
      dataCadastro: '2024-08-20',
    },
    {
      id: 5,
      nome: 'Rafael Santos - Montador',
      tipo: 'colaborador',
      especializacao: 'montador',
      centroTrabalhoId: 'ct-002',
      calendarioId: 'cal-001',
      horasDisponiveisSemana: 45,
      horasDisponiveisMes: 180,
      valorHora: 30.0,
      ativo: true,
      dataCadastro: '2023-11-10',
    },
    {
      id: 6,
      nome: 'Lucas Ferreira - Auxiliar',
      tipo: 'colaborador',
      especializacao: 'auxiliar',
      centroTrabalhoId: 'ct-002',
      calendarioId: 'cal-001',
      horasDisponiveisSemana: 45,
      horasDisponiveisMes: 180,
      valorHora: 22.0,
      ativo: true,
      dataCadastro: '2025-01-05',
    },
    {
      id: 7,
      nome: 'Mariana Lima - Auxiliar',
      tipo: 'colaborador',
      especializacao: 'auxiliar',
      centroTrabalhoId: 'ct-002',
      calendarioId: 'cal-001',
      horasDisponiveisSemana: 45,
      horasDisponiveisMes: 180,
      valorHora: 22.0,
      ativo: true,
      dataCadastro: '2025-02-10',
    },
    // Caldeireiros (CT-003)
    {
      id: 8,
      nome: 'Fernando Alves - Caldeireiro',
      tipo: 'colaborador',
      especializacao: 'caldeireiro',
      centroTrabalhoId: 'ct-003',
      calendarioId: 'cal-001',
      horasDisponiveisSemana: 45,
      horasDisponiveisMes: 180,
      valorHora: 40.0,
      ativo: true,
      dataCadastro: '2022-05-10',
    },
    {
      id: 9,
      nome: 'Roberto Gomes - Caldeireiro',
      tipo: 'colaborador',
      especializacao: 'caldeireiro',
      centroTrabalhoId: 'ct-003',
      calendarioId: 'cal-001',
      horasDisponiveisSemana: 45,
      horasDisponiveisMes: 180,
      valorHora: 42.0,
      ativo: true,
      dataCadastro: '2021-09-01',
    },
    // Pintor (CT-004)
    {
      id: 10,
      nome: 'Thiago Pereira - Pintor',
      tipo: 'colaborador',
      especializacao: 'pintor',
      centroTrabalhoId: 'ct-004',
      calendarioId: 'cal-001',
      horasDisponiveisSemana: 45,
      horasDisponiveisMes: 180,
      valorHora: 30.0,
      ativo: true,
      dataCadastro: '2024-07-15',
    },
  ];

  // ============================================
  // MOCK DATA - Alocações (integração conceitual com Cronogramas)
  // ============================================

  private mockAlocacoes: AlocacaoRecurso[] = [
    // PROJETO 1 - Galpão Industrial (Gargalo em Soldagem)
    {
      id: 'aloc-001',
      recursoId: 1,
      recursoNome: 'João Silva - Soldador',
      recursoTipo: 'colaborador',
      projetoId: 1,
      projetoNome: 'Galpão Industrial - Cliente XYZ',
      tarefaCronogramaId: 101,
      tarefaDescricao: 'Soldagem de Pilares',
      dataInicio: '2026-01-20',
      dataFim: '2026-02-10',
      horasAlocadas: 80, // ~4 semanas × 20h/semana = 80h (44% de 180h mês)
      percentualAlocacao: 44,
      status: 'em_andamento',
    },
    {
      id: 'aloc-002',
      recursoId: 2,
      recursoNome: 'Carlos Mendes - Soldador',
      recursoTipo: 'colaborador',
      projetoId: 1,
      projetoNome: 'Galpão Industrial - Cliente XYZ',
      tarefaCronogramaId: 102,
      tarefaDescricao: 'Soldagem de Vigas',
      dataInicio: '2026-01-20',
      dataFim: '2026-02-10',
      horasAlocadas: 90, // 50% do mês (GARGALO)
      percentualAlocacao: 50,
      status: 'em_andamento',
    },
    {
      id: 'aloc-003',
      recursoId: 3,
      recursoNome: 'Pedro Oliveira - Soldador',
      recursoTipo: 'colaborador',
      projetoId: 1,
      projetoNome: 'Galpão Industrial - Cliente XYZ',
      tarefaCronogramaId: 103,
      tarefaDescricao: 'Soldagem de Terças',
      dataInicio: '2026-01-20',
      dataFim: '2026-02-10',
      horasAlocadas: 70,
      percentualAlocacao: 39,
      status: 'em_andamento',
    },
    {
      id: 'aloc-004',
      recursoId: 4,
      recursoNome: 'Ana Costa - Montador',
      recursoTipo: 'colaborador',
      projetoId: 1,
      projetoNome: 'Galpão Industrial - Cliente XYZ',
      tarefaCronogramaId: 104,
      tarefaDescricao: 'Montagem de Estrutura Principal',
      dataInicio: '2026-02-05',
      dataFim: '2026-02-28',
      horasAlocadas: 60,
      percentualAlocacao: 33,
      status: 'planejada',
    },
    {
      id: 'aloc-005',
      recursoId: 5,
      recursoNome: 'Rafael Santos - Montador',
      recursoTipo: 'colaborador',
      projetoId: 1,
      projetoNome: 'Galpão Industrial - Cliente XYZ',
      tarefaCronogramaId: 104,
      tarefaDescricao: 'Montagem de Estrutura Principal',
      dataInicio: '2026-02-05',
      dataFim: '2026-02-28',
      horasAlocadas: 60,
      percentualAlocacao: 33,
      status: 'planejada',
    },

    // PROJETO 2 - Edifício Comercial (Conflito em Soldador Carlos)
    {
      id: 'aloc-006',
      recursoId: 2,
      recursoNome: 'Carlos Mendes - Soldador',
      recursoTipo: 'colaborador',
      projetoId: 2,
      projetoNome: 'Edifício Comercial - Shopping Center',
      tarefaCronogramaId: 201,
      tarefaDescricao: 'Soldagem de Cobertura',
      dataInicio: '2026-01-27',
      dataFim: '2026-02-15',
      horasAlocadas: 50, // CONFLITO! Já tem 90h no Projeto 1 = 140h total > 180h mês
      percentualAlocacao: 28,
      status: 'planejada',
    },
    {
      id: 'aloc-007',
      recursoId: 8,
      recursoNome: 'Fernando Alves - Caldeireiro',
      recursoTipo: 'colaborador',
      projetoId: 2,
      projetoNome: 'Edifício Comercial - Shopping Center',
      tarefaCronogramaId: 202,
      tarefaDescricao: 'Corte e Preparação de Chapas',
      dataInicio: '2026-01-22',
      dataFim: '2026-02-05',
      horasAlocadas: 55,
      percentualAlocacao: 31,
      status: 'em_andamento',
    },
    {
      id: 'aloc-008',
      recursoId: 9,
      recursoNome: 'Roberto Gomes - Caldeireiro',
      recursoTipo: 'colaborador',
      projetoId: 2,
      projetoNome: 'Edifício Comercial - Shopping Center',
      tarefaCronogramaId: 202,
      tarefaDescricao: 'Corte e Preparação de Chapas',
      dataInicio: '2026-01-22',
      dataFim: '2026-02-05',
      horasAlocadas: 55,
      percentualAlocacao: 31,
      status: 'em_andamento',
    },
    {
      id: 'aloc-009',
      recursoId: 6,
      recursoNome: 'Lucas Ferreira - Auxiliar',
      recursoTipo: 'colaborador',
      projetoId: 2,
      projetoNome: 'Edifício Comercial - Shopping Center',
      tarefaCronogramaId: 203,
      tarefaDescricao: 'Apoio à Montagem',
      dataInicio: '2026-02-10',
      dataFim: '2026-03-01',
      horasAlocadas: 40,
      percentualAlocacao: 22,
      status: 'planejada',
    },

    // PROJETO 3 - Ponte Metálica (Recurso ocioso: Pintor)
    {
      id: 'aloc-010',
      recursoId: 1,
      recursoNome: 'João Silva - Soldador',
      recursoTipo: 'colaborador',
      projetoId: 3,
      projetoNome: 'Ponte Metálica - Rodovia BR-101',
      tarefaCronogramaId: 301,
      tarefaDescricao: 'Soldagem de Longarinas',
      dataInicio: '2026-02-12',
      dataFim: '2026-03-05',
      horasAlocadas: 70,
      percentualAlocacao: 39,
      status: 'planejada',
    },
    {
      id: 'aloc-011',
      recursoId: 3,
      recursoNome: 'Pedro Oliveira - Soldador',
      recursoTipo: 'colaborador',
      projetoId: 3,
      projetoNome: 'Ponte Metálica - Rodovia BR-101',
      tarefaCronogramaId: 302,
      tarefaDescricao: 'Soldagem de Transversinas',
      dataInicio: '2026-02-12',
      dataFim: '2026-03-05',
      horasAlocadas: 80,
      percentualAlocacao: 44,
      status: 'planejada',
    },
    {
      id: 'aloc-012',
      recursoId: 10,
      recursoNome: 'Thiago Pereira - Pintor',
      recursoTipo: 'colaborador',
      projetoId: 3,
      projetoNome: 'Ponte Metálica - Rodovia BR-101',
      tarefaCronogramaId: 303,
      tarefaDescricao: 'Pintura Anticorrosiva',
      dataInicio: '2026-03-10',
      dataFim: '2026-03-20',
      horasAlocadas: 30, // Apenas 17% - OCIOSO resto do tempo
      percentualAlocacao: 17,
      status: 'planejada',
    },
  ];

  // ============================================
  // MÉTODOS AUXILIARES - INTEGRAÇÃO COM DADOS REAIS
  // ============================================

  /**
   * Mapeia nome de TAREFA MACRO para tipo de operação do centro de trabalho
   * Baseado nos processos reais da GMX
   */
  private mapearTarefaMacroParaTipo(tarefaMacro: string): string {
    const nome = tarefaMacro.toUpperCase().trim();

    // Mapeamento específico GMX
    if (nome.includes('SOLDA')) return 'soldagem';
    if (nome.includes('PREPARAÇÃO') || nome.includes('PREPARACAO')) return 'preparacao';
    if (nome.includes('ACABAMENTO')) return 'acabamento';
    if (nome.includes('JATEAMENTO')) return 'pintura'; // Jateamento faz parte da Pintura
    if (nome.includes('MONTAGEM') && !nome.includes('GABARITO')) return 'montagem';
    if (nome.includes('MOBILIZAÇÃO') || nome.includes('MOBILIZACAO')) return 'transporte';
    if (nome.includes('PERITAGEM') || nome.includes('AVALIAÇÃO') || nome.includes('AVALIACAO')) return 'inspecao';
    if (nome.includes('PINTURA')) return 'pintura';
    if (nome.includes('QUALIDADE')) return 'administrativo';
    if (nome.includes('ORGANIZAÇÃO') || nome.includes('ORGANIZACAO') || nome.includes('5S')) return '5s';
    if (nome.includes('RETRABALHO')) return 'retrabalho';
    if (nome.includes('TRANSPORTE')) return 'transporte';
    if (nome.includes('MANUTENÇÃO') || nome.includes('MANUTENCAO')) return 'manutencao';
    if (nome.includes('CORTE')) return 'preparacao'; // Corte faz parte da Preparação
    if (nome.includes('EXPEDIÇÃO') || nome.includes('EXPEDICAO') || nome.includes('CARGA') || nome.includes('DESCARGA')) return 'transporte';
    if (nome.includes('TESTES') || nome.includes('ENSAIOS')) return 'inspecao';

    // Default: montagem (mais genérico)
    return 'montagem';
  }

  /**
   * Busca centros de trabalho baseados em TAREFAS MACRO reais do banco de dados
   * IMPORTANTE: Usa Tarefas Macro como fonte principal (não Processos)
   */
  private async buscarCentrosReais(): Promise<CentroTrabalho[]> {
    try {
      const tarefaMacroService = new TarefaMacroService();
      const tarefasMacro = await tarefaMacroService.getAll();

      console.log('[CapacidadeService] ========== TAREFAS MACRO ==========');
      console.log('[CapacidadeService] Tarefas Macro encontradas:', tarefasMacro.length);
      console.log('[CapacidadeService] Lista completa:', tarefasMacro.map(t => t.name));

      // Se não houver tarefas macro, retorna centros padrão GMX
      if (!tarefasMacro || tarefasMacro.length === 0) {
        console.warn('[CapacidadeService] ⚠️ Nenhuma Tarefa Macro encontrada no banco. Usando centros padrão GMX.');
        return this.criarCentrosPadraoGMX();
      }

      // Agrupa tarefas macro por tipo de operação
      const centrosPorTipo = new Map<string, { tarefas: any[]; nome: string }>();

      for (const tarefa of tarefasMacro) {
        // Ignora "MONTAGEM GABARITO" conforme solicitado
        if (tarefa.name.toUpperCase().includes('MONTAGEM') && tarefa.name.toUpperCase().includes('GABARITO')) {
          console.log('[CapacidadeService] ❌ Ignorando tarefa:', tarefa.name);
          continue;
        }

        const tipoOperacao = this.mapearTarefaMacroParaTipo(tarefa.name);
        console.log(`[CapacidadeService] ✓ Mapeando: "${tarefa.name}" → ${tipoOperacao}`);

        if (!centrosPorTipo.has(tipoOperacao)) {
          centrosPorTipo.set(tipoOperacao, {
            tarefas: [],
            nome: this.getNomeCentroPorTipo(tipoOperacao),
          });
        }

        centrosPorTipo.get(tipoOperacao)!.tarefas.push(tarefa);
      }

      console.log('[CapacidadeService] Tipos de operação únicos:', Array.from(centrosPorTipo.keys()));

      // Busca activities para calcular demanda
      const activities = await getAllActivities();
      console.log('[CapacidadeService] Activities encontradas:', activities.length);

      // Cria centros de trabalho reais
      const centrosReais: CentroTrabalho[] = [];
      let centroIndex = 1;

      for (const [tipoOperacao, dados] of centrosPorTipo.entries()) {
        // Calcula capacidade estimada (pode ser refinado depois)
        const numRecursos = this.estimarRecursosPorTipo(tipoOperacao);
        const horasPorRecurso = 45; // 45h/semana padrão
        const capacidadeTotal = numRecursos * horasPorRecurso;

        const centro: CentroTrabalho = {
          id: `ct-real-${centroIndex++}`,
          nome: dados.nome,
          descricao: `Tarefas: ${dados.tarefas.map((t) => t.name).join(', ')}`,
          tipoOperacao: tipoOperacao as any, // Usa tipo customizado GMX
          recursosIds: [], // Será preenchido se integrar com recursos
          localizacao: 'GMX - Planta Principal',
          capacidadeTotalSemana: capacidadeTotal,
        };

        centrosReais.push(centro);
        console.log(`[CapacidadeService] ✓ Centro criado: ${centro.nome} (${centro.capacidadeTotalSemana}h/semana)`);
      }

      console.log('[CapacidadeService] ========== RESULTADO ==========');
      console.log('[CapacidadeService] Centros reais criados:', centrosReais.length);
      console.log('[CapacidadeService] Lista:', centrosReais.map(c => c.nome));
      console.log('[CapacidadeService] ==================================');

      return centrosReais;
    } catch (error) {
      console.error('[CapacidadeService] ❌ Erro ao buscar centros reais:', error);
      // Fallback para centros padrão GMX
      console.warn('[CapacidadeService] ⚠️ Usando centros padrão GMX como fallback');
      return this.criarCentrosPadraoGMX();
    }
  }

  /**
   * Cria centros de trabalho padrão GMX baseados nas 11 categorias
   * Usado como fallback quando não há tarefas macro no banco
   */
  private criarCentrosPadraoGMX(): CentroTrabalho[] {
    const centrosPadrao: Array<{ nome: string; tipo: string; recursos: number }> = [
      { nome: 'Soldagem', tipo: 'soldagem', recursos: 3 },
      { nome: 'Preparação', tipo: 'preparacao', recursos: 3 },
      { nome: 'Acabamento', tipo: 'acabamento', recursos: 2 },
      { nome: 'Pintura', tipo: 'pintura', recursos: 2 },
      { nome: 'Montagem', tipo: 'montagem', recursos: 4 },
      { nome: 'Transporte', tipo: 'transporte', recursos: 2 },
      { nome: 'Inspeção', tipo: 'inspecao', recursos: 2 },
      { nome: 'Administrativo', tipo: 'administrativo', recursos: 2 },
      { nome: '5S', tipo: '5s', recursos: 1 },
      { nome: 'Retrabalho', tipo: 'retrabalho', recursos: 2 },
      { nome: 'Manutenção', tipo: 'manutencao', recursos: 1 },
    ];

    return centrosPadrao.map((c, index) => ({
      id: `ct-gmx-${index + 1}`,
      nome: c.nome,
      descricao: `Centro de trabalho GMX - ${c.nome}`,
      tipoOperacao: c.tipo as any,
      recursosIds: [],
      localizacao: 'GMX - Planta Principal',
      capacidadeTotalSemana: c.recursos * 45,
    }));
  }

  /**
   * Retorna nome amigável do centro baseado no tipo de operação GMX
   */
  private getNomeCentroPorTipo(tipo: string): string {
    const nomes: Record<string, string> = {
      soldagem: 'Soldagem',
      preparacao: 'Preparação',
      acabamento: 'Acabamento',
      pintura: 'Pintura',
      montagem: 'Montagem',
      transporte: 'Transporte',
      inspecao: 'Inspeção',
      administrativo: 'Administrativo',
      '5s': '5S',
      retrabalho: 'Retrabalho',
      manutencao: 'Manutenção',
    };
    return nomes[tipo] || `Centro - ${tipo}`;
  }

  /**
   * Estima número de recursos por tipo GMX (pode ser refinado com dados reais depois)
   */
  private estimarRecursosPorTipo(tipo: string): number {
    const estimativas: Record<string, number> = {
      soldagem: 3,          // Soldadores
      preparacao: 3,        // Corte, Furação, Ajustes
      acabamento: 2,        // Acabamento
      pintura: 2,           // Pintura + Jateamento
      montagem: 4,          // Montadores
      transporte: 2,        // Motoristas/Operadores
      inspecao: 2,          // Inspetores
      administrativo: 2,    // Qualidade
      '5s': 1,              // Organização
      retrabalho: 2,        // Retrabalho
      manutencao: 1,        // Manutenção
    };
    return estimativas[tipo] || 2;
  }

  /**
   * Calcula demanda real por centro baseado em activities ativas
   * IMPORTANTE: Usa macroTask (Tarefa Macro) como fonte principal
   */
  private async calcularDemandaPorCentro(
    centros: CentroTrabalho[],
    periodoInicio: string,
    periodoFim: string
  ): Promise<Map<string, number>> {
    try {
      const activities = await getAllActivities();
      const tarefaMacroService = new TarefaMacroService();
      const tarefasMacro = await tarefaMacroService.getAll();

      // Cria mapa de tarefaMacroId -> tipoOperacao
      const tarefaParaTipo = new Map<number, string>();
      for (const tarefa of tarefasMacro) {
        // Ignora MONTAGEM GABARITO
        if (tarefa.name.toUpperCase().includes('MONTAGEM') && tarefa.name.toUpperCase().includes('GABARITO')) {
          continue;
        }
        tarefaParaTipo.set(tarefa.id, this.mapearTarefaMacroParaTipo(tarefa.name));
      }

      // Calcula demanda por tipo de operação
      const demandaPorTipo = new Map<string, number>();

      for (const activity of activities) {
        // Filtra apenas activities ativas ou planejadas
        if (activity.status === 'Concluída' || activity.status === 'Cancelado') continue;

        // Pega a tarefa macro da activity
        const tarefaMacroId = typeof activity.macroTask === 'object' ? activity.macroTask.id : Number(activity.macroTask);
        if (!tarefaMacroId || !tarefaParaTipo.has(tarefaMacroId)) {
          // Fallback: tenta usar processo se macroTask não existir
          if (activity.process) {
            const processService = new ProcessService();
            const processos = await processService.getAll();
            const processo = processos.find((p) => p.id === (typeof activity.process === 'object' ? activity.process.id : Number(activity.process)));
            if (processo) {
              // Mapeia processo para tipo usando lógica similar
              const tipo = this.mapearTarefaMacroParaTipo(processo.name);
              const atual = demandaPorTipo.get(tipo) || 0;
              let horasEstimadas = this.calcularHorasActivity(activity);
              demandaPorTipo.set(tipo, atual + horasEstimadas);
            }
          }
          continue;
        }

        const tipoOperacao = tarefaParaTipo.get(tarefaMacroId)!;

        // Calcula horas estimadas
        let horasEstimadas = this.calcularHorasActivity(activity);

        // Acumula demanda por tipo
        const atual = demandaPorTipo.get(tipoOperacao) || 0;
        demandaPorTipo.set(tipoOperacao, atual + horasEstimadas);
      }

      // Mapeia demanda por tipo para demanda por centro
      const demandaPorCentro = new Map<string, number>();
      for (const centro of centros) {
        const demanda = demandaPorTipo.get(centro.tipoOperacao) || 0;
        demandaPorCentro.set(centro.id, demanda);
      }

      console.log('[CapacidadeService] Demanda calculada por centro:', Object.fromEntries(demandaPorCentro));
      return demandaPorCentro;
    } catch (error) {
      console.error('[CapacidadeService] Erro ao calcular demanda:', error);
      return new Map();
    }
  }

  /**
   * Calcula horas estimadas de uma activity
   */
  private calcularHorasActivity(activity: any): number {
    let horasEstimadas = 0;
    if (activity.timePerUnit && activity.quantity) {
      horasEstimadas = activity.timePerUnit * activity.quantity;
    } else if (activity.estimatedTime) {
      // Parse estimatedTime se for string como "8:30"
      const parts = activity.estimatedTime.toString().split(':');
      horasEstimadas = parseInt(parts[0]) + (parts[1] ? parseInt(parts[1]) / 60 : 0);
    }
    return horasEstimadas;
  }

  // ============================================
  // MÉTODOS PRINCIPAIS
  // ============================================

  /**
   * Gera Dashboard de Capacidade Produtiva
   */
  async gerarDashboard(request?: AnaliseCapacidadeRequest): Promise<DashboardCapacidade> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    // Período padrão: hoje até +90 dias
    const dataInicio = request?.periodoInicio || new Date().toISOString().split('T')[0];
    const dataFim = request?.periodoFim || this.addDays(new Date(), 90).toISOString().split('T')[0];

    // Calcula análise consolidada
    const analiseConsolidada = await this.calcularAnaliseConsolidada({
      periodoInicio: dataInicio,
      periodoFim: dataFim,
      tipoPeriodo: request?.tipoPeriodo || 'mensal',
      recursoIds: request?.recursoIds,
      tipoRecurso: request?.tipoRecurso,
      projetoIds: request?.projetoIds,
      apenasAtivos: request?.apenasAtivos !== undefined ? request.apenasAtivos : true,
      apenasGargalos: request?.apenasGargalos || false,
      incluirSugestoes: request?.incluirSugestoes || false,
    });

    // KPIs
    const kpis = this.calcularKPIs(analiseConsolidada);

    // Timeline (evolução semanal)
    const timeline = this.gerarTimeline(dataInicio, dataFim, analiseConsolidada);

    // Top recursos por utilização
    const recursosTopUtilizacao = analiseConsolidada.analisesPorRecurso
      .sort((a, b) => b.taxaUtilizacao - a.taxaUtilizacao)
      .slice(0, 10)
      .map((analise) => ({
        recursoId: analise.recurso.id,
        recursoNome: analise.recurso.nome,
        recursoTipo: analise.recurso.tipo,
        taxaUtilizacao: analise.taxaUtilizacao,
        horasAlocadas: analise.horasAlocadas,
        quantidadeProjetos: analise.quantidadeProjetos,
      }));

    // Recursos ociosos (< 50% utilização)
    const recursosOciosos = analiseConsolidada.analisesPorRecurso
      .filter((a) => a.taxaUtilizacao < 50)
      .sort((a, b) => a.taxaUtilizacao - b.taxaUtilizacao)
      .slice(0, 10)
      .map((analise) => ({
        recursoId: analise.recurso.id,
        recursoNome: analise.recurso.nome,
        recursoTipo: analise.recurso.tipo,
        taxaUtilizacao: analise.taxaUtilizacao,
        horasLivres: analise.horasLivres,
      }));

    // Capacidade por centro de trabalho (INTEGRAÇÃO COM DADOS REAIS)
    const centrosReais = await this.buscarCentrosReais();
    const demandaPorCentro = await this.calcularDemandaPorCentro(centrosReais, dataInicio, dataFim);

    const capacidadePorCentro = centrosReais.map((centro) => {
      const demandaTotal = demandaPorCentro.get(centro.id) || 0;
      const capacidadeTotal = centro.capacidadeTotalSemana * 4; // ~1 mês
      const taxaUtilizacao = capacidadeTotal > 0 ? (demandaTotal / capacidadeTotal) * 100 : 0;

      return {
        centroTrabalhoId: centro.id,
        centroTrabalhoNome: centro.nome,
        capacidadeTotal,
        demandaTotal,
        taxaUtilizacao,
        ehGargalo: taxaUtilizacao > 90,
      };
    });

    // Capacidade por projeto
    const projetosMap = new Map<number, { projetoId: number; projetoNome: string; horasTotais: number; recursos: Set<number> }>();

    for (const alocacao of this.mockAlocacoes) {
      const existing = projetosMap.get(alocacao.projetoId);
      if (existing) {
        existing.horasTotais += alocacao.horasAlocadas;
        existing.recursos.add(alocacao.recursoId);
      } else {
        projetosMap.set(alocacao.projetoId, {
          projetoId: alocacao.projetoId,
          projetoNome: alocacao.projetoNome,
          horasTotais: alocacao.horasAlocadas,
          recursos: new Set([alocacao.recursoId]),
        });
      }
    }

    const capacidadePorProjeto = Array.from(projetosMap.values()).map((p) => ({
      projetoId: p.projetoId,
      projetoNome: p.projetoNome,
      horasTotaisAlocadas: p.horasTotais,
      quantidadeRecursos: p.recursos.size,
      percentualCapacidadeTotal:
        analiseConsolidada.totalHorasDisponiveis > 0
          ? (p.horasTotais / analiseConsolidada.totalHorasDisponiveis) * 100
          : 0,
    }));

    return {
      dataGeracao: new Date().toISOString(),
      periodoInicio: dataInicio,
      periodoFim: dataFim,
      kpis,
      analiseConsolidada,
      timeline,
      recursosTopUtilizacao,
      recursosOciosos,
      capacidadePorCentro,
      capacidadePorProjeto,
    };
  }

  /**
   * Calcula análise consolidada de capacidade multi-projeto
   */
  async calcularAnaliseConsolidada(request: AnaliseCapacidadeRequest): Promise<AnaliseCapacidadeConsolidada> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    // Filtra recursos
    let recursos = [...this.mockRecursos];
    if (request.apenasAtivos) {
      recursos = recursos.filter((r) => r.ativo);
    }
    if (request.recursoIds && request.recursoIds.length > 0) {
      recursos = recursos.filter((r) => request.recursoIds!.includes(r.id));
    }
    if (request.tipoRecurso && request.tipoRecurso.length > 0) {
      recursos = recursos.filter((r) => request.tipoRecurso!.includes(r.tipo));
    }

    // Calcula análise por recurso individual
    const analisesPorRecurso: AnaliseCapacidadeRecurso[] = [];

    for (const recurso of recursos) {
      const analise = await this.calcularAnaliseRecurso(
        recurso,
        request.periodoInicio || new Date().toISOString().split('T')[0],
        request.periodoFim || this.addDays(new Date(), 90).toISOString().split('T')[0]
      );
      analisesPorRecurso.push(analise);
    }

    // Filtra apenas gargalos se solicitado
    const analisesFiltradas = request.apenasGargalos
      ? analisesPorRecurso.filter((a) => a.ehGargalo)
      : analisesPorRecurso;

    // Totais
    const totalRecursos = analisesFiltradas.length;
    const totalHorasDisponiveis = analisesFiltradas.reduce((sum, a) => sum + a.horasDisponiveis, 0);
    const totalHorasAlocadas = analisesFiltradas.reduce((sum, a) => sum + a.horasAlocadas, 0);
    const taxaUtilizacaoGeral = totalHorasDisponiveis > 0 ? (totalHorasAlocadas / totalHorasDisponiveis) * 100 : 0;

    // Projetos ativos (únicos)
    const projetosSet = new Set<number>();
    this.mockAlocacoes.forEach((a) => projetosSet.add(a.projetoId));
    const totalProjetos = projetosSet.size;

    // Recursos por tipo
    const recursosPorTipo: {
      tipo: TipoRecurso;
      quantidade: number;
      horasDisponiveis: number;
      horasAlocadas: number;
      taxaUtilizacao: number;
    }[] = [];

    const tiposUnicos = Array.from(new Set(analisesFiltradas.map((a) => a.recurso.tipo)));
    for (const tipo of tiposUnicos) {
      const recursosDoTipo = analisesFiltradas.filter((a) => a.recurso.tipo === tipo);
      const horasDisp = recursosDoTipo.reduce((sum, r) => sum + r.horasDisponiveis, 0);
      const horasAloc = recursosDoTipo.reduce((sum, r) => sum + r.horasAlocadas, 0);

      recursosPorTipo.push({
        tipo,
        quantidade: recursosDoTipo.length,
        horasDisponiveis: horasDisp,
        horasAlocadas: horasAloc,
        taxaUtilizacao: horasDisp > 0 ? (horasAloc / horasDisp) * 100 : 0,
      });
    }

    // Detecta conflitos
    const conflitos = this.detectarConflitos(analisesFiltradas);

    // Detecta sobrecargas em centros de trabalho
    const sobrecargas = this.detectarSobrecargas(analisesFiltradas);

    // Gargalos
    const gargalos = analisesFiltradas
      .filter((a) => a.ehGargalo)
      .map((a) => ({
        recursoId: a.recurso.id,
        recursoNome: a.recurso.nome,
        recursoTipo: a.recurso.tipo,
        taxaUtilizacao: a.taxaUtilizacao,
        horasExtrasNecessarias: Math.max(0, a.horasAlocadas - a.horasDisponiveis),
      }));

    return {
      dataAnalise: new Date().toISOString(),
      periodoInicio: request.periodoInicio || new Date().toISOString().split('T')[0],
      periodoFim: request.periodoFim || this.addDays(new Date(), 90).toISOString().split('T')[0],
      tipoPeriodo: request.tipoPeriodo || 'mensal',
      totalRecursos,
      totalProjetos,
      totalHorasDisponiveis,
      totalHorasAlocadas,
      taxaUtilizacaoGeral,
      recursosPorTipo,
      analisesPorRecurso: analisesFiltradas,
      centrosTrabalho: this.mockCentrosTrabalho,
      sobrecargas,
      conflitos,
      gargalos,
    };
  }

  /**
   * Calcula análise de capacidade para um recurso individual
   */
  private async calcularAnaliseRecurso(
    recurso: RecursoProdutivo,
    periodoInicio: string,
    periodoFim: string
  ): Promise<AnaliseCapacidadeRecurso> {
    // Busca alocações do recurso no período
    const alocacoesRecurso = this.mockAlocacoes.filter((a) => a.recursoId === recurso.id);

    // Calcula horas alocadas
    const horasAlocadas = alocacoesRecurso.reduce((sum, a) => sum + a.horasAlocadas, 0);

    // Horas disponíveis (aproximado para 1 mês - 4 semanas)
    const horasDisponiveis = recurso.horasDisponiveisMes;

    // Horas livres
    const horasLivres = Math.max(0, horasDisponiveis - horasAlocadas);

    // Taxa de utilização
    const taxaUtilizacao = horasDisponiveis > 0 ? (horasAlocadas / horasDisponiveis) * 100 : 0;

    // É gargalo?
    const ehGargalo = taxaUtilizacao > 90;

    // Projetos únicos
    const projetosSet = new Set(alocacoesRecurso.map((a) => a.projetoId));
    const quantidadeProjetos = projetosSet.size;

    // Demanda por período (simplificado - semanal)
    const demandaPorPeriodo: DemandaRecurso[] = this.calcularDemandaSemanal(recurso, alocacoesRecurso, periodoInicio, periodoFim);

    // Conflitos (alocação > disponível no mesmo período)
    const conflitos: ConflitoAlocacao[] = [];
    for (const demanda of demandaPorPeriodo) {
      if (demanda.ehGargalo && demanda.alocacoes.length > 1) {
        // Potencial conflito
        const conflito: ConflitoAlocacao = {
          id: `conflito-${recurso.id}-${demanda.periodoInicio}`,
          recursoId: recurso.id,
          recursoNome: recurso.nome,
          recursoTipo: recurso.tipo,
          periodoInicio: demanda.periodoInicio,
          periodoFim: demanda.periodoFim,
          horasDisponiveis: demanda.horasDisponiveis,
          horasDemandadas: demanda.horasAlocadas,
          deficit: demanda.horasExtras,
          taxaSobrecarga: demanda.taxaUtilizacao - 100,
          projetosEmConflito: demanda.projetosDemandantes.map((p) => ({
            projetoId: p.projetoId,
            projetoNome: p.projetoNome,
            tarefaCronogramaId: undefined,
            tarefaDescricao: '',
            horasDemandadas: p.horasDemandadas,
            prioridade: this.calcularPrioridadeConflito(p.horasDemandadas, demanda.horasAlocadas),
          })),
          gravidade: this.calcularGravidadeConflito(demanda.taxaUtilizacao),
          sugestaoResolucao: this.sugerirResolucaoConflito(demanda.taxaUtilizacao, demanda.horasExtras),
          dataDeteccao: new Date().toISOString(),
          status: 'pendente',
        };
        conflitos.push(conflito);
      }
    }

    // Sugestões
    const sugestoes: string[] = [];
    if (ehGargalo) {
      sugestoes.push(`Recurso sobrecarregado (${taxaUtilizacao.toFixed(1)}%). Considere contratar temporário ou realocar tarefas.`);
    } else if (taxaUtilizacao < 50) {
      sugestoes.push(`Recurso ocioso (${taxaUtilizacao.toFixed(1)}%). Pode ser alocado em outros projetos.`);
    }
    if (conflitos.length > 0) {
      sugestoes.push(`${conflitos.length} conflito(s) detectado(s). Revisar alocações simultâneas.`);
    }

    return {
      recurso,
      periodoInicio,
      periodoFim,
      horasDisponiveis,
      horasAlocadas,
      horasLivres,
      taxaUtilizacao,
      ehGargalo,
      quantidadeProjetos,
      demandaPorPeriodo,
      conflitos,
      sugestoes,
    };
  }

  /**
   * Calcula demanda semanal de um recurso
   */
  private calcularDemandaSemanal(
    recurso: RecursoProdutivo,
    alocacoes: AlocacaoRecurso[],
    periodoInicio: string,
    periodoFim: string
  ): DemandaRecurso[] {
    // Simplificado: retorna 1 período mensal consolidado
    const horasDisponiveisSemana = recurso.horasDisponiveisSemana;
    const horasAlocadasTotal = alocacoes.reduce((sum, a) => sum + a.horasAlocadas, 0);
    const horasExtras = Math.max(0, horasAlocadasTotal - recurso.horasDisponiveisMes);
    const taxaUtilizacao = recurso.horasDisponiveisMes > 0 ? (horasAlocadasTotal / recurso.horasDisponiveisMes) * 100 : 0;

    // Projetos demandantes
    const projetosMap = new Map<number, { projetoId: number; projetoNome: string; horasDemandadas: number }>();
    for (const alocacao of alocacoes) {
      const existing = projetosMap.get(alocacao.projetoId);
      if (existing) {
        existing.horasDemandadas += alocacao.horasAlocadas;
      } else {
        projetosMap.set(alocacao.projetoId, {
          projetoId: alocacao.projetoId,
          projetoNome: alocacao.projetoNome,
          horasDemandadas: alocacao.horasAlocadas,
        });
      }
    }

    const projetosDemandantes = Array.from(projetosMap.values()).map((p) => ({
      ...p,
      percentualDemanda: horasAlocadasTotal > 0 ? (p.horasDemandadas / horasAlocadasTotal) * 100 : 0,
    }));

    return [
      {
        recursoId: recurso.id,
        recursoNome: recurso.nome,
        recursoTipo: recurso.tipo,
        periodoInicio,
        periodoFim,
        tipoPeriodo: 'mensal',
        horasDisponiveis: recurso.horasDisponiveisMes,
        horasAlocadas: horasAlocadasTotal,
        horasExtras,
        taxaUtilizacao,
        ehGargalo: taxaUtilizacao > 90,
        projetosDemandantes,
        alocacoes,
      },
    ];
  }

  /**
   * Detecta conflitos de alocação entre projetos
   */
  private detectarConflitos(analises: AnaliseCapacidadeRecurso[]): ConflitoAlocacao[] {
    const conflitos: ConflitoAlocacao[] = [];

    for (const analise of analises) {
      conflitos.push(...analise.conflitos);
    }

    return conflitos;
  }

  /**
   * Detecta sobrecargas em centros de trabalho
   */
  private detectarSobrecargas(analises: AnaliseCapacidadeRecurso[]): SobrecargaCentroTrabalho[] {
    const sobrecargas: SobrecargaCentroTrabalho[] = [];

    for (const centro of this.mockCentrosTrabalho) {
      const recursosCenter = analises.filter((a) => centro.recursosIds.includes(a.recurso.id));
      const capacidadeTotal = centro.capacidadeTotalSemana * 4; // ~1 mês
      const demandaTotal = recursosCenter.reduce((sum, r) => sum + r.horasAlocadas, 0);
      const taxaUtilizacao = capacidadeTotal > 0 ? (demandaTotal / capacidadeTotal) * 100 : 0;
      const ehGargalo = taxaUtilizacao > 90;

      if (ehGargalo) {
        const recursosSobrecarregados = recursosCenter
          .filter((r) => r.ehGargalo)
          .map((r) => ({
            recursoId: r.recurso.id,
            recursoNome: r.recurso.nome,
            taxaUtilizacao: r.taxaUtilizacao,
            horasExtrasNecessarias: Math.max(0, r.horasAlocadas - r.horasDisponiveis),
          }));

        // Projetos demandantes do centro
        // CORREÇÃO IMPORTANTE #4: Loop triplo aninhado - Complexidade O(n³)
        // Justificativa: Cenário comum é ~5 recursos × ~2 períodos × ~3 projetos = 30 iterações (aceitável)
        // TODO FUTURO: Se performance se tornar problema (>50 recursos, >10 projetos),
        // otimizar criando Map<projetoId, horas> único durante a análise inicial
        const projetosMap = new Map<number, { projetoId: number; projetoNome: string; horasDemandadas: number }>();
        for (const recurso of recursosCenter) {
          for (const demanda of recurso.demandaPorPeriodo) {
            for (const projeto of demanda.projetosDemandantes) {
              const existing = projetosMap.get(projeto.projetoId);
              if (existing) {
                existing.horasDemandadas += projeto.horasDemandadas;
              } else {
                projetosMap.set(projeto.projetoId, {
                  projetoId: projeto.projetoId,
                  projetoNome: projeto.projetoNome,
                  horasDemandadas: projeto.horasDemandadas,
                });
              }
            }
          }
        }

        sobrecargas.push({
          centroTrabalhoId: centro.id,
          centroTrabalhoNome: centro.nome,
          periodoInicio: recursosCenter[0]?.periodoInicio || new Date().toISOString().split('T')[0],
          periodoFim: recursosCenter[0]?.periodoFim || this.addDays(new Date(), 30).toISOString().split('T')[0],
          capacidadeTotal,
          demandaTotal,
          taxaUtilizacao,
          ehGargalo,
          recursosSobrecarregados,
          projetosDemandantes: Array.from(projetosMap.values()),
        });
      }
    }

    return sobrecargas;
  }

  /**
   * Calcula KPIs do Dashboard
   */
  private calcularKPIs(analise: AnaliseCapacidadeConsolidada): DashboardCapacidadeKPIs {
    const recursosOciosos = analise.analisesPorRecurso.filter((a) => a.taxaUtilizacao < 50).length;
    const recursosUtilizacaoIdeal = analise.analisesPorRecurso.filter(
      (a) => a.taxaUtilizacao >= 50 && a.taxaUtilizacao <= 90
    ).length;
    const recursosSobrecarregados = analise.gargalos.length;
    const percentualSobrecarregados =
      analise.totalRecursos > 0 ? (recursosSobrecarregados / analise.totalRecursos) * 100 : 0;

    const horasExtrasTotais = analise.gargalos.reduce((sum, g) => sum + g.horasExtrasNecessarias, 0);

    // Custo médio de hora extra (estimado como valorHora × 1.5)
    // CORREÇÃO CRÍTICA #1: Proteger divisão por zero com precedência correta
    const valorHoraMedio =
      analise.totalRecursos > 0
        ? analise.analisesPorRecurso.reduce((sum, a) => sum + (a.recurso.valorHora || 0), 0) / analise.totalRecursos
        : 30;
    const custoHorasExtras = horasExtrasTotais * valorHoraMedio * 1.5;

    return {
      dataAtualizacao: new Date().toISOString(),
      taxaUtilizacaoGeral: analise.taxaUtilizacaoGeral,
      quantidadeGargalos: analise.gargalos.length,
      quantidadeConflitos: analise.conflitos.length,
      horasExtrasTotais,
      custoHorasExtras,
      recursosOciosos,
      recursosUtilizacaoIdeal,
      recursosSobrecarregados,
      percentualSobrecarregados,
    };
  }

  /**
   * Gera timeline de capacidade (evolução semanal)
   */
  private gerarTimeline(
    periodoInicio: string,
    periodoFim: string,
    analise: AnaliseCapacidadeConsolidada
  ): TimelineCapacidade[] {
    // CORREÇÃO IMPORTANTE #7: Calcular semanas dinamicamente baseado no período real
    const diasPeriodo = Math.ceil(
      (new Date(periodoFim).getTime() - new Date(periodoInicio).getTime()) / (1000 * 60 * 60 * 24)
    );
    const semanasPeriodo = Math.max(1, Math.ceil(diasPeriodo / 7)); // Mínimo 1 semana

    const timeline: TimelineCapacidade[] = [];
    const horasPorSemana = semanasPeriodo > 0 ? analise.totalHorasDisponiveis / semanasPeriodo : 0;
    const horasAlocadasPorSemana = semanasPeriodo > 0 ? analise.totalHorasAlocadas / semanasPeriodo : 0;

    for (let i = 0; i < semanasPeriodo; i++) {
      const data = this.addDays(new Date(periodoInicio), i * 7).toISOString().split('T')[0];
      const taxaUtilizacao = horasPorSemana > 0 ? (horasAlocadasPorSemana / horasPorSemana) * 100 : 0;

      timeline.push({
        data,
        horasDisponiveis: horasPorSemana,
        horasAlocadas: horasAlocadasPorSemana,
        taxaUtilizacao,
        quantidadeGargalos: Math.floor(analise.gargalos.length / semanasPeriodo), // Distribuído
        quantidadeProjetos: analise.totalProjetos,
      });
    }

    return timeline;
  }

  /**
   * Simula impacto de adicionar novo projeto
   */
  async simularNovoProjeto(
    projetoNome: string,
    horasEstimadas: number,
    dataInicioPrevisao: string,
    dataFimPrevisao: string
  ): Promise<SimulacaoNovoProjeto> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    // Calcula capacidade atual
    const analiseAtual = await this.calcularAnaliseConsolidada({
      periodoInicio: dataInicioPrevisao,
      periodoFim: dataFimPrevisao,
      apenasAtivos: true,
    });

    // Simula nova demanda
    const horasDisponiveisLivres = analiseAtual.totalHorasDisponiveis - analiseAtual.totalHorasAlocadas;
    const viavel = horasEstimadas <= horasDisponiveisLivres;
    const taxaUtilizacaoResultante =
      analiseAtual.totalHorasDisponiveis > 0
        ? ((analiseAtual.totalHorasAlocadas + horasEstimadas) / analiseAtual.totalHorasDisponiveis) * 100
        : 0;

    // Gargalos criados
    const gargalosCriados = analiseAtual.analisesPorRecurso
      .filter((a) => {
        const taxaNova = ((a.horasAlocadas + horasEstimadas / analiseAtual.totalRecursos) / a.horasDisponiveis) * 100;
        return taxaNova > 90 && a.taxaUtilizacao <= 90; // Novo gargalo
      })
      .map((a) => ({
        recursoId: a.recurso.id,
        recursoNome: a.recurso.nome,
        taxaUtilizacaoAtual: a.taxaUtilizacao,
        taxaUtilizacaoFutura: ((a.horasAlocadas + horasEstimadas / analiseAtual.totalRecursos) / a.horasDisponiveis) * 100,
      }));

    // Recursos disponíveis
    const recursosDisponiveis = analiseAtual.analisesPorRecurso
      .filter((a) => a.horasLivres > 20) // Pelo menos 20h livres
      .map((a) => ({
        recursoId: a.recurso.id,
        recursoNome: a.recurso.nome,
        horasLivres: a.horasLivres,
      }));

    // Data ideal se não viável agora (+ 30 dias)
    const dataIdealInicio = viavel ? undefined : this.addDays(new Date(dataInicioPrevisao), 30).toISOString().split('T')[0];

    // Mensagem
    const mensagem = viavel
      ? `✅ VIÁVEL! Capacidade suficiente para executar o projeto "${projetoNome}" com ${horasEstimadas}h. Taxa de utilização resultante: ${taxaUtilizacaoResultante.toFixed(1)}%.`
      : `⚠️ NÃO VIÁVEL! Faltam ${(horasEstimadas - horasDisponiveisLivres).toFixed(0)}h de capacidade. Taxa de utilização ultrapassaria ${taxaUtilizacaoResultante.toFixed(1)}%. Considere iniciar em ${dataIdealInicio}.`;

    // Sugestões
    const sugestoes: string[] = [];
    if (!viavel) {
      sugestoes.push(`Postergar início para ${dataIdealInicio} quando haverá mais capacidade disponível.`);
      sugestoes.push('Considerar contratação temporária ou terceirização de parte do escopo.');
      // CORREÇÃO IMPORTANTE #6: Validar array antes de acessar
      if (gargalosCriados.length > 0 && recursosDisponiveis.length > 0) {
        sugestoes.push(`Alocar recursos ociosos: ${recursosDisponiveis.slice(0, 3).map((r) => r.recursoNome).join(', ')}.`);
      }
    } else if (taxaUtilizacaoResultante > 85) {
      sugestoes.push('Capacidade ficará crítica (>85%). Monitorar de perto e evitar atrasos.');
    }

    return {
      viavel,
      taxaUtilizacaoResultante,
      gargalosCriados,
      conflitosCriados: [], // Simplificado
      recursosDisponiveis,
      dataIdealInicio,
      mensagem,
      sugestoes,
    };
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  /**
   * Calcula prioridade de conflito baseada em participação
   */
  private calcularPrioridadeConflito(horasProjeto: number, horasTotal: number): 'critica' | 'alta' | 'media' | 'baixa' {
    const percentual = horasTotal > 0 ? (horasProjeto / horasTotal) * 100 : 0;
    if (percentual > 50) return 'critica';
    if (percentual > 30) return 'alta';
    if (percentual > 15) return 'media';
    return 'baixa';
  }

  /**
   * Calcula gravidade do conflito
   */
  private calcularGravidadeConflito(taxaUtilizacao: number): 'critica' | 'alta' | 'media' | 'baixa' {
    if (taxaUtilizacao > 150) return 'critica';
    if (taxaUtilizacao > 120) return 'alta';
    if (taxaUtilizacao > 100) return 'media';
    return 'baixa';
  }

  /**
   * Sugere resolução de conflito
   */
  private sugerirResolucaoConflito(
    taxaUtilizacao: number,
    horasExtras: number
  ): 'contratar_temporario' | 'realocar_tarefa' | 'estender_prazo' | 'dividir_recursos' | 'hora_extra' {
    if (taxaUtilizacao > 150) return 'contratar_temporario';
    if (horasExtras > 40) return 'realocar_tarefa';
    if (horasExtras > 20) return 'estender_prazo';
    if (taxaUtilizacao > 110) return 'dividir_recursos';
    return 'hora_extra';
  }

  /**
   * Adiciona dias a uma data
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

const CapacidadeProdutivaService = new CapacidadeProdutivaServiceClass();
export default CapacidadeProdutivaService;
