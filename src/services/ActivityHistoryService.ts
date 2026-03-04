import api from '@/lib/axios';

// Função para criar um histórico de atividade
export const createActivityHistory = async (activityHistoryData, userId) => {
  try {
    const response = await api.post('/activity-history', {
      ...activityHistoryData,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating activity history', error);
    throw error;
  }
};

// Função para obter todos os históricos de atividades
export const getAllActivityHistories = async () => {
  try {
    const response = await api.get('/activity-history');
    return response.data;
  } catch (error) {
    console.error('Error fetching activity histories', error);
    throw error;
  }
};

// Função para obter um histórico de atividade por ID
export const getActivityHistoryById = async (id) => {
  try {
    const response = await api.get(`/activity-history/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activity history', error);
    throw error;
  }
};
