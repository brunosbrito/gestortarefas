import axios from 'axios';
import API_URL from '@/config';
import { Inspecao } from '@/interfaces/QualidadeInterfaces';

// Mock data storage
const mockInspecoes: Inspecao[] = [];
let nextId = 1;

class InspecaoService {
  private baseURL = `${API_URL}/api/inspecoes`;
  // TODO: Alterar para false quando backend estiver pronto
  private useMock = true;

  // Criar nova inspeção
  async create(data: Partial<Inspecao>): Promise<Inspecao> {
    if (this.useMock) {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));

      const currentId = nextId++;
      const novaInspecao: Inspecao = {
        id: String(currentId),
        codigo: currentId, // Gera código sequencial automaticamente
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Inspecao;

      mockInspecoes.push(novaInspecao);
      console.log('✅ Mock: Inspeção criada com sucesso', novaInspecao);
      return novaInspecao;
    }

    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  // Listar todas as inspeções
  async getAll(): Promise<Inspecao[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('✅ Mock: Retornando inspeções', mockInspecoes);
      return mockInspecoes;
    }

    const response = await axios.get(this.baseURL);
    return response.data;
  }

  // Buscar inspeção por ID
  async getById(id: string): Promise<Inspecao> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const inspecao = mockInspecoes.find(i => i.id === id);
      if (!inspecao) throw new Error('Inspeção não encontrada');
      console.log('✅ Mock: Retornando inspeção por ID', inspecao);
      return inspecao;
    }

    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Buscar inspeções por projeto
  async getByProjectId(projectId: string): Promise<Inspecao[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const inspecoes = mockInspecoes.filter(i => i.projectId === projectId);
      console.log('✅ Mock: Retornando inspeções por projeto', inspecoes);
      return inspecoes;
    }

    const response = await axios.get(`${this.baseURL}/projeto/${projectId}`);
    return response.data;
  }

  // Buscar inspeções por OS
  async getByServiceOrderId(serviceOrderId: string): Promise<Inspecao[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const inspecoes = mockInspecoes.filter(i => i.serviceOrderId === serviceOrderId);
      console.log('✅ Mock: Retornando inspeções por OS', inspecoes);
      return inspecoes;
    }

    const response = await axios.get(`${this.baseURL}/os/${serviceOrderId}`);
    return response.data;
  }

  // Atualizar inspeção
  async update(id: string, data: Partial<Inspecao>): Promise<Inspecao> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockInspecoes.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Inspeção não encontrada');

      mockInspecoes[index] = {
        ...mockInspecoes[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as Inspecao;

      console.log('✅ Mock: Inspeção atualizada com sucesso', mockInspecoes[index]);
      return mockInspecoes[index];
    }

    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  // Deletar inspeção
  async delete(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockInspecoes.findIndex(i => i.id === id);
      if (index !== -1) {
        mockInspecoes.splice(index, 1);
        console.log('✅ Mock: Inspeção deletada com sucesso');
      }
      return;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));

      const inspecoesFiltradas = projectId
        ? mockInspecoes.filter(i => i.projectId === projectId)
        : mockInspecoes;

      const total = inspecoesFiltradas.length;
      const aprovadas = inspecoesFiltradas.filter(i => i.resultado === 'aprovado').length;
      const aprovadasComRessalvas = inspecoesFiltradas.filter(i => i.resultado === 'aprovado_com_ressalvas').length;
      const reprovadas = inspecoesFiltradas.filter(i => i.resultado === 'reprovado').length;
      const taxaConformidade = total > 0 ? ((aprovadas + aprovadasComRessalvas) / total) * 100 : 0;

      const stats = {
        total,
        aprovadas,
        aprovadasComRessalvas,
        reprovadas,
        taxaConformidade: Math.round(taxaConformidade * 10) / 10,
      };

      console.log('✅ Mock: Retornando estatísticas', stats);
      return stats;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let resultado = [...mockInspecoes];

      if (filters.projectId) {
        resultado = resultado.filter(i => i.projectId === filters.projectId);
      }

      if (filters.tipo) {
        resultado = resultado.filter(i => i.tipo === filters.tipo);
      }

      if (filters.dataInicio) {
        resultado = resultado.filter(i => i.dataInspecao >= filters.dataInicio!);
      }

      if (filters.dataFim) {
        resultado = resultado.filter(i => i.dataInspecao <= filters.dataFim!);
      }

      console.log('✅ Mock: Retornando relatório de inspeções', resultado);
      return resultado;
    }

    const response = await axios.get(`${this.baseURL}/relatorio`, {
      params: filters,
    });
    return response.data;
  }
}

export default new InspecaoService();
