// src/services/effectiveService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/effectives';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

const handleError = (error) => {
  if (error.response) {
    // O pedido foi feito e o servidor respondeu com um status que não está no intervalo de 2xx
    console.error('Erro na resposta:', error.response.data);
    console.error('Status:', error.response.status);
    return `Erro na resposta: ${
      error.response.data.message || 'Erro desconhecido'
    }`;
  } else if (error.request) {
    // O pedido foi feito, mas não houve resposta
    console.error('Erro na requisição:', error.request);
    return 'Erro na requisição, sem resposta do servidor.';
  } else {
    // Algo aconteceu ao configurar o pedido
    console.error('Erro:', error.message);
    return `Erro ao configurar requisição: ${error.message}`;
  }
};

// Função para criar um ponto de trabalho
export const createEffective = async (effectiveData) => {
  try {
    const response = await apiClient.post('/', effectiveData);
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Função para obter todos os pontos de trabalho
export const getAllEffectives = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Função para obter um ponto de trabalho específico
export const getEffectiveById = async (id) => {
  try {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Função para atualizar um ponto de trabalho
export const updateEffective = async (id, effectiveData) => {
  try {
    const response = await apiClient.put(`/${id}`, effectiveData);
    return response.data;
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Função para excluir um ponto de trabalho
export const deleteEffective = async (id) => {
  try {
    await apiClient.delete(`/${id}`);
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Função para buscar pontos de trabalho por turno e data
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
