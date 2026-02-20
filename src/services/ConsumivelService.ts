/**
 * Service para gerenciamento de Consumíveis
 */

import axios from 'axios';
import API_URL from '@/config';
import {
  ConsumivelInterface,
  ConsumivelCreateDTO,
  ConsumivelUpdateDTO,
  ConsumivelFiltros,
} from '@/interfaces/ConsumivelInterface';

class ConsumivelService {
  private baseURL = `${API_URL}/consumiveis`;

  /**
   * Lista todos os consumíveis (com filtros opcionais)
   */
  async getAll(filtros?: ConsumivelFiltros): Promise<ConsumivelInterface[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.busca) params.append('busca', filtros.busca);
      if (filtros?.categoria) params.append('categoria', filtros.categoria);
      if (filtros?.fornecedor) params.append('fornecedor', filtros.fornecedor);
      if (filtros?.grupoABC) params.append('grupoABC', filtros.grupoABC);
      if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

      const response = await axios.get(`${this.baseURL}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar consumíveis:', error);
      throw error;
    }
  }

  /**
   * Busca consumível por ID
   */
  async getById(id: number): Promise<ConsumivelInterface> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar consumível:', error);
      throw error;
    }
  }

  /**
   * Cria novo consumível
   */
  async create(data: ConsumivelCreateDTO): Promise<ConsumivelInterface> {
    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar consumível:', error);
      throw error;
    }
  }

  /**
   * Atualiza consumível existente
   */
  async update(data: ConsumivelUpdateDTO): Promise<ConsumivelInterface> {
    try {
      const { id, ...updateData } = data;
      const response = await axios.put(`${this.baseURL}/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar consumível:', error);
      throw error;
    }
  }

  /**
   * Exclui consumível
   */
  async delete(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Erro ao excluir consumível:', error);
      throw error;
    }
  }

  /**
   * Ativa/desativa consumível
   */
  async toggleAtivo(id: number, ativo: boolean): Promise<ConsumivelInterface> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/toggle-ativo`, { ativo });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do consumível:', error);
      throw error;
    }
  }
}

export default new ConsumivelService();
