import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { Analytics } from '@/interfaces/suprimentos/AnalyticsInterface';

const URL = `${API_URL}/api/suprimentos/analytics`;
const USE_MOCK = true;

class AnalyticsService {
  async get(): Promise<ApiResponse<Analytics>> {
    if (USE_MOCK) {
      const mockAnalytics: Analytics = {
        roi: 15.5,
        averageQuoteTime: 48,
        activeSuppliers: 12,
        accumulatedSavings: 85000,
        costEvolution: [
          { month: 'Jan', value: 100000 },
          { month: 'Fev', value: 120000 },
          { month: 'Mar', value: 95000 },
        ],
        supplierPerformance: [
          { name: 'Fornecedor A', score: 4.5 },
          { name: 'Fornecedor B', score: 4.2 },
        ],
        insights: {
          positive: ['Redução de custos em 12%', 'Melhoria na qualidade de fornecedores'],
          attention: ['Atraso em 2 entregas este mês'],
        },
        recommendations: [
          {
            title: 'Negociar volume com Fornecedor A',
            description: 'Potencial economia de 8%',
          },
        ],
      };

      return Promise.resolve({
        data: mockAnalytics,
        success: true,
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }
}

export default new AnalyticsService();
