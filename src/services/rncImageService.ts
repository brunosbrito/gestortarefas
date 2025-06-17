// services/rncImageService.ts
import API_URL from '@/config';

const URL = `${API_URL}/rnc-images`;
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
  formData.append('description', description);

  const response = await fetch(`${URL}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Erro ao enviar imagem');
  }

  return response.json();
}

export async function listImagesByRnc(nonConformityId: string) {
  const response = await fetch(`${URL}/${nonConformityId}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar imagens');
  }

  return response.json();
}

export async function deleteRncImage(id: string) {
  const response = await fetch(`${URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao deletar imagem');
  }

  return response.json();
}
