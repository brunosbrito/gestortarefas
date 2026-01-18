import API_URL from '@/config';
import axios from 'axios';
import { Vehicle, VehicleCreate, VehicleUpdate } from '@/interfaces/suprimentos/logistica/VehicleInterface';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';

const URL = `${API_URL}/api/suprimentos/logistica/veiculos`;
const USE_MOCK = true; // ⚠️ Backend será implementado depois

// Mock data
let mockVehicles: Vehicle[] = [
  {
    id: 1,
    tipo: 'caminhao',
    placa: 'ABC-1234',
    modelo: 'Cargo 2429',
    marca: 'Ford',
    ano: 2020,
    cor: 'Branco',
    km_atual: 85000,
    km_proxima_manutencao: 90000,
    renavam: '12345678901',
    chassi: '9BWZZZ377VT004251',
    crlv_validade: '2026-06-30',
    seguro_validade: '2026-03-15',
    seguro_numero: 'SEG-2024-001',
    status: 'disponivel',
    observacoes: 'Veículo em ótimo estado',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 2,
    tipo: 'empilhadeira',
    placa: 'EMP-001',
    modelo: 'FD25T',
    marca: 'Toyota',
    ano: 2019,
    cor: 'Amarelo',
    km_atual: 12000,
    km_proxima_manutencao: 15000,
    crlv_validade: '2026-05-20',
    seguro_validade: '2026-02-10',
    status: 'em_uso',
    observacoes: 'Bateria trocada recentemente',
    created_at: '2024-01-05T14:30:00Z',
    updated_at: '2024-01-15T08:15:00Z',
  },
  {
    id: 3,
    tipo: 'carro',
    placa: 'XYZ-5678',
    modelo: 'Hilux',
    marca: 'Toyota',
    ano: 2022,
    cor: 'Prata',
    km_atual: 35000,
    km_proxima_manutencao: 40000,
    renavam: '98765432109',
    chassi: '8AFZZZ54ZHJ123456',
    crlv_validade: '2026-08-15',
    seguro_validade: '2026-04-20',
    seguro_numero: 'SEG-2024-002',
    status: 'disponivel',
    observacoes: null,
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-08T09:00:00Z',
  },
];

let mockIdCounter = 4;

class VehiclesService {
  // Get all vehicles
  async getAll(): Promise<ApiResponse<{ vehicles: Vehicle[] }>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: { vehicles: mockVehicles },
        success: true,
        message: 'Veículos carregados com sucesso (MOCK)',
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }

  // Get vehicle by ID
  async getById(id: number): Promise<ApiResponse<Vehicle>> {
    if (USE_MOCK) {
      const vehicle = mockVehicles.find((v) => v.id === id);
      if (!vehicle) {
        throw new Error('Veículo não encontrado');
      }

      return Promise.resolve({
        data: vehicle,
        success: true,
        message: 'Veículo carregado (MOCK)',
      });
    }
    const response = await axios.get(`${URL}/${id}`);
    return response.data;
  }

  // Create new vehicle
  async create(vehicleData: VehicleCreate): Promise<ApiResponse<Vehicle>> {
    if (USE_MOCK) {
      const newVehicle: Vehicle = {
        id: mockIdCounter++,
        ...vehicleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockVehicles.push(newVehicle);

      return Promise.resolve({
        data: newVehicle,
        success: true,
        message: 'Veículo criado com sucesso (MOCK)',
      });
    }

    const response = await axios.post(URL, vehicleData);
    return response.data;
  }

  // Update vehicle
  async update(id: number, vehicleData: VehicleUpdate): Promise<ApiResponse<Vehicle>> {
    if (USE_MOCK) {
      const index = mockVehicles.findIndex((v) => v.id === id);
      if (index === -1) {
        throw new Error('Veículo não encontrado');
      }
      mockVehicles[index] = {
        ...mockVehicles[index],
        ...vehicleData,
        updated_at: new Date().toISOString(),
      };

      return Promise.resolve({
        data: mockVehicles[index],
        success: true,
        message: 'Veículo atualizado com sucesso (MOCK)',
      });
    }
    const response = await axios.put(`${URL}/${id}`, vehicleData);
    return response.data;
  }

  // Delete vehicle
  async delete(id: number): Promise<ApiResponse<void>> {
    if (USE_MOCK) {
      const index = mockVehicles.findIndex((v) => v.id === id);
      if (index === -1) {
        throw new Error('Veículo não encontrado');
      }
      mockVehicles.splice(index, 1);

      return Promise.resolve({
        data: undefined as any,
        success: true,
        message: 'Veículo removido com sucesso (MOCK)',
      });
    }
    const response = await axios.delete(`${URL}/${id}`);
    return response.data;
  }

  // Update vehicle status
  async updateStatus(id: number, status: Vehicle['status']): Promise<ApiResponse<Vehicle>> {
    return this.update(id, { status });
  }

  // Update vehicle KM
  async updateKM(id: number, km_atual: number): Promise<ApiResponse<Vehicle>> {
    return this.update(id, { km_atual });
  }
}

export default new VehiclesService();
