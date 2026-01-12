import API_URL from '@/config';
import {
  ItemComposicao,
  CreateItemComposicao,
  UpdateItemComposicao,
  ItemCSV,
} from '@/interfaces/OrcamentoInterface';
import axios from 'axios';

const URL = `${API_URL}/api`;

class ItemComposicaoService {
  async getByComposicao(composicaoId: string): Promise<ItemComposicao[]> {
    try {
      const response = await axios.get(`${URL}/composicoes/${composicaoId}/itens`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar itens da composição:', error);
      throw error;
    }
  }

  async create(data: CreateItemComposicao): Promise<ItemComposicao> {
    try {
      const response = await axios.post(`${URL}/composicoes/${data.composicaoId}/itens`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar item:', error);
      throw error;
    }
  }

  async importarCSV(composicaoId: string, itens: ItemCSV[]): Promise<ItemComposicao[]> {
    try {
      const response = await axios.post(`${URL}/composicoes/${composicaoId}/itens/csv`, { itens });
      return response.data;
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<UpdateItemComposicao>): Promise<ItemComposicao> {
    try {
      const response = await axios.put(`${URL}/itens-composicao/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${URL}/itens-composicao/${id}`);
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      throw error;
    }
  }

  async calcularABC(itemId: string): Promise<ItemComposicao> {
    try {
      const response = await axios.post(`${URL}/itens-composicao/${itemId}/calcular-abc`);
      return response.data;
    } catch (error) {
      console.error('Erro ao calcular ABC:', error);
      throw error;
    }
  }
}

export default new ItemComposicaoService();
