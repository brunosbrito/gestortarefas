import axios from 'axios';
import { UpdateEffectiveDto } from '@/interfaces/EffectiveInterface';

const API_URL = 'http://localhost:3000/effectives';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

const handleError = (error: any) => {
  if (error.response) {
    console.error('Erro na resposta:', error.response.data);
    console.error('Status:', error.response.status);
    return `Erro na resposta: ${
      error.response.data.message || 'Erro desconhecido'
    }`;
  } else if (error.request) {
    console.error('Erro na requisição:', error.request);
    return 'Erro na requisição, sem resposta do servidor.';
  } else {
    console.error('Erro:', error.message);
    return `Erro ao configurar requisição: ${error.message}`;
  }
};

export const updateEffective = async (effectiveData: UpdateEffectiveDto) => {
  try {
    const response = await apiClient.post('/', effectiveData);
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getEffectivesByShiftAndDate = async (shift: string) => {
  try {
    const response = await apiClient.get('/by-shift-and-date', {
      params: { shift },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};