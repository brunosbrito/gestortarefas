import API_URL from '@/config';
import {
  CreateNonConformity,
  CreateWorkforce,
  NonConformity,
} from '@/interfaces/RncInterface';
import axios from 'axios';

const URL = `${API_URL}/non-conformities/`;

// Mock data storage
const mockRNCs: NonConformity[] = [];
const mockWorkforces: any[] = [];
let nextRncId = 1;
let nextWorkforceId = 1;

class RncService {
  // TODO: Alterar para false quando backend estiver pronto
  private useMock = true;

  async createRnc(data: CreateNonConformity) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const novaRnc: NonConformity = {
        id: String(nextRncId++),
        ...data,
        status: 'aberta',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as NonConformity;

      mockRNCs.push(novaRnc);
      console.log('✅ Mock: RNC criada com sucesso', novaRnc);
      return novaRnc;
    }

    try {
      const response = await axios.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar RNC:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<NonConformity>) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockRNCs.findIndex(r => r.id === id);
      if (index === -1) throw new Error('RNC não encontrada');

      mockRNCs[index] = {
        ...mockRNCs[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as NonConformity;

      console.log('✅ Mock: RNC atualizada com sucesso', mockRNCs[index]);
      return mockRNCs[index];
    }

    try {
      const response = await axios.put(`${URL}${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar RNC:', error);
      throw error;
    }
  }

  async updateRnc(id: string, data: Partial<NonConformity>) {
    // Duplicado do update - redireciona para o mesmo método
    return this.update(id, data);
  }

  async getAllRnc() {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('✅ Mock: Retornando RNCs', mockRNCs);
      return mockRNCs;
    }

    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar RNCs:', error);
      throw error;
    }
  }

  async workforce(data: CreateWorkforce) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 600));

      const novaWorkforce = {
        id: String(nextWorkforceId++),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockWorkforces.push(novaWorkforce);
      console.log('✅ Mock: Mão de obra criada com sucesso', novaWorkforce);
      return novaWorkforce;
    }

    try {
      const response = await axios.post(`${API_URL}/workforce`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar mao de obra:', error);
      throw error;
    }
  }

  async getRncWithWorkforce(rncId: string) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const workforces = mockWorkforces.filter((w: any) => w.rncId === rncId);
      console.log('✅ Mock: Retornando mão de obra da RNC', workforces);
      return workforces;
    }

    const response = await axios.get(`${API_URL}/workforce/rnc/${rncId}`);
    return response.data;
  }

  async deleteWorkforce(id: string) {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockWorkforces.findIndex((w: any) => w.id === id);
      if (index !== -1) {
        mockWorkforces.splice(index, 1);
        console.log('✅ Mock: Mão de obra deletada com sucesso');
      }
      return;
    }

    await axios.delete(`${API_URL}/workforce/${id}`);
  }
}

export default new RncService();
