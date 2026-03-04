import API_URL from '@/config';
import { TemplateComposicao } from '@/interfaces/OrcamentoInterface';
import api from '@/lib/axios';

const URL = `${API_URL}/templates/composicoes`;

class TemplateComposicaoService {
  async getAll(): Promise<TemplateComposicao[]> {
    try {
      const response = await api.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<TemplateComposicao> {
    try {
      const response = await api.get(`${URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      throw error;
    }
  }

  async create(data: Omit<TemplateComposicao, 'id'>): Promise<TemplateComposicao> {
    try {
      const response = await api.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<TemplateComposicao>): Promise<TemplateComposicao> {
    try {
      const response = await api.put(`${URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`${URL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      throw error;
    }
  }

  async aplicar(templateId: string, orcamentoId: string): Promise<any> {
    try {
      const response = await api.post(`${URL}/${templateId}/aplicar`, { orcamentoId });
      return response.data;
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
      throw error;
    }
  }
}

export default new TemplateComposicaoService();
