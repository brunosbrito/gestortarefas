import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface UploadImageParams {
  activityId: number;
  image: File;
  description: string;
}

export const uploadActivityImage = async ({ activityId, image, description }: UploadImageParams) => {
  try {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', description);

    const response = await axios.post(
      `${API_URL}/activity-images/upload/${activityId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
};