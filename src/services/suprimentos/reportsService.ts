import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { Report, ReportTemplate } from '@/interfaces/suprimentos/ReportInterface';

const URL = `${API_URL}/api/suprimentos/reports`;
const USE_MOCK = true;

class ReportsService {
  async getAll(): Promise<ApiResponse<Report[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: [],
        success: true,
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }

  async generate(templateId: string, filters: any): Promise<ApiResponse<Report>> {
    if (USE_MOCK) {
      const mockReport: Report = {
        id: Date.now(),
        name: 'Relatório Gerado',
        contract: 'Contrato 1',
        type: 'Analítico',
        date: new Date().toISOString().split('T')[0],
        size: '1.2 MB',
        status: 'Finalizado',
      };

      return Promise.resolve({
        data: mockReport,
        success: true,
        message: 'Relatório gerado (MOCK)',
      });
    }
    const response = await axios.post(`${URL}/generate`, { templateId, filters });
    return response.data;
  }
}

export default new ReportsService();
