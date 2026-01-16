// services/rncImageService.ts
import api from '@/lib/axios';

const URL = '/rnc-images';

export async function uploadRncImage({
  file,
  nonConformityId,
  description,
}: {
  file: File;
  nonConformityId: string;
  description?: string;
}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('nonConformityId', nonConformityId);
  formData.append('description', description || '');

  const response = await api.post(URL, formData);
  return response.data;
}

export async function listImagesByRnc(nonConformityId: string) {
  const response = await api.get(`${URL}/${nonConformityId}`);
  return response.data;
}

export async function deleteRncImage(id: string) {
  const response = await api.delete(`${URL}/${id}`);
  return response.data;
}
