/**
 * Service para gerenciamento de Templates de Orçamento
 */

import api from '@/lib/axios';
import API_URL from '@/config';
import {
  OrcamentoTemplateInterface,
  OrcamentoTemplateCreateDTO,
  OrcamentoTemplateUpdateDTO,
  UsarTemplateDTO,
  CriarTemplateDeOrcamentoDTO,
  TemplateCategoriaEnum,
} from '@/interfaces/OrcamentoTemplateInterface';
import { Orcamento } from '@/interfaces/OrcamentoInterface';

class OrcamentoTemplateService {
  private baseURL = `${API_URL}/orcamentos/templates`;

  /**
   * Lista todos os templates (com filtros opcionais)
   */
  async getAll(categoria?: TemplateCategoriaEnum, ativo?: boolean): Promise<OrcamentoTemplateInterface[]> {
    try {
      const params = new URLSearchParams();
      if (categoria) params.append('categoria', categoria);
      if (ativo !== undefined) params.append('ativo', String(ativo));

      const response = await api.get(`${this.baseURL}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar templates:', error);
      throw error;
    }
  }

  /**
   * Busca template por ID
   */
  async getById(id: number): Promise<OrcamentoTemplateInterface> {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      throw error;
    }
  }

  /**
   * Cria novo template
   */
  async create(data: OrcamentoTemplateCreateDTO): Promise<OrcamentoTemplateInterface> {
    try {
      const response = await api.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  }

  /**
   * Atualiza template existente
   */
  async update(data: OrcamentoTemplateUpdateDTO): Promise<OrcamentoTemplateInterface> {
    try {
      const { id, ...updateData } = data;
      const response = await api.put(`${this.baseURL}/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      throw error;
    }
  }

  /**
   * Exclui template
   */
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      throw error;
    }
  }

  /**
   * Usa um template para criar um novo orçamento
   * Copia a estrutura do template e cria um novo orçamento
   */
  async usarTemplate(data: UsarTemplateDTO): Promise<Orcamento> {
    try {
      const response = await api.post(`${this.baseURL}/${data.templateId}/usar`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao usar template:', error);
      throw error;
    }
  }

  /**
   * Cria um template a partir de um orçamento existente
   * Remove itens específicos e mantém apenas a estrutura
   */
  async criarTemplateDeOrcamento(data: CriarTemplateDeOrcamentoDTO): Promise<OrcamentoTemplateInterface> {
    try {
      const response = await api.post(`${this.baseURL}/from-orcamento/${data.orcamentoId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar template de orçamento:', error);
      throw error;
    }
  }

  /**
   * Duplica um template existente
   */
  async duplicar(id: number, novoNome: string): Promise<OrcamentoTemplateInterface> {
    try {
      const response = await api.post(`${this.baseURL}/${id}/duplicar`, { novoNome });
      return response.data;
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      throw error;
    }
  }

  /**
   * Ativa/desativa template
   */
  async toggleAtivo(id: number, ativo: boolean): Promise<OrcamentoTemplateInterface> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/toggle-ativo`, { ativo });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do template:', error);
      throw error;
    }
  }
}

export default new OrcamentoTemplateService();
