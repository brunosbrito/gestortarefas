import API_URL from '@/config';
import { CreateRNC, RNC, UpdateRNC } from '@/interfaces/RNCInterface';
import axios from 'axios';

const URL = `${API_URL}/non-conformities`;

class RNCService {
  async createRNC(data: CreateRNC) {
    try {
      const response = await axios.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar RNC:', error);
      throw error;
    }
  }

  async getAllRNCs() {
    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar RNCs:', error);
      throw error;
    }
  }

  async getRNCById(id: string) {
    try {
      const response = await axios.get(`${URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar RNC:', error);
      throw error;
    }
  }

  async getRNCsByProject(projectId: number) {
    try {
      const response = await axios.get(`${URL}/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar RNCs do projeto:', error);
      throw error;
    }
  }

  async updateRNC(id: string, data: UpdateRNC) {
    try {
      const response = await axios.put(`${URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar RNC:', error);
      throw error;
    }
  }

  async deleteRNC(id: string) {
    try {
      await axios.delete(`${URL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar RNC:', error);
      throw error;
    }
  }
}

export default new RNCService();