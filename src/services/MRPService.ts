/**
 * FASE 2 PCP: MRP Service - Material Requirements Planning
 * Cálculo de necessidades multi-projeto com pegging e consolidação
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

import {
  NecessidadeMaterial,
  NecessidadeConsolidada,
  ConflitoProjetos,
  SugestaoCompra,
  RelatorioMRP,
  DashboardMRP,
  CalculoMRPRequest,
  OrigemNecessidade,
  ItemEstoqueIntegracao,
  RequisicaoCompraIntegracao,
} from '@/interfaces/MRPInterface';
import { Orcamento, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { Activity } from '@/interfaces/AtividadeInterface';
import RequisicoesService from '@/services/suprimentos/compras/requisicoesService';
import { RequisicaoCreate } from '@/interfaces/suprimentos/compras/RequisicaoInterface';

// ============================================
// SERVICE CLASS
// ============================================

class MRPServiceClass {
  private useMock = true; // IMPORTANTE: Frontend-only, mock mode ativado

  /**
   * MOCK DATA: Estoque de materiais
   */
  private mockEstoque: ItemEstoqueIntegracao[] = [
    {
      itemEstoqueId: 1,
      codigo: 'MAT-CH-001',
      descricao: 'Chapa ASTM A 36 - 6mm',
      quantidadeAtual: 300,
      estoqueMinimo: 200,
      estoqueMaximo: 1000,
      quantidadeReservada: 50,
      quantidadeDisponivel: 250,
      localizacao: 'Almoxarifado A - Prateleira 3',
    },
    {
      itemEstoqueId: 2,
      codigo: 'MAT-PF-001',
      descricao: 'Perfil I ASTM A 572 - 200mm',
      quantidadeAtual: 150,
      estoqueMinimo: 100,
      estoqueMaximo: 800,
      quantidadeReservada: 0,
      quantidadeDisponivel: 150,
      localizacao: 'Almoxarifado A - Prateleira 5',
    },
    {
      itemEstoqueId: 3,
      codigo: 'MAT-EL-001',
      descricao: 'Eletrodo Revestido AWS E7018',
      quantidadeAtual: 80,
      estoqueMinimo: 50,
      estoqueMaximo: 200,
      quantidadeReservada: 10,
      quantidadeDisponivel: 70,
      localizacao: 'Almoxarifado B - Consumíveis',
    },
  ];

  /**
   * MOCK DATA: Service Orders ativas com orçamentos vinculados
   */
  private mockServiceOrders: ServiceOrder[] = [
    {
      id: 1,
      serviceOrderNumber: 'OS-0001',
      description: 'Estrutura Metálica - Galpão Industrial - Projeto A',
      status: 'em_andamento',
      notes: 'Cliente ABC Ltda',
      createdAt: '2026-01-20T10:00:00Z',
      startDate: '2026-01-25T08:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z',
      quantity: 1300,
      weight: '1300',
      projectNumber: 'M-15706',
      progress: 15,
      projectId: {
        id: 1,
        name: 'Galpão Industrial - ABC Ltda',
        groupNumber: 1,
        client: 'ABC Ltda',
        address: 'São Paulo - SP',
        startDate: '2026-01-25T08:00:00Z',
        endDate: '2026-03-15T17:00:00Z',
        observation: '',
        status: 'Em andamento',
      },
      assignedUser: null,
      orcamentoId: 'orc-001',
      composicaoIds: ['comp-001', 'comp-002'],
      custoPlanejado: 24067.75,
      custoReal: 3200.0,
      varianceCusto: -20867.75,
    },
    {
      id: 2,
      serviceOrderNumber: 'OS-0002',
      description: 'Estrutura de Cobertura - Projeto B',
      status: 'em_andamento',
      notes: 'Cliente XYZ Ind.',
      createdAt: '2026-01-22T14:00:00Z',
      startDate: '2026-02-01T08:00:00Z',
      updatedAt: '2026-01-22T14:00:00Z',
      quantity: 800,
      weight: '800',
      projectNumber: 'M-15707',
      progress: 0,
      projectId: {
        id: 2,
        name: 'Cobertura Metálica - XYZ Ind.',
        groupNumber: 2,
        client: 'XYZ Indústria',
        address: 'Campinas - SP',
        startDate: '2026-02-01T08:00:00Z',
        endDate: '2026-03-20T17:00:00Z',
        observation: '',
        status: 'Em andamento',
      },
      assignedUser: null,
      orcamentoId: 'orc-002',
      composicaoIds: ['comp-003'],
      custoPlanejado: 18500.0,
      custoReal: 0,
      varianceCusto: -18500.0,
    },
  ];

  /**
   * MOCK DATA: Atividades vinculadas a itens de orçamento
   */
  private mockAtividades: Activity[] = [
    // Projeto A - OS-0001
    {
      id: 1,
      description: 'Chapa ASTM A 36 - 6mm (MAT-CH-001)',
      status: 'Planejado',
      observation: 'Importado do orçamento - 6mm x 1500mm',
      macroTask: undefined,
      process: undefined,
      timePerUnit: undefined,
      quantity: 500,
      estimatedTime: undefined,
      actualTime: 0,
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z',
      collaborators: [],
      projectId: 1,
      orderServiceId: 1,
      createdBy: 1,
      unidadeTempo: undefined,
      project: {} as any,
      serviceOrder: {} as any,
      itemComposicaoId: 'item-001',
      custoPlanejado: 4250,
      custoReal: 0,
      quantidadePlanejada: 500,
      quantidadeRealizada: 0,
    },
    {
      id: 2,
      description: 'Perfil I ASTM A 572 - 200mm (MAT-PF-001)',
      status: 'Planejado',
      observation: 'Importado do orçamento - I 200mm',
      macroTask: undefined,
      process: undefined,
      timePerUnit: undefined,
      quantity: 800,
      estimatedTime: undefined,
      actualTime: 0,
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z',
      collaborators: [],
      projectId: 1,
      orderServiceId: 1,
      createdBy: 1,
      unidadeTempo: undefined,
      project: {} as any,
      serviceOrder: {} as any,
      itemComposicaoId: 'item-002',
      custoPlanejado: 7360,
      custoReal: 0,
      quantidadePlanejada: 800,
      quantidadeRealizada: 0,
    },
    {
      id: 3,
      description: 'Eletrodo Revestido AWS E7018 (MAT-EL-001)',
      status: 'Planejado',
      observation: 'Importado do orçamento',
      macroTask: undefined,
      process: undefined,
      timePerUnit: undefined,
      quantity: 25,
      estimatedTime: undefined,
      actualTime: 0,
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z',
      collaborators: [],
      projectId: 1,
      orderServiceId: 1,
      createdBy: 1,
      unidadeTempo: undefined,
      project: {} as any,
      serviceOrder: {} as any,
      itemComposicaoId: 'item-003',
      custoPlanejado: 612.5,
      custoReal: 0,
      quantidadePlanejada: 25,
      quantidadeRealizada: 0,
    },
    // Projeto B - OS-0002
    {
      id: 4,
      description: 'Chapa ASTM A 36 - 6mm (MAT-CH-001)',
      status: 'Planejado',
      observation: 'Projeto B - Cobertura',
      macroTask: undefined,
      process: undefined,
      timePerUnit: undefined,
      quantity: 300,
      estimatedTime: undefined,
      actualTime: 0,
      createdAt: '2026-01-22T14:00:00Z',
      updatedAt: '2026-01-22T14:00:00Z',
      collaborators: [],
      projectId: 2,
      orderServiceId: 2,
      createdBy: 1,
      unidadeTempo: undefined,
      project: {} as any,
      serviceOrder: {} as any,
      itemComposicaoId: 'item-004',
      custoPlanejado: 2550,
      custoReal: 0,
      quantidadePlanejada: 300,
      quantidadeRealizada: 0,
    },
    {
      id: 5,
      description: 'Perfil I ASTM A 572 - 200mm (MAT-PF-001)',
      status: 'Planejado',
      observation: 'Projeto B - Cobertura',
      macroTask: undefined,
      process: undefined,
      timePerUnit: undefined,
      quantity: 500,
      estimatedTime: undefined,
      actualTime: 0,
      createdAt: '2026-01-22T14:00:00Z',
      updatedAt: '2026-01-22T14:00:00Z',
      collaborators: [],
      projectId: 2,
      orderServiceId: 2,
      createdBy: 1,
      unidadeTempo: undefined,
      project: {} as any,
      serviceOrder: {} as any,
      itemComposicaoId: 'item-005',
      custoPlanejado: 4600,
      custoReal: 0,
      quantidadePlanejada: 500,
      quantidadeRealizada: 0,
    },
  ];

  /**
   * MOCK DATA: Mapa de códigos de material por item de composição
   */
  private mockItemComposicaoToMaterial: Record<string, {
    codigo: string;
    descricao: string;
    unidade: string;
    tipoItem: 'material' | 'consumivel' | 'mao_obra' | 'servico' | 'equipamento';
    material?: string;
    especificacao?: string;
    classeABC?: 'A' | 'B' | 'C';
    valorUnitario: number;
    leadTime?: number;
  }> = {
    'item-001': {
      codigo: 'MAT-CH-001',
      descricao: 'Chapa ASTM A 36 - 6mm',
      unidade: 'kg',
      tipoItem: 'material',
      material: 'ASTM A 36',
      especificacao: '6mm x 1500mm',
      classeABC: 'A',
      valorUnitario: 8.5,
      leadTime: 20, // Chapas especiais: 20 dias
    },
    'item-002': {
      codigo: 'MAT-PF-001',
      descricao: 'Perfil I ASTM A 572 - 200mm',
      unidade: 'kg',
      tipoItem: 'material',
      material: 'ASTM A 572',
      especificacao: 'I 200mm',
      classeABC: 'A',
      valorUnitario: 9.2,
      leadTime: 25, // Perfis grandes: 25 dias
    },
    'item-003': {
      codigo: 'MAT-EL-001',
      descricao: 'Eletrodo Revestido AWS E7018',
      unidade: 'kg',
      tipoItem: 'consumivel',
      classeABC: 'C',
      valorUnitario: 24.5,
      leadTime: 5, // Consumíveis: 5 dias
    },
    'item-004': {
      codigo: 'MAT-CH-001',
      descricao: 'Chapa ASTM A 36 - 6mm',
      unidade: 'kg',
      tipoItem: 'material',
      material: 'ASTM A 36',
      especificacao: '6mm x 1500mm',
      classeABC: 'A',
      valorUnitario: 8.5,
      leadTime: 20, // Chapas especiais: 20 dias
    },
    'item-005': {
      codigo: 'MAT-PF-001',
      descricao: 'Perfil I ASTM A 572 - 200mm',
      unidade: 'kg',
      tipoItem: 'material',
      material: 'ASTM A 572',
      especificacao: 'I 200mm',
      classeABC: 'A',
      valorUnitario: 9.2,
      leadTime: 25, // Perfis grandes: 25 dias
    },
  };

  // ============================================
  // MÉTODOS PRINCIPAIS
  // ============================================

  /**
   * Calcula necessidades de materiais por projeto individual
   */
  async calcularNecessidadesPorProjeto(
    projetoId: number
  ): Promise<NecessidadeMaterial[]> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    // Busca Service Orders do projeto
    const serviceOrders = this.mockServiceOrders.filter(
      (os) => os.projectId.id === projetoId
    );

    if (serviceOrders.length === 0) {
      return [];
    }

    // Busca atividades vinculadas a estas OSs
    const atividades = this.mockAtividades.filter((ativ) =>
      serviceOrders.some((os) => os.id === ativ.orderServiceId)
    );

    // Agrupa atividades por código de material
    const necessidadesPorMaterial = new Map<string, {
      atividades: Activity[];
      material: typeof this.mockItemComposicaoToMaterial[string];
    }>();

    for (const atividade of atividades) {
      if (!atividade.itemComposicaoId) continue;

      const materialInfo = this.mockItemComposicaoToMaterial[atividade.itemComposicaoId];
      if (!materialInfo) continue;

      const codigo = materialInfo.codigo;

      if (!necessidadesPorMaterial.has(codigo)) {
        necessidadesPorMaterial.set(codigo, {
          atividades: [],
          material: materialInfo,
        });
      }

      necessidadesPorMaterial.get(codigo)!.atividades.push(atividade);
    }

    // Calcula necessidades para cada material
    const necessidades: NecessidadeMaterial[] = [];

    for (const [codigo, { atividades: ativs, material }] of necessidadesPorMaterial) {
      const quantidadeBruta = ativs.reduce(
        (sum, a) => sum + (a.quantidadePlanejada || 0),
        0
      );

      // Busca estoque
      const itemEstoque = this.mockEstoque.find((e) => e.codigo === codigo);
      const estoqueDisponivel = itemEstoque?.quantidadeDisponivel || 0;

      // Quantidade em pedidos (mock)
      const quantidadeEmPedido = 0;

      // Calcula necessidade líquida
      const quantidadeLiquida = Math.max(
        0,
        quantidadeBruta - estoqueDisponivel - quantidadeEmPedido
      );

      // Cria origens (pegging)
      const origens: OrigemNecessidade[] = ativs.map((a) => {
        const os = serviceOrders.find((s) => s.id === a.orderServiceId)!;
        return {
          projetoId: os.projectId.id,
          projetoNome: os.projectId.name,
          osId: os.id,
          osNumero: os.serviceOrderNumber,
          atividadeId: a.id,
          atividadeDescricao: a.description,
          itemComposicaoId: a.itemComposicaoId!,
          quantidadeDemandada: a.quantidadePlanejada || 0,
          dataNecessidade: os.startDate || new Date().toISOString(),
          prioridade: this.calcularPrioridade(os.startDate || new Date().toISOString()),
        };
      });

      // Data mais próxima
      const dataNecessidadeMaisProxima = origens.reduce((min, o) =>
        o.dataNecessidade < min ? o.dataNecessidade : min,
        origens[0].dataNecessidade
      );

      // Lead time - busca do material ou usa padrão 15 dias
      const leadTime = material.leadTime || 15;
      const dataSugeridaPedido = new Date(
        new Date(dataNecessidadeMaisProxima).getTime() - leadTime * 24 * 60 * 60 * 1000
      ).toISOString();

      // Status
      const status =
        quantidadeLiquida > 0
          ? estoqueDisponivel === 0
            ? ('critica' as const)
            : ('parcial' as const)
          : ('atendida' as const);

      const necessidade: NecessidadeMaterial = {
        id: `nec-${projetoId}-${codigo}`,
        codigoMaterial: codigo,
        descricaoMaterial: material.descricao,
        unidade: material.unidade,
        tipoItem: material.tipoItem,
        material: material.material,
        especificacao: material.especificacao,
        classeABC: material.classeABC,
        quantidadeBruta,
        estoqueDisponivel,
        quantidadeEmPedido,
        quantidadeLiquida,
        valorUnitario: material.valorUnitario,
        valorTotal: quantidadeLiquida * material.valorUnitario,
        origens,
        dataNecessidadeMaisProxima,
        leadTime,
        dataSugeridaPedido,
        status,
        temConflito: false, // Calculado em consolidação
      };

      necessidades.push(necessidade);
    }

    return necessidades;
  }

  /**
   * Calcula necessidades consolidadas de TODOS os projetos ativos
   */
  async calcularNecessidadesConsolidadas(
    request?: CalculoMRPRequest
  ): Promise<NecessidadeConsolidada[]> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    // Determina projetos a analisar - valida array não vazio
    const projetosParaAnalisar =
      request?.projetoIds && request.projetoIds.length > 0 ? request.projetoIds : [1, 2];

    // Calcula necessidades por projeto
    const necessidadesPorProjeto = new Map<number, NecessidadeMaterial[]>();
    for (const projetoId of projetosParaAnalisar) {
      const nec = await this.calcularNecessidadesPorProjeto(projetoId);
      if (nec.length > 0) {
        necessidadesPorProjeto.set(projetoId, nec);
      }
    }

    // Consolida por código de material
    const consolidacaoPorMaterial = new Map<string, {
      necessidades: NecessidadeMaterial[];
      materialInfo: typeof this.mockItemComposicaoToMaterial[string];
    }>();

    for (const [projetoId, necessidades] of necessidadesPorProjeto) {
      for (const nec of necessidades) {
        if (!consolidacaoPorMaterial.has(nec.codigoMaterial)) {
          consolidacaoPorMaterial.set(nec.codigoMaterial, {
            necessidades: [],
            materialInfo: {
              codigo: nec.codigoMaterial,
              descricao: nec.descricaoMaterial,
              unidade: nec.unidade,
              tipoItem: nec.tipoItem,
              material: nec.material,
              especificacao: nec.especificacao,
              classeABC: nec.classeABC,
              valorUnitario: nec.valorUnitario,
            },
          });
        }

        consolidacaoPorMaterial.get(nec.codigoMaterial)!.necessidades.push(nec);
      }
    }

    // Cria necessidades consolidadas
    const consolidadas: NecessidadeConsolidada[] = [];

    for (const [codigo, { necessidades, materialInfo }] of consolidacaoPorMaterial) {
      // Agrega quantidades
      const quantidadeBrutaTotal = necessidades.reduce(
        (sum, n) => sum + n.quantidadeBruta,
        0
      );

      // Estoque é compartilhado entre todos os projetos - buscar diretamente da fonte
      const itemEstoque = this.mockEstoque.find((e) => e.codigo === codigo);
      const estoqueDisponivel = itemEstoque?.quantidadeDisponivel || 0;
      const quantidadeEmPedido = 0; // TODO: Buscar de pedidos em andamento
      const quantidadeLiquidaTotal = Math.max(
        0,
        quantidadeBrutaTotal - estoqueDisponivel - quantidadeEmPedido
      );

      // Breakdown por projeto
      const projetosOrigem = necessidades.map((n) => {
        const osIds = Array.from(
          new Set(n.origens.map((o) => o.osId))
        );
        return {
          projetoId: n.origens[0].projetoId,
          projetoNome: n.origens[0].projetoNome,
          quantidadeDemandada: n.quantidadeBruta,
          dataNecessidade: n.dataNecessidadeMaisProxima,
          osIds,
        };
      });

      // Consolida todas as origens
      const origensConsolidadas = necessidades.flatMap((n) => n.origens);

      // Data mais próxima
      const dataNecessidadeMaisProxima = necessidades.reduce(
        (min, n) =>
          n.dataNecessidadeMaisProxima < min
            ? n.dataNecessidadeMaisProxima
            : min,
        necessidades[0].dataNecessidadeMaisProxima
      );

      // Lead time e data de pedido
      const leadTime = necessidades[0].leadTime;
      const dataSugeridaPedido = necessidades[0].dataSugeridaPedido;

      // Status
      const status =
        quantidadeLiquidaTotal > 0
          ? estoqueDisponivel === 0
            ? ('critica' as const)
            : ('parcial' as const)
          : ('atendida' as const);

      // Identifica conflitos
      const conflitos = await this.identificarConflitos(codigo, origensConsolidadas);

      const consolidada: NecessidadeConsolidada = {
        codigoMaterial: codigo,
        descricaoMaterial: materialInfo.descricao,
        unidade: materialInfo.unidade,
        tipoItem: materialInfo.tipoItem,
        material: materialInfo.material,
        especificacao: materialInfo.especificacao,
        classeABC: materialInfo.classeABC,
        quantidadeBrutaTotal,
        estoqueDisponivel,
        quantidadeEmPedido,
        quantidadeLiquidaTotal,
        valorUnitario: materialInfo.valorUnitario,
        valorTotalConsolidado: quantidadeLiquidaTotal * materialInfo.valorUnitario,
        projetosOrigem,
        origensConsolidadas,
        dataNecessidadeMaisProxima,
        leadTime,
        dataSugeridaPedido,
        status,
        conflitos,
      };

      consolidadas.push(consolidada);
    }

    return consolidadas;
  }

  /**
   * Identifica conflitos quando múltiplos projetos precisam do mesmo material na mesma data
   */
  async identificarConflitos(
    codigoMaterial: string,
    origens: OrigemNecessidade[]
  ): Promise<ConflitoProjetos[]> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    // Agrupa origens por data
    const porData = new Map<string, OrigemNecessidade[]>();
    for (const origem of origens) {
      const dataKey = origem.dataNecessidade.substring(0, 10); // YYYY-MM-DD
      if (!porData.has(dataKey)) {
        porData.set(dataKey, []);
      }
      porData.get(dataKey)!.push(origem);
    }

    const conflitos: ConflitoProjetos[] = [];

    // Busca estoque disponível
    const itemEstoque = this.mockEstoque.find((e) => e.codigo === codigoMaterial);
    const estoqueTotal = itemEstoque?.quantidadeDisponivel || 0;

    for (const [data, origensNaData] of porData) {
      // Se múltiplos projetos na mesma data
      const projetosUnicos = new Set(origensNaData.map((o) => o.projetoId));

      if (projetosUnicos.size > 1) {
        const quantidadeTotalDemandada = origensNaData.reduce(
          (sum, o) => sum + o.quantidadeDemandada,
          0
        );

        // Se demanda excede estoque
        if (quantidadeTotalDemandada > estoqueTotal) {
          const deficit = quantidadeTotalDemandada - estoqueTotal;

          const projetosEmConflito = Array.from(projetosUnicos).map((projetoId) => {
            const origensProj = origensNaData.filter((o) => o.projetoId === projetoId);
            return {
              projetoId,
              projetoNome: origensProj[0].projetoNome,
              osId: origensProj[0].osId,
              osNumero: origensProj[0].osNumero,
              quantidadeSolicitada: origensProj.reduce(
                (sum, o) => sum + o.quantidadeDemandada,
                0
              ),
              prioridade: origensProj[0].prioridade,
            };
          });

          conflitos.push({
            id: `conflito-${codigoMaterial}-${data}`,
            codigoMaterial,
            dataConflito: data,
            quantidadeTotalDemandada,
            estoqueDisponivel: estoqueTotal,
            deficit,
            projetosEmConflito,
            sugestaoResolucao: this.calcularMelhorResolucao(deficit, estoqueTotal, projetosEmConflito),
          });
        }
      }
    }

    return conflitos;
  }

  /**
   * Gera sugestões de compra/fabricação consolidadas
   */
  async gerarSugestoesConsolidadas(
    necessidades: NecessidadeConsolidada[]
  ): Promise<SugestaoCompra[]> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    const sugestoes: SugestaoCompra[] = [];

    for (const nec of necessidades) {
      // Apenas gera sugestão se houver necessidade líquida
      if (nec.quantidadeLiquidaTotal <= 0) continue;

      // Pula mão de obra - não gera sugestão de compra/fabricação (usar sistema de RH)
      if (nec.tipoItem === 'mao_obra') continue;

      // Determina tipo de ação
      const tipo: 'comprar' | 'fabricar' | 'transferir' | 'antecipar_pedido' =
        nec.tipoItem === 'servico' ? 'fabricar' : 'comprar';

      // Urgência baseada no status
      const urgencia =
        nec.status === 'critica'
          ? ('critica' as const)
          : nec.status === 'parcial'
          ? ('alta' as const)
          : ('media' as const);

      // Projetos atendidos
      const projetosAtendidos = nec.projetosOrigem.map((p) => ({
        projetoId: p.projetoId,
        projetoNome: p.projetoNome,
        quantidadeAtendida: p.quantidadeDemandada,
      }));

      // Justificativa
      const justificativa =
        nec.conflitos.length > 0
          ? `Demanda de ${nec.projetosOrigem.length} projetos simultâneos. ${nec.conflitos.length} conflito(s) detectado(s).`
          : `Atende demanda de ${nec.projetosOrigem.length} projeto(s).`;

      const sugestao: SugestaoCompra = {
        id: `sug-${nec.codigoMaterial}-${Date.now()}`,
        tipo,
        codigoMaterial: nec.codigoMaterial,
        descricaoMaterial: nec.descricaoMaterial,
        quantidadeSugerida: nec.quantidadeLiquidaTotal,
        unidade: nec.unidade,
        valorUnitario: nec.valorUnitario,
        valorTotal: nec.valorTotalConsolidado,
        classeABC: nec.classeABC,
        justificativa,
        urgencia,
        prazoLimite: nec.dataNecessidadeMaisProxima,
        leadTime: nec.leadTime,
        projetosAtendidos,
        origens: nec.origensConsolidadas,
        ehConsolidada: nec.projetosOrigem.length > 1,
        quantidadeProjetos: nec.projetosOrigem.length,
        fornecedorSugerido: tipo === 'comprar' ? 'Fornecedor A' : undefined,
        centroTrabalho: tipo === 'fabricar' ? 'Centro de Trabalho 1' : undefined,
        status: 'pendente',
        dataCriacao: new Date().toISOString(),
      };

      sugestoes.push(sugestao);
    }

    return sugestoes;
  }

  /**
   * Gera relatório MRP completo
   */
  async gerarRelatorio(request: CalculoMRPRequest): Promise<RelatorioMRP> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    const necessidadesConsolidadas = await this.calcularNecessidadesConsolidadas(
      request
    );
    const sugestoes = await this.gerarSugestoesConsolidadas(necessidadesConsolidadas);

    // Identifica todos os conflitos
    const todosConflitos = necessidadesConsolidadas.flatMap((n) => n.conflitos);

    // KPIs
    const totalItens = necessidadesConsolidadas.length;
    const itensCriticos = necessidadesConsolidadas.filter(
      (n) => n.status === 'critica'
    ).length;
    const valorTotalNecessario = necessidadesConsolidadas.reduce(
      (sum, n) => sum + n.valorTotalConsolidado,
      0
    );
    const quantidadeProjetos = new Set(
      necessidadesConsolidadas.flatMap((n) =>
        n.projetosOrigem.map((p) => p.projetoId)
      )
    ).size;

    const valorTotalCompras = sugestoes
      .filter((s) => s.tipo === 'comprar')
      .reduce((sum, s) => sum + s.valorTotal, 0);

    const valorTotalFabricacao = sugestoes
      .filter((s) => s.tipo === 'fabricar')
      .reduce((sum, s) => sum + s.valorTotal, 0);

    const relatorio: RelatorioMRP = {
      id: `relatorio-${Date.now()}`,
      dataGeracao: new Date().toISOString(),
      tipo: request.consolidar ? 'consolidado' : 'por_projeto',
      totalItens,
      itensCriticos,
      valorTotalNecessario,
      quantidadeProjetos,
      quantidadeConflitos: todosConflitos.length,
      necessidadesConsolidadas,
      conflitos: todosConflitos,
      sugestoes,
      valorTotalCompras,
      valorTotalFabricacao,
      filtros: {
        projetoIds: request.projetoIds,
        dataInicio: request.dataLimite,
        classeABC: request.classeABC,
        apenasItensComFalta: request.apenasItensComFalta,
      },
    };

    return relatorio;
  }

  /**
   * Gera Dashboard MRP com KPIs agregados
   */
  async gerarDashboard(): Promise<DashboardMRP> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    const relatorio = await this.gerarRelatorio({ consolidar: true });

    // KPIs principais
    const totalMateriaisNecessarios = relatorio.totalItens;
    const itensEmFalta = relatorio.necessidadesConsolidadas!.filter(
      (n) => n.quantidadeLiquidaTotal > 0
    ).length;
    const percentualFalta =
      totalMateriaisNecessarios > 0
        ? (itensEmFalta / totalMateriaisNecessarios) * 100
        : 0;
    const valorTotalCompras = relatorio.valorTotalCompras;
    const sugestoesPendentes = relatorio.sugestoes.filter(
      (s) => s.status === 'pendente'
    ).length;
    const conflitosAtivos = relatorio.conflitos.length;
    // Proteção contra divisão por zero - prazo médio
    const prazoMedioEntrega =
      relatorio.sugestoes.length > 0
        ? relatorio.sugestoes.reduce((sum, s) => sum + (s.leadTime || 0), 0) /
          relatorio.sugestoes.length
        : 0;

    // Por classe ABC
    const porClasseABC = {
      classeA: {
        quantidade: relatorio.necessidadesConsolidadas!.filter(
          (n) => n.classeABC === 'A'
        ).length,
        valor: relatorio.necessidadesConsolidadas!
          .filter((n) => n.classeABC === 'A')
          .reduce((sum, n) => sum + n.valorTotalConsolidado, 0),
        percentualValor: 0,
      },
      classeB: {
        quantidade: relatorio.necessidadesConsolidadas!.filter(
          (n) => n.classeABC === 'B'
        ).length,
        valor: relatorio.necessidadesConsolidadas!
          .filter((n) => n.classeABC === 'B')
          .reduce((sum, n) => sum + n.valorTotalConsolidado, 0),
        percentualValor: 0,
      },
      classeC: {
        quantidade: relatorio.necessidadesConsolidadas!.filter(
          (n) => n.classeABC === 'C'
        ).length,
        valor: relatorio.necessidadesConsolidadas!
          .filter((n) => n.classeABC === 'C')
          .reduce((sum, n) => sum + n.valorTotalConsolidado, 0),
        percentualValor: 0,
      },
    };

    const valorTotal =
      porClasseABC.classeA.valor + porClasseABC.classeB.valor + porClasseABC.classeC.valor;

    // Proteção contra divisão por zero
    if (valorTotal > 0) {
      porClasseABC.classeA.percentualValor = (porClasseABC.classeA.valor / valorTotal) * 100;
      porClasseABC.classeB.percentualValor = (porClasseABC.classeB.valor / valorTotal) * 100;
      porClasseABC.classeC.percentualValor = (porClasseABC.classeC.valor / valorTotal) * 100;
    } else {
      porClasseABC.classeA.percentualValor = 0;
      porClasseABC.classeB.percentualValor = 0;
      porClasseABC.classeC.percentualValor = 0;
    }

    // Por projeto
    const projetosMap = new Map<number, {
      projetoId: number;
      projetoNome: string;
      totalItens: number;
      itensCriticos: number;
      valorTotal: number;
    }>();

    for (const nec of relatorio.necessidadesConsolidadas!) {
      for (const proj of nec.projetosOrigem) {
        if (!projetosMap.has(proj.projetoId)) {
          projetosMap.set(proj.projetoId, {
            projetoId: proj.projetoId,
            projetoNome: proj.projetoNome,
            totalItens: 0,
            itensCriticos: 0,
            valorTotal: 0,
          });
        }

        const p = projetosMap.get(proj.projetoId)!;
        p.totalItens++;
        if (nec.status === 'critica') p.itensCriticos++;
        p.valorTotal += nec.valorUnitario * proj.quantidadeDemandada;
      }
    }

    const porProjeto = Array.from(projetosMap.values());

    // Itens mais críticos (top 10)
    const itensMaisCriticos = relatorio
      .necessidadesConsolidadas!.filter((n) => n.quantidadeLiquidaTotal > 0)
      .sort((a, b) => b.valorTotalConsolidado - a.valorTotalConsolidado)
      .slice(0, 10)
      .map((n) => ({
        codigoMaterial: n.codigoMaterial,
        descricao: n.descricaoMaterial,
        quantidadeFaltante: n.quantidadeLiquidaTotal,
        valorFaltante: n.valorTotalConsolidado,
        prazoLimite: n.dataNecessidadeMaisProxima,
        quantidadeProjetos: n.projetosOrigem.length,
      }));

    // Timeline de necessidades (próximos 90 dias)
    const timelineNecessidades = this.gerarTimelineMock();

    const dashboard: DashboardMRP = {
      dataAtualizacao: new Date().toISOString(),
      kpis: {
        totalMateriaisNecessarios,
        itensEmFalta,
        percentualFalta,
        valorTotalCompras,
        sugestoesPendentes,
        conflitosAtivos,
        prazoMedioEntrega,
      },
      porClasseABC,
      porProjeto,
      itensMaisCriticos,
      timelineNecessidades,
    };

    return dashboard;
  }

  /**
   * Gera timeline mock de necessidades (próximos 90 dias)
   */
  private gerarTimelineMock(): {
    data: string;
    quantidadeItens: number;
    valorTotal: number;
    itensCriticos: number;
  }[] {
    const timeline = [];
    const hoje = new Date();

    for (let i = 0; i < 90; i += 7) {
      const data = new Date(hoje.getTime() + i * 24 * 60 * 60 * 1000);
      timeline.push({
        data: data.toISOString().substring(0, 10),
        quantidadeItens: Math.floor(Math.random() * 10) + 5,
        valorTotal: Math.floor(Math.random() * 50000) + 10000,
        itensCriticos: Math.floor(Math.random() * 3),
      });
    }

    return timeline;
  }

  // ============================================
  // INTEGRAÇÃO COM MÓDULOS EXISTENTES
  // ============================================

  /**
   * Gera requisições de compra a partir de sugestões do MRP
   * Integração com RequisicoesService existente
   */
  async gerarRequisicoesDeCompra(
    sugestoes: SugestaoCompra[]
  ): Promise<{ success: boolean; requisicoes: number[]; errors: string[] }> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    const requisicoesCriadas: number[] = [];
    const erros: string[] = [];

    for (const sugestao of sugestoes) {
      try {
        // Monta dados da requisição no formato esperado pelo RequisicoesService
        // Proteção contra arrays vazios
        const primeiroProjeto = sugestao.projetosAtendidos[0];
        const primeiraOrigem = sugestao.origens.length > 0 ? sugestao.origens[0] : null;

        const requisicaoData: RequisicaoCreate = {
          status: 'pendente',
          solicitante_id: 1, // Mock: Sistema MRP
          solicitante_nome: 'Sistema MRP',
          centro_custo_id: primeiroProjeto?.projetoId || 1,
          centro_custo_nome: primeiroProjeto?.projetoNome || 'PCP - MRP',
          obra_id: primeiroProjeto?.projetoId,
          obra_nome: primeiroProjeto?.projetoNome,
          data_requisicao: new Date().toISOString(),
          data_necessidade: sugestao.prazoLimite,
          prioridade: this.mapearUrgenciaParaPrioridade(sugestao.urgencia),
          items: [
            {
              id: 0, // Será gerado pelo service
              requisicao_id: 0, // Será gerado pelo service
              descricao: sugestao.descricaoMaterial,
              especificacao:
                primeiraOrigem && this.mockItemComposicaoToMaterial[primeiraOrigem.itemComposicaoId]
                  ? this.mockItemComposicaoToMaterial[primeiraOrigem.itemComposicaoId].especificacao
                  : 'Conforme orçamento',
              quantidade: sugestao.quantidadeSugerida,
              unidade: sugestao.unidade,
              data_necessidade: sugestao.prazoLimite,
              centro_custo_id: sugestao.projetosAtendidos[0]?.projetoId || 1,
              centro_custo_nome: sugestao.projetosAtendidos[0]?.projetoNome || 'PCP - MRP',
              observacoes: `Classe ABC: ${sugestao.classeABC || 'N/A'} | Lead Time: ${sugestao.leadTime || 0} dias`,
            },
          ],
          justificativa: `[MRP] ${sugestao.justificativa}. ${
            sugestao.ehConsolidada
              ? sugestao.quantidadeProjetos <= 3
                ? `Atende ${sugestao.quantidadeProjetos} projetos: ${sugestao.projetosAtendidos
                    .map((p) => p.projetoNome)
                    .join(', ')}.`
                : `Atende ${sugestao.quantidadeProjetos} projetos simultaneamente.`
              : ''
          }`,
          observacoes: `Gerado automaticamente pelo MRP. Fornecedor sugerido: ${
            sugestao.fornecedorSugerido || 'A definir'
          }`,
          created_by: 1, // Mock: Sistema MRP
        };

        // Cria requisição usando o service existente
        const response = await RequisicoesService.create(requisicaoData);

        if (response.success && response.data?.requisicao) {
          requisicoesCriadas.push(response.data.requisicao.id);
        } else {
          erros.push(`Erro ao criar requisição para ${sugestao.codigoMaterial}: ${response.message}`);
        }
      } catch (error) {
        erros.push(
          `Erro ao processar sugestão ${sugestao.codigoMaterial}: ${
            error instanceof Error ? error.message : 'Erro desconhecido'
          }`
        );
      }
    }

    return {
      success: erros.length === 0,
      requisicoes: requisicoesCriadas,
      errors: erros,
    };
  }

  /**
   * Calcula melhor estratégia de resolução de conflito
   */
  private calcularMelhorResolucao(
    deficit: number,
    estoqueTotal: number,
    projetosEmConflito: {
      projetoId: number;
      projetoNome: string;
      osId: number;
      osNumero: string;
      quantidadeSolicitada: number;
      prioridade: 'critica' | 'alta' | 'media' | 'baixa';
    }[]
  ): 'comprar_mais' | 'reprogramar_projeto' | 'dividir_estoque' {
    // Se déficit é muito grande (>50% do estoque), melhor comprar
    if (deficit > estoqueTotal * 0.5) return 'comprar_mais';

    // Se há projeto crítico, dividir estoque priorizando-o
    if (projetosEmConflito.some((p) => p.prioridade === 'critica')) return 'dividir_estoque';

    // Caso contrário, sugerir reprogramação
    return 'reprogramar_projeto';
  }

  /**
   * Calcula prioridade baseada na data de necessidade
   */
  private calcularPrioridade(dataNecessidade: string): 'critica' | 'alta' | 'media' | 'baixa' {
    const dias = Math.floor(
      (new Date(dataNecessidade).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (dias < 0) return 'critica'; // Atrasado
    if (dias < 7) return 'critica'; // Menos de 1 semana
    if (dias < 30) return 'alta'; // Menos de 1 mês
    if (dias < 60) return 'media'; // Menos de 2 meses
    return 'baixa';
  }

  /**
   * Mapeia urgência do MRP para prioridade do sistema de requisições
   */
  private mapearUrgenciaParaPrioridade(
    urgencia: 'critica' | 'alta' | 'media' | 'baixa'
  ): 'urgente' | 'alta' | 'media' | 'baixa' {
    if (urgencia === 'critica') return 'urgente';
    return urgencia;
  }

  /**
   * Consulta estoque atual
   * Integração com ItemEstoqueService existente
   */
  async consultarEstoque(codigoMaterial: string): Promise<ItemEstoqueIntegracao | null> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    return this.mockEstoque.find((e) => e.codigo === codigoMaterial) || null;
  }
}

// Singleton export
const MRPService = new MRPServiceClass();
export default MRPService;
