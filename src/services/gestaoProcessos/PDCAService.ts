import {
  PDCA,
  CreatePDCADTO,
  PDCAPlan,
  PDCADo,
  PDCACheck,
  PDCAAct,
  StatusPDCA,
  FasePDCA,
  AprovacaoDTO,
} from '@/interfaces/GestaoProcessosInterfaces';

/**
 * Service para gerenciamento de Ciclos PDCA
 *
 * Funcionalidades:
 * - CRUD completo de ciclos PDCA
 * - Gestão de 4 fases: Plan, Do, Check, Act
 * - Sistema de iterações (ciclos encadeados)
 * - Workflow de aprovação
 * - Tracking de progresso por fase
 * - Relacionamento com Desdobramento
 * - Mock mode para desenvolvimento
 */
class PDCAService {
  private useMock = true; // TODO: Alterar para false quando backend estiver pronto
  private mockData: PDCA[] = [];
  private nextId = 1;

  constructor() {
    if (this.useMock) {
      this.initializeMockData();
    }
  }

  /**
   * Gera código único para o PDCA
   */
  private gerarCodigo(numeroCiclo: number): string {
    const ano = new Date().getFullYear();
    const numero = String(this.nextId).padStart(3, '0');
    return `GP-PDCA-${ano}-${numero}-C${numeroCiclo}`;
  }

  /**
   * Inicializa dados mock
   */
  private initializeMockData() {
    const mockPDCAs: Partial<PDCA>[] = [
      {
        titulo: 'Redução de Desperdício de Material',
        descricao: 'Ciclo PDCA para reduzir desperdício de material de solda em 30%',
        objetivo: 'Reduzir desperdício de eletrodos de solda de 20% para 5% em 3 meses',
        numeroCiclo: 1,
        tipoVinculacao: 'obra',
        obraId: '1',
        obraNome: 'Torre Eólica - Bahia',
        statusPDCA: 'concluido',
        faseAtual: 'act',
        status: 'aprovado',

        // Fase PLAN
        plan: {
          problema: 'Alto índice de desperdício de eletrodos de solda (20% do total consumido)',
          metaEsperada: 'Reduzir desperdício para 5%',
          indicador: 'Percentual de desperdício de eletrodos',
          valorAtual: 20,
          valorMeta: 5,
          causaRaiz:
            'Falta de treinamento adequado dos soldadores e armazenamento inadequado dos eletrodos',
          analiseMetodo: '5 Porquês + Diagrama de Ishikawa',
          acoes: [
            'Realizar treinamento de técnicas de soldagem eficiente',
            'Implementar sistema de armazenamento climatizado',
            'Criar procedimento de controle de estoque',
            'Implementar checklist de inspeção diária',
          ],
          responsaveis: ['João Silva', 'Carlos Oliveira'],
          prazo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          recursos: 'R$ 12.000 (treinamento + climatizador + materiais)',
        },

        // Fase DO
        do: {
          dataInicio: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          dataFim: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          statusExecucao: 'concluida',
          acoesRealizadas: [
            'Treinamento de 40h realizado com 12 soldadores (100% participação)',
            'Climatizador instalado e temperatura controlada em 20-25°C',
            'Procedimento GP-PROC-2024-001 criado e aprovado',
            'Checklist implementado e em uso diário',
          ],
          evidencias: [
            'Certificados de treinamento',
            'Fotos do climatizador instalado',
            'Procedimento documentado',
            'Registros de checklist',
          ],
          desvios: 'Atraso de 1 semana na instalação do climatizador devido a atraso na entrega',
          medidasCorretivas: 'Negociado com fornecedor e instalação priorizada',
        },

        // Fase CHECK
        check: {
          dataVerificacao: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          valorAlcancado: 6,
          metaAtingida: false,
          resultadosObtidos:
            'Desperdício reduzido de 20% para 6% (redução de 70% do desperdício)',
          comparacaoMeta:
            'Meta era 5%, alcançamos 6%. Diferença de 1 ponto percentual (20% de desvio da meta)',
          eficaz: true,
          justificativa:
            'Apesar de não atingir exatamente 5%, a redução de 70% no desperdício é significativa e gera economia mensal de R$ 8.500. Considerado eficaz.',
          evidencias: [
            'Relatório de consumo mensal',
            'Gráficos de evolução',
            'Análise comparativa 3 meses',
          ],
        },

        // Fase ACT
        act: {
          tipo: 'padronizar',
          documentosPadrao: [
            'GP-PROC-2024-001 - Controle de Estoque de Eletrodos',
            'GP-CHECK-2024-001 - Checklist Diário de Armazenamento',
          ],
          treinamentosRealizados: [
            'Treinamento de Soldagem Eficiente (40h) - 12 participantes',
          ],
          procedimentosAtualizados: [
            'Procedimento de Soldagem atualizado com novas técnicas',
            'Manual de Armazenamento de Consumíveis revisado',
          ],
          problemasRemanescentes:
            '1% de desperdício adicional identificado em eletrodos especiais - necessita investigação específica',
          novoCicloNecessario: true,
          licoesAprendidas:
            'O treinamento foi fundamental para a redução. O armazenamento climatizado também teve impacto significativo. Importante: envolver equipe desde o planejamento aumenta engajamento.',
          observacoes:
            'Proposta de novo ciclo focado em eletrodos especiais (AWS E7018-1) que ainda apresentam 8% de desperdício',
        },

        criadoPorId: '1',
        criadoPorNome: 'João Silva',
        aprovadorId: '2',
        aprovadorNome: 'Maria Santos',
        dataAprovacao: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
        dataInicioPlanejamento: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        dataFimCiclo: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },

      {
        titulo: 'Melhoria no Tempo de Setup de Equipamentos',
        descricao: 'Ciclo PDCA para reduzir tempo de setup de soldas',
        objetivo: 'Reduzir tempo de setup de 45min para 20min',
        numeroCiclo: 1,
        tipoVinculacao: 'setor',
        setorId: '2',
        setorNome: 'Produção',
        statusPDCA: 'em_execucao',
        faseAtual: 'do',

        // Fase PLAN
        plan: {
          problema: 'Tempo excessivo de setup dos equipamentos de solda (45 minutos)',
          metaEsperada: 'Reduzir para 20 minutos',
          indicador: 'Tempo médio de setup (minutos)',
          valorAtual: 45,
          valorMeta: 20,
          causaRaiz: 'Falta de organização e procedimento padronizado de setup',
          analiseMetodo: '5S + Análise de Fluxo',
          acoes: [
            'Implementar 5S na área de equipamentos',
            'Criar procedimento visual de setup',
            'Organizar ferramentas por frequência de uso',
            'Treinar equipe no novo procedimento',
          ],
          responsaveis: ['Carlos Oliveira'],
          prazo: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          recursos: 'R$ 3.000 (organização + materiais visuais)',
        },

        // Fase DO
        do: {
          dataInicio: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          statusExecucao: 'em_andamento',
          acoesRealizadas: [
            '5S implementado (Seiri e Seiton concluídos)',
            'Procedimento visual em desenvolvimento',
          ],
          evidencias: ['Fotos antes/depois da organização'],
        },

        criadoPorId: '3',
        criadoPorNome: 'Carlos Oliveira',
        status: 'aprovado',
        aprovadorId: '2',
        aprovadorNome: 'Maria Santos',
        dataAprovacao: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        dataInicioPlanejamento: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
    ];

    mockPDCAs.forEach((data) => {
      const pdca: PDCA = {
        id: String(this.nextId),
        codigo: this.gerarCodigo(data.numeroCiclo || 1),
        ...data,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      } as PDCA;

      this.mockData.push(pdca);
      this.nextId++;
    });
  }

  /**
   * Cria novo ciclo PDCA
   */
  async create(data: CreatePDCADTO): Promise<PDCA> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const novoPDCA: PDCA = {
        id: String(this.nextId++),
        codigo: this.gerarCodigo(data.numeroCiclo || 1),
        ...data,
        statusPDCA: 'planejamento',
        faseAtual: 'plan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.mockData.push(novoPDCA);
      console.log('✅ Mock: PDCA criado com sucesso', novoPDCA);
      return novoPDCA;
    }

    throw new Error('API não implementada');
  }

  /**
   * Atualiza PDCA existente
   */
  async update(id: string, data: Partial<PDCA>): Promise<PDCA> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const index = this.mockData.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('PDCA não encontrado');
      }

      const updated: PDCA = {
        ...this.mockData[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      this.mockData[index] = updated;
      console.log('✅ Mock: PDCA atualizado com sucesso', updated);
      return updated;
    }

    throw new Error('API não implementada');
  }

  /**
   * Deleta PDCA
   */
  async delete(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = this.mockData.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error('PDCA não encontrado');
      }

      this.mockData.splice(index, 1);
      console.log('✅ Mock: PDCA deletado com sucesso');
      return;
    }

    throw new Error('API não implementada');
  }

  /**
   * Busca PDCA por ID
   */
  async getById(id: string): Promise<PDCA | null> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const pdca = this.mockData.find((p) => p.id === id);
      return pdca || null;
    }

    throw new Error('API não implementada');
  }

  /**
   * Busca todos os PDCAs
   */
  async getAll(): Promise<PDCA[]> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return [...this.mockData].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    throw new Error('API não implementada');
  }

  /**
   * Atualiza fase PLAN
   */
  async atualizarPlan(id: string, plan: PDCAPlan): Promise<PDCA> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return await this.update(id, {
        plan,
        faseAtual: 'plan',
        statusPDCA: 'planejamento',
        dataInicioPlanejamento: new Date().toISOString().split('T')[0],
      });
    }

    throw new Error('API não implementada');
  }

  /**
   * Atualiza fase DO
   */
  async atualizarDo(id: string, doPhase: PDCADo): Promise<PDCA> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return await this.update(id, {
        do: doPhase,
        faseAtual: 'do',
        statusPDCA: 'em_execucao',
      });
    }

    throw new Error('API não implementada');
  }

  /**
   * Atualiza fase CHECK
   */
  async atualizarCheck(id: string, check: PDCACheck): Promise<PDCA> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return await this.update(id, {
        check,
        faseAtual: 'check',
        statusPDCA: 'em_verificacao',
      });
    }

    throw new Error('API não implementada');
  }

  /**
   * Atualiza fase ACT
   */
  async atualizarAct(id: string, act: PDCAAct): Promise<PDCA> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return await this.update(id, {
        act,
        faseAtual: 'act',
        statusPDCA: 'concluido',
        dataFimCiclo: new Date().toISOString().split('T')[0],
      });
    }

    throw new Error('API não implementada');
  }

  /**
   * Inicia novo ciclo a partir de um PDCA existente
   */
  async iniciarNovoCiclo(pdcaAnteriorId: string): Promise<PDCA> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const pdcaAnterior = await this.getById(pdcaAnteriorId);
      if (!pdcaAnterior) {
        throw new Error('PDCA anterior não encontrado');
      }

      const novoPDCA: PDCA = {
        id: String(this.nextId++),
        codigo: this.gerarCodigo(pdcaAnterior.numeroCiclo + 1),
        titulo: `${pdcaAnterior.titulo} - Ciclo ${pdcaAnterior.numeroCiclo + 1}`,
        descricao: `Novo ciclo de melhoria contínua`,
        objetivo: pdcaAnterior.objetivo,
        numeroCiclo: pdcaAnterior.numeroCiclo + 1,
        tipoVinculacao: pdcaAnterior.tipoVinculacao,
        obraId: pdcaAnterior.obraId,
        obraNome: pdcaAnterior.obraNome,
        setorId: pdcaAnterior.setorId,
        setorNome: pdcaAnterior.setorNome,
        statusPDCA: 'planejamento',
        faseAtual: 'plan',
        status: 'rascunho',
        criadoPorId: pdcaAnterior.criadoPorId,
        criadoPorNome: pdcaAnterior.criadoPorNome,
        cicloAnteriorId: pdcaAnteriorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Atualiza PDCA anterior com link para o novo
      await this.update(pdcaAnteriorId, { proximoCicloId: novoPDCA.id });

      this.mockData.push(novoPDCA);
      console.log('✅ Mock: Novo ciclo PDCA criado', novoPDCA);
      return novoPDCA;
    }

    throw new Error('API não implementada');
  }

  /**
   * Aprova um PDCA
   */
  async aprovar(aprovacao: AprovacaoDTO): Promise<PDCA> {
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
   * Rejeita um PDCA
   */
  async rejeitar(aprovacao: AprovacaoDTO): Promise<PDCA> {
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
   * Submete PDCA para aprovação
   */
  async submeterParaAprovacao(id: string): Promise<PDCA> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return await this.update(id, {
        status: 'aguardando_aprovacao',
      });
    }

    throw new Error('API não implementada');
  }
}

export default new PDCAService();
