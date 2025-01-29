import API_URL from '@/config';
import { Obra } from '@/interfaces/ObrasInterface';
import axios from 'axios';

const URL = `${API_URL}/projects/`;

class ProjectService {
  async createObra(obraData: Obra) {
    try {
      const response = await axios.post(URL, obraData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw error;
    }
  }

  async getAllObras() {
    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw error;
    }
  }

  async getProjectsByType(type: string) {
    try {
      const response = await axios.get(`${URL}type/${type}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      throw error;
    }
  }

  async getObraById(id: number) {
    try {
      const response = await axios.get(`${URL}${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      throw error;
    }
  }

  async updateObra(id: number, obraData: Obra) {
    try {
      const response = await axios.put(`${URL}${id}`, obraData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      throw error;
    }
  }

  async deleteObra(id: number) {
    try {
      await axios.delete(`${URL}${id}`);
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      throw error;
    }
  }
}

export default new ProjectService();
