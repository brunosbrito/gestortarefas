import API_URL from '@/config';
import axios from 'axios';
import { Driver, DriverCreate, DriverUpdate } from '@/interfaces/suprimentos/logistica/DriverInterface';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';

const URL = `${API_URL}/api/suprimentos/logistica/motoristas`;
const USE_MOCK = true; // ⚠️ Backend será implementado depois

// Mock data
let mockDrivers: Driver[] = [
  {
    id: 1,
    nome: 'João Silva',
    cpf: '123.456.789-00',
    cnh_numero: 'CNH123456789',
    cnh_categoria: 'D',
    cnh_validade: '2027-12-31',
    telefone: '(11) 98765-4321',
    email: 'joao.silva@gml.com.br',
    status: 'ativo',
    observacoes: 'Motorista experiente com mais de 10 anos de carteira',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
  },
  {
    id: 2,
    nome: 'Maria Santos',
    cpf: '987.654.321-00',
    cnh_numero: 'CNH987654321',
    cnh_categoria: 'B',
    cnh_validade: '2026-06-30',
    telefone: '(11) 91234-5678',
    email: 'maria.santos@gml.com.br',
    status: 'ativo',
    observacoes: null,
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z',
  },
  {
    id: 3,
    nome: 'Carlos Oliveira',
    cpf: '456.789.123-00',
    cnh_numero: 'CNH456789123',
    cnh_categoria: 'E',
    cnh_validade: '2028-03-15',
    telefone: '(11) 99876-5432',
    status: 'ferias',
    observacoes: 'Férias até 28/01/2026',
    created_at: '2024-01-03T09:00:00Z',
    updated_at: '2024-01-15T11:20:00Z',
  },
];

let mockIdCounter = 4;

class DriversService {
  // Get all drivers
  async getAll(): Promise<ApiResponse<{ drivers: Driver[] }>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: { drivers: mockDrivers },
        success: true,
        message: 'Motoristas carregados com sucesso (MOCK)',
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }

  // Get driver by ID
  async getById(id: number): Promise<ApiResponse<Driver>> {
    if (USE_MOCK) {
      const driver = mockDrivers.find((d) => d.id === id);
      if (!driver) {
        throw new Error('Motorista não encontrado');
      }

      return Promise.resolve({
        data: driver,
        success: true,
        message: 'Motorista carregado (MOCK)',
      });
    }
    const response = await axios.get(`${URL}/${id}`);
    return response.data;
  }

  // Create new driver
  async create(driverData: DriverCreate): Promise<ApiResponse<Driver>> {
    if (USE_MOCK) {
      const newDriver: Driver = {
        id: mockIdCounter++,
        ...driverData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockDrivers.push(newDriver);

      return Promise.resolve({
        data: newDriver,
        success: true,
        message: 'Motorista criado com sucesso (MOCK)',
      });
    }

    const response = await axios.post(URL, driverData);
    return response.data;
  }

  // Update driver
  async update(id: number, driverData: DriverUpdate): Promise<ApiResponse<Driver>> {
    if (USE_MOCK) {
      const index = mockDrivers.findIndex((d) => d.id === id);
      if (index === -1) {
        throw new Error('Motorista não encontrado');
      }
      mockDrivers[index] = {
        ...mockDrivers[index],
        ...driverData,
        updated_at: new Date().toISOString(),
      };

      return Promise.resolve({
        data: mockDrivers[index],
        success: true,
        message: 'Motorista atualizado com sucesso (MOCK)',
      });
    }
    const response = await axios.put(`${URL}/${id}`, driverData);
    return response.data;
  }

  // Delete driver
  async delete(id: number): Promise<ApiResponse<void>> {
    if (USE_MOCK) {
      const index = mockDrivers.findIndex((d) => d.id === id);
      if (index === -1) {
        throw new Error('Motorista não encontrado');
      }
      mockDrivers.splice(index, 1);

      return Promise.resolve({
        data: undefined as any,
        success: true,
        message: 'Motorista removido com sucesso (MOCK)',
      });
    }
    const response = await axios.delete(`${URL}/${id}`);
    return response.data;
  }

  // Update driver status
  async updateStatus(id: number, status: Driver['status']): Promise<ApiResponse<Driver>> {
    return this.update(id, { status });
  }

  // Get active drivers only
  async getActive(): Promise<ApiResponse<{ drivers: Driver[] }>> {
    if (USE_MOCK) {
      const activeDrivers = mockDrivers.filter((d) => d.status === 'ativo');
      return Promise.resolve({
        data: { drivers: activeDrivers },
        success: true,
        message: 'Motoristas ativos carregados (MOCK)',
      });
    }
    const response = await axios.get(`${URL}/active`);
    return response.data;
  }
}

export default new DriversService();
