import {
  CreateServiceOrder,
  ServiceOrder,
} from '@/interfaces/ServiceOrderInterface';
import axios from 'axios';

const API_URL = 'http://localhost:3000/service-orders';

export const createServiceOrder = async (data: Partial<CreateServiceOrder>) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    throw error;
  }
};

export const getAllServiceOrders = async (projectId?: number) => {
  try {
    const url = projectId ? `${API_URL}?projectId=${projectId}` : API_URL;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    throw error;
  }
};

export const getServiceOrderById = async (serviceOrderId: string) => {
  try {
    const response = await axios.get(`${API_URL}/${serviceOrderId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    throw error;
  }
};

export const getServiceOrderByProjectId = async (projectId: string) => {
  try {
    const response = await axios.get(`${API_URL}/project/${projectId}`);
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
    const response = await axios.put(`${API_URL}/${serviceOrderId}`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    throw error;
  }
};

export const deleteServiceOrder = async (serviceOrderId: string) => {
  try {
    await axios.delete(`${API_URL}/${serviceOrderId}`);
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
  return axios.patch(`${API_URL}/progress/${id}`, { progress });
};
