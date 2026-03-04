import api from '@/lib/axios';
import {
  Colaborador,
  CreateColaborador,
} from '@/interfaces/ColaboradorInterface';

const URL = '/collaborators/';

class ColaboradorService {
  async createColaborador(colaboradorData: CreateColaborador) {
    try {
      const response = await api.post(URL, colaboradorData);
      return response;
    } catch (error) {
      console.error('Erro ao criar colaborador:', error);
      throw error;
    }
  }

  async getAllColaboradores() {
    try {
      const response = await api.get(URL);
      return response.data as Colaborador[];
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      throw error;
    }
  }

  async getAll() {
    try {
      const response = await api.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      throw error;
    }
  }

  async getColaboradorById(id: number) {
    try {
      const response = await api.get(`${URL}${id}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar colaborador:', error);
      throw error;
    }
  }

  async updateColaborador(id: number, colaboradorData: Partial<Colaborador>) {
    try {
      const response = await api.put(`${URL}${id}`, colaboradorData);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      throw error;
    }
  }

  async deleteColaborador(id: number) {
    try {
      await api.delete(`${URL}${id}`);
    } catch (error) {
      console.error('Erro ao deletar colaborador:', error);
      throw error;
    }
  }

  async desativarColaborador(id: number, status: boolean) {
    try {
      const response = await api.patch(`${URL}${id}/status`, {
        status,
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao desativar colaborador:', error);
      throw error;
    }
  }
}

export default new ColaboradorService();
