import axios from 'axios';
import { CreateRNC, RNC } from '@/interfaces/RNCInterface';
import API_URL from '@/config';

const RNCService = {
  async createRNC(data: CreateRNC): Promise<RNC> {
    const response = await axios.post(`${API_URL}/rnc`, data);
    return response.data;
  },

  async getRNCs(): Promise<RNC[]> {
    const response = await axios.get(`${API_URL}/rnc`);
    return response.data;
  },
};

export default RNCService;