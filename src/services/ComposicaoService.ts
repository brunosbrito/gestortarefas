import API_URL from '@/config';
import {
  ComposicaoCustos,
  CreateComposicao,
  UpdateComposicao,
} from '@/interfaces/OrcamentoInterface';
import axios from 'axios';
import OrcamentoService from './OrcamentoService';
import {
  calcularCustoDirectoComposicao,
  calcularBDIComposicao,
  calcularSubtotalComposicao,
} from '@/lib/calculosOrcamento';

const URL = `${API_URL}/api`;

// MOCK DATA
const USE_MOCK = true;
let mockIdCounter = 1;

class ComposicaoService {
  async getByOrcamento(orcamentoId: string): Promise<ComposicaoCustos[]> {
    try {
      const response = await axios.get(`${URL}/orcamentos/${orcamentoId}/composicoes`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar composições:', error);
      throw error;
    }
  }

  async create(data: CreateComposicao): Promise<ComposicaoCustos> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Buscar orçamento pai
      const orcamento = await OrcamentoService.getById(data.orcamentoId);

      const composicao: ComposicaoCustos = {
        id: `comp-${mockIdCounter++}`,
        orcamentoId: data.orcamentoId,
        nome: data.nome,
        tipo: data.tipo,
        itens: [],
        bdi: {
          percentual: data.bdiPercentual,
          valor: 0,
        },
        custoDirecto: 0,
        subtotal: 0,
        percentualDoTotal: 0,
        ordem: orcamento.composicoes.length + 1,
      };

      // Adicionar ao orçamento
      orcamento.composicoes.push(composicao);

      // Atualizar orçamento
      await OrcamentoService.update(data.orcamentoId, {
        id: data.orcamentoId,
        composicoes: orcamento.composicoes,
      });

      return composicao;
    }

    try {
      const response = await axios.post(`${URL}/orcamentos/${data.orcamentoId}/composicoes`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar composição:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<ComposicaoCustos> {
    try {
      const response = await axios.get(`${URL}/composicoes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar composição:', error);
      throw error;
    }
  }

  async update(data: Partial<UpdateComposicao> & { id: string }): Promise<ComposicaoCustos> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Buscar todos os orçamentos e encontrar a composição
      const orcamentos = await OrcamentoService.getAll();

      for (const orc of orcamentos) {
        const compIndex = orc.composicoes.findIndex((c) => c.id === data.id);

        if (compIndex !== -1) {
          // Atualizar composição
          orc.composicoes[compIndex] = {
            ...orc.composicoes[compIndex],
            ...data,
          };

          // Salvar orçamento
          await OrcamentoService.update(orc.id, {
            id: orc.id,
            composicoes: orc.composicoes,
          });

          return orc.composicoes[compIndex];
        }
      }

      throw new Error('Composição não encontrada');
    }

    try {
      const response = await axios.put(`${URL}/composicoes/${data.id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar composição:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Buscar todos os orçamentos e remover a composição
      const orcamentos = await OrcamentoService.getAll();

      for (const orc of orcamentos) {
        const compIndex = orc.composicoes.findIndex((c) => c.id === id);

        if (compIndex !== -1) {
          // Remover composição
          orc.composicoes.splice(compIndex, 1);

          // Salvar orçamento
          await OrcamentoService.update(orc.id, {
            id: orc.id,
            composicoes: orc.composicoes,
          });

          return;
        }
      }

      return;
    }

    try {
      await axios.delete(`${URL}/composicoes/${id}`);
    } catch (error) {
      console.error('Erro ao deletar composição:', error);
      throw error;
    }
  }

  async updateBDI(id: string, percentual: number): Promise<ComposicaoCustos> {
    try {
      const response = await axios.patch(`${URL}/composicoes/${id}/bdi`, { percentual });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar BDI:', error);
      throw error;
    }
  }
}

export default new ComposicaoService();
