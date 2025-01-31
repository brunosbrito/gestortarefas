import API_URL from '@/config';
import { CreateNonConformity } from '@/interfaces/RncInterface';
import axios from 'axios';

const URL = `${API_URL}/non-conformities/`;
const token = localStorage.getItem('authToken');

class RncService {
  async createRnc(dados: CreateNonConformity) {
    try {
      const response = await axios.post(URL, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async getAllRnc() {
    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
}

export default new RncService();
