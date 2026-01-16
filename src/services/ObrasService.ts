import api from '@/lib/axios';
import { Obra } from '@/interfaces/ObrasInterface';

const URL = '/projects/';

class ProjectService {
  async createObra(obraData: Obra) {
    try {
      const response = await api.post(URL, obraData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw error;
    }
  }

  async getAllObras() {
    try {
      const response = await api.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw error;
    }
  }

  async getProjectsByType(type: string) {
    try {
      const response = await api.get(`${URL}type/${type}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw error;
    }
  }

  async getObraById(id: number) {
    try {
      const response = await api.get(`${URL}${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      throw error;
    }
  }

  async updateObra(id: number, obraData: Obra) {
    try {
      const response = await api.put(`${URL}${id}`, obraData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      throw error;
    }
  }

  async deleteObra(id: number) {
    try {
      await api.delete(`${URL}${id}`);
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      throw error;
    }
  }
}

export default new ProjectService();
