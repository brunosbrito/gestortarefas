
import API_URL from '@/config';
import { CreateNonConformity, NonConformity } from '@/interfaces/RncInterface';
import axios from 'axios';

const URL = `${API_URL}/non-conformities/`;

class RncService {
  async createRnc(data: CreateNonConformity) {
    try {
      const response = await axios.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar RNC:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<NonConformity>) {
    try {
      const response = await axios.put(`${URL}${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar RNC:', error);
      throw error;
    }
  }

  async updateRnc(id: string, data: Partial<NonConformity>) {
    try {
      const response = await axios.put(`${URL}${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar RNC:', error);
      throw error;
    }
  }

  async getAllRnc() {
    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar RNCs:', error);
      throw error;
    }
  }
}

export default new RncService();
