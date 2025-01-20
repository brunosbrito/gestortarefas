import axios from 'axios';

export const uploadActivityImage = async (
  activityId: number,
  formData: FormData
) => {
  try {
    const response = await axios.post(
      `${API_URL}/activity-images/upload/${activityId}`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
};