import axios from 'axios';
import API_URL from '@/config';
import { Inspecao } from '@/interfaces/QualidadeInterfaces';

class InspecaoService {
  private baseURL = `${API_URL}/api/inspecoes`;

  // Criar nova inspeção
  async create(data: Partial<Inspecao>): Promise<Inspecao> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  // Listar todas as inspeções
  async getAll(): Promise<Inspecao[]> {
    const response = await axios.get(this.baseURL);
    return response.data;
  }

  // Buscar inspeção por ID
  async getById(id: string): Promise<Inspecao> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Buscar inspeções por projeto
  async getByProjectId(projectId: string): Promise<Inspecao[]> {
    const response = await axios.get(`${this.baseURL}/projeto/${projectId}`);
    return response.data;
  }

  // Buscar inspeções por OS
  async getByServiceOrderId(serviceOrderId: string): Promise<Inspecao[]> {
    const response = await axios.get(`${this.baseURL}/os/${serviceOrderId}`);
    return response.data;
  }

  // Atualizar inspeção
  async update(id: string, data: Partial<Inspecao>): Promise<Inspecao> {
    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  // Deletar inspeção
  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }

  // Upload de imagem
  async uploadImage(inspecaoId: string, formData: FormData): Promise<any> {
    const response = await axios.post(
      `${this.baseURL}/${inspecaoId}/imagens`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Deletar imagem
  async deleteImage(inspecaoId: string, imageId: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${inspecaoId}/imagens/${imageId}`);
  }

  // Estatísticas
  async getStats(projectId?: string): Promise<{
    total: number;
    aprovadas: number;
    aprovadasComRessalvas: number;
    reprovadas: number;
    taxaConformidade: number;
  }> {
    const params = projectId ? { projectId } : {};
    const response = await axios.get(`${this.baseURL}/stats`, { params });
    return response.data;
  }

  // Relatório de inspeções
  async getRelatorio(filters: {
    projectId?: string;
    tipo?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<Inspecao[]> {
    const response = await axios.get(`${this.baseURL}/relatorio`, {
      params: filters,
    });
    return response.data;
  }
}

export default new InspecaoService();
