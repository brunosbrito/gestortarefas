/**
 * FASE 1 PCP: Orçamento Execução Service
 * Integra BOM do Orçamento com Service Orders e Atividades
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

import { Orcamento, ComposicaoCustos, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { Activity } from '@/interfaces/AtividadeInterface';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface VarianceReport {
  obraId: number;
  obraNome: string;
  totalPlanejado: number;
  totalReal: number;
  varianceTotal: number;
  variancePercentual: number;
  serviceOrders: ServiceOrderVariance[];
}

export interface ServiceOrderVariance {
  osId: number;
  osNumero: string;
  custoPlanejado: number;
  custoReal: number;
  variance: number;
  variancePercentual: number;
  composicoes: ComposicaoVariance[];
}

export interface ComposicaoVariance {
  composicaoId: string;
  composicaoNome: string;
  custoPlanejado: number;
  custoReal: number;
  variance: number;
  atividades: AtividadeVariance[];
}

export interface AtividadeVariance {
  atividadeId: number;
  descricao: string;
  quantidadePlanejada: number;
  quantidadeRealizada: number;
  custoPlanejado: number;
  custoReal: number;
  variance: number;
}

// ============================================
// SERVICE CLASS
// ============================================

class OrcamentoExecucaoServiceClass {
  private useMock = true; // IMPORTANTE: Frontend-only, mock mode ativado

  /**
   * MOCK DATA: Orçamentos para teste
   */
  private mockOrcamentos: Orcamento[] = [
    {
      id: 'orc-001',
      numero: 'S-001|2026',
      nome: 'Estrutura Metálica - Galpão Industrial',
      tipo: 'servico',
      pesoTotalProjeto: 15000,
      codigoProjeto: 'M-15706',
      clienteNome: 'Indústria ABC Ltda',
      composicoes: [
        {
          id: 'comp-001',
          orcamentoId: 'orc-001',
          nome: 'Materiais - Estrutura Metálica',
          tipo: 'materiais',
          itens: [
            {
              id: 'item-001',
              composicaoId: 'comp-001',
              codigo: 'MAT-CH-001',
              descricao: 'Chapa ASTM A 36 - 6mm',
              quantidade: 500,
              unidade: 'kg',
              peso: 500,
              material: 'ASTM A 36',
              especificacao: '6mm x 1500mm',
              valorUnitario: 8.50,
              subtotal: 4250,
              percentual: 35,
              tipoItem: 'material',
              tipoCalculo: 'kg',
              classeABC: 'A',
              ordem: 1
            },
            {
              id: 'item-002',
              composicaoId: 'comp-001',
              codigo: 'MAT-PF-001',
              descricao: 'Perfil I ASTM A 572 - 200mm',
              quantidade: 800,
              unidade: 'kg',
              peso: 800,
              material: 'ASTM A 572',
              especificacao: 'I 200mm',
              valorUnitario: 9.20,
              subtotal: 7360,
              percentual: 60,
              tipoItem: 'material',
              tipoCalculo: 'kg',
              classeABC: 'A',
              ordem: 2
            },
            {
              id: 'item-003',
              composicaoId: 'comp-001',
              codigo: 'MAT-EL-001',
              descricao: 'Eletrodo Revestido AWS E7018',
              quantidade: 25,
              unidade: 'kg',
              peso: 25,
              valorUnitario: 24.50,
              subtotal: 612.50,
              percentual: 5,
              tipoItem: 'consumivel',
              tipoCalculo: 'kg',
              classeABC: 'C',
              ordem: 3
            }
          ],
          bdi: {
            despesasAdministrativas: { percentual: 12, valor: 1466.70 },
            despesasComerciais: { percentual: 5, valor: 611.13 },
            despesasFinanceiras: { percentual: 3, valor: 366.68 },
            impostosIndiretos: { percentual: 5, valor: 611.13 },
            percentualTotal: 25,
            valorTotal: 3055.64
          },
          margemLucro: {
            percentual: 7,
            valor: 854.36
          },
          custoDirecto: 12222.50,
          subtotal: 16132.50,
          percentualDoTotal: 62,
          ordem: 1
        },
        {
          id: 'comp-002',
          orcamentoId: 'orc-001',
          nome: 'MO Fabricação',
          tipo: 'mo_fabricacao',
          itens: [
            {
              id: 'item-004',
              composicaoId: 'comp-002',
              codigo: 'MO-SOLD-001',
              descricao: 'Soldador Qualificado',
              quantidade: 120,
              unidade: 'h',
              cargo: 'Soldador',
              valorUnitario: 35.00,
              subtotal: 4200,
              percentual: 70,
              tipoItem: 'mao_obra',
              tipoCalculo: 'hh',
              encargos: {
                percentual: 50.72,
                valor: 2130.24
              },
              classeABC: 'A',
              ordem: 1
            },
            {
              id: 'item-005',
              composicaoId: 'comp-002',
              codigo: 'MO-AJ-001',
              descricao: 'Ajudante de Produção',
              quantidade: 80,
              unidade: 'h',
              cargo: 'Ajudante',
              valorUnitario: 22.50,
              subtotal: 1800,
              percentual: 30,
              tipoItem: 'mao_obra',
              tipoCalculo: 'hh',
              encargos: {
                percentual: 50.72,
                valor: 912.96
              },
              classeABC: 'B',
              ordem: 2
            }
          ],
          bdi: {
            despesasAdministrativas: { percentual: 12, valor: 726 },
            despesasComerciais: { percentual: 5, valor: 302.5 },
            despesasFinanceiras: { percentual: 3, valor: 181.5 },
            impostosIndiretos: { percentual: 5, valor: 302.5 },
            percentualTotal: 25,
            valorTotal: 1512.5
          },
          margemLucro: {
            percentual: 7,
            valor: 422.75
          },
          custoDirecto: 6000,
          subtotal: 7935.25,
          percentualDoTotal: 38,
          ordem: 2
        }
      ],
      tributos: {
        temISS: true,
        aliquotaISS: 3,
        aliquotaSimples: 11.8
      },
      custoDirectoTotal: 18222.50,
      bdiTotal: 4568.14,
      margemLucroTotal: 1277.11,
      subtotal: 24067.75,
      tributosTotal: 722.03,
      totalVenda: 24789.78,
      dre: {
        receitaLiquida: 24067.75,
        lucroBruto: 5845.25,
        margemBruta: 24.29,
        lucroOperacional: 2789.61,
        margemOperacional: 11.59,
        lucroLiquido: 1277.11,
        margemLiquida: 5.30
      },
      custoPorM2: 150.42,
      bdiMedio: 25,
      margemLucroMedia: 7,
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
      createdBy: 1
    }
  ];

  /**
   * Importa orçamento e cria Service Orders baseadas em composições
   */
  async importarOrcamentoParaOS(
    orcamentoId: string,
    obraId: number
  ): Promise<ServiceOrder[]> {
    if (!this.useMock) {
      // TODO: Implementação real com backend
      throw new Error('Backend integration not implemented yet');
    }

    // MOCK: Busca orçamento
    const orcamento = this.mockOrcamentos.find(o => o.id === orcamentoId);
    if (!orcamento) {
      throw new Error(`Orçamento ${orcamentoId} não encontrado`);
    }

    // MOCK: Cria Service Orders baseadas em composições principais
    const serviceOrders: ServiceOrder[] = [];
    let osNumber = 1;

    for (const composicao of orcamento.composicoes) {
      // Criar uma OS para cada composição de custo
      const os: ServiceOrder = {
        id: Date.now() + osNumber,
        serviceOrderNumber: `OS-${String(osNumber).padStart(4, '0')}`,
        description: `${composicao.nome} - ${orcamento.nome}`,
        status: 'em_andamento',
        notes: `Importado do orçamento ${orcamento.numero}`,
        createdAt: new Date().toISOString(),
        startDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        quantity: composicao.itens.reduce((sum, item) => sum + item.quantidade, 0),
        weight: composicao.itens
          .reduce((sum, item) => sum + (item.peso || 0), 0)
          .toString(),
        projectNumber: orcamento.codigoProjeto || 'N/A',
        progress: 0,
        projectId: {
          id: obraId,
          name: orcamento.clienteNome || 'Projeto',
          groupNumber: obraId,
          client: orcamento.clienteNome || 'Cliente',
          address: '',
          startDate: new Date().toISOString(),
          endDate: null,
          observation: '',
          status: 'Em andamento'
        },
        assignedUser: null,
        // NOVOS CAMPOS PCP
        orcamentoId: orcamento.id,
        composicaoIds: [composicao.id],
        custoPlanejado: composicao.subtotal,
        custoReal: 0,
        varianceCusto: 0
      };

      serviceOrders.push(os);
      osNumber++;
    }

    return serviceOrders;
  }

  /**
   * Gera atividades baseadas nos itens de uma composição
   */
  async gerarAtividadesDeBOM(
    serviceOrderId: number,
    composicaoId: string
  ): Promise<Activity[]> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    // MOCK: Busca composição
    let composicao: ComposicaoCustos | undefined;
    for (const orc of this.mockOrcamentos) {
      composicao = orc.composicoes.find(c => c.id === composicaoId);
      if (composicao) break;
    }

    if (!composicao) {
      throw new Error(`Composição ${composicaoId} não encontrada`);
    }

    // MOCK: Cria atividades baseadas em itens da composição
    const atividades: Activity[] = [];
    let atividadeId = Date.now();

    for (const item of composicao.itens) {
      const atividade: Activity = {
        id: atividadeId++,
        description: `${item.descricao} (${item.codigo || 'SEM-COD'})`,
        status: 'Planejado',
        observation: `Importado do orçamento - ${item.especificacao || ''}`,
        macroTask: undefined,
        process: undefined,
        timePerUnit: item.tipoItem === 'mao_obra' ? 1 : undefined,
        quantity: item.quantidade,
        estimatedTime: item.tipoItem === 'mao_obra' ? `${item.quantidade}h` : undefined,
        actualTime: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        collaborators: [],
        projectId: 1, // Mock
        orderServiceId: serviceOrderId,
        createdBy: 1,
        unidadeTempo: item.tipoItem === 'mao_obra' ? 'horas' : undefined,
        project: {} as any, // Mock
        serviceOrder: {} as any, // Mock
        // NOVOS CAMPOS PCP
        itemComposicaoId: item.id,
        custoPlanejado: item.subtotal,
        custoReal: 0,
        quantidadePlanejada: item.quantidade,
        quantidadeRealizada: 0
      };

      atividades.push(atividade);
    }

    return atividades;
  }

  /**
   * Compara orçado vs real de uma obra
   */
  async compararOrcadoVsReal(obraId: number): Promise<VarianceReport> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    // MOCK: Dados de exemplo com variance simulada
    const report: VarianceReport = {
      obraId,
      obraNome: 'Indústria ABC Ltda - Galpão Industrial',
      totalPlanejado: 24067.75,
      totalReal: 25150.30,
      varianceTotal: 1082.55,
      variancePercentual: 4.5,
      serviceOrders: [
        {
          osId: 1,
          osNumero: 'OS-0001',
          custoPlanejado: 16132.50,
          custoReal: 16850.20,
          variance: 717.70,
          variancePercentual: 4.4,
          composicoes: [
            {
              composicaoId: 'comp-001',
              composicaoNome: 'Materiais - Estrutura Metálica',
              custoPlanejado: 16132.50,
              custoReal: 16850.20,
              variance: 717.70,
              atividades: [
                {
                  atividadeId: 1,
                  descricao: 'Chapa ASTM A 36 - 6mm',
                  quantidadePlanejada: 500,
                  quantidadeRealizada: 520, // Consumiu mais que planejado
                  custoPlanejado: 4250,
                  custoReal: 4420,
                  variance: 170
                },
                {
                  atividadeId: 2,
                  descricao: 'Perfil I ASTM A 572 - 200mm',
                  quantidadePlanejada: 800,
                  quantidadeRealizada: 850,
                  custoPlanejado: 7360,
                  custoReal: 7820,
                  variance: 460
                }
              ]
            }
          ]
        },
        {
          osId: 2,
          osNumero: 'OS-0002',
          custoPlanejado: 7935.25,
          custoReal: 8300.10,
          variance: 364.85,
          variancePercentual: 4.6,
          composicoes: [
            {
              composicaoId: 'comp-002',
              composicaoNome: 'MO Fabricação',
              custoPlanejado: 7935.25,
              custoReal: 8300.10,
              variance: 364.85,
              atividades: [
                {
                  atividadeId: 3,
                  descricao: 'Soldador Qualificado',
                  quantidadePlanejada: 120,
                  quantidadeRealizada: 128, // Levou mais tempo
                  custoPlanejado: 4200,
                  custoReal: 4480,
                  variance: 280
                }
              ]
            }
          ]
        }
      ]
    };

    return report;
  }

  /**
   * Busca orçamento por ID (MOCK)
   */
  async getOrcamentoById(orcamentoId: string): Promise<Orcamento | null> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    return this.mockOrcamentos.find(o => o.id === orcamentoId) || null;
  }

  /**
   * Lista todos os orçamentos (MOCK)
   */
  async getAllOrcamentos(): Promise<Orcamento[]> {
    if (!this.useMock) {
      throw new Error('Backend integration not implemented yet');
    }

    return this.mockOrcamentos;
  }
}

// Singleton export
const OrcamentoExecucaoService = new OrcamentoExecucaoServiceClass();
export default OrcamentoExecucaoService;
