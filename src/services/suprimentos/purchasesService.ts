import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { Purchase } from '@/interfaces/suprimentos/PurchaseInterface';

const URL = `${API_URL}/api/suprimentos/purchases`;
const USE_MOCK = true;

let mockPurchases: Purchase[] = [];

class PurchasesService {
  async getAll(): Promise<ApiResponse<Purchase[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockPurchases,
        success: true,
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }

  async create(data: Partial<Purchase>): Promise<ApiResponse<Purchase>> {
    if (USE_MOCK) {
      const newPurchase: Purchase = {
        id: Date.now(),
        ...data,
      } as Purchase;
      mockPurchases.push(newPurchase);

      return Promise.resolve({
        data: newPurchase,
        success: true,
      });
    }
    const response = await axios.post(URL, data);
    return response.data;
  }
}

export default new PurchasesService();
