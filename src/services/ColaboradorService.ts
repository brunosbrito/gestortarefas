import API_URL from '@/config';
import {
  Colaborador,
  CreateColaborador,
} from '@/interfaces/ColaboradorInterface';
import axios from 'axios';

const URL = `${API_URL}/collaborators/`;

class ColaboradorService {
  async createColaborador(colaboradorData: CreateColaborador) {
    try {
      const response = await axios.post(URL, colaboradorData);
      return response;
    } catch (error) {
      console.error('Erro ao criar colaborador:', error);
      throw error;
    }
  }

  async getAllColaboradores() {
    try {
      const response = await axios.get(URL);
      return response;
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      throw error;
    }
  }

  async getColaboradorById(id: number) {
    try {
      const response = await axios.get(`${URL}:${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar colaborador:', error);
      throw error;
    }
  }

  async updateColaborador(id: number, colaboradorData: Colaborador) {
    try {
      const response = await axios.put(`${URL}${id}`, colaboradorData);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      throw error;
    }
  }

  async deleteColaborador(id: number) {
    try {
      await axios.delete(`${API_URL}${id}`);
    } catch (error) {
      console.error('Erro ao deletar colaborador:', error);
      throw error;
    }
  }
}

export default new ColaboradorService();
