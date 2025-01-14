import axios from 'axios';

const API_URL = 'http://localhost:3000';  // Defina a URL base da sua API

// Função para criar uma nova atividade
export const createActivity = async (activityData) => {
  try {
    const response = await axios.post(`${API_URL}/activities`, activityData);
    return response.data;
  } catch (error) {
    console.error('Error creating activity', error);
    throw error;
  }
};

// Função para obter todas as atividades
export const getAllActivities = async () => {
  try {
    const response = await axios.get(`${API_URL}/activities`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activities', error);
    throw error;
  }
};

// Função para atualizar uma atividade
export const updateActivity = async (id, activityData) => {
  try {
    const response = await axios.put(`${API_URL}/activities/${id}`, activityData);
    return response.data;
  } catch (error) {
    console.error('Error updating activity', error);
    throw error;
  }
};

// Função para excluir uma atividade
export const deleteActivity = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/activities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting activity', error);
    throw error;
  }
};
