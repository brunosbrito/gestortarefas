import API_URL from '@/config';
import axios from 'axios';

export const createActivity = async (activityData) => {
  try {
    const formData = new FormData();
    
    // Adiciona todos os campos de texto ao FormData
    Object.keys(activityData).forEach(key => {
      if (key !== 'arquivo' && key !== 'imagem') {
        if (Array.isArray(activityData[key])) {
          activityData[key].forEach(value => {
            formData.append(key + '[]', value);
          });
        } else {
          formData.append(key, activityData[key]);
        }
      }
    });

    // Adiciona arquivo se existir
    if (activityData.arquivo) {
      formData.append('arquivo', activityData.arquivo);
      if (activityData.arquivoDescricao) {
        formData.append('arquivoDescricao', activityData.arquivoDescricao);
      }
    }

    // Adiciona imagem se existir
    if (activityData.imagem) {
      formData.append('imagem', activityData.imagem);
      if (activityData.imagemDescricao) {
        formData.append('imagemDescricao', activityData.imagemDescricao);
      }
    }

    const response = await axios.post(`${API_URL}/activities`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

export const getActivitiesByServiceOrderId = async (serviceOrderId) => {
  try {
    const response = await axios.get(
      `${API_URL}/activities/service-order/${serviceOrderId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching activities', error);
    throw error;
  }
};

// Função para atualizar uma atividade
export const updateActivity = async (id, activityData) => {
  console.log(activityData);
  try {
    const response = await axios.put(
      `${API_URL}/activities/${id}`,
      activityData
    );
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
