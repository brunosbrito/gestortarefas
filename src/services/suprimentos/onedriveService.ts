import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';

const URL = `${API_URL}/api/suprimentos/onedrive`;
const USE_MOCK = true;

class OneDriveService {
  async getConnectionStatus(): Promise<ApiResponse<any>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: { connected: false },
        success: true,
        message: '⚠️ OneDrive requer configuração OAuth Microsoft no backend',
      });
    }
    const response = await axios.get(`${URL}/status`);
    return response.data;
  }

  async connect(): Promise<ApiResponse<{ authUrl: string }>> {
    if (USE_MOCK) {
      throw new Error('OneDrive OAuth não disponível em modo MOCK. Backend necessário.');
    }
    const response = await axios.post(`${URL}/connect`);
    return response.data;
  }
}

export default new OneDriveService();
