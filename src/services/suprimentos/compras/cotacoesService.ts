// Service para Cotações de Compra
import { ApiResponse } from '@/interfaces/ApiResponse';
import {
  Cotacao,
  CotacaoCreate,
  CotacaoUpdate,
} from '@/interfaces/suprimentos/compras/CotacaoInterface';

// ============================================================================
// MOCK DATA
// ============================================================================
let mockCotacoes: Cotacao[] = [
  {
    id: 1,
    numero: 'COT-2026-001',
    status: 'finalizada',
    requisicao_id: 1,
    requisicao_numero: 'REQ-2026-001',
    requisicao_items: [
      {
        id: 1,
        requisicao_id: 1,
        descricao: 'Parafusos Sextavados M12x50',
        especificacao: 'Aço galvanizado, classe 8.8',
        quantidade: 500,
        unidade: 'UN',
        data_necessidade: '2026-01-25T00:00:00Z',
        centro_custo_id: 1,
        centro_custo_nome: 'Obra Galpão Industrial',
      },
      {
        id: 2,
        requisicao_id: 1,
        descricao: 'Porcas Sextavadas M12',
        especificacao: 'Aço galvanizado, classe 8',
        quantidade: 500,
        unidade: 'UN',
        data_necessidade: '2026-01-25T00:00:00Z',
        centro_custo_id: 1,
        centro_custo_nome: 'Obra Galpão Industrial',
      },
      {
        id: 3,
        requisicao_id: 1,
        descricao: 'Arruelas Lisas M12',
        especificacao: 'Aço galvanizado',
        quantidade: 1000,
        unidade: 'UN',
        data_necessidade: '2026-01-25T00:00:00Z',
        centro_custo_id: 1,
        centro_custo_nome: 'Obra Galpão Industrial',
      },
    ],
    data_abertura: '2026-01-11T14:00:00Z',
    data_limite_resposta: '2026-01-18T23:59:59Z',
    data_finalizacao: '2026-01-17T16:00:00Z',
    fornecedores: [
      {
        id: 1,
        cotacao_id: 1,
        fornecedor_id: 1,
        fornecedor_nome: 'Parafusos Ltda',
        fornecedor_cnpj: '12.345.678/0001-90',
        fornecedor_email: 'vendas@parafusosltda.com.br',
        fornecedor_telefone: '(11) 3456-7890',
        data_envio: '2026-01-11T14:30:00Z',
        data_resposta: '2026-01-15T10:00:00Z',
        respondeu: true,
        items: [
          {
            id: '1',
            cotacao_fornecedor_id: 1,
            requisicao_item_id: 1,
            requisicao_item_descricao: 'Parafusos Sextavados M12x50',
            valor_unitario: 0.85,
            valor_total: 425.0,
            marca: 'Fixafort',
            observacoes: 'Entrega imediata',
          },
          {
            id: '2',
            cotacao_fornecedor_id: 1,
            requisicao_item_id: 2,
            requisicao_item_descricao: 'Porcas Sextavadas M12',
            valor_unitario: 0.45,
            valor_total: 225.0,
            marca: 'Fixafort',
          },
          {
            id: '3',
            cotacao_fornecedor_id: 1,
            requisicao_item_id: 3,
            requisicao_item_descricao: 'Arruelas Lisas M12',
            valor_unitario: 0.15,
            valor_total: 150.0,
            marca: 'Fixafort',
          },
        ],
        prazo_entrega: 5,
        forma_pagamento: '28 dias',
        condicoes_pagamento: 'Boleto ou Transferência',
        validade_proposta: 15,
      },
      {
        id: 2,
        cotacao_id: 1,
        fornecedor_id: 2,
        fornecedor_nome: 'Comercial de Parafusos XYZ',
        fornecedor_cnpj: '98.765.432/0001-10',
        fornecedor_email: 'cotacao@parafusosxyz.com.br',
        fornecedor_telefone: '(11) 2345-6789',
        data_envio: '2026-01-11T14:30:00Z',
        data_resposta: '2026-01-16T14:00:00Z',
        respondeu: true,
        items: [
          {
            id: '4',
            cotacao_fornecedor_id: 2,
            requisicao_item_id: 1,
            requisicao_item_descricao: 'Parafusos Sextavados M12x50',
            valor_unitario: 0.75,
            valor_total: 375.0,
            marca: 'Ciser',
            observacoes: 'Melhor preço',
          },
          {
            id: '5',
            cotacao_fornecedor_id: 2,
            requisicao_item_id: 2,
            requisicao_item_descricao: 'Porcas Sextavadas M12',
            valor_unitario: 0.40,
            valor_total: 200.0,
            marca: 'Ciser',
          },
          {
            id: '6',
            cotacao_fornecedor_id: 2,
            requisicao_item_id: 3,
            requisicao_item_descricao: 'Arruelas Lisas M12',
            valor_unitario: 0.12,
            valor_total: 120.0,
            marca: 'Ciser',
          },
        ],
        prazo_entrega: 7,
        forma_pagamento: '21 dias',
        condicoes_pagamento: 'Boleto',
        validade_proposta: 10,
      },
      {
        id: 3,
        cotacao_id: 1,
        fornecedor_id: 3,
        fornecedor_nome: 'Distribuidora ABC',
        fornecedor_cnpj: '45.678.901/0001-23',
        fornecedor_email: 'vendas@distribuidoraabc.com.br',
        fornecedor_telefone: '(11) 9876-5432',
        data_envio: '2026-01-11T14:30:00Z',
        respondeu: false,
        items: [],
      },
    ],
    observacoes: 'Cotação urgente para início da montagem',
    created_by: 1,
    created_at: '2026-01-11T14:00:00Z',
    updated_at: '2026-01-17T16:00:00Z',
  },
  {
    id: 2,
    numero: 'COT-2026-002',
    status: 'em_analise',
    requisicao_id: 3,
    requisicao_numero: 'REQ-2026-003',
    requisicao_items: [
      {
        id: 6,
        requisicao_id: 3,
        descricao: 'Eletrodo de Solda E6013',
        especificacao: 'Diâmetro 3.25mm',
        quantidade: 50,
        unidade: 'KG',
        data_necessidade: '2026-01-20T00:00:00Z',
        centro_custo_id: 3,
        centro_custo_nome: 'Manutenção Geral',
      },
      {
        id: 7,
        requisicao_id: 3,
        descricao: 'Disco de Corte 7"',
        especificacao: 'Para aço, espessura 3mm',
        quantidade: 100,
        unidade: 'UN',
        data_necessidade: '2026-01-20T00:00:00Z',
        centro_custo_id: 3,
        centro_custo_nome: 'Manutenção Geral',
      },
      {
        id: 8,
        requisicao_id: 3,
        descricao: 'Disco de Desbaste 7"',
        especificacao: 'Para aço, espessura 6mm',
        quantidade: 50,
        unidade: 'UN',
        data_necessidade: '2026-01-20T00:00:00Z',
        centro_custo_id: 3,
        centro_custo_nome: 'Manutenção Geral',
      },
    ],
    data_abertura: '2026-01-09T15:30:00Z',
    data_limite_resposta: '2026-01-16T23:59:59Z',
    fornecedores: [
      {
        id: 4,
        cotacao_id: 2,
        fornecedor_id: 4,
        fornecedor_nome: 'Ferramentas e Soldas Ltda',
        fornecedor_cnpj: '11.222.333/0001-44',
        fornecedor_email: 'vendas@ferramentasesoldas.com.br',
        fornecedor_telefone: '(11) 4567-8901',
        data_envio: '2026-01-09T16:00:00Z',
        data_resposta: '2026-01-14T11:00:00Z',
        respondeu: true,
        items: [
          {
            id: '7',
            cotacao_fornecedor_id: 4,
            requisicao_item_id: 6,
            requisicao_item_descricao: 'Eletrodo de Solda E6013',
            valor_unitario: 18.5,
            valor_total: 925.0,
            marca: 'Conarco',
          },
          {
            id: '8',
            cotacao_fornecedor_id: 4,
            requisicao_item_id: 7,
            requisicao_item_descricao: 'Disco de Corte 7"',
            valor_unitario: 3.2,
            valor_total: 320.0,
            marca: 'Norton',
          },
          {
            id: '9',
            cotacao_fornecedor_id: 4,
            requisicao_item_id: 8,
            requisicao_item_descricao: 'Disco de Desbaste 7"',
            valor_unitario: 4.5,
            valor_total: 225.0,
            marca: 'Norton',
          },
        ],
        prazo_entrega: 3,
        forma_pagamento: '14 dias',
        condicoes_pagamento: 'Boleto',
        validade_proposta: 7,
      },
      {
        id: 5,
        cotacao_id: 2,
        fornecedor_id: 5,
        fornecedor_nome: 'Distribuidora de Ferramentas DEF',
        fornecedor_cnpj: '55.666.777/0001-88',
        fornecedor_email: 'cotacao@ferramdef.com.br',
        fornecedor_telefone: '(11) 5678-9012',
        data_envio: '2026-01-09T16:00:00Z',
        data_resposta: '2026-01-15T09:30:00Z',
        respondeu: true,
        items: [
          {
            id: '10',
            cotacao_fornecedor_id: 5,
            requisicao_item_id: 6,
            requisicao_item_descricao: 'Eletrodo de Solda E6013',
            valor_unitario: 17.8,
            valor_total: 890.0,
            marca: 'Esab',
            observacoes: 'Preço promocional',
          },
          {
            id: '11',
            cotacao_fornecedor_id: 5,
            requisicao_item_id: 7,
            requisicao_item_descricao: 'Disco de Corte 7"',
            valor_unitario: 2.9,
            valor_total: 290.0,
            marca: 'Makita',
          },
          {
            id: '12',
            cotacao_fornecedor_id: 5,
            requisicao_item_id: 8,
            requisicao_item_descricao: 'Disco de Desbaste 7"',
            valor_unitario: 4.2,
            valor_total: 210.0,
            marca: 'Makita',
          },
        ],
        prazo_entrega: 2,
        forma_pagamento: '21 dias',
        condicoes_pagamento: 'Boleto ou Transferência',
        validade_proposta: 10,
        observacoes: 'Entrega expressa disponível',
      },
    ],
    observacoes: 'Reposição de estoque - urgente',
    created_by: 1,
    created_at: '2026-01-09T15:30:00Z',
    updated_at: '2026-01-15T09:30:00Z',
  },
  {
    id: 3,
    numero: 'COT-2026-003',
    status: 'aguardando',
    requisicao_id: 2,
    requisicao_numero: 'REQ-2026-002',
    requisicao_items: [
      {
        id: 4,
        requisicao_id: 2,
        descricao: 'Telhas Metálicas Trapezoidais',
        especificacao: 'Aço galvanizado, espessura 0.5mm, largura útil 1000mm',
        quantidade: 150,
        unidade: 'M2',
        data_necessidade: '2026-02-01T00:00:00Z',
        centro_custo_id: 2,
        centro_custo_nome: 'Obra Edifício Comercial',
      },
      {
        id: 5,
        requisicao_id: 2,
        descricao: 'Calhas Metálicas',
        especificacao: 'Desenvolvimento 33cm, aço galvanizado',
        quantidade: 80,
        unidade: 'M',
        data_necessidade: '2026-02-01T00:00:00Z',
        centro_custo_id: 2,
        centro_custo_nome: 'Obra Edifício Comercial',
      },
    ],
    data_abertura: '2026-01-13T08:00:00Z',
    data_limite_resposta: '2026-01-20T23:59:59Z',
    fornecedores: [
      {
        id: 6,
        cotacao_id: 3,
        fornecedor_id: 6,
        fornecedor_nome: 'Telhas e Coberturas S.A.',
        fornecedor_cnpj: '22.333.444/0001-55',
        fornecedor_email: 'orcamento@telhascoberturas.com.br',
        fornecedor_telefone: '(11) 6789-0123',
        data_envio: '2026-01-13T09:00:00Z',
        respondeu: false,
        items: [],
      },
      {
        id: 7,
        cotacao_id: 3,
        fornecedor_id: 7,
        fornecedor_nome: 'Metalúrgica GHI',
        fornecedor_cnpj: '88.999.000/0001-11',
        fornecedor_email: 'vendas@metalurgicaghi.com.br',
        fornecedor_telefone: '(11) 7890-1234',
        data_envio: '2026-01-13T09:00:00Z',
        respondeu: false,
        items: [],
      },
    ],
    created_by: 3,
    created_at: '2026-01-13T08:00:00Z',
    updated_at: '2026-01-13T09:00:00Z',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================
class CotacoesService {
  // GET ALL - Lista todas as cotações
  async getAll(): Promise<ApiResponse<{ cotacoes: Cotacao[] }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        success: true,
        message: 'Cotações carregadas com sucesso',
        data: {
          cotacoes: [...mockCotacoes],
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao carregar cotações',
      };
    }
  }

  // GET BY ID - Busca cotação específica
  async getById(id: number): Promise<ApiResponse<{ cotacao: Cotacao }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const cotacao = mockCotacoes.find((c) => c.id === id);

      if (!cotacao) {
        return {
          success: false,
          message: 'Cotação não encontrada',
        };
      }

      return {
        success: true,
        message: 'Cotação carregada com sucesso',
        data: { cotacao },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao carregar cotação',
      };
    }
  }

  // GET BY STATUS - Filtra por status
  async getByStatus(status: string): Promise<ApiResponse<{ cotacoes: Cotacao[] }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const cotacoes = mockCotacoes.filter((c) => c.status === status);

      return {
        success: true,
        message: 'Cotações filtradas com sucesso',
        data: { cotacoes },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao filtrar cotações',
      };
    }
  }

  // GET BY REQUISICAO - Busca cotações de uma requisição
  async getByRequisicao(requisicaoId: number): Promise<ApiResponse<{ cotacoes: Cotacao[] }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const cotacoes = mockCotacoes.filter((c) => c.requisicao_id === requisicaoId);

      return {
        success: true,
        message: 'Cotações da requisição carregadas',
        data: { cotacoes },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao carregar cotações',
      };
    }
  }

  // CREATE - Cria nova cotação
  async create(data: CotacaoCreate): Promise<ApiResponse<{ cotacao: Cotacao }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const year = new Date().getFullYear();
      const numero = `COT-${year}-${String(mockCotacoes.length + 1).padStart(3, '0')}`;

      const novaCotacao: Cotacao = {
        ...data,
        id: mockCotacoes.length + 1,
        numero,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockCotacoes.push(novaCotacao);

      return {
        success: true,
        message: 'Cotação criada com sucesso',
        data: { cotacao: novaCotacao },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao criar cotação',
      };
    }
  }

  // UPDATE - Atualiza cotação existente
  async update(id: number, data: CotacaoUpdate): Promise<ApiResponse<{ cotacao: Cotacao }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = mockCotacoes.findIndex((c) => c.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Cotação não encontrada',
        };
      }

      const cotacaoAtualizada: Cotacao = {
        ...mockCotacoes[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      mockCotacoes[index] = cotacaoAtualizada;

      return {
        success: true,
        message: 'Cotação atualizada com sucesso',
        data: { cotacao: cotacaoAtualizada },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao atualizar cotação',
      };
    }
  }

  // DELETE - Deleta cotação
  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const index = mockCotacoes.findIndex((c) => c.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Cotação não encontrada',
        };
      }

      mockCotacoes.splice(index, 1);

      return {
        success: true,
        message: 'Cotação deletada com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao deletar cotação',
      };
    }
  }

  // FINALIZAR - Finaliza cotação
  async finalizar(id: number): Promise<ApiResponse<{ cotacao: Cotacao }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const index = mockCotacoes.findIndex((c) => c.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Cotação não encontrada',
        };
      }

      const cotacaoFinalizada: Cotacao = {
        ...mockCotacoes[index],
        status: 'finalizada',
        data_finalizacao: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockCotacoes[index] = cotacaoFinalizada;

      return {
        success: true,
        message: 'Cotação finalizada com sucesso',
        data: { cotacao: cotacaoFinalizada },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao finalizar cotação',
      };
    }
  }
}

export default new CotacoesService();
