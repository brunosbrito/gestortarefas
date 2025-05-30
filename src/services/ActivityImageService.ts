import API_URL from '@/config';
import axios from 'axios';

export const uploadActivityImage = async (
  activityId: number,
  imageData: any
) => {
  try {
    const response = await axios.post(
      `${API_URL}/activity-images/upload/${activityId}`,
      imageData
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
};