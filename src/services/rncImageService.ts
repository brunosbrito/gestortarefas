// services/rncImageService.ts
import API_URL from '@/config';

const URL = `${API_URL}/rnc-images`;
export async function uploadRncImage({
  file,
  nonConformityId,
}: {
  file: File;
  nonConformityId: string;
}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('nonConformityId', nonConformityId);

  const response = await fetch(`${URL}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erro ao enviar imagem');
  }

  return response.json();
}
