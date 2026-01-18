import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { Goal } from '@/interfaces/suprimentos/AnalyticsInterface';

const URL = `${API_URL}/api/suprimentos/goals`;
const USE_MOCK = true;

class GoalsService {
  async getAll(): Promise<ApiResponse<Goal[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: [],
        success: true,
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }
}

export default new GoalsService();
