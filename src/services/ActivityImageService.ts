import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const uploadActivityImage = async (
  activityId: number,
  file: File,
  description?: string
) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    if (description) {
      formData.append('description', description);
    }

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
