import {
  DesdobramentoProblema,
  CreateDesdobramentoDTO,
  CausaProblema,
  EfeitoProblema,
  AprovacaoDTO,
} from '@/interfaces/GestaoProcessosInterfaces';

/**
 * Service para gerenciamento de Desdobramento de Problemas
 *
 * Funcionalidades:
 * - CRUD completo
 * - Análise de causas hierárquica (primária → secundária → terciária)
 * - Análise de efeitos/consequências
 * - Identificação de causa raiz
 * - Linking opcional com Priorização
 * - Workflow de aprovação
 * - Mock mode para desenvolvimento
 */
class DesdobramentoProblemaService {
  private useMock = true; // TODO: Alterar para false quando backend estiver pronto
  private mockData: DesdobramentoProblema[] = [];
  private nextId = 1;
  private nextCausaId = 1;
  private nextEfeitoId = 1;

  constructor() {
    if (this.useMock) {
      this.initializeMockData();
    }
  }

  /**
   * Gera código único para o desdobramento
   */
  private gerarCodigo(): string {
    const ano = new Date().getFullYear();
    const numero = String(this.nextId).padStart(3, '0');
    return `GP-DES-${ano}-${numero}`;
  }

  /**
   * Inicializa dados mock
   */
  private initializeMockData() {
    const mockDesdobramentos: Partial<DesdobramentoProblema>[] = [
      {
        titulo: 'Análise de Retrabalho em Soldagem',
        descricao: 'Desdobramento do problema de alto índice de retrabalho em soldas',
        tipoVinculacao: 'obra',
        obraId: '1',
        obraNome: 'Torre Eólica - Bahia',
        problema: 'Alto índice de retrabalho em soldas estruturais (15% das peças)',
        situacaoAtual:
          'Equipe de soldagem apresenta retrabalho em 15% das peças soldadas, gerando atraso de 2-3 dias por semana no cronograma e custo adicional estimado em R$ 45.000/mês',
        causas: [
          // Causa Primária 1
          {
            id: `causa-${this.nextCausaId++}`,
            descricao: 'Falta de treinamento adequado',
            tipo: 'primaria',
            nivel: 1,
            porQueOcorre: 'Última capacitação foi há 3 anos, novas técnicas não foram repassadas',
            evidencias: 'Registros de RH mostram ausência de treinamentos desde 2021',
          },
          // Causas Secundárias da Primária 1
          {
            id: `causa-${this.nextCausaId++}`,
            descricao: 'Orçamento de treinamento não aprovado',
            tipo: 'secundaria',
            nivel: 2,
            parentId: 'causa-1',
            porQueOcorre: 'Gestão priorizou outros investimentos',
            evidencias: 'Atas de reunião de budget 2023',
          },
          {
            id: `causa-${this.nextCausaId++}`,
            descricao: 'Rotatividade de funcionários',
            tipo: 'secundaria',
            nivel: 2,
            parentId: 'causa-1',
            porQueOcorre: 'Turnover de 25% ao ano no setor de soldagem',
            evidencias: 'Relatório de RH - taxa de turnover acima da média',
          },
          // Causa Primária 2
          {
            id: `causa-${this.nextCausaId++}`,
            descricao: 'Equipamentos desatualizados',
            tipo: 'primaria',
            nivel: 1,
            porQueOcorre: 'Máquinas de solda com mais de 10 anos de uso',
            evidencias: 'Inventário de equipamentos - última aquisição em 2014',
          },
          // Causa Secundária da Primária 2
          {
            id: `causa-${this.nextCausaId++}`,
            descricao: 'Manutenção preventiva irregular',
            tipo: 'secundaria',
            nivel: 2,
            parentId: 'causa-4',
            porQueOcorre: 'Plano de manutenção não seguido rigorosamente',
            evidencias: 'Checklist de manutenção com falhas nos últimos 6 meses',
          },
          // Causa Terciária
          {
            id: `causa-${this.nextCausaId++}`,
            descricao: 'Falta de peças de reposição',
            tipo: 'terciaria',
            nivel: 3,
            parentId: 'causa-5',
            porQueOcorre: 'Almoxarifado sem estoque de componentes específicos',
            evidencias: 'Relatório de estoque - itens em falta há 45 dias',
          },
          // Causa Primária 3
          {
            id: `causa-${this.nextCausaId++}`,
            descricao: 'Especificações técnicas confusas',
            tipo: 'primaria',
            nivel: 1,
            porQueOcorre: 'Desenhos técnicos com informações conflitantes',
            evidencias: 'Registro de não conformidades apontando problemas nos desenhos',
          },
        ],
        efeitos: [
          {
            id: `efeito-${this.nextEfeitoId++}`,
            descricao: 'Atraso no cronograma de entrega',
            gravidade: 'alta',
            area: 'Produção',
            impacto: 'Atraso médio de 2-3 dias por semana, risco de multa contratual',
          },
          {
            id: `efeito-${this.nextEfeitoId++}`,
            descricao: 'Aumento de custos operacionais',
            gravidade: 'alta',
            area: 'Financeiro',
            impacto: 'Custo adicional estimado em R$ 45.000/mês com retrabalho',
          },
          {
            id: `efeito-${this.nextEfeitoId++}`,
            descricao: 'Desmotivação da equipe',
            gravidade: 'media',
            area: 'Recursos Humanos',
            impacto: 'Equipe frustrada com retrabalhos constantes, impacta moral',
          },
          {
            id: `efeito-${this.nextEfeitoId++}`,
            descricao: 'Risco de perda de contrato',
            gravidade: 'alta',
            area: 'Comercial',
            impacto: 'Cliente insatisfeito pode rescindir contrato ou não renovar',
          },
        ],
        causaRaiz: 'causa-1',
        conclusao:
          'A causa raiz identificada é a falta de treinamento adequado da equipe. As causas secundárias (orçamento não aprovado e rotatividade) agravam o problema. Recomenda-se implementar programa de capacitação imediato.',
        proximasAcoes:
          'Criar plano de ação 5W2H para treinamento da equipe e atualização dos equipamentos',
        status: 'aprovado',
        criadoPorId: '1',
        criadoPorNome: 'João Silva',
        aprovadorId: '2',
        aprovadorNome: 'Maria Santos',
        dataAprovacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        priorizacaoId: '1',
      },
    ];

    mockDesdobramentos.forEach((data) => {
      const desdobramento: DesdobramentoProblema = {
        id: String(this.nextId++),
        codigo: this.gerarCodigo(),
        ...data,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      } as DesdobramentoProblema;

      this.mockData.push(desdobramento);
    });
  }

  /**
   * Cria novo desdobramento
   */
  async create(data: CreateDesdobramentoDTO): Promise<DesdobramentoProblema> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const novoDesdobramento: DesdobramentoProblema = {
        id: String(this.nextId++),
        codigo: this.gerarCodigo(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockData.push(novoDesdobramento);
      console.log('✅ Mock: Desdobramento criado com sucesso', novoDesdobramento);
      return novoDesdobramento;
    }

    throw new Error('API não implementada');
  }

  /**
   * Atualiza desdobramento existente
   */
  async update(
    id: string,
    data: Partial<DesdobramentoProblema>
  ): Promise<DesdobramentoProblema> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = this.mockData.findIndex((d) => d.id === id);
      if (index === -1) {
        throw new Error('Desdobramento não encontrado');
      }

      const updated: DesdobramentoProblema = {
        ...this.mockData[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      this.mockData[index] = updated;
      console.log('✅ Mock: Desdobramento atualizado com sucesso', updated);
      return updated;
    }

    throw new Error('API não implementada');
  }

  /**
   * Deleta desdobramento
   */
  async delete(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = this.mockData.findIndex((d) => d.id === id);
      if (index === -1) {
        throw new Error('Desdobramento não encontrado');
      }

      this.mockData.splice(index, 1);
      console.log('✅ Mock: Desdobramento deletado com sucesso');
      return;
    }

    throw new Error('API não implementada');
  }

  /**
   * Busca desdobramento por ID
   */
  async getById(id: string): Promise<DesdobramentoProblema | null> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const desdobramento = this.mockData.find((d) => d.id === id);
      return desdobramento || null;
    }

    throw new Error('API não implementada');
  }

  /**
   * Busca todos os desdobramentos
   */
  async getAll(): Promise<DesdobramentoProblema[]> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return [...this.mockData].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    throw new Error('API não implementada');
  }

  /**
   * Aprova um desdobramento
   */
  async aprovar(aprovacao: AprovacaoDTO): Promise<DesdobramentoProblema> {
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
   * Rejeita um desdobramento
   */
  async rejeitar(aprovacao: AprovacaoDTO): Promise<DesdobramentoProblema> {
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
   * Submete desdobramento para aprovação
   */
  async submeterParaAprovacao(id: string): Promise<DesdobramentoProblema> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return await this.update(id, {
        status: 'aguardando_aprovacao',
      });
    }

    throw new Error('API não implementada');
  }

  /**
   * Helper: Adiciona nova causa
   */
  async adicionarCausa(
    desdobramentoId: string,
    causa: Omit<CausaProblema, 'id'>
  ): Promise<DesdobramentoProblema> {
    if (this.useMock) {
      const desdobramento = await this.getById(desdobramentoId);
      if (!desdobramento) {
        throw new Error('Desdobramento não encontrado');
      }

      const novaCausa: CausaProblema = {
        ...causa,
        id: `causa-${this.nextCausaId++}`,
      };

      const causasAtualizadas = [...desdobramento.causas, novaCausa];
      return await this.update(desdobramentoId, { causas: causasAtualizadas });
    }

    throw new Error('API não implementada');
  }

  /**
   * Helper: Adiciona novo efeito
   */
  async adicionarEfeito(
    desdobramentoId: string,
    efeito: Omit<EfeitoProblema, 'id'>
  ): Promise<DesdobramentoProblema> {
    if (this.useMock) {
      const desdobramento = await this.getById(desdobramentoId);
      if (!desdobramento) {
        throw new Error('Desdobramento não encontrado');
      }

      const novoEfeito: EfeitoProblema = {
        ...efeito,
        id: `efeito-${this.nextEfeitoId++}`,
      };

      const efeitosAtualizados = [...desdobramento.efeitos, novoEfeito];
      return await this.update(desdobramentoId, { efeitos: efeitosAtualizados });
    }

    throw new Error('API não implementada');
  }
}

export default new DesdobramentoProblemaService();
