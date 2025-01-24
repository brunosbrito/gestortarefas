import API_URL from '@/config';
import {
  CreateServiceOrder,
  ServiceOrder,
} from '@/interfaces/ServiceOrderInterface';
import axios from 'axios';

const URL = `${API_URL}/service-orders`;

export const createServiceOrder = async (data: FormData | Partial<CreateServiceOrder>) => {
  try {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    const response = await axios.post(URL, data, config);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    throw error;
  }
};

export const getAllServiceOrders = async (projectId?: number) => {
  try {
    const url = projectId ? `${URL}?projectId=${projectId}` : URL;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    throw error;
  }
};

export const getServiceOrderById = async (serviceOrderId: string) => {
  try {
    const response = await axios.get(`${URL}/${serviceOrderId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    throw error;
  }
};

export const getServiceOrderByProjectId = async (projectId: string) => {
  try {
    const response = await axios.get(`${URL}/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    throw error;
  }
};

export const updateServiceOrder = async (
  serviceOrderId: string,
  data: Partial<CreateServiceOrder>
) => {
  try {
    const response = await axios.put(`${URL}/${serviceOrderId}`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    throw error;
  }
};

export const deleteServiceOrder = async (serviceOrderId: string) => {
  try {
    await axios.delete(`${URL}/${serviceOrderId}`);
  } catch (error) {
    console.error('Erro ao excluir ordem de serviço:', error);
    throw error;
  }
};

export const updateServiceOrderProgress = async (
  id: number,
  progress: number
) => {
  console.log(progress);
  return axios.patch(`${URL}/progress/${id}`, { progress });
};
