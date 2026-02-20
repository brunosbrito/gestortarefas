import api from '@/lib/axios';
import {
  CreateNonConformity,
  CreateWorkforce,
  NonConformity,
} from '@/interfaces/RncInterface';

const URL = '/non-conformities/';

class RncService {
  async createRnc(data: CreateNonConformity) {
    try {
      const response = await api.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar RNC:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<NonConformity>) {
    try {
      const response = await api.put(`${URL}${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar RNC:', error);
      throw error;
    }
  }

  async updateRnc(id: string, data: Partial<NonConformity>) {
    try {
      const response = await api.put(`${URL}${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar RNC:', error);
      throw error;
    }
  }

  async getAllRnc() {
    try {
      const response = await api.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar RNCs:', error);
      throw error;
    }
  }

  async workforce(data: CreateWorkforce) {
    try {
      const response = await api.post('/workforce', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar mao de obra:', error);
      throw error;
    }
  }

  async getRncWithWorkforce(rncId: string) {
    const response = await api.get(`/workforce/rnc/${rncId}`);
    return response.data;
  }

  async deleteWorkforce(id: string) {
    await api.delete(`/workforce/${id}`);
  }
}

export default new RncService();
