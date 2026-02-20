/**
 * Service para gerenciamento de Mobilização e Desmobilização
 */

import axios from 'axios';
import API_URL from '@/config';
import {
  ItemMobilizacaoInterface,
  ItemMobilizacaoCreateDTO,
  ItemMobilizacaoUpdateDTO,
  ItemMobilizacaoFiltros,
} from '@/interfaces/MobilizacaoInterface';

class MobilizacaoService {
  private baseURL = `${API_URL}/mobilizacao`;

  /**
   * Lista todos os itens (com filtros opcionais)
   */
  async getAll(filtros?: ItemMobilizacaoFiltros): Promise<ItemMobilizacaoInterface[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.busca) params.append('busca', filtros.busca);
      if (filtros?.tipo) params.append('tipo', filtros.tipo);
      if (filtros?.categoria) params.append('categoria', filtros.categoria);
      if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

      const response = await axios.get(`${this.baseURL}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar itens de mobilização:', error);
      throw error;
    }
  }

  /**
   * Busca item por ID
   */
  async getById(id: number): Promise<ItemMobilizacaoInterface> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar item de mobilização:', error);
      throw error;
    }
  }

  /**
   * Cria novo item
   */
  async create(data: ItemMobilizacaoCreateDTO): Promise<ItemMobilizacaoInterface> {
    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar item de mobilização:', error);
      throw error;
    }
  }

  /**
   * Atualiza item existente
   */
  async update(data: ItemMobilizacaoUpdateDTO): Promise<ItemMobilizacaoInterface> {
    try {
      const { id, ...updateData } = data;
      const response = await axios.put(`${this.baseURL}/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar item de mobilização:', error);
      throw error;
    }
  }

  /**
   * Exclui item
   */
  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Erro ao excluir item de mobilização:', error);
      throw error;
    }
  }

  /**
   * Ativa/desativa item
   */
  async toggleAtivo(id: number, ativo: boolean): Promise<ItemMobilizacaoInterface> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/toggle-ativo`, { ativo });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do item:', error);
      throw error;
    }
  }
}

export default new MobilizacaoService();
