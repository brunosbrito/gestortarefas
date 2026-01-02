import API_URL from '@/config';
import { Equipamento, Calibracao } from '@/interfaces/QualidadeInterfaces';
import axios from 'axios';

class EquipamentoService {
  private baseURL = `${API_URL}/api/equipamentos`;

  // CRUD Equipamentos
  async create(data: Partial<Equipamento>): Promise<Equipamento> {
    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar equipamento:', error);
      throw error;
    }
  }

  async getAll(apenasAtivos?: boolean): Promise<Equipamento[]> {
    try {
      const url = apenasAtivos ? `${this.baseURL}?ativo=true` : this.baseURL;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Equipamento> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar equipamento:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Equipamento>): Promise<Equipamento> {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar equipamento:', error);
      throw error;
    }
  }

  async toggleAtivo(id: string, ativo: boolean): Promise<Equipamento> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/ativo`, { ativo });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status do equipamento:', error);
      throw error;
    }
  }

  // Calibrações
  async addCalibracao(equipamentoId: string, data: FormData): Promise<Calibracao> {
    try {
      const response = await axios.post(
        `${this.baseURL}/${equipamentoId}/calibracoes`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar calibração:', error);
      throw error;
    }
  }

  async getCalibracoes(equipamentoId: string): Promise<Calibracao[]> {
    try {
      const response = await axios.get(`${this.baseURL}/${equipamentoId}/calibracoes`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar calibrações:', error);
      throw error;
    }
  }

  async deleteCalibracao(equipamentoId: string, calibracaoId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${equipamentoId}/calibracoes/${calibracaoId}`);
    } catch (error) {
      console.error('Erro ao deletar calibração:', error);
      throw error;
    }
  }

  // Queries específicas
  async getByStatus(status: 'em_dia' | 'proximo_vencimento' | 'vencido' | 'reprovado'): Promise<Equipamento[]> {
    try {
      const response = await axios.get(`${this.baseURL}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar equipamentos por status:', error);
      throw error;
    }
  }

  async getVencendoEm(dias: number): Promise<Equipamento[]> {
    try {
      const response = await axios.get(`${this.baseURL}/vencimento/${dias}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar equipamentos próximos do vencimento:', error);
      throw error;
    }
  }

  async getByObra(obraId: string): Promise<Equipamento[]> {
    try {
      const response = await axios.get(`${this.baseURL}/obra/${obraId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar equipamentos da obra:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    emDia: number;
    proximoVencimento: number;
    vencidos: number;
    reprovados: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export default new EquipamentoService();
