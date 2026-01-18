import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse, ChatMessage } from '@/interfaces/suprimentos/CommonInterface';

const URL = `${API_URL}/api/suprimentos/ai`;
const USE_MOCK = true;

class AIService {
  async sendMessage(message: string, context?: any): Promise<ApiResponse<ChatMessage>> {
    if (USE_MOCK) {
      const mockResponse: ChatMessage = {
        id: Date.now(),
        content: 'Esta é uma resposta simulada. A funcionalidade real requer API Key OpenAI configurada no backend.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      return Promise.resolve({
        data: mockResponse,
        success: true,
        message: '⚠️ AI Chat é MOCK - backend com OpenAI necessário para funcionalidade real',
      });
    }
    const response = await axios.post(`${URL}/chat`, { message, context });
    return response.data;
  }

  async getChatHistory(limit?: number): Promise<ApiResponse<ChatMessage[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: [],
        success: true,
      });
    }
    const response = await axios.get(`${URL}/chat/history`, { params: { limit } });
    return response.data;
  }
}

export default new AIService();
