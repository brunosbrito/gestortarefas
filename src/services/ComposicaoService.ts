import API_URL from '@/config';
import {
  ComposicaoCustos,
  CreateComposicao,
  UpdateComposicao,
} from '@/interfaces/OrcamentoInterface';
import axios from 'axios';

const URL = `${API_URL}/api`;

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

  async update(id: string, data: Partial<UpdateComposicao>): Promise<ComposicaoCustos> {
    try {
      const response = await axios.put(`${URL}/composicoes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar composição:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
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
