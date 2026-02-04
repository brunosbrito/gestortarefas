import {
  MetaSMART,
  CreateMetaSMARTDTO,
  MilestoneMeta,
  RevisaoMeta,
  AprovacaoDTO,
} from '@/interfaces/GestaoProcessosInterfaces';

/**
 * Service para gerenciamento de Metas SMART
 *
 * Funcionalidades:
 * - CRUD completo
 * - Sistema de milestones (marcos intermediários)
 * - Revisões periódicas com tracking de progresso
 * - Cálculo automático de progresso
 * - Workflow de aprovação
 * - Linking opcional com Desdobramento
 * - Mock mode para desenvolvimento
 */
class MetaSMARTService {
  private useMock = true; // TODO: Alterar para false quando backend estiver pronto
  private mockData: MetaSMART[] = [];
  private nextId = 1;
  private nextMilestoneId = 1;
  private nextRevisaoId = 1;

  constructor() {
    if (this.useMock) {
      this.initializeMockData();
    }
  }

  /**
   * Calcula progresso geral baseado nos milestones
   */
  private calcularProgresso(milestones: MilestoneMeta[]): number {
    if (milestones.length === 0) return 0;

    const completados = milestones.filter(
      (m) => m.status === 'concluida' || m.status === 'verificada'
    ).length;

    return Math.round((completados / milestones.length) * 100);
  }

  /**
   * Gera código único para a meta
   */
  private gerarCodigo(): string {
    const ano = new Date().getFullYear();
    const numero = String(this.nextId).padStart(3, '0');
    return `GP-META-${ano}-${numero}`;
  }

  /**
   * Inicializa dados mock
   */
  private initializeMockData() {
    const mockMetas: Partial<MetaSMART>[] = [
      {
        titulo: 'Reduzir Índice de Retrabalho em Soldagem',
        descricao: 'Meta para reduzir retrabalho de 15% para 5% em 3 meses',
        tipoVinculacao: 'obra',
        obraId: '1',
        obraNome: 'Torre Eólica - Bahia',
        meta: 'Reduzir o índice de retrabalho em soldas de 15% para 5% em 3 meses',
        contexto:
          'Após análise de desdobramento, identificou-se falta de treinamento como causa raiz',
        criterios: [
          {
            criterio: 'specific',
            atendido: true,
            descricao:
              'Específico: Reduzir retrabalho em soldas estruturais de 15% para 5% no setor de produção',
            evidencia: 'Meta clara e bem definida com valores e escopo delimitado',
          },
          {
            criterio: 'measurable',
            atendido: true,
            descricao:
              'Mensurável: Percentual de retrabalho medido através de inspeções de qualidade',
            evidencia: 'Indicador já existe no sistema de qualidade',
          },
          {
            criterio: 'attainable',
            atendido: true,
            descricao:
              'Atingível: Com treinamento adequado e manutenção de equipamentos é possível atingir',
            evidencia: 'Benchmark de outras obras mostra redução similar após capacitação',
          },
          {
            criterio: 'relevant',
            atendido: true,
            descricao:
              'Relevante: Alinhado com objetivo estratégico de reduzir custos e melhorar prazos',
            evidencia: 'Priorizado como crítico na matriz GUT',
          },
          {
            criterio: 'timeBound',
            atendido: true,
            descricao: 'Temporal: Prazo de 3 meses (90 dias) bem definido',
            evidencia: 'Data início e fim estabelecidas',
          },
        ],
        especifico: {
          oQue: 'Reduzir índice de retrabalho em soldas estruturais de 15% para 5%',
          quem: 'Equipe de soldagem (12 colaboradores) e gestor de produção',
          onde: 'Setor de soldagem - Planta Bahia',
        },
        mensuravel: {
          indicador: 'Percentual de retrabalho em soldas',
          unidadeMedida: '%',
          valorAtual: 15,
          valorMeta: 5,
          formaAcompanhamento: 'Inspeções de qualidade semanais com registro no sistema',
        },
        atingivel: {
          recursos: [
            'Orçamento aprovado: R$ 16.000',
            'Instrutor certificado contratado',
            'Equipamentos disponíveis para treinamento',
            'Sala de treinamento reservada',
          ],
          viabilidade:
            'Meta é atingível considerando que outras obras alcançaram redução de 12% para 3% após treinamento similar',
          limitacoes: 'Depende de disponibilidade da equipe para treinamento (100h total)',
        },
        relevante: {
          alinhamentoEstrategico:
            'Alinhado com objetivo estratégico de reduzir custos operacionais em 20% no ano',
          beneficios: [
            'Redução de custos: economia estimada de R$ 45.000/mês',
            'Melhoria de prazos: ganho de 2-3 dias/semana',
            'Satisfação do cliente: entrega no prazo',
            'Motivação da equipe: menos retrabalho',
          ],
          impacto: 'Impacto direto na lucratividade do projeto e renovação de contratos',
        },
        temporal: {
          dataInicio: new Date().toISOString().split('T')[0],
          dataFim: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          milestones: [
            {
              id: `milestone-${this.nextMilestoneId++}`,
              descricao: 'Contratar instrutor e preparar material',
              dataPrevisao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              dataConclusao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              status: 'concluida',
              responsavelId: '1',
              responsavelNome: 'João Silva',
            },
            {
              id: `milestone-${this.nextMilestoneId++}`,
              descricao: 'Realizar treinamento teórico (40h)',
              dataPrevisao: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              status: 'em_andamento',
              responsavelId: '3',
              responsavelNome: 'Carlos Oliveira',
            },
            {
              id: `milestone-${this.nextMilestoneId++}`,
              descricao: 'Realizar treinamento prático (60h)',
              dataPrevisao: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              status: 'pendente',
              responsavelId: '3',
              responsavelNome: 'Carlos Oliveira',
            },
            {
              id: `milestone-${this.nextMilestoneId++}`,
              descricao: 'Avaliação e certificação da equipe',
              dataPrevisao: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              status: 'pendente',
              responsavelId: '1',
              responsavelNome: 'João Silva',
            },
            {
              id: `milestone-${this.nextMilestoneId++}`,
              descricao: 'Medição final e validação da meta',
              dataPrevisao: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              status: 'pendente',
              responsavelId: '1',
              responsavelNome: 'João Silva',
            },
          ],
        },
        revisoes: [
          {
            id: `revisao-${this.nextRevisaoId++}`,
            data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            revisorId: '1',
            revisorNome: 'João Silva',
            progresso: 20,
            situacao: 'Primeira revisão - início do projeto',
            observacoes: 'Instrutor contratado, material preparado. Treinamento inicia semana que vem.',
          },
        ],
        status: 'aprovado',
        criadoPorId: '1',
        criadoPorNome: 'João Silva',
        aprovadorId: '2',
        aprovadorNome: 'Maria Santos',
        dataAprovacao: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        desdobramentoId: '1',
      },
    ];

    mockMetas.forEach((data) => {
      const progresso = this.calcularProgresso(data.temporal!.milestones);

      const meta: MetaSMART = {
        id: String(this.nextId++),
        codigo: this.gerarCodigo(),
        ...data,
        progresso,
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      } as MetaSMART;

      this.mockData.push(meta);
    });
  }

  /**
   * Cria nova meta
   */
  async create(data: CreateMetaSMARTDTO): Promise<MetaSMART> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Gera IDs para milestones
      const milestonesComId = data.temporal.milestones.map((m) => ({
        ...m,
        id: `milestone-${this.nextMilestoneId++}`,
      }));

      const progresso = this.calcularProgresso(milestonesComId);

      const novaMeta: MetaSMART = {
        id: String(this.nextId++),
        codigo: this.gerarCodigo(),
        ...data,
        temporal: {
          ...data.temporal,
          milestones: milestonesComId,
        },
        progresso,
        revisoes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockData.push(novaMeta);
      console.log('✅ Mock: Meta SMART criada com sucesso', novaMeta);
      return novaMeta;
    }

    throw new Error('API não implementada');
  }

  /**
   * Atualiza meta existente
   */
  async update(id: string, data: Partial<MetaSMART>): Promise<MetaSMART> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = this.mockData.findIndex((m) => m.id === id);
      if (index === -1) {
        throw new Error('Meta não encontrada');
      }

      // Recalcula progresso se alterou milestones
      let progresso = this.mockData[index].progresso;
      if (data.temporal?.milestones) {
        progresso = this.calcularProgresso(data.temporal.milestones);
      }

      const updated: MetaSMART = {
        ...this.mockData[index],
        ...data,
        progresso,
        updatedAt: new Date().toISOString(),
      };

      this.mockData[index] = updated;
      console.log('✅ Mock: Meta SMART atualizada com sucesso', updated);
      return updated;
    }

    throw new Error('API não implementada');
  }

  /**
   * Deleta meta
   */
  async delete(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = this.mockData.findIndex((m) => m.id === id);
      if (index === -1) {
        throw new Error('Meta não encontrada');
      }

      this.mockData.splice(index, 1);
      console.log('✅ Mock: Meta SMART deletada com sucesso');
      return;
    }

    throw new Error('API não implementada');
  }

  /**
   * Busca meta por ID
   */
  async getById(id: string): Promise<MetaSMART | null> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const meta = this.mockData.find((m) => m.id === id);
      return meta || null;
    }

    throw new Error('API não implementada');
  }

  /**
   * Busca todas as metas
   */
  async getAll(): Promise<MetaSMART[]> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return [...this.mockData].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    throw new Error('API não implementada');
  }

  /**
   * Adiciona revisão à meta
   */
  async adicionarRevisao(
    metaId: string,
    revisao: Omit<RevisaoMeta, 'id'>
  ): Promise<MetaSMART> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const meta = await this.getById(metaId);
      if (!meta) {
        throw new Error('Meta não encontrada');
      }

      const novaRevisao: RevisaoMeta = {
        ...revisao,
        id: `revisao-${this.nextRevisaoId++}`,
      };

      const revisoesAtualizadas = [...meta.revisoes, novaRevisao];
      return await this.update(metaId, { revisoes: revisoesAtualizadas, progresso: revisao.progresso });
    }

    throw new Error('API não implementada');
  }

  /**
   * Atualiza status de milestone
   */
  async atualizarMilestone(
    metaId: string,
    milestoneId: string,
    status: string,
    dataConclusao?: string
  ): Promise<MetaSMART> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const meta = await this.getById(metaId);
      if (!meta) {
        throw new Error('Meta não encontrada');
      }

      const milestonesAtualizados = meta.temporal.milestones.map((m) => {
        if (m.id === milestoneId) {
          return { ...m, status, dataConclusao };
        }
        return m;
      });

      return await this.update(metaId, {
        temporal: { ...meta.temporal, milestones: milestonesAtualizados },
      });
    }

    throw new Error('API não implementada');
  }

  /**
   * Aprova uma meta
   */
  async aprovar(aprovacao: AprovacaoDTO): Promise<MetaSMART> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      return await this.update(aprovacao.documentoId, {
        status: 'aprovado',
        aprovadorId: aprovacao.aprovadorId,
        aprovadorNome: aprovacao.aprovadorNome,
        dataAprovacao: new Date().toISOString(),
      });
    }

    throw new Error('API não implementada');
  }

  /**
   * Rejeita uma meta
   */
  async rejeitar(aprovacao: AprovacaoDTO): Promise<MetaSMART> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      return await this.update(aprovacao.documentoId, {
        status: 'rejeitado',
        aprovadorId: aprovacao.aprovadorId,
        aprovadorNome: aprovacao.aprovadorNome,
        dataAprovacao: new Date().toISOString(),
        motivoRejeicao: aprovacao.motivoRejeicao,
      });
    }

    throw new Error('API não implementada');
  }

  /**
   * Submete meta para aprovação
   */
  async submeterParaAprovacao(id: string): Promise<MetaSMART> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return await this.update(id, {
        status: 'aguardando_aprovacao',
      });
    }

    throw new Error('API não implementada');
  }
}

export default new MetaSMARTService();
