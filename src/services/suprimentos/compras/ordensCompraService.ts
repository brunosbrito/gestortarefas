// Service para Ordens de Compra
import { ApiResponse } from '@/interfaces/ApiResponse';
import {
  OrdemCompra,
  OrdemCompraCreate,
  OrdemCompraUpdate,
} from '@/interfaces/suprimentos/compras/OrdemCompraInterface';

// ============================================================================
// MOCK DATA
// ============================================================================
let mockOrdensCompra: OrdemCompra[] = [
  {
    id: 1,
    numero: 'OC-2026-001',
    status: 'recebida',
    requisicao_id: 1,
    requisicao_numero: 'REQ-2026-001',
    cotacao_id: 1,
    cotacao_numero: 'COT-2026-001',
    fornecedor_id: 2,
    fornecedor_nome: 'Comercial de Parafusos XYZ',
    fornecedor_cnpj: '98.765.432/0001-10',
    fornecedor_endereco: 'Rua das Indústrias, 123 - São Paulo/SP',
    fornecedor_email: 'cotacao@parafusosxyz.com.br',
    fornecedor_telefone: '(11) 2345-6789',
    data_emissao: '2026-01-17T16:30:00Z',
    data_previsao_entrega: '2026-01-24T00:00:00Z',
    data_confirmacao: '2026-01-18T09:00:00Z',
    data_recebimento: '2026-01-23T14:00:00Z',
    items: [
      {
        id: 1,
        ordem_compra_id: 1,
        requisicao_item_id: 1,
        cotacao_item_id: 4,
        descricao: 'Parafusos Sextavados M12x50',
        especificacao: 'Aço galvanizado, classe 8.8, Marca Ciser',
        quantidade: 500,
        unidade: 'UN',
        valor_unitario: 0.75,
        valor_total: 375.0,
        quantidade_recebida: 500,
        data_recebimento: '2026-01-23T14:00:00Z',
      },
      {
        id: 2,
        ordem_compra_id: 1,
        requisicao_item_id: 2,
        cotacao_item_id: 5,
        descricao: 'Porcas Sextavadas M12',
        especificacao: 'Aço galvanizado, classe 8, Marca Ciser',
        quantidade: 500,
        unidade: 'UN',
        valor_unitario: 0.40,
        valor_total: 200.0,
        quantidade_recebida: 500,
        data_recebimento: '2026-01-23T14:00:00Z',
      },
      {
        id: 3,
        ordem_compra_id: 1,
        requisicao_item_id: 3,
        cotacao_item_id: 6,
        descricao: 'Arruelas Lisas M12',
        especificacao: 'Aço galvanizado, Marca Ciser',
        quantidade: 1000,
        unidade: 'UN',
        valor_unitario: 0.12,
        valor_total: 120.0,
        quantidade_recebida: 1000,
        data_recebimento: '2026-01-23T14:00:00Z',
      },
    ],
    valor_subtotal: 695.0,
    valor_frete: 50.0,
    valor_desconto: 0,
    valor_total: 745.0,
    prazo_entrega: 7,
    forma_pagamento: '21 dias',
    condicoes_pagamento: 'Boleto bancário, vencimento em 21 dias após recebimento',
    local_entrega: 'Galpão Industrial - Av. das Indústrias, 500 - São Paulo/SP',
    contato_recebimento: 'João Silva',
    telefone_recebimento: '(11) 98765-4321',
    observacoes: 'Entrega urgente para início da montagem',
    observacoes_internas: 'Fornecedor selecionado por melhor preço na cotação COT-2026-001',
    created_by: 1,
    created_at: '2026-01-17T16:30:00Z',
    updated_at: '2026-01-23T14:00:00Z',
  },
  {
    id: 2,
    numero: 'OC-2026-002',
    status: 'confirmada',
    requisicao_id: 3,
    requisicao_numero: 'REQ-2026-003',
    cotacao_id: 2,
    cotacao_numero: 'COT-2026-002',
    fornecedor_id: 5,
    fornecedor_nome: 'Distribuidora de Ferramentas DEF',
    fornecedor_cnpj: '55.666.777/0001-88',
    fornecedor_endereco: 'Rua do Comércio, 456 - São Paulo/SP',
    fornecedor_email: 'cotacao@ferramdef.com.br',
    fornecedor_telefone: '(11) 5678-9012',
    data_emissao: '2026-01-15T10:00:00Z',
    data_previsao_entrega: '2026-01-17T00:00:00Z',
    data_confirmacao: '2026-01-15T14:30:00Z',
    items: [
      {
        id: 4,
        ordem_compra_id: 2,
        requisicao_item_id: 6,
        cotacao_item_id: 10,
        descricao: 'Eletrodo de Solda E6013',
        especificacao: 'Diâmetro 3.25mm, Marca Esab',
        quantidade: 50,
        unidade: 'KG',
        valor_unitario: 17.8,
        valor_total: 890.0,
        quantidade_recebida: 0,
      },
      {
        id: 5,
        ordem_compra_id: 2,
        requisicao_item_id: 7,
        cotacao_item_id: 11,
        descricao: 'Disco de Corte 7"',
        especificacao: 'Para aço, espessura 3mm, Marca Makita',
        quantidade: 100,
        unidade: 'UN',
        valor_unitario: 2.9,
        valor_total: 290.0,
        quantidade_recebida: 0,
      },
      {
        id: 6,
        ordem_compra_id: 2,
        requisicao_item_id: 8,
        cotacao_item_id: 12,
        descricao: 'Disco de Desbaste 7"',
        especificacao: 'Para aço, espessura 6mm, Marca Makita',
        quantidade: 50,
        unidade: 'UN',
        valor_unitario: 4.2,
        valor_total: 210.0,
        quantidade_recebida: 0,
      },
    ],
    valor_subtotal: 1390.0,
    valor_frete: 0,
    valor_desconto: 50.0,
    valor_total: 1340.0,
    prazo_entrega: 2,
    forma_pagamento: '21 dias',
    condicoes_pagamento: 'Boleto ou Transferência, vencimento em 21 dias',
    local_entrega: 'Almoxarifado Central - Rua da Logística, 100 - São Paulo/SP',
    contato_recebimento: 'Carlos Mendes',
    telefone_recebimento: '(11) 91234-5678',
    observacoes: 'Entrega expressa solicitada',
    created_by: 1,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T14:30:00Z',
  },
  {
    id: 3,
    numero: 'OC-2026-003',
    status: 'enviada',
    requisicao_id: 2,
    requisicao_numero: 'REQ-2026-002',
    fornecedor_id: 6,
    fornecedor_nome: 'Telhas e Coberturas S.A.',
    fornecedor_cnpj: '22.333.444/0001-55',
    fornecedor_endereco: 'Av. Industrial, 789 - Guarulhos/SP',
    fornecedor_email: 'orcamento@telhascoberturas.com.br',
    fornecedor_telefone: '(11) 6789-0123',
    data_emissao: '2026-01-14T08:00:00Z',
    data_previsao_entrega: '2026-02-05T00:00:00Z',
    items: [
      {
        id: 7,
        ordem_compra_id: 3,
        requisicao_item_id: 4,
        descricao: 'Telhas Metálicas Trapezoidais',
        especificacao: 'Aço galvanizado, espessura 0.5mm, largura útil 1000mm',
        quantidade: 150,
        unidade: 'M2',
        valor_unitario: 45.0,
        valor_total: 6750.0,
        quantidade_recebida: 0,
      },
      {
        id: 8,
        ordem_compra_id: 3,
        requisicao_item_id: 5,
        descricao: 'Calhas Metálicas',
        especificacao: 'Desenvolvimento 33cm, aço galvanizado',
        quantidade: 80,
        unidade: 'M',
        valor_unitario: 28.0,
        valor_total: 2240.0,
        quantidade_recebida: 0,
      },
    ],
    valor_subtotal: 8990.0,
    valor_frete: 250.0,
    valor_desconto: 0,
    valor_total: 9240.0,
    prazo_entrega: 22,
    forma_pagamento: '28 dias',
    condicoes_pagamento: 'Boleto, vencimento em 28 dias após entrega',
    local_entrega: 'Obra Edifício Comercial - Av. Paulista, 1000 - São Paulo/SP',
    contato_recebimento: 'Ana Costa',
    telefone_recebimento: '(11) 99876-5432',
    observacoes: 'Coordenar entrega com equipe de obra',
    created_by: 3,
    created_at: '2026-01-14T08:00:00Z',
    updated_at: '2026-01-14T08:00:00Z',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================
class OrdensCompraService {
  // GET ALL - Lista todas as ordens de compra
  async getAll(): Promise<ApiResponse<{ ordens: OrdemCompra[] }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        success: true,
        message: 'Ordens de compra carregadas com sucesso',
        data: {
          ordens: [...mockOrdensCompra],
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao carregar ordens de compra',
      };
    }
  }

  // GET BY ID - Busca ordem específica
  async getById(id: number): Promise<ApiResponse<{ ordem: OrdemCompra }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const ordem = mockOrdensCompra.find((o) => o.id === id);

      if (!ordem) {
        return {
          success: false,
          message: 'Ordem de compra não encontrada',
        };
      }

      return {
        success: true,
        message: 'Ordem de compra carregada com sucesso',
        data: { ordem },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao carregar ordem de compra',
      };
    }
  }

  // GET BY STATUS - Filtra por status
  async getByStatus(status: string): Promise<ApiResponse<{ ordens: OrdemCompra[] }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const ordens = mockOrdensCompra.filter((o) => o.status === status);

      return {
        success: true,
        message: 'Ordens filtradas com sucesso',
        data: { ordens },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao filtrar ordens',
      };
    }
  }

  // CREATE - Cria nova ordem de compra
  async create(data: OrdemCompraCreate): Promise<ApiResponse<{ ordem: OrdemCompra }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const year = new Date().getFullYear();
      const numero = `OC-${year}-${String(mockOrdensCompra.length + 1).padStart(3, '0')}`;

      const novaOrdem: OrdemCompra = {
        ...data,
        id: mockOrdensCompra.length + 1,
        numero,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockOrdensCompra.push(novaOrdem);

      return {
        success: true,
        message: 'Ordem de compra criada com sucesso',
        data: { ordem: novaOrdem },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao criar ordem de compra',
      };
    }
  }

  // UPDATE - Atualiza ordem existente
  async update(id: number, data: OrdemCompraUpdate): Promise<ApiResponse<{ ordem: OrdemCompra }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const index = mockOrdensCompra.findIndex((o) => o.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Ordem de compra não encontrada',
        };
      }

      const ordemAtualizada: OrdemCompra = {
        ...mockOrdensCompra[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      mockOrdensCompra[index] = ordemAtualizada;

      return {
        success: true,
        message: 'Ordem de compra atualizada com sucesso',
        data: { ordem: ordemAtualizada },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao atualizar ordem de compra',
      };
    }
  }

  // DELETE - Deleta ordem
  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const index = mockOrdensCompra.findIndex((o) => o.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Ordem de compra não encontrada',
        };
      }

      mockOrdensCompra.splice(index, 1);

      return {
        success: true,
        message: 'Ordem de compra deletada com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao deletar ordem de compra',
      };
    }
  }

  // CONFIRMAR - Marca ordem como confirmada pelo fornecedor
  async confirmar(id: number): Promise<ApiResponse<{ ordem: OrdemCompra }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const index = mockOrdensCompra.findIndex((o) => o.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Ordem de compra não encontrada',
        };
      }

      const ordemConfirmada: OrdemCompra = {
        ...mockOrdensCompra[index],
        status: 'confirmada',
        data_confirmacao: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockOrdensCompra[index] = ordemConfirmada;

      return {
        success: true,
        message: 'Ordem de compra confirmada',
        data: { ordem: ordemConfirmada },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao confirmar ordem de compra',
      };
    }
  }

  // REGISTRAR RECEBIMENTO - Marca items como recebidos
  async registrarRecebimento(
    id: number,
    itemsRecebidos: { item_id: number; quantidade: number }[]
  ): Promise<ApiResponse<{ ordem: OrdemCompra }>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const index = mockOrdensCompra.findIndex((o) => o.id === id);

      if (index === -1) {
        return {
          success: false,
          message: 'Ordem de compra não encontrada',
        };
      }

      const ordem = { ...mockOrdensCompra[index] };
      const dataRecebimento = new Date().toISOString();

      // Atualizar quantities recebidas
      itemsRecebidos.forEach((itemRecebido) => {
        const itemIndex = ordem.items.findIndex((i) => i.id === itemRecebido.item_id);
        if (itemIndex !== -1) {
          ordem.items[itemIndex].quantidade_recebida += itemRecebido.quantidade;
          ordem.items[itemIndex].data_recebimento = dataRecebimento;
        }
      });

      // Verificar se tudo foi recebido
      const totalmenteRecebida = ordem.items.every((i) => i.quantidade_recebida >= i.quantidade);
      const parcialmenteRecebida = ordem.items.some((i) => i.quantidade_recebida > 0);

      if (totalmenteRecebida) {
        ordem.status = 'recebida';
        ordem.data_recebimento = dataRecebimento;
      } else if (parcialmenteRecebida) {
        ordem.status = 'parcialmente_recebida';
      }

      ordem.updated_at = dataRecebimento;
      mockOrdensCompra[index] = ordem;

      return {
        success: true,
        message: 'Recebimento registrado com sucesso',
        data: { ordem },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao registrar recebimento',
      };
    }
  }
}

export default new OrdensCompraService();
