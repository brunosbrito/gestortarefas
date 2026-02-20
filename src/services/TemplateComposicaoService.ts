import API_URL from '@/config';
import { TemplateComposicao } from '@/interfaces/OrcamentoInterface';
import axios from 'axios';

const URL = `${API_URL}/api/templates/composicoes`;

class TemplateComposicaoService {
  async getAll(): Promise<TemplateComposicao[]> {
    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<TemplateComposicao> {
    try {
      const response = await axios.get(`${URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      throw error;
    }
  }

  async create(data: Omit<TemplateComposicao, 'id'>): Promise<TemplateComposicao> {
    try {
      const response = await axios.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<TemplateComposicao>): Promise<TemplateComposicao> {
    try {
      const response = await axios.put(`${URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${URL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      throw error;
    }
  }

  async aplicar(templateId: string, orcamentoId: string): Promise<any> {
    try {
      const response = await axios.post(`${URL}/${templateId}/aplicar`, { orcamentoId });
      return response.data;
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
      throw error;
    }
  }
}

export default new TemplateComposicaoService();
