/**
 * FASE 4 PCP: Pipeline Projetos Service
 * Gestão de portfolio de projetos ETO (Engineer To Order)
 * Sistema: Gestor Master - GMX Soluções Industriais
 *
 * Funcionalidades:
 * - Kanban de projetos (Lead → Proposta → Vendido → Execução → Concluído)
 * - Timeline de projetos futuros vs capacidade
 * - Simulação de impacto de novos projetos
 * - Análise de viabilidade antes de aceitar propostas
 * - Integração com Propostas Comerciais
 */

import {
  ProjetoPipeline,
  StatusPipeline,
  DashboardPipeline,
  KPIsPipeline,
  TimelinePipeline,
  AnaliseCapacidadePipeline,
  FunilConversao,
  SimulacaoNovoProjeto,
  ResultadoSimulacao,
  AlternativaSimulacao,
  FiltroPipeline,
  RequestDashboardPipeline,
  ProjetoEmRisco,
  MovimentacaoPipeline,
  AnaliseViabilidadeCapacidade,
  RecomendacaoCapacidade,
} from '@/interfaces/PipelineInterface';
import CapacidadeProdutivaService from './CapacidadeProdutivaService';

// ============================================
// SERVICE CLASS
// ============================================

class PipelineProjetosServiceClass {
  private useMock = true; // IMPORTANTE: Frontend-only, mock mode ativado

  // ============================================
  // MOCK DATA - Projetos no Pipeline
  // ============================================

  private mockProjetos: ProjetoPipeline[] = [
    // LEADS (5) - Topo do funil
    {
      id: 'proj-001',
      codigo: 'LEAD-2026-001',
      nome: 'Estrutura Metálica - Galpão Logístico',
      clienteNome: 'Logística Express Ltda',
      status: 'lead',
      prioridade: 'alta',
      tipoProjeto: 'estrutura_metalica',
      dataIdentificacao: '2026-02-01',
      horasEstimadas: 800,
      pesoEstimadoKg: 25000,
      valorEstimado: 450000,
      margemEstimada: 15,
      probabilidadeFechamento: 60,
      dataInicioDesejada: '2026-04-01',
      dataFimPrevista: '2026-06-30',
      responsavel: 'João Silva',
      observacoes: 'Cliente interessado, aguardando orçamento detalhado',
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'proj-002',
      codigo: 'LEAD-2026-002',
      nome: 'Caldeiraria - Tanques de Armazenamento',
      clienteNome: 'Petroquímica Sul S.A.',
      status: 'lead',
      prioridade: 'media',
      tipoProjeto: 'caldeiraria',
      dataIdentificacao: '2026-02-03',
      horasEstimadas: 1200,
      pesoEstimadoKg: 40000,
      valorEstimado: 780000,
      margemEstimada: 18,
      probabilidadeFechamento: 40,
      dataInicioDesejada: '2026-05-01',
      dataFimPrevista: '2026-08-31',
      responsavel: 'Maria Santos',
      observacoes: 'Projeto grande, alta concorrência',
      createdAt: '2026-02-03T14:00:00Z',
      updatedAt: '2026-02-03T14:00:00Z',
    },
    {
      id: 'proj-010',
      codigo: 'LEAD-2026-003',
      nome: 'Estrutura Metálica - Passarela Industrial',
      clienteNome: 'Indústria Tech Solutions',
      status: 'lead',
      prioridade: 'baixa',
      tipoProjeto: 'estrutura_metalica',
      dataIdentificacao: '2026-02-04',
      horasEstimadas: 300,
      pesoEstimadoKg: 8000,
      valorEstimado: 180000,
      margemEstimada: 12,
      probabilidadeFechamento: 30,
      dataInicioDesejada: '2026-06-01',
      dataFimPrevista: '2026-07-15',
      responsavel: 'Carlos Pereira',
      observacoes: 'Lead frio, apenas sondagem inicial',
      createdAt: '2026-02-04T11:00:00Z',
      updatedAt: '2026-02-04T11:00:00Z',
    },
    {
      id: 'proj-011',
      codigo: 'LEAD-2026-004',
      nome: 'Caldeiraria - Tubulações Industriais',
      clienteNome: 'Metalúrgica do Vale',
      status: 'lead',
      prioridade: 'media',
      tipoProjeto: 'caldeiraria',
      dataIdentificacao: '2026-02-05',
      horasEstimadas: 600,
      pesoEstimadoKg: 20000,
      valorEstimado: 350000,
      margemEstimada: 14,
      probabilidadeFechamento: 50,
      dataInicioDesejada: '2026-05-01',
      dataFimPrevista: '2026-07-31',
      responsavel: 'Maria Santos',
      observacoes: 'Aguardando visita técnica',
      createdAt: '2026-02-05T09:00:00Z',
      updatedAt: '2026-02-05T09:00:00Z',
    },
    {
      id: 'proj-012',
      codigo: 'LEAD-2026-005',
      nome: 'Estrutura Metálica - Torre de Resfriamento',
      clienteNome: 'Energia Sustentável S.A.',
      status: 'lead',
      prioridade: 'alta',
      tipoProjeto: 'estrutura_metalica',
      dataIdentificacao: '2026-02-06',
      horasEstimadas: 950,
      pesoEstimadoKg: 32000,
      valorEstimado: 580000,
      margemEstimada: 16,
      probabilidadeFechamento: 70,
      dataInicioDesejada: '2026-04-15',
      dataFimPrevista: '2026-08-30',
      responsavel: 'João Silva',
      observacoes: 'Cliente com histórico positivo, alta chance',
      createdAt: '2026-02-06T14:00:00Z',
      updatedAt: '2026-02-06T14:00:00Z',
    },

    // PROPOSTAS (3) - Convertidas de leads
    {
      id: 'proj-004',
      codigo: 'PROP-2026-001',
      nome: 'Estrutura Metálica - Plataforma de Acesso',
      clienteNome: 'Mineração Norte S.A.',
      status: 'proposta',
      prioridade: 'alta',
      tipoProjeto: 'estrutura_metalica',
      dataIdentificacao: '2026-01-20',
      dataProposta: '2026-01-28',
      horasEstimadas: 600,
      pesoEstimadoKg: 18000,
      valorEstimado: 340000,
      margemEstimada: 14,
      probabilidadeFechamento: 75,
      dataInicioDesejada: '2026-03-15',
      dataFimPrevista: '2026-05-31',
      propostaId: 101,
      orcamentoId: 'orc-prop-001',
      responsavel: 'Carlos Pereira',
      observacoes: 'Proposta enviada, aguardando resposta',
      createdAt: '2026-01-20T11:00:00Z',
      updatedAt: '2026-01-28T15:00:00Z',
    },
    {
      id: 'proj-003',
      codigo: 'PROP-2026-003',
      nome: 'Estrutura de Cobertura Industrial',
      clienteNome: 'Indústria Moderna Ltda',
      status: 'proposta',
      prioridade: 'media',
      tipoProjeto: 'estrutura_metalica',
      dataIdentificacao: '2026-01-12',
      dataProposta: '2026-01-26',
      horasEstimadas: 500,
      pesoEstimadoKg: 15000,
      valorEstimado: 280000,
      margemEstimada: 12,
      probabilidadeFechamento: 65,
      dataInicioDesejada: '2026-06-01',
      dataFimPrevista: '2026-08-15',
      propostaId: 108,
      orcamentoId: 'orc-prop-003',
      responsavel: 'João Silva',
      observacoes: 'Proposta enviada. Cliente avaliando prazo.',
      createdAt: '2026-01-12T09:00:00Z',
      updatedAt: '2026-01-26T11:00:00Z',
    },
    {
      id: 'proj-005',
      codigo: 'PROP-2026-002',
      nome: 'Caldeiraria - Trocadores de Calor',
      clienteNome: 'Indústria Química XYZ',
      status: 'negociacao',
      prioridade: 'critica',
      tipoProjeto: 'caldeiraria',
      dataIdentificacao: '2026-01-15',
      dataProposta: '2026-01-25',
      horasEstimadas: 900,
      pesoEstimadoKg: 30000,
      valorEstimado: 620000,
      margemEstimada: 16,
      probabilidadeFechamento: 85,
      dataInicioDesejada: '2026-03-01',
      dataFimPrevista: '2026-06-15',
      propostaId: 102,
      orcamentoId: 'orc-prop-002',
      responsavel: 'Maria Santos',
      observacoes: 'Negociando prazo de pagamento',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-02-02T14:00:00Z',
    },

    // VENDIDOS (2) - Aguardando execução
    {
      id: 'proj-006',
      codigo: 'M-15708',
      nome: 'Estrutura Metálica - Mezanino Industrial',
      clienteNome: 'Distribuidora ABC Ltda',
      status: 'vendido',
      prioridade: 'alta',
      tipoProjeto: 'estrutura_metalica',
      dataIdentificacao: '2026-01-10',
      dataProposta: '2026-01-18',
      dataVenda: '2026-01-30',
      dataInicioPlanejada: '2026-02-15',
      dataFimPrevista: '2026-04-30',
      horasEstimadas: 520,
      pesoEstimadoKg: 16000,
      valorEstimado: 300000,
      valorVendido: 295000,
      margemEstimada: 13,
      probabilidadeFechamento: 100,
      propostaId: 103,
      orcamentoId: 'orc-003',
      responsavel: 'João Silva',
      observacoes: 'Vendido! Aguardando liberação de recursos para início',
      analiseCapacidade: {
        viavel: true,
        taxaUtilizacaoResultante: 78,
        mensagem: 'Projeto viável. Capacidade OK para início em 15/02.',
        recomendacoes: [],
      },
      createdAt: '2026-01-10T09:00:00Z',
      updatedAt: '2026-01-30T16:00:00Z',
    },
    {
      id: 'proj-007',
      codigo: 'M-15709',
      nome: 'Caldeiraria - Tubulações Especiais',
      clienteNome: 'Petroquímica Sul S.A.',
      status: 'vendido',
      prioridade: 'media',
      tipoProjeto: 'caldeiraria',
      dataIdentificacao: '2025-12-20',
      dataProposta: '2026-01-05',
      dataVenda: '2026-01-20',
      dataInicioPlanejada: '2026-03-01',
      dataFimPrevista: '2026-05-15',
      horasEstimadas: 700,
      pesoEstimadoKg: 22000,
      valorEstimado: 420000,
      valorVendido: 415000,
      margemEstimada: 15,
      probabilidadeFechamento: 100,
      propostaId: 104,
      orcamentoId: 'orc-004',
      responsavel: 'Carlos Pereira',
      observacoes: 'Vendido. Início planejado para março.',
      analiseCapacidade: {
        viavel: true,
        taxaUtilizacaoResultante: 82,
        mensagem: 'Viável com início em março.',
        recomendacoes: [],
      },
      createdAt: '2025-12-20T10:00:00Z',
      updatedAt: '2026-01-20T14:00:00Z',
    },

    // EM EXECUÇÃO (2) - Já existentes do sistema
    {
      id: 'proj-008',
      codigo: 'M-15706',
      nome: 'Estrutura Metálica - Galpão Industrial ABC',
      clienteNome: 'ABC Ltda',
      status: 'em_execucao',
      prioridade: 'alta',
      tipoProjeto: 'estrutura_metalica',
      dataIdentificacao: '2025-11-15',
      dataProposta: '2025-11-30',
      dataVenda: '2025-12-15',
      dataInicioReal: '2026-01-25',
      dataFimPrevista: '2026-03-15',
      horasEstimadas: 1300,
      horasRealizadas: 195, // 15% progresso
      pesoEstimadoKg: 15000,
      valorEstimado: 480000,
      valorVendido: 475000,
      margemEstimada: 14,
      probabilidadeFechamento: 100,
      propostaId: 100,
      orcamentoId: 'orc-001',
      obraId: 1,
      responsavel: 'João Silva',
      observacoes: 'Em execução conforme planejado',
      createdAt: '2025-11-15T10:00:00Z',
      updatedAt: '2026-02-04T10:00:00Z',
    },
    {
      id: 'proj-009',
      codigo: 'M-15707',
      nome: 'Estrutura de Cobertura - XYZ Ind.',
      clienteNome: 'XYZ Indústria',
      status: 'em_execucao',
      prioridade: 'media',
      tipoProjeto: 'estrutura_metalica',
      dataIdentificacao: '2025-12-01',
      dataProposta: '2025-12-10',
      dataVenda: '2026-01-05',
      dataInicioReal: '2026-02-01',
      dataFimPrevista: '2026-03-20',
      horasEstimadas: 800,
      horasRealizadas: 0, // Recém iniciado
      pesoEstimadoKg: 8000,
      valorEstimado: 370000,
      valorVendido: 370000,
      margemEstimada: 13,
      probabilidadeFechamento: 100,
      propostaId: 105,
      orcamentoId: 'orc-002',
      obraId: 2,
      responsavel: 'Maria Santos',
      observacoes: 'Iniciado recentemente',
      createdAt: '2025-12-01T09:00:00Z',
      updatedAt: '2026-02-01T08:00:00Z',
    },

    // CONCLUÍDOS (1)
    {
      id: 'proj-010',
      codigo: 'M-15705',
      nome: 'Caldeiraria - Silos de Armazenamento',
      clienteNome: 'Agrícola Sul Ltda',
      status: 'concluido',
      prioridade: 'media',
      tipoProjeto: 'caldeiraria',
      dataIdentificacao: '2025-10-01',
      dataProposta: '2025-10-15',
      dataVenda: '2025-11-01',
      dataInicioReal: '2025-11-15',
      dataFimReal: '2026-01-30',
      dataFimPrevista: '2026-01-31',
      horasEstimadas: 650,
      horasRealizadas: 680, // 4.6% acima do estimado
      pesoEstimadoKg: 20000,
      valorEstimado: 390000,
      valorVendido: 390000,
      margemEstimada: 14,
      probabilidadeFechamento: 100,
      propostaId: 99,
      orcamentoId: 'orc-concluido-001',
      obraId: 10,
      responsavel: 'Carlos Pereira',
      observacoes: 'Concluído com sucesso. Cliente satisfeito.',
      createdAt: '2025-10-01T10:00:00Z',
      updatedAt: '2026-01-30T17:00:00Z',
    },
  ];

  // ============================================
  // MÉTODOS PRINCIPAIS
  // ============================================

  /**
   * Gera dashboard completo do pipeline
   */
  async gerarDashboard(request?: RequestDashboardPipeline): Promise<DashboardPipeline> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    // Filtrar projetos
    const projetosFiltrados = this.aplicarFiltros(this.mockProjetos, request?.filtro);

    // Calcular KPIs
    const kpis = this.calcularKPIs(projetosFiltrados);

    // Gerar timeline futura
    const timelineFutura = await this.gerarTimelineFutura(projetosFiltrados);

    // Análise de capacidade futura
    const analiseCapacidadeFutura = await this.analisarCapacidadeFutura(projetosFiltrados);

    // Funil de conversão
    const funil = this.calcularFunilConversao(projetosFiltrados);

    return {
      kpis,
      projetos: projetosFiltrados,
      timelineFutura,
      analiseCapacidadeFutura,
      funil,
    };
  }

  /**
   * Simula impacto de aceitar um novo projeto
   */
  async simularNovoProjeto(simulacao: SimulacaoNovoProjeto): Promise<ResultadoSimulacao> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    // Análise de capacidade atual
    const analiseAtual = await CapacidadeProdutivaService.gerarDashboard();
    const taxaUtilizacaoAtual = analiseAtual.kpis.taxaUtilizacaoGeral;

    // Calcular impacto do novo projeto
    const horasDisponiveisPeriodo = this.calcularHorasDisponiveisPeriodo(
      simulacao.dataInicioDesejada,
      simulacao.dataFimDesejada
    );

    const horasJaAlocadas = this.calcularHorasAlocadasPeriodo(
      simulacao.dataInicioDesejada,
      simulacao.dataFimDesejada
    );

    const horasTotais = horasJaAlocadas + simulacao.horasEstimadas;
    const taxaUtilizacaoComNovo = horasDisponiveisPeriodo > 0
      ? (horasTotais / horasDisponiveisPeriodo) * 100
      : 0;

    const impacto = taxaUtilizacaoComNovo - taxaUtilizacaoAtual;
    const viavel = taxaUtilizacaoComNovo <= 90;

    // Gerar mensagem
    let mensagem: string;
    if (viavel) {
      mensagem = `✅ PROJETO VIÁVEL: Taxa de utilização ficaria em ${taxaUtilizacaoComNovo.toFixed(1)}% (dentro do limite saudável de 90%).`;
    } else {
      mensagem = `❌ PROJETO NÃO VIÁVEL: Taxa de utilização ficaria em ${taxaUtilizacaoComNovo.toFixed(1)}% (SOBRECARGA de ${(taxaUtilizacaoComNovo - 90).toFixed(1)}% acima do limite).`;
    }

    // Gerar alternativas se não viável
    const alternativas: AlternativaSimulacao[] = [];
    if (!viavel) {
      // Alternativa 1: Postergar início
      const dataIdeal = this.calcularDataIdealInicio(simulacao.horasEstimadas, 90);
      alternativas.push({
        tipo: 'postergar',
        descricao: `Postergar início para ${dataIdeal} quando haverá mais capacidade disponível`,
        viavel: true,
        impactoCapacidade: 85, // Estimativa
      });

      // Alternativa 2: Contratar
      const pessoasNecessarias = Math.ceil((taxaUtilizacaoComNovo - 90) / 10);
      alternativas.push({
        tipo: 'contratar',
        descricao: `Contratar ${pessoasNecessarias} colaborador(es) temporário(s)`,
        viavel: true,
        custoEstimado: pessoasNecessarias * 8000, // R$ 8k/mês por pessoa (estimativa)
        impactoCapacidade: 75,
      });

      // Alternativa 3: Subcontratar
      const horasSubcontratar = (taxaUtilizacaoComNovo - 90) * horasDisponiveisPeriodo / 100;
      alternativas.push({
        tipo: 'subcontratar',
        descricao: `Subcontratar ${Math.ceil(horasSubcontratar)} horas de serviço`,
        viavel: true,
        custoEstimado: horasSubcontratar * 120, // R$ 120/hora (estimativa)
        impactoCapacidade: 88,
      });
    }

    return {
      viavel,
      taxaUtilizacaoAtual,
      taxaUtilizacaoComNovo,
      impacto,
      mensagem,
      dataIdealInicio: viavel ? undefined : this.calcularDataIdealInicio(simulacao.horasEstimadas, 90),
      alternativas,
    };
  }

  /**
   * Move projeto para outro estágio do pipeline
   */
  async moverProjeto(
    projetoId: string,
    novoStatus: StatusPipeline,
    observacao?: string
  ): Promise<MovimentacaoPipeline> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    const projeto = this.mockProjetos.find(p => p.id === projetoId);
    if (!projeto) {
      throw new Error(`Projeto ${projetoId} não encontrado`);
    }

    const statusOrigem = projeto.status;

    // Atualizar projeto
    projeto.status = novoStatus;
    projeto.updatedAt = new Date().toISOString();

    // Atualizar datas conforme status
    if (novoStatus === 'proposta' && !projeto.dataProposta) {
      projeto.dataProposta = new Date().toISOString();
    } else if (novoStatus === 'vendido' && !projeto.dataVenda) {
      projeto.dataVenda = new Date().toISOString();
      projeto.probabilidadeFechamento = 100;
    } else if (novoStatus === 'em_execucao' && !projeto.dataInicioReal) {
      projeto.dataInicioReal = new Date().toISOString();
    } else if ((novoStatus === 'concluido' || novoStatus === 'cancelado') && !projeto.dataFimReal) {
      projeto.dataFimReal = new Date().toISOString();
    }

    // Registrar movimentação
    const movimentacao: MovimentacaoPipeline = {
      projetoId,
      statusOrigem,
      statusDestino: novoStatus,
      data: new Date().toISOString(),
      observacao,
    };

    return movimentacao;
  }

  /**
   * Busca projeto por ID
   */
  async getProjetoById(projetoId: string): Promise<ProjetoPipeline | null> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    return this.mockProjetos.find(p => p.id === projetoId) || null;
  }

  /**
   * Lista todos os projetos (com filtro opcional)
   */
  async getAllProjetos(filtro?: FiltroPipeline): Promise<ProjetoPipeline[]> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    return this.aplicarFiltros(this.mockProjetos, filtro);
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  private calcularKPIs(projetos: ProjetoPipeline[]): KPIsPipeline {
    // Contagens por status
    const totalLeads = projetos.filter(p => p.status === 'lead').length;
    const totalPropostas = projetos.filter(p => p.status === 'proposta' || p.status === 'negociacao').length;
    const totalVendidos = projetos.filter(p => p.status === 'vendido').length;
    const totalEmExecucao = projetos.filter(p => p.status === 'em_execucao').length;
    const totalConcluidos = projetos.filter(p => p.status === 'concluido').length;
    const totalCancelados = projetos.filter(p => p.status === 'cancelado' || p.status === 'perdido').length;

    // Valores
    const valorTotalPipeline = projetos
      .filter(p => ['lead', 'proposta', 'negociacao', 'vendido'].includes(p.status))
      .reduce((sum, p) => {
        const prob = (p.probabilidadeFechamento || 50) / 100;
        return sum + (p.valorEstimado * prob);
      }, 0);

    const valorVendidoAguardando = projetos
      .filter(p => p.status === 'vendido')
      .reduce((sum, p) => sum + (p.valorVendido || p.valorEstimado), 0);

    const valorEmExecucao = projetos
      .filter(p => p.status === 'em_execucao')
      .reduce((sum, p) => sum + (p.valorVendido || p.valorEstimado), 0);

    // Taxas de conversão
    const totalPropostasHistorico = projetos.filter(p =>
      ['proposta', 'negociacao', 'vendido', 'em_execucao', 'concluido', 'perdido'].includes(p.status)
    ).length;
    const totalVendasHistorico = projetos.filter(p =>
      ['vendido', 'em_execucao', 'concluido'].includes(p.status)
    ).length;
    const taxaConversaoPropostaVenda = totalPropostasHistorico > 0
      ? (totalVendasHistorico / totalPropostasHistorico) * 100
      : 0;

    const totalLeadsHistorico = projetos.length;
    const taxaConversaoLeadProposta = totalLeadsHistorico > 0
      ? (totalPropostasHistorico / totalLeadsHistorico) * 100
      : 0;

    // Capacidade
    const projetosAtivos = projetos.filter(p =>
      ['vendido', 'em_execucao'].includes(p.status)
    );
    const horasTotaisEmPipeline = projetosAtivos.reduce((sum, p) => sum + p.horasEstimadas, 0);

    // Estimativa simplificada de capacidade (3 meses)
    const capacidadeDisponivel = 45 * 12 * 10; // 45h/semana × 12 semanas × 10 pessoas (mock)
    const capacidadeUtilizada = horasTotaisEmPipeline;
    const taxaOcupacaoFutura = capacidadeDisponivel > 0
      ? (capacidadeUtilizada / capacidadeDisponivel) * 100
      : 0;

    return {
      totalLeads,
      totalPropostas,
      totalVendidos,
      totalEmExecucao,
      totalConcluidos,
      totalCancelados,
      valorTotalPipeline,
      valorVendidoAguardando,
      valorEmExecucao,
      taxaConversaoPropostaVenda,
      taxaConversaoLeadProposta,
      horasTotaisEmPipeline,
      capacidadeDisponivel,
      capacidadeUtilizada,
      taxaOcupacaoFutura,
    };
  }

  private async gerarTimelineFutura(projetos: ProjetoPipeline[]): Promise<TimelinePipeline[]> {
    const timeline: TimelinePipeline[] = [];
    const hoje = new Date();

    // Próximos 6 meses
    for (let i = 0; i < 6; i++) {
      const mes = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const mesStr = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`;

      // Projetos que estarão ativos neste mês
      const projetosDoMes = projetos.filter(p => {
        if (!['vendido', 'em_execucao'].includes(p.status)) return false;

        const inicio = new Date(p.dataInicioPlanejada || p.dataInicioReal || '2026-01-01');
        const fim = new Date(p.dataFimPrevista || '2026-12-31');

        return inicio <= new Date(mes.getFullYear(), mes.getMonth() + 1, 0) &&
               fim >= new Date(mes.getFullYear(), mes.getMonth(), 1);
      });

      const horasAlocadas = projetosDoMes.reduce((sum, p) => {
        // Distribuir horas uniformemente ao longo do projeto
        const inicio = new Date(p.dataInicioPlanejada || p.dataInicioReal || '2026-01-01');
        const fim = new Date(p.dataFimPrevista || '2026-12-31');
        const mesesDuracao = Math.max(1, (fim.getTime() - inicio.getTime()) / (30 * 24 * 60 * 60 * 1000));
        const horasPorMes = p.horasEstimadas / mesesDuracao;
        return sum + horasPorMes;
      }, 0);

      // Capacidade disponível baseada em CCT Metalúrgicos
      // 186h/mês por pessoa (44h/semana × dias úteis médios, já descontados feriados)
      const HORAS_MES_POR_PESSOA = 186;

      // Simular variação de equipe: meses 2 e 4 com menos pessoas (gargalo)
      const pessoasDisponiveis = i === 2 || i === 4 ? 8 : 10;
      const capacidadeDisponivel = HORAS_MES_POR_PESSOA * pessoasDisponiveis;

      // Simular SOBRECARGA CRÍTICA em Março (i === 2)
      // Forçar capacidade necessária = disponível + 450h para evidenciar problema
      let horasNecessarias: number;
      if (i === 2) {
        // MARÇO: Sobrecarga de 450h (25% acima da capacidade)
        horasNecessarias = capacidadeDisponivel + 450;
      } else if (i === 4) {
        // MAIO: Gargalo moderado
        horasNecessarias = horasAlocadas * 1.25;
      } else {
        horasNecessarias = horasAlocadas;
      }

      const taxaUtilizacao = capacidadeDisponivel > 0
        ? (horasNecessarias / capacidadeDisponivel) * 100
        : 0;

      timeline.push({
        mes: mesStr,
        projetos: projetosDoMes.map(p => ({
          projetoId: p.id,
          nome: p.nome,
          status: p.status,
          horasAlocadas: p.horasEstimadas / Math.max(1,
            (new Date(p.dataFimPrevista || '2026-12-31').getTime() -
             new Date(p.dataInicioPlanejada || p.dataInicioReal || '2026-01-01').getTime()) /
            (30 * 24 * 60 * 60 * 1000)
          ),
        })),
        capacidadeDisponivel,
        capacidadeNecessaria: horasNecessarias,
        taxaUtilizacao,
        ehGargalo: taxaUtilizacao > 90,
      });
    }

    return timeline;
  }

  private async analisarCapacidadeFutura(projetos: ProjetoPipeline[]): Promise<AnaliseCapacidadePipeline> {
    const hoje = new Date();
    const periodoInicio = hoje.toISOString().split('T')[0];
    const periodoFim = new Date(hoje.getFullYear(), hoje.getMonth() + 6, 0).toISOString().split('T')[0];

    // Projetos ativos no período
    const projetosAtivos = projetos.filter(p => ['vendido', 'em_execucao'].includes(p.status));

    const capacidadeTotalPeriodo = 45 * 4 * 6 * 10; // 45h/sem × 4 sem/mês × 6 meses × 10 pessoas
    const demandaTotalPipeline = projetosAtivos.reduce((sum, p) => sum + p.horasEstimadas, 0);
    const folga = capacidadeTotalPeriodo - demandaTotalPipeline;
    const taxaUtilizacao = capacidadeTotalPeriodo > 0
      ? (demandaTotalPipeline / capacidadeTotalPeriodo) * 100
      : 0;

    // Identificar meses com gargalo
    const timeline = await this.gerarTimelineFutura(projetos);
    const mesesComGargalo = timeline
      .filter(t => t.ehGargalo)
      .map(t => t.mes);

    // Projetos em risco
    const projetosEmRisco: ProjetoEmRisco[] = [];
    if (taxaUtilizacao > 90) {
      const projetosVendidos = projetos.filter(p => p.status === 'vendido');
      projetosVendidos.forEach(p => {
        projetosEmRisco.push({
          projetoId: p.id,
          nome: p.nome,
          motivo: 'Capacidade insuficiente no período planejado',
          impacto: 'alto',
          sugestoes: [
            'Postergar início para após pico de demanda',
            'Contratar equipe temporária',
            'Subcontratar parte do escopo',
          ],
        });
      });
    }

    return {
      periodoInicio,
      periodoFim,
      capacidadeTotalPeriodo,
      demandaTotalPipeline,
      folga,
      taxaUtilizacao,
      mesesComGargalo,
      projetosEmRisco,
    };
  }

  private calcularFunilConversao(projetos: ProjetoPipeline[]): FunilConversao {
    const leads = projetos.filter(p => p.status === 'lead').length;
    const propostas = projetos.filter(p => ['proposta', 'negociacao'].includes(p.status)).length;
    const vendidos = projetos.filter(p => p.status === 'vendido').length;
    const emExecucao = projetos.filter(p => p.status === 'em_execucao').length;
    const concluidos = projetos.filter(p => p.status === 'concluido').length;

    const totalLeads = projetos.length;
    const totalPropostas = projetos.filter(p =>
      ['proposta', 'negociacao', 'vendido', 'em_execucao', 'concluido', 'perdido'].includes(p.status)
    ).length;
    const totalVendidos = projetos.filter(p =>
      ['vendido', 'em_execucao', 'concluido'].includes(p.status)
    ).length;
    const totalEmExecucao = projetos.filter(p =>
      ['em_execucao', 'concluido'].includes(p.status)
    ).length;
    const totalConcluidos = concluidos;

    return {
      leads,
      propostas,
      vendidos,
      emExecucao,
      concluidos,
      conversaoLeadProposta: totalLeads > 0 ? (totalPropostas / totalLeads) * 100 : 0,
      conversaoPropostaVenda: totalPropostas > 0 ? (totalVendidos / totalPropostas) * 100 : 0,
      conversaoVendaExecucao: totalVendidos > 0 ? (totalEmExecucao / totalVendidos) * 100 : 0,
      conversaoExecucaoConclusao: totalEmExecucao > 0 ? (totalConcluidos / totalEmExecucao) * 100 : 0,
    };
  }

  private aplicarFiltros(projetos: ProjetoPipeline[], filtro?: FiltroPipeline): ProjetoPipeline[] {
    if (!filtro) return projetos;

    return projetos.filter(p => {
      if (filtro.status && !filtro.status.includes(p.status)) return false;
      if (filtro.prioridade && !filtro.prioridade.includes(p.prioridade)) return false;
      if (filtro.tipoProjeto && !filtro.tipoProjeto.includes(p.tipoProjeto)) return false;
      if (filtro.clienteId && p.clienteId !== filtro.clienteId) return false;
      if (filtro.responsavel && p.responsavel !== filtro.responsavel) return false;
      if (filtro.valorMin && p.valorEstimado < filtro.valorMin) return false;
      if (filtro.valorMax && p.valorEstimado > filtro.valorMax) return false;
      if (filtro.probabilidadeMin && (p.probabilidadeFechamento || 0) < filtro.probabilidadeMin) return false;

      return true;
    });
  }

  private calcularHorasDisponiveisPeriodo(dataInicio: string, dataFim: string): number {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diasUteis = Math.max(1, (fim.getTime() - inicio.getTime()) / (24 * 60 * 60 * 1000) / 7 * 5);
    const horasPorDia = 9;
    const pessoasDisponiveis = 10; // Mock
    return diasUteis * horasPorDia * pessoasDisponiveis;
  }

  private calcularHorasAlocadasPeriodo(dataInicio: string, dataFim: string): number {
    const projetosAtivos = this.mockProjetos.filter(p =>
      ['vendido', 'em_execucao'].includes(p.status)
    );

    // Simplificação: soma horas de todos os projetos no período
    return projetosAtivos.reduce((sum, p) => sum + p.horasEstimadas, 0) / 3; // Distribuído em 3 meses
  }

  private calcularDataIdealInicio(horasNecessarias: number, taxaMaxima: number): string {
    // Simplificação: postergar 2 meses
    const hoje = new Date();
    const dataIdeal = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 1);
    return dataIdeal.toISOString().split('T')[0];
  }
}

// Singleton export
const PipelineProjetosService = new PipelineProjetosServiceClass();
export default PipelineProjetosService;
