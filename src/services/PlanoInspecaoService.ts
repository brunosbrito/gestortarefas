import axios from 'axios';
import API_URL from '@/config';
import { PlanoInspecao } from '@/interfaces/QualidadeInterfaces';

class PlanoInspecaoService {
  private baseURL = `${API_URL}/api/planos-inspecao`;

  // Criar novo plano
  async create(data: Partial<PlanoInspecao>): Promise<PlanoInspecao> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  // Listar todos os planos
  async getAll(apenasAtivos?: boolean): Promise<PlanoInspecao[]> {
    const params = apenasAtivos ? { ativo: true } : {};
    const response = await axios.get(this.baseURL, { params });
    return response.data;
  }

  // Buscar plano por ID
  async getById(id: string): Promise<PlanoInspecao> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Buscar planos por tipo
  async getByTipo(tipo: string): Promise<PlanoInspecao[]> {
    const response = await axios.get(`${this.baseURL}/tipo/${tipo}`);
    return response.data;
  }

  // Atualizar plano
  async update(id: string, data: Partial<PlanoInspecao>): Promise<PlanoInspecao> {
    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  // Deletar plano
  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }

  // Ativar/Desativar plano
  async toggleAtivo(id: string, ativo: boolean): Promise<PlanoInspecao> {
    const response = await axios.patch(`${this.baseURL}/${id}/ativo`, { ativo });
    return response.data;
  }

  // Criar nova revisão
  async criarRevisao(id: string, data: Partial<PlanoInspecao>): Promise<PlanoInspecao> {
    const response = await axios.post(`${this.baseURL}/${id}/revisao`, data);
    return response.data;
  }

  // Histórico de revisões
  async getRevisoes(id: string): Promise<PlanoInspecao[]> {
    const response = await axios.get(`${this.baseURL}/${id}/revisoes`);
    return response.data;
  }

  // Duplicar plano
  async duplicar(id: string, novoNome: string): Promise<PlanoInspecao> {
    const response = await axios.post(`${this.baseURL}/${id}/duplicar`, { nome: novoNome });
    return response.data;
  }
}

export default new PlanoInspecaoService();
