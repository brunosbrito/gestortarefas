import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { KPI, Activity } from '@/interfaces/suprimentos/AnalyticsInterface';

const URL = `${API_URL}/api/suprimentos/dashboard`;
const USE_MOCK = true;

class DashboardService {
  async getKPIs(): Promise<ApiResponse<{ kpis: KPI[] }>> {
    if (USE_MOCK) {
      const mockKPIs: KPI[] = [
        {
          title: 'Contratos Ativos',
          value: 3,
          format: 'number',
        },
        {
          title: 'Valor Total dos Contratos',
          value: 1600000,
          format: 'currency',
        },
        {
          title: 'Total Realizado',
          value: 405000,
          format: 'currency',
          trend: 'up',
          trendValue: '+12% este mês',
        },
        {
          title: 'Total de NFs',
          value: 12,
          format: 'number',
        },
      ];

      return Promise.resolve({
        data: { kpis: mockKPIs },
        success: true,
      });
    }

    const response = await axios.get(`${URL}/kpis`);
    return response.data;
  }

  async getRecentActivity(): Promise<ApiResponse<{ activities: Activity[] }>> {
    if (USE_MOCK) {
      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'nf',
          description: 'Nova NF #12345 importada',
          date: new Date().toISOString(),
          status: 'pending',
          value: 50000,
        },
        {
          id: 2,
          type: 'contract',
          description: 'Contrato de Fornecimento atualizado',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
        },
      ];

      return Promise.resolve({
        data: { activities: mockActivities },
        success: true,
      });
    }

    const response = await axios.get(`${URL}/activity`);
    return response.data;
  }
}

export default new DashboardService();
