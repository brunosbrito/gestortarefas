import API_URL from '@/config';
import axios from 'axios';
import {
  Transportadora,
  TransportadoraCreate,
  TransportadoraUpdate,
} from '@/interfaces/suprimentos/logistica/TransportInterface';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';

const URL = `${API_URL}/api/suprimentos/logistica/transportadoras`;
const USE_MOCK = true; // ⚠️ Backend será implementado depois

// Mock data
let mockTransportadoras: Transportadora[] = [
  {
    id: 1,
    razao_social: 'Transportadora Rápida Ltda',
    cnpj: '12.345.678/0001-90',
    telefone: '(11) 3456-7890',
    email: 'contato@rapidaltda.com.br',
    endereco: 'Av. Paulista, 1000 - São Paulo/SP',
    rating: 5,
    observacoes: 'Excelente histórico de entregas',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
  },
  {
    id: 2,
    razao_social: 'Logística Express S.A.',
    cnpj: '98.765.432/0001-10',
    telefone: '(11) 2345-6789',
    email: 'logistica@express.com.br',
    endereco: 'Rua da Consolação, 500 - São Paulo/SP',
    rating: 4,
    observacoes: 'Boa transportadora, ocasionalmente atrasa entregas',
    created_at: '2024-01-08T14:30:00Z',
    updated_at: '2024-01-12T09:15:00Z',
  },
  {
    id: 3,
    razao_social: 'Transporte Nacional Ltda',
    cnpj: '45.678.901/0001-23',
    telefone: '(11) 4567-8901',
    rating: 3,
    observacoes: null,
    created_at: '2024-01-10T11:00:00Z',
    updated_at: '2024-01-10T11:00:00Z',
  },
];

let mockIdCounter = 4;

class TransportadorasService {
  // Get all transportadoras
  async getAll(): Promise<ApiResponse<{ transportadoras: Transportadora[] }>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: { transportadoras: mockTransportadoras },
        success: true,
        message: 'Transportadoras carregadas com sucesso (MOCK)',
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }

  // Get transportadora by ID
  async getById(id: number): Promise<ApiResponse<Transportadora>> {
    if (USE_MOCK) {
      const transportadora = mockTransportadoras.find((t) => t.id === id);
      if (!transportadora) {
        throw new Error('Transportadora não encontrada');
      }

      return Promise.resolve({
        data: transportadora,
        success: true,
        message: 'Transportadora carregada (MOCK)',
      });
    }
    const response = await axios.get(`${URL}/${id}`);
    return response.data;
  }

  // Create new transportadora
  async create(transportadoraData: TransportadoraCreate): Promise<ApiResponse<Transportadora>> {
    if (USE_MOCK) {
      const newTransportadora: Transportadora = {
        id: mockIdCounter++,
        ...transportadoraData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockTransportadoras.push(newTransportadora);

      return Promise.resolve({
        data: newTransportadora,
        success: true,
        message: 'Transportadora criada com sucesso (MOCK)',
      });
    }

    const response = await axios.post(URL, transportadoraData);
    return response.data;
  }

  // Update transportadora
  async update(
    id: number,
    transportadoraData: TransportadoraUpdate
  ): Promise<ApiResponse<Transportadora>> {
    if (USE_MOCK) {
      const index = mockTransportadoras.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Transportadora não encontrada');
      }
      mockTransportadoras[index] = {
        ...mockTransportadoras[index],
        ...transportadoraData,
        updated_at: new Date().toISOString(),
      };

      return Promise.resolve({
        data: mockTransportadoras[index],
        success: true,
        message: 'Transportadora atualizada com sucesso (MOCK)',
      });
    }
    const response = await axios.put(`${URL}/${id}`, transportadoraData);
    return response.data;
  }

  // Delete transportadora
  async delete(id: number): Promise<ApiResponse<void>> {
    if (USE_MOCK) {
      const index = mockTransportadoras.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Transportadora não encontrada');
      }
      mockTransportadoras.splice(index, 1);

      return Promise.resolve({
        data: undefined as any,
        success: true,
        message: 'Transportadora removida com sucesso (MOCK)',
      });
    }
    const response = await axios.delete(`${URL}/${id}`);
    return response.data;
  }

  // Update transportadora rating
  async updateRating(id: number, rating: number): Promise<ApiResponse<Transportadora>> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating deve estar entre 1 e 5');
    }
    return this.update(id, { rating });
  }
}

export default new TransportadorasService();
