import API_URL from '@/config';
import { AnaliseAcaoCorretiva, AcaoCorretiva } from '@/interfaces/QualidadeInterfaces';
import axios from 'axios';

const BASE_URL = `${API_URL}/analises-acoes-corretivas`;

class AnaliseAcaoCorretivaService {
  // ============================================
  // ANÁLISES
  // ============================================

  async create(data: Partial<AnaliseAcaoCorretiva>) {
    try {
      const response = await axios.post(BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar análise e ação corretiva:', error);
      throw error;
    }
  }

  async getAll() {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análises e ações corretivas:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise e ação corretiva:', error);
      throw error;
    }
  }

  async getByRncId(rncId: string) {
    try {
      const response = await axios.get(`${BASE_URL}/rnc/${rncId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise por RNC:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<AnaliseAcaoCorretiva>) {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar análise e ação corretiva:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar análise e ação corretiva:', error);
      throw error;
    }
  }

  // ============================================
  // AÇÕES CORRETIVAS
  // ============================================

  async createAcao(analiseId: string, data: Partial<AcaoCorretiva>) {
    try {
      const response = await axios.post(`${BASE_URL}/${analiseId}/acoes`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ação corretiva:', error);
      throw error;
    }
  }

  async updateAcao(analiseId: string, acaoId: string, data: Partial<AcaoCorretiva>) {
    try {
      const response = await axios.put(`${BASE_URL}/${analiseId}/acoes/${acaoId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar ação corretiva:', error);
      throw error;
    }
  }

  async deleteAcao(analiseId: string, acaoId: string) {
    try {
      const response = await axios.delete(`${BASE_URL}/${analiseId}/acoes/${acaoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar ação corretiva:', error);
      throw error;
    }
  }

  async updateStatusAcao(
    analiseId: string,
    acaoId: string,
    status: 'pendente' | 'em_andamento' | 'concluida' | 'verificada'
  ) {
    try {
      const response = await axios.patch(`${BASE_URL}/${analiseId}/acoes/${acaoId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status da ação:', error);
      throw error;
    }
  }

  async marcarEficacia(analiseId: string, acaoId: string, eficaz: boolean, observacoes?: string) {
    try {
      const response = await axios.patch(`${BASE_URL}/${analiseId}/acoes/${acaoId}/eficacia`, {
        eficaz,
        observacoes,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar eficácia da ação:', error);
      throw error;
    }
  }

  // ============================================
  // RELATÓRIOS E CONSULTAS
  // ============================================

  async getAcoesAtrasadas() {
    try {
      const response = await axios.get(`${BASE_URL}/acoes/atrasadas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ações atrasadas:', error);
      throw error;
    }
  }

  async getAcoesPorStatus(status: string) {
    try {
      const response = await axios.get(`${BASE_URL}/acoes/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ações por status:', error);
      throw error;
    }
  }

  async getTaxaEficacia() {
    try {
      const response = await axios.get(`${BASE_URL}/relatorios/taxa-eficacia`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar taxa de eficácia:', error);
      throw error;
    }
  }
}

export default new AnaliseAcaoCorretivaService();
