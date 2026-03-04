import api from '@/lib/axios';
import {
  CreateServiceOrder,
  ServiceOrder,
} from '@/interfaces/ServiceOrderInterface';

const URL = '/service-orders';

export const createServiceOrder = async (data: Partial<CreateServiceOrder>) => {
  try {
    const response = await api.post(URL, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    throw error;
  }
};

export const getAllServiceOrders = async (projectId?: number) => {
  try {
    const url = projectId ? `${URL}?projectId=${projectId}` : URL;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    throw error;
  }
};

export const getServiceOrderById = async (serviceOrderId: string) => {
  try {
    const response = await api.get(`${URL}/${serviceOrderId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    throw error;
  }
};

export const getServiceOrderByProjectId = async (projectId: string) => {
  try {
    const response = await api.get(`${URL}/project/${projectId}`);
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
    const response = await api.put(`${URL}/${serviceOrderId}`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    throw error;
  }
};

export const deleteServiceOrder = async (serviceOrderId: string) => {
  try {
    await api.delete(`${URL}/${serviceOrderId}`);
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
  return api.patch(`${URL}/progress/${id}`, { progress });
};
