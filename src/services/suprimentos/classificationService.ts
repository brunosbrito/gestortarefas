import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { CostCenter, ClassificationRule } from '@/interfaces/suprimentos/CostCenterInterface';

const URL = `${API_URL}/api/suprimentos/classification`;
const USE_MOCK = true;

class ClassificationService {
  async getCostCenters(): Promise<ApiResponse<CostCenter[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: [],
        success: true,
      });
    }
    const response = await axios.get(`${URL}/cost-centers`);
    return response.data;
  }

  async classifyItem(itemId: number): Promise<ApiResponse<any>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: { classified: true, costCenter: 'Material' },
        success: true,
      });
    }
    const response = await axios.post(`${URL}/classify/${itemId}`);
    return response.data;
  }
}

export default new ClassificationService();
