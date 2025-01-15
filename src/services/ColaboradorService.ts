import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { Obra } from '@/interfaces/ObrasInterface';
import axios from 'axios';

const API_URL = 'http://localhost:3000/collaborators/';

class ColaboradorService {
  async createColaborador(colaboradorData: Colaborador) {
    try {
      const response = await axios.post(API_URL, colaboradorData);
      return response;
    } catch (error) {
      console.error('Erro ao criar colaborador:', error);
      throw error;
    }
  }

  async getAllColaboradores() {
    try {
      const response = await axios.get(API_URL);
      return response;
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      throw error;
    }
  }

  async getColaboradorById(id: number) {
    try {
      const response = await axios.get(`${API_URL}:${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar colaborador:', error);
      throw error;
    }
  }

  async updateColaborador(id: number, colaboradorData: Colaborador) {
    try {
      const response = await axios.put(`${API_URL}${id}`, colaboradorData);
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
