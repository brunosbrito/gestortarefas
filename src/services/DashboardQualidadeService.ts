import API_URL from '@/config';
import { DashboardQualidade } from '@/interfaces/QualidadeInterfaces';
import axios from 'axios';

class DashboardQualidadeService {
  private baseURL = `${API_URL}/api/qualidade/dashboard`;
  // TODO: Alterar para false quando backend estiver pronto
  private useMock = true;

  async getMetrics(
    periodo?: { inicio: string; fim: string },
    obraId?: string
  ): Promise<DashboardQualidade> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockMetrics: DashboardQualidade = {
        periodo: periodo || {
          inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          fim: new Date().toISOString().split('T')[0],
        },
        obraId,
        rncs: {
          total: 45,
          abertas: 12,
          resolvidas: 25,
          taxaResolucao: 55.6,
          tempoMedioResolucao: 7.5,
        },
        inspecoes: {
          total: 128,
          aprovadas: 95,
          aprovadasComRessalvas: 21,
          reprovadas: 12,
          taxaConformidade: 74.2,
        },
        certificados: {
          total: 67,
          pendentes: 8,
          recebidos: 15,
          enviados: 5,
          proximosPrazo: 3,
        },
        calibracao: {
          equipamentosTotal: 34,
          emDia: 28,
          proximoVencimento: 4,
          vencidos: 2,
        },
        acoesCorretivas: {
          total: 25,
          abertas: 8,
          concluidas: 15,
          atrasadas: 2,
          taxaEficacia: 88.5,
        },
      };

      console.log('✅ Mock: Retornando métricas do dashboard', mockMetrics);
      return mockMetrics;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      const mockTrend = {
        labels: labels.slice(0, meses),
        abertas: [8, 12, 7, 10, 15, 9].slice(0, meses),
        resolvidas: [5, 8, 10, 6, 11, 13].slice(0, meses),
      };

      console.log('✅ Mock: Retornando tendência de RNCs', mockTrend);
      return mockTrend;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      const mockTrend = {
        labels: labels.slice(0, meses),
        aprovadas: [18, 22, 19, 25, 21, 24].slice(0, meses),
        ressalvas: [4, 3, 5, 2, 6, 4].slice(0, meses),
        reprovadas: [2, 1, 3, 1, 2, 1].slice(0, meses),
      };

      console.log('✅ Mock: Retornando tendência de inspeções', mockTrend);
      return mockTrend;
    }

    try {
      const response = await axios.get(`${this.baseURL}/inspecoes-trend?meses=${meses}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tendência de inspeções:', error);
      throw error;
    }
  }

  async getTendencia(
    periodo?: { inicio: string; fim: string },
    obraId?: string
  ): Promise<{
    mes: string;
    rncs: number;
    inspecoes: number;
  }[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const mockTendencia = [
        { mes: '2024-01', rncs: 8, inspecoes: 24 },
        { mes: '2024-02', rncs: 12, inspecoes: 26 },
        { mes: '2024-03', rncs: 7, inspecoes: 27 },
        { mes: '2024-04', rncs: 10, inspecoes: 28 },
        { mes: '2024-05', rncs: 15, inspecoes: 29 },
        { mes: '2024-06', rncs: 9, inspecoes: 29 },
      ];

      console.log('✅ Mock: Retornando tendência', mockTendencia);
      return mockTendencia;
    }

    try {
      const params = new URLSearchParams();

      if (periodo) {
        params.append('inicio', periodo.inicio);
        params.append('fim', periodo.fim);
      }

      if (obraId) {
        params.append('obraId', obraId);
      }

      const url = params.toString() ? `${this.baseURL}/tendencia?${params.toString()}` : `${this.baseURL}/tendencia`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tendência:', error);
      // Retornar array vazio em caso de erro
      return [];
    }
  }

  async getTopCausasNC(
    periodo?: { inicio: string; fim: string },
    obraId?: string,
    limit: number = 5
  ): Promise<{
    causa: string;
    quantidade: number;
    percentual?: number;
  }[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const mockCausas = [
        { causa: 'Falha de Solda', quantidade: 18, percentual: 32.7 },
        { causa: 'Dimensões Incorretas', quantidade: 12, percentual: 21.8 },
        { causa: 'Material Fora da Especificação', quantidade: 10, percentual: 18.2 },
        { causa: 'Acabamento Inadequado', quantidade: 8, percentual: 14.5 },
        { causa: 'Falta de Documentação', quantidade: 7, percentual: 12.7 },
      ].slice(0, limit);

      console.log('✅ Mock: Retornando top causas de NC', mockCausas);
      return mockCausas;
    }

    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());

      if (periodo) {
        params.append('inicio', periodo.inicio);
        params.append('fim', periodo.fim);
      }

      if (obraId) {
        params.append('obraId', obraId);
      }

      const url = `${this.baseURL}/top-causas-nc?${params.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar top causas de NC:', error);
      // Retornar array vazio em caso de erro
      return [];
    }
  }

  async getPerformancePorObra(
    periodo?: { inicio: string; fim: string }
  ): Promise<{
    obraId: string;
    obraNome: string;
    totalNCs: number;
    totalInspecoes?: number;
    certificadosPendentes: number;
    inspecoesReprovadas?: number;
    taxaConformidade?: number;
    score?: number;
  }[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));

      const mockPerformance = [
        {
          obraId: '1',
          obraNome: 'Obra Industrial ABC',
          totalNCs: 8,
          totalInspecoes: 45,
          certificadosPendentes: 3,
          inspecoesReprovadas: 2,
          taxaConformidade: 95.6,
          score: 85,
        },
        {
          obraId: '2',
          obraNome: 'Galpão XYZ Ltda',
          totalNCs: 12,
          totalInspecoes: 38,
          certificadosPendentes: 5,
          inspecoesReprovadas: 4,
          taxaConformidade: 89.5,
          score: 72,
        },
        {
          obraId: '3',
          obraNome: 'Estrutura Metálica DEF',
          totalNCs: 5,
          totalInspecoes: 52,
          certificadosPendentes: 1,
          inspecoesReprovadas: 1,
          taxaConformidade: 98.1,
          score: 92,
        },
      ];

      console.log('✅ Mock: Retornando performance por obra', mockPerformance);
      return mockPerformance;
    }

    try {
      const params = new URLSearchParams();

      if (periodo) {
        params.append('inicio', periodo.inicio);
        params.append('fim', periodo.fim);
      }

      const url = params.toString() ? `${this.baseURL}/performance-obras?${params.toString()}` : `${this.baseURL}/performance-obras`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar performance por obra:', error);
      // Retornar array vazio em caso de erro
      return [];
    }
  }

  async exportRelatorio(
    formato: 'pdf' | 'excel',
    periodo?: { inicio: string; fim: string },
    obraId?: string
  ): Promise<Blob> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mimeType = formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const mockBlob = new Blob([`Mock ${formato.toUpperCase()} content`], { type: mimeType });

      console.log('✅ Mock: Exportando relatório', { formato, periodo, obraId });
      return mockBlob;
    }

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
