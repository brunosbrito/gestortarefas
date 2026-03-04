import api from '@/lib/axios';

export const createActivity = async (data: FormData) => {
  try {
    const response = await api.post('/activities', data, {
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
    const response = await api.get('/activities');
    return response.data;
  } catch (error) {
    console.error('Error fetching activities', error);
    throw error;
  }
};

// Função para obter apenas atividades programadas
export const getScheduledActivities = async () => {
  try {
    const response = await api.get('/activities?status=Planejadas');
    return response.data;
  } catch (error) {
    console.error('Error fetching scheduled activities', error);
    throw error;
  }
};

export const getActivitiesByServiceOrderId = async (serviceOrderId: string | undefined) => {
  if (!serviceOrderId) {
    throw new Error('Service Order ID is required');
  }

  try {
    const response = await api.get(`/activities/service-order/${serviceOrderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activities', error);
    throw error;
  }
};

// Função para atualizar uma atividade
export const updateActivity = async (id: number, data: any) => {
  try {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating activity', error);
    throw error;
  }
};

export const updateCompletedQuantity = async (
  id: number,
  completedQuantity: number,
  changedBy: number
) => {
  try {
    const response = await api.patch(`/activities/${id}/completedQuantity`, {
      completedQuantity,
      changedBy,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating activity', error);
    throw error;
  }
};

// Função para excluir uma atividade
export const deleteActivity = async (id: number) => {
  try {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting activity', error);
    throw error;
  }
};

// Função para obter uma atividade por ID
export const getActivityById = async (id: number) => {
  try {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activity', error);
    throw error;
  }
};

// Função para atualizar colaboradores de uma atividade
export const updateActivityCollaborators = async (
  id: number,
  collaboratorIds: number[],
  changedBy: number
) => {
  try {
    const response = await api.put(`/activities/${id}`, {
      collaborators: collaboratorIds,
      changedBy,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating activity collaborators', error);
    throw error;
  }
};
