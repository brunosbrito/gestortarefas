import API_URL from '@/config';
import { DashboardQualidade } from '@/interfaces/QualidadeInterfaces';
import axios from 'axios';

class DashboardQualidadeService {
  private baseURL = `${API_URL}/api/qualidade/dashboard`;

  async getMetrics(
    periodo?: { inicio: string; fim: string },
    obraId?: string
  ): Promise<DashboardQualidade> {
    try {
      const params = new URLSearchParams();

      if (periodo) {
        params.append('inicio', periodo.inicio);
        params.append('fim', periodo.fim);
      }

      if (obraId) {
        params.append('obraId', obraId);
      }

      const url = params.toString() ? `${this.baseURL}?${params.toString()}` : this.baseURL;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar métricas do dashboard:', error);
      throw error;
    }
  }

  async getRNCsTrend(meses: number = 6): Promise<{
    labels: string[];
    abertas: number[];
    resolvidas: number[];
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/rncs-trend?meses=${meses}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tendência de RNCs:', error);
      throw error;
    }
  }

  async getInspectionsTrend(meses: number = 6): Promise<{
    labels: string[];
    aprovadas: number[];
    ressalvas: number[];
    reprovadas: number[];
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/inspecoes-trend?meses=${meses}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tendência de inspeções:', error);
      throw error;
    }
  }

  async getTopCausasNC(limit: number = 5): Promise<{
    causa: string;
    quantidade: number;
    percentual: number;
  }[]> {
    try {
      const response = await axios.get(`${this.baseURL}/top-causas-nc?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar top causas de NC:', error);
      throw error;
    }
  }

  async getPerformancePorObra(): Promise<{
    obraId: string;
    obraNome: string;
    totalNCs: number;
    certificadosPendentes: number;
    inspecoesReprovadas: number;
    score: number;
  }[]> {
    try {
      const response = await axios.get(`${this.baseURL}/performance-obras`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar performance por obra:', error);
      throw error;
    }
  }

  async exportRelatorio(
    formato: 'pdf' | 'excel',
    periodo?: { inicio: string; fim: string },
    obraId?: string
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('formato', formato);

      if (periodo) {
        params.append('inicio', periodo.inicio);
        params.append('fim', periodo.fim);
      }

      if (obraId) {
        params.append('obraId', obraId);
      }

      const response = await axios.get(`${this.baseURL}/export?${params.toString()}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      throw error;
    }
  }
}

export default new DashboardQualidadeService();
