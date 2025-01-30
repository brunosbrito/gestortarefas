import API_URL from '@/config';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import axios from 'axios';

const URL = `${API_URL}/service-orders`;

export const ServiceOrderService = {
  getAllServiceOrders: async (projectId?: string) => {
    try {
      const url = projectId ? `${URL}?projectId=${projectId}` : URL;
      const response = await axios.get<ServiceOrder[]>(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
      throw error;
    }
  }
};