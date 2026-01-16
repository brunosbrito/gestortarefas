import api from '@/lib/axios';

export const uploadActivityImage = async (
  activityId: number,
  imageData: any
) => {
  try {
    const response = await api.post(
      `/activity-images/upload/${activityId}`,
      imageData
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
};