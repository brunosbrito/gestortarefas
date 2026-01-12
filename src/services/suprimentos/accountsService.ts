import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { Account } from '@/interfaces/suprimentos/AnalyticsInterface';

const URL = `${API_URL}/api/suprimentos/accounts`;
const USE_MOCK = true;

class AccountsService {
  async getAll(): Promise<ApiResponse<Account[]>> {
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

export default new AccountsService();
