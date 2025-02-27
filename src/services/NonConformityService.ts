
import API_URL from '@/config';
import { NonConformity } from '@/interfaces/RncInterface';
import axios from 'axios';

const URL = `${API_URL}/non-conformities/`;
const token = localStorage.getItem('authToken');

class RncService {
  async createRnc(formData: FormData) {
    try {
      const response = await axios.post(URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar RNC:', error);
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
