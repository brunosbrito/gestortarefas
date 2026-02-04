import {
  PlanoAcao5W2H,
  CreatePlanoAcao5W2HDTO,
  Acao5W2H,
  AprovacaoDTO,
  AtualizacaoStatusAcaoDTO,
} from '@/interfaces/GestaoProcessosInterfaces';

/**
 * Service para gerenciamento de Planos de Ação 5W2H
 *
 * Funcionalidades:
 * - CRUD completo de planos
 * - Gestão de ações individuais (CRUD)
 * - Cálculo automático de progresso
 * - Workflow de aprovação
 * - Atualização de status de ações
 * - Mock mode para desenvolvimento
 */
class PlanoAcao5W2HService {
  private useMock = true; // TODO: Alterar para false quando backend estiver pronto
  private mockData: PlanoAcao5W2H[] = [];
  private nextId = 1;
  private nextAcaoId = 1;

  constructor() {
    if (this.useMock) {
      this.initializeMockData();
    }
  }

  /**
   * Calcula progresso geral do plano
   */
  private calcularProgresso(acoes: Acao5W2H[]): {
    progressoGeral: number;
    acoesCompletadas: number;
    acoesTotal: number;
  } {
    const total = acoes.length;
    if (total === 0) {
      return { progressoGeral: 0, acoesCompletadas: 0, acoesTotal: 0 };
    }

    const completadas = acoes.filter(
      (a) => a.status === 'concluida' || a.status === 'verificada'
    ).length;

    const progressoGeral = Math.round((completadas / total) * 100);

    return { progressoGeral, acoesCompletadas: completadas, acoesTotal: total };
  }

  /**
   * Calcula custos totais e prazos
   */
  private calcularResumo(acoes: Acao5W2H[]): {
    custoTotal?: number;
    prazoInicio?: string;
    prazoFim?: string;
  } {
    const custoTotal = acoes.reduce((sum, a) => sum + (a.quantoCusta || 0), 0);

    // Pega menor data de início e maior data de fim
    const datas = acoes.map((a) => a.quando).filter((d) => d);
    if (datas.length === 0) {
      return { custoTotal };
    }

    const prazoInicio = datas.sort()[0];
    const prazoFim = datas.sort()[datas.length - 1];

    return { custoTotal, prazoInicio, prazoFim };
  }

  /**
   * Gera código único para o plano
   */
  private gerarCodigo(): string {
    const ano = new Date().getFullYear();
    const numero = String(this.nextId).padStart(3, '0');
    return `GP-5W2H-${ano}-${numero}`;
  }

  /**
   * Inicializa dados mock
   */
  private initializeMockData() {
    const mockPlanos: Partial<PlanoAcao5W2H>[] = [
      {
        titulo: 'Implementação de Treinamento em Soldagem',
        descricao: 'Plano para capacitação da equipe de soldagem visando reduzir retrabalhos',
        tipoVinculacao: 'obra',
        obraId: '1',
        obraNome: 'Torre Eólica - Bahia',
        objetivo: 'Reduzir o índice de retrabalho em soldas de 15% para 5% em 3 meses',
        contexto: 'Alto índice de retrabalho identificado na priorização GP-PRI-2024-001',
        acoes: [
          {
            id: String(this.nextAcaoId++),
            oQue: 'Contratar instrutor especializado em soldagem estrutural',
            porque: 'Equipe necessita atualização técnica para reduzir defeitos',
            quemId: '1',
            quemNome: 'João Silva',
            quando: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            onde: 'Setor de Treinamento - Planta BA',
            como: 'Licitação seguindo processo padrão de RH',
            quantoCusta: 8000,
            status: 'em_andamento',
            progresso: 60,
            dataInicio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: String(this.nextAcaoId++),
            oQue: 'Realizar treinamento teórico de 40h',
            porque: 'Fundamentação teórica necessária antes da prática',
            quemId: '3',
            quemNome: 'Carlos Oliveira',
            quando: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            onde: 'Sala de Treinamento A',
            como: 'Aulas com apostilas e slides técnicos',
            quantoCusta: 2000,
            status: 'pendente',
          },
          {
            id: String(this.nextAcaoId++),
            oQue: 'Realizar treinamento prático de 60h',
            porque: 'Desenvolver habilidades práticas de soldagem',
            quemId: '3',
            quemNome: 'Carlos Oliveira',
            quando: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            onde: 'Oficina de Soldagem',
            como: 'Prática supervisionada com exercícios progressivos',
            quantoCusta: 5000,
            status: 'pendente',
          },
          {
            id: String(this.nextAcaoId++),
            oQue: 'Aplicar avaliação e certificar aprovados',
            porque: 'Validar aprendizado e emitir certificados',
            quemId: '1',
            quemNome: 'João Silva',
            quando: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            onde: 'Oficina de Soldagem',
            como: 'Prova teórica + teste prático avaliado',
            quantoCusta: 1000,
            status: 'pendente',
          },
        ],
        status: 'aprovado',
        criadoPorId: '1',
        criadoPorNome: 'João Silva',
        aprovadorId: '2',
        aprovadorNome: 'Maria Santos',
        dataAprovacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        priorizacaoId: '1',
      },
      {
        titulo: 'Otimização do Processo de Corte',
        descricao: 'Ações para melhorar produtividade do setor de corte',
        tipoVinculacao: 'setor',
        setorId: '1',
        setorNome: 'Produção',
        objetivo: 'Aumentar produtividade do corte em 30% nos próximos 60 dias',
        contexto: 'Baixa produtividade identificada em análise setorial',
        acoes: [
          {
            id: String(this.nextAcaoId++),
            oQue: 'Realizar manutenção preventiva nas máquinas de corte',
            porque: 'Equipamentos apresentando quedas frequentes',
            quemId: '4',
            quemNome: 'Ana Costa',
            quando: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            onde: 'Setor de Corte',
            como: 'Equipe de manutenção seguindo checklist',
            quantoCusta: 3500,
            status: 'em_andamento',
            progresso: 40,
          },
          {
            id: String(this.nextAcaoId++),
            oQue: 'Revisar e otimizar layout do setor',
            porque: 'Reduzir movimentação desnecessária de materiais',
            quemId: '4',
            quemNome: 'Ana Costa',
            quando: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            onde: 'Setor de Corte',
            como: 'Estudo de tempos e movimentos + reorganização',
            quantoCusta: 1500,
            status: 'pendente',
          },
        ],
        status: 'aguardando_aprovacao',
        criadoPorId: '4',
        criadoPorNome: 'Ana Costa',
      },
    ];

    mockPlanos.forEach((data) => {
      const progresso = this.calcularProgresso(data.acoes!);
      const resumo = this.calcularResumo(data.acoes!);

      const plano: PlanoAcao5W2H = {
        id: String(this.nextId++),
        codigo: this.gerarCodigo(),
        ...data,
        ...progresso,
        ...resumo,
        ultimaAtualizacao: new Date().toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      } as PlanoAcao5W2H;

      this.mockData.push(plano);
    });
  }

  /**
   * Cria novo plano
   */
  async create(data: CreatePlanoAcao5W2HDTO): Promise<PlanoAcao5W2H> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Gera IDs para as ações
      const acoesComId = data.acoes.map((acao) => ({
        ...acao,
        id: String(this.nextAcaoId++),
      }));

      const progresso = this.calcularProgresso(acoesComId);
      const resumo = this.calcularResumo(acoesComId);

      const novoPlano: PlanoAcao5W2H = {
        id: String(this.nextId++),
        codigo: this.gerarCodigo(),
        ...data,
        acoes: acoesComId,
        ...progresso,
        ...resumo,
        ultimaAtualizacao: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockData.push(novoPlano);
      console.log('✅ Mock: Plano de Ação criado com sucesso', novoPlano);
      return novoPlano;
    }

    throw new Error('API não implementada');
  }

  /**
   * Atualiza plano existente
   */
  async update(id: string, data: Partial<PlanoAcao5W2H>): Promise<PlanoAcao5W2H> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = this.mockData.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Plano não encontrado');
      }

      // Recalcula progresso se alterou ações
      let progresso = this.mockData[index];
      if (data.acoes) {
        const calc = this.calcularProgresso(data.acoes);
        const resumo = this.calcularResumo(data.acoes);
        progresso = { ...progresso, ...calc, ...resumo };
      }

      const updated: PlanoAcao5W2H = {
        ...this.mockData[index],
        ...data,
        ...progresso,
        ultimaAtualizacao: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockData[index] = updated;
      console.log('✅ Mock: Plano de Ação atualizado com sucesso', updated);
      return updated;
    }

    throw new Error('API não implementada');
  }

  /**
   * Deleta plano
   */
  async delete(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = this.mockData.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Plano não encontrado');
      }

      this.mockData.splice(index, 1);
      console.log('✅ Mock: Plano de Ação deletado com sucesso');
      return;
    }

    throw new Error('API não implementada');
  }

  /**
   * Busca plano por ID
   */
  async getById(id: string): Promise<PlanoAcao5W2H | null> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const plano = this.mockData.find((p) => p.id === id);
      return plano || null;
    }

    throw new Error('API não implementada');
  }

  /**
   * Busca todos os planos
   */
  async getAll(): Promise<PlanoAcao5W2H[]> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return [...this.mockData].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    throw new Error('API não implementada');
  }

  /**
   * Atualiza status de uma ação específica
   */
  async atualizarStatusAcao(
    planoId: string,
    atualizacao: AtualizacaoStatusAcaoDTO
  ): Promise<PlanoAcao5W2H> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const plano = await this.getById(planoId);
      if (!plano) {
        throw new Error('Plano não encontrado');
      }

      const acoesAtualizadas = plano.acoes.map((acao) => {
        if (acao.id === atualizacao.acaoId) {
          return {
            ...acao,
            status: atualizacao.status,
            progresso: atualizacao.progresso,
            evidencias: atualizacao.evidencias,
            observacoes: atualizacao.observacoes,
            dataConclusao:
              atualizacao.status === 'concluida' || atualizacao.status === 'verificada'
                ? new Date().toISOString()
                : acao.dataConclusao,
          };
        }
        return acao;
      });

      return await this.update(planoId, { acoes: acoesAtualizadas });
    }

    throw new Error('API não implementada');
  }

  /**
   * Aprova um plano
   */
  async aprovar(aprovacao: AprovacaoDTO): Promise<PlanoAcao5W2H> {
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
   * Rejeita um plano
   */
  async rejeitar(aprovacao: AprovacaoDTO): Promise<PlanoAcao5W2H> {
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
   * Submete plano para aprovação
   */
  async submeterParaAprovacao(id: string): Promise<PlanoAcao5W2H> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return await this.update(id, {
        status: 'aguardando_aprovacao',
      });
    }

    throw new Error('API não implementada');
  }
}

export default new PlanoAcao5W2HService();
