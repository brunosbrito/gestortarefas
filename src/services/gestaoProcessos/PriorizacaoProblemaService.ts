import {
  PriorizacaoProblema,
  CreatePriorizacaoDTO,
  EscalaGUT,
  AprovacaoDTO,
} from '@/interfaces/GestaoProcessosInterfaces';

/**
 * Service para gerenciamento de Priorização de Problemas (Matriz GUT)
 *
 * Funcionalidades:
 * - CRUD completo
 * - Cálculo automático da matriz GUT (G × U × T)
 * - Ranking automático por pontuação
 * - Workflow de aprovação
 * - Mock mode para desenvolvimento
 */
class PriorizacaoProblemaService {
  private useMock = true; // TODO: Alterar para false quando backend estiver pronto
  private mockData: PriorizacaoProblema[] = [];
  private nextId = 1;

  constructor() {
    if (this.useMock) {
      this.initializeMockData();
    }
  }

  /**
   * Calcula a pontuação GUT e classificação
   */
  private calcularResultadoGUT(
    gravidade: EscalaGUT,
    urgencia: EscalaGUT,
    tendencia: EscalaGUT
  ) {
    const pontuacao = gravidade * urgencia * tendencia;

    let classificacao: 'baixa' | 'media' | 'alta' | 'critica';
    if (pontuacao <= 27) {
      classificacao = 'baixa';
    } else if (pontuacao <= 64) {
      classificacao = 'media';
    } else if (pontuacao <= 100) {
      classificacao = 'alta';
    } else {
      classificacao = 'critica';
    }

    return {
      pontuacao,
      classificacao,
      ranking: undefined, // Será calculado depois
    };
  }

  /**
   * Recalcula rankings de todas as priorizações
   */
  private recalcularRankings() {
    // Ordena por pontuação decrescente
    const sorted = [...this.mockData].sort(
      (a, b) => b.resultado.pontuacao - a.resultado.pontuacao
    );

    // Atribui rankings
    sorted.forEach((item, index) => {
      item.resultado.ranking = index + 1;
    });
  }

  /**
   * Gera código único para a priorização
   */
  private gerarCodigo(): string {
    const ano = new Date().getFullYear();
    const numero = String(this.nextId).padStart(3, '0');
    return `GP-PRI-${ano}-${numero}`;
  }

  /**
   * Inicializa dados mock
   */
  private initializeMockData() {
    const mockPriorizacoes: Partial<PriorizacaoProblema>[] = [
      {
        titulo: 'Alto índice de retrabalho na soldagem',
        descricao: 'Identificado alto índice de retrabalho nas peças soldadas, gerando atraso',
        tipoVinculacao: 'obra',
        obraId: '1',
        obraNome: 'Torre Eólica - Bahia',
        problema: 'Retrabalho excessivo em soldas de estruturas metálicas',
        area: 'Produção - Setor de Soldagem',
        responsavelId: '1',
        responsavelNome: 'João Silva',
        criterios: {
          gravidade: 4,
          urgencia: 5,
          tendencia: 4,
        },
        justificativaGravidade: 'Impacto alto no prazo de entrega e custos adicionais',
        justificativaUrgencia: 'Cliente cobrando prazos, risco de multa contratual',
        justificativaTendencia: 'Tendência de piorar se não forem tomadas ações imediatas',
        acaoImediata: true,
        observacoes: 'Requer análise de causa raiz urgente',
        status: 'aprovado',
        criadoPorId: '1',
        criadoPorNome: 'João Silva',
        aprovadorId: '2',
        aprovadorNome: 'Maria Santos',
        dataAprovacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        titulo: 'Baixa produtividade no corte de chapas',
        descricao: 'Setor de corte apresentando produtividade 30% abaixo da meta',
        tipoVinculacao: 'setor',
        setorId: '1',
        setorNome: 'Produção',
        problema: 'Produtividade do setor de corte abaixo da meta estabelecida',
        area: 'Produção - Corte',
        responsavelId: '3',
        responsavelNome: 'Carlos Oliveira',
        criterios: {
          gravidade: 3,
          urgencia: 3,
          tendencia: 3,
        },
        justificativaGravidade: 'Atraso na produção de aproximadamente 2 dias por semana',
        justificativaUrgencia: 'Prazo médio para resolução',
        justificativaTendencia: 'Situação estável no momento',
        acaoImediata: false,
        status: 'aguardando_aprovacao',
        criadoPorId: '3',
        criadoPorNome: 'Carlos Oliveira',
      },
      {
        titulo: 'Falta de matéria-prima no almoxarifado',
        descricao: 'Constantes rupturas de estoque de materiais críticos',
        tipoVinculacao: 'independente',
        problema: 'Ruptura frequente de estoque de materiais essenciais',
        area: 'Suprimentos - Almoxarifado',
        responsavelId: '4',
        responsavelNome: 'Ana Costa',
        criterios: {
          gravidade: 5,
          urgencia: 4,
          tendencia: 5,
        },
        justificativaGravidade: 'Paralização total da produção quando falta material',
        justificativaUrgencia: 'Precisa de ação rápida mas não imediata',
        justificativaTendencia: 'Tendência de agravar com aumento de demanda',
        acaoImediata: true,
        observacoes: 'Sugere-se revisar ponto de pedido e estoque de segurança',
        status: 'rascunho',
        criadoPorId: '4',
        criadoPorNome: 'Ana Costa',
      },
    ];

    mockPriorizacoes.forEach((data) => {
      const resultado = this.calcularResultadoGUT(
        data.criterios!.gravidade,
        data.criterios!.urgencia,
        data.criterios!.tendencia
      );

      const priorizacao: PriorizacaoProblema = {
        id: String(this.nextId++),
        codigo: this.gerarCodigo(),
        ...data,
        resultado,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      } as PriorizacaoProblema;

      this.mockData.push(priorizacao);
    });

    this.recalcularRankings();
  }

  /**
   * Cria nova priorização
   */
  async create(data: CreatePriorizacaoDTO): Promise<PriorizacaoProblema> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Calcula resultado GUT
      const resultado = this.calcularResultadoGUT(
        data.criterios.gravidade,
        data.criterios.urgencia,
        data.criterios.tendencia
      );

      const novaPriorizacao: PriorizacaoProblema = {
        id: String(this.nextId++),
        codigo: this.gerarCodigo(),
        ...data,
        resultado,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockData.push(novaPriorizacao);
      this.recalcularRankings();

      console.log('✅ Mock: Priorização criada com sucesso', novaPriorizacao);
      return novaPriorizacao;
    }

    // TODO: Implementar chamada real à API
    throw new Error('API não implementada');
  }

  /**
   * Atualiza priorização existente
   */
  async update(
    id: string,
    data: Partial<PriorizacaoProblema>
  ): Promise<PriorizacaoProblema> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = this.mockData.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Priorização não encontrada');
      }

      // Se alterou critérios, recalcula resultado
      let resultado = this.mockData[index].resultado;
      if (data.criterios) {
        resultado = this.calcularResultadoGUT(
          data.criterios.gravidade,
          data.criterios.urgencia,
          data.criterios.tendencia
        );
      }

      const updated: PriorizacaoProblema = {
        ...this.mockData[index],
        ...data,
        resultado,
        updatedAt: new Date().toISOString(),
      };

      this.mockData[index] = updated;
      this.recalcularRankings();

      console.log('✅ Mock: Priorização atualizada com sucesso', updated);
      return updated;
    }

    // TODO: Implementar chamada real à API
    throw new Error('API não implementada');
  }

  /**
   * Deleta priorização
   */
  async delete(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = this.mockData.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Priorização não encontrada');
      }

      this.mockData.splice(index, 1);
      this.recalcularRankings();

      console.log('✅ Mock: Priorização deletada com sucesso');
      return;
    }

    // TODO: Implementar chamada real à API
    throw new Error('API não implementada');
  }

  /**
   * Busca priorização por ID
   */
  async getById(id: string): Promise<PriorizacaoProblema | null> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const priorizacao = this.mockData.find((p) => p.id === id);
      return priorizacao || null;
    }

    // TODO: Implementar chamada real à API
    throw new Error('API não implementada');
  }

  /**
   * Busca todas as priorizações
   */
  async getAll(): Promise<PriorizacaoProblema[]> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Retorna cópia ordenada por ranking
      return [...this.mockData].sort(
        (a, b) => (a.resultado.ranking || 999) - (b.resultado.ranking || 999)
      );
    }

    // TODO: Implementar chamada real à API
    throw new Error('API não implementada');
  }

  /**
   * Aprova uma priorização
   */
  async aprovar(aprovacao: AprovacaoDTO): Promise<PriorizacaoProblema> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = this.mockData.findIndex((p) => p.id === aprovacao.documentoId);
      if (index === -1) {
        throw new Error('Priorização não encontrada');
      }

      this.mockData[index] = {
        ...this.mockData[index],
        status: 'aprovado',
        aprovadorId: aprovacao.aprovadorId,
        aprovadorNome: aprovacao.aprovadorNome,
        dataAprovacao: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('✅ Mock: Priorização aprovada com sucesso');
      return this.mockData[index];
    }

    // TODO: Implementar chamada real à API
    throw new Error('API não implementada');
  }

  /**
   * Rejeita uma priorização
   */
  async rejeitar(aprovacao: AprovacaoDTO): Promise<PriorizacaoProblema> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = this.mockData.findIndex((p) => p.id === aprovacao.documentoId);
      if (index === -1) {
        throw new Error('Priorização não encontrada');
      }

      this.mockData[index] = {
        ...this.mockData[index],
        status: 'rejeitado',
        aprovadorId: aprovacao.aprovadorId,
        aprovadorNome: aprovacao.aprovadorNome,
        dataAprovacao: new Date().toISOString(),
        motivoRejeicao: aprovacao.motivoRejeicao,
        updatedAt: new Date().toISOString(),
      };

      console.log('✅ Mock: Priorização rejeitada com sucesso');
      return this.mockData[index];
    }

    // TODO: Implementar chamada real à API
    throw new Error('API não implementada');
  }

  /**
   * Submete priorização para aprovação
   */
  async submeterParaAprovacao(id: string): Promise<PriorizacaoProblema> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = this.mockData.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('Priorização não encontrada');
      }

      this.mockData[index] = {
        ...this.mockData[index],
        status: 'aguardando_aprovacao',
        updatedAt: new Date().toISOString(),
      };

      console.log('✅ Mock: Priorização submetida para aprovação');
      return this.mockData[index];
    }

    // TODO: Implementar chamada real à API
    throw new Error('API não implementada');
  }

  /**
   * Busca priorizações por status
   */
  async getByStatus(status: string): Promise<PriorizacaoProblema[]> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return this.mockData.filter((p) => p.status === status);
    }

    // TODO: Implementar chamada real à API
    throw new Error('API não implementada');
  }

  /**
   * Busca priorizações críticas (ação imediata)
   */
  async getCriticas(): Promise<PriorizacaoProblema[]> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return this.mockData.filter((p) => p.acaoImediata === true);
    }

    // TODO: Implementar chamada real à API
    throw new Error('API não implementada');
  }
}

export default new PriorizacaoProblemaService();
