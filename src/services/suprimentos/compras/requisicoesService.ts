// Service para Requisições de Compra
import { ApiResponse } from '@/interfaces/ApiResponse';
import {
  Requisicao,
  RequisicaoCreate,
  RequisicaoUpdate,
} from '@/interfaces/suprimentos/compras/RequisicaoInterface';

// ============================================================================
// MOCK DATA
// ============================================================================
let mockRequisicoes: Requisicao[] = [
  {
    id: 1,
    numero: 'REQ-2026-001',
    status: 'aprovada',
    solicitante_id: 1,
    solicitante_nome: 'João Silva',
    centro_custo_id: 1,
    centro_custo_nome: 'Obra Galpão Industrial',
    obra_id: 1,
    obra_nome: 'Galpão Industrial - Cliente XYZ',
    data_requisicao: '2026-01-10T08:00:00Z',
    data_necessidade: '2026-01-25T00:00:00Z',
    prioridade: 'alta',
    items: [
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
        observacoes: 'Urgente para montagem',
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
    justificativa: 'Materiais necessários para montagem da estrutura metálica conforme cronograma',
    observacoes: 'Verificar disponibilidade de entrega urgente',
    aprovador_id: 2,
    aprovador_nome: 'Maria Santos',
    data_aprovacao: '2026-01-11T10:30:00Z',
    created_by: 1,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-11T10:30:00Z',
  },
  {
    id: 2,
    numero: 'REQ-2026-002',
    status: 'pendente',
    solicitante_id: 3,
    solicitante_nome: 'Carlos Mendes',
    centro_custo_id: 2,
    centro_custo_nome: 'Obra Edifício Comercial',
    obra_id: 2,
    obra_nome: 'Edifício Comercial - Shopping Center',
    data_requisicao: '2026-01-12T14:00:00Z',
    data_necessidade: '2026-02-01T00:00:00Z',
    prioridade: 'media',
    items: [
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
    justificativa: 'Cobertura do edifício conforme projeto arquitetônico',
    created_by: 3,
    created_at: '2026-01-12T14:00:00Z',
    updated_at: '2026-01-12T14:00:00Z',
  },
  {
    id: 3,
    numero: 'REQ-2026-003',
    status: 'em_cotacao',
    solicitante_id: 1,
    solicitante_nome: 'João Silva',
    centro_custo_id: 3,
    centro_custo_nome: 'Manutenção Geral',
    data_requisicao: '2026-01-08T09:00:00Z',
    data_necessidade: '2026-01-20T00:00:00Z',
    prioridade: 'urgente',
    items: [
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
    justificativa: 'Reposição de consumíveis de solda e corte',
    observacoes: 'Estoque crítico',
    aprovador_id: 2,
    aprovador_nome: 'Maria Santos',
    data_aprovacao: '2026-01-08T11:00:00Z',
    created_by: 1,
    created_at: '2026-01-08T09:00:00Z',
    updated_at: '2026-01-09T15:00:00Z',
  },
  {
    id: 4,
    numero: 'REQ-2026-004',
    status: 'rascunho',
    solicitante_id: 4,
    solicitante_nome: 'Ana Costa',
    centro_custo_id: 1,
    centro_custo_nome: 'Obra Galpão Industrial',
    obra_id: 1,
    obra_nome: 'Galpão Industrial - Cliente XYZ',
    data_requisicao: '2026-01-15T10:00:00Z',
    data_necessidade: '2026-02-10T00:00:00Z',
    prioridade: 'baixa',
    items: [
      {
        id: 9,
        requisicao_id: 4,
        descricao: 'Tinta Epóxi Industrial',
        especificacao: 'Cor cinza, acabamento fosco',
        quantidade: 20,
        unidade: 'L',
        data_necessidade: '2026-02-10T00:00:00Z',
        centro_custo_id: 1,
        centro_custo_nome: 'Obra Galpão Industrial',
      },
    ],
    justificativa: 'Pintura de estruturas metálicas',
    created_by: 4,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 5,
    numero: 'REQ-2026-005',
    status: 'reprovada',
    solicitante_id: 5,
    solicitante_nome: 'Pedro Oliveira',
    centro_custo_id: 4,
    centro_custo_nome: 'Administrativo',
    data_requisicao: '2026-01-13T11:00:00Z',
    data_necessidade: '2026-01-28T00:00:00Z',
    prioridade: 'media',
    items: [
      {
        id: 10,
        requisicao_id: 5,
        descricao: 'Notebook Dell',
        especificacao: 'Core i7, 16GB RAM, SSD 512GB',
        quantidade: 2,
        unidade: 'UN',
        data_necessidade: '2026-01-28T00:00:00Z',
        centro_custo_id: 4,
        centro_custo_nome: 'Administrativo',
      },
    ],
    justificativa: 'Equipamentos para novos colaboradores',
    aprovador_id: 2,
    aprovador_nome: 'Maria Santos',
    data_aprovacao: '2026-01-14T09:00:00Z',
    motivo_reprovacao: 'Orçamento não previsto. Aguardar próximo trimestre.',
    created_by: 5,
    created_at: '2026-01-13T11:00:00Z',
    updated_at: '2026-01-14T09:00:00Z',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================
class RequisicoesService {
  // GET ALL - Lista todas as requisições
  async getAll(): Promise<ApiResponse<{ requisicoes: Requisicao[] }>> {
    try {
      // Simula latência da rede
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        success: true,
        message: 'Requisições carregadas com sucesso',
        data: {
          requisicoes: [...mockRequisicoes],
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao carregar requisições',
      };
    }
  }

  // GET BY ID - Busca requisição específica
  async getById(id: number): Promise<ApiResponse<{ requisicao: Requisicao }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const requisicao = mockRequisicoes.find((r) => r.id === id);

      if (!requisicao) {
        return {
          success: false,
          message: 'Requisição não encontrada',
        };
      }

      return {
        success: true,
        message: 'Requisição carregada com sucesso',
        data: { requisicao },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao carregar requisição',
      };
    }
  }

  // GET BY STATUS - Filtra por status
  async getByStatus(status: string): Promise<ApiResponse<{ requisicoes: Requisicao[] }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const requisicoes = mockRequisicoes.filter((r) => r.status === status);

      return {
        success: true,
        message: 'Requisições filtradas com sucesso',
        data: { requisicoes },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao filtrar requisições',
      };
    }
  }

  // CREATE - Cria nova requisição
  async create(data: RequisicaoCreate): Promise<ApiResponse<{ requisicao: Requisicao }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Gera número automático
      const year = new Date().getFullYear();
      const numero = `REQ-${year}-${String(mockRequisicoes.length + 1).padStart(3, '0')}`;

      const novaRequisicao: Requisicao = {
        ...data,
        id: mockRequisicoes.length + 1,
        numero,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRequisicoes.push(novaRequisicao);

      return {
        success: true,
        message: 'Requisição criada com sucesso',
        data: { requisicao: novaRequisicao },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao criar requisição',
      };
    }
  }

  // UPDATE - Atualiza requisição existente
  async update(id: number, data: RequisicaoUpdate): Promise<ApiResponse<{ requisicao: Requisicao }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = mockRequisicoes.findIndex((r) => r.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Requisição não encontrada',
        };
      }

      const requisicaoAtualizada: Requisicao = {
        ...mockRequisicoes[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      mockRequisicoes[index] = requisicaoAtualizada;

      return {
        success: true,
        message: 'Requisição atualizada com sucesso',
        data: { requisicao: requisicaoAtualizada },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao atualizar requisição',
      };
    }
  }

  // DELETE - Deleta requisição
  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const index = mockRequisicoes.findIndex((r) => r.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Requisição não encontrada',
        };
      }

      mockRequisicoes.splice(index, 1);

      return {
        success: true,
        message: 'Requisição deletada com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao deletar requisição',
      };
    }
  }

  // APROVAR - Aprova requisição
  async aprovar(id: number, aprovadorId: number): Promise<ApiResponse<{ requisicao: Requisicao }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const index = mockRequisicoes.findIndex((r) => r.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Requisição não encontrada',
        };
      }

      const requisicaoAprovada: Requisicao = {
        ...mockRequisicoes[index],
        status: 'aprovada',
        aprovador_id: aprovadorId,
        aprovador_nome: 'Aprovador Mock',
        data_aprovacao: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRequisicoes[index] = requisicaoAprovada;

      return {
        success: true,
        message: 'Requisição aprovada com sucesso',
        data: { requisicao: requisicaoAprovada },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao aprovar requisição',
      };
    }
  }

  // REPROVAR - Reprova requisição
  async reprovar(
    id: number,
    aprovadorId: number,
    motivo: string
  ): Promise<ApiResponse<{ requisicao: Requisicao }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const index = mockRequisicoes.findIndex((r) => r.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Requisição não encontrada',
        };
      }

      const requisicaoReprovada: Requisicao = {
        ...mockRequisicoes[index],
        status: 'reprovada',
        aprovador_id: aprovadorId,
        aprovador_nome: 'Aprovador Mock',
        data_aprovacao: new Date().toISOString(),
        motivo_reprovacao: motivo,
        updated_at: new Date().toISOString(),
      };

      mockRequisicoes[index] = requisicaoReprovada;

      return {
        success: true,
        message: 'Requisição reprovada',
        data: { requisicao: requisicaoReprovada },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao reprovar requisição',
      };
    }
  }
}

export default new RequisicoesService();
