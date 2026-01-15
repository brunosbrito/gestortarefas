// Service para Check-lists de Saída
import { ChecklistSaida, ChecklistSaidaCreate, ChecklistSaidaUpdate, checklistTemplates } from '@/interfaces/suprimentos/logistica/ChecklistSaidaInterface';

// Mock data - Será substituído por API real no futuro
let mockChecklistsSaida: ChecklistSaida[] = [
  {
    id: 1,
    veiculo_id: 1,
    veiculo_placa: 'ABC1234',
    veiculo_modelo: 'Fiat Toro 2022',
    motorista_id: 1,
    motorista_nome: 'João Silva Santos',
    km_inicial: 45230,
    combustivel_nivel: 'cheio',
    destino_id: 1,
    destino_nome: 'São Paulo - Campinas',
    destino_endereco: 'Campinas, SP',
    items: [...checklistTemplates.carro].map(item => ({ ...item, checked: true })),
    fotos_danos: [],
    observacoes: 'Veículo em perfeitas condições',
    data_hora_saida: '2026-01-15T08:30:00Z',
    viagem_finalizada: false,
    created_at: '2026-01-15T08:30:00Z',
    updated_at: '2026-01-15T08:30:00Z',
  },
  {
    id: 2,
    veiculo_id: 3,
    veiculo_placa: 'DEF5678',
    veiculo_modelo: 'Mercedes-Benz Sprinter 2021',
    motorista_id: 2,
    motorista_nome: 'Maria Oliveira Costa',
    km_inicial: 67890,
    combustivel_nivel: '3/4',
    destino_id: 2,
    destino_nome: 'São Paulo - Santos',
    destino_endereco: 'Santos, SP',
    items: [...checklistTemplates.caminhao].map((item, idx) => ({
      ...item,
      checked: idx < 6 // Primeiros 6 marcados
    })),
    fotos_danos: [],
    observacoes: 'Alguns items pendentes de verificação',
    data_hora_saida: '2026-01-14T14:20:00Z',
    viagem_finalizada: true,
    checklist_retorno_id: 1,
    created_at: '2026-01-14T14:20:00Z',
    updated_at: '2026-01-14T18:45:00Z',
  },
  {
    id: 3,
    veiculo_id: 2,
    veiculo_placa: 'EMP0001',
    veiculo_modelo: 'Toyota 8FG25 Empilhadeira',
    motorista_id: 3,
    motorista_nome: 'Carlos Eduardo Mendes',
    km_inicial: 1250, // Horímetro para empilhadeiras
    combustivel_nivel: 'cheio',
    items: [...checklistTemplates.empilhadeira].map(item => ({ ...item, checked: true })),
    fotos_danos: [],
    observacoes: 'Uso interno no galpão',
    data_hora_saida: '2026-01-15T07:00:00Z',
    viagem_finalizada: false,
    created_at: '2026-01-15T07:00:00Z',
    updated_at: '2026-01-15T07:00:00Z',
  },
];

let nextId = 4;

class ChecklistsSaidaService {
  // GET ALL
  async getAll(): Promise<{ success: boolean; data: { checklistsSaida: ChecklistSaida[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { checklistsSaida: [...mockChecklistsSaida] },
        });
      }, 300);
    });
  }

  // GET BY ID
  async getById(id: number): Promise<{ success: boolean; data?: { checklistSaida: ChecklistSaida }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const checklistSaida = mockChecklistsSaida.find((cs) => cs.id === id);
        if (checklistSaida) {
          resolve({
            success: true,
            data: { checklistSaida: { ...checklistSaida } },
          });
        } else {
          resolve({
            success: false,
            message: 'Check-list de saída não encontrado',
          });
        }
      }, 200);
    });
  }

  // GET BY VEICULO
  async getByVeiculo(veiculoId: number): Promise<{ success: boolean; data: { checklistsSaida: ChecklistSaida[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockChecklistsSaida.filter((cs) => cs.veiculo_id === veiculoId);
        resolve({
          success: true,
          data: { checklistsSaida: filtered },
        });
      }, 200);
    });
  }

  // GET BY MOTORISTA
  async getByMotorista(motoristaId: number): Promise<{ success: boolean; data: { checklistsSaida: ChecklistSaida[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockChecklistsSaida.filter((cs) => cs.motorista_id === motoristaId);
        resolve({
          success: true,
          data: { checklistsSaida: filtered },
        });
      }, 200);
    });
  }

  // GET VIAGENS ABERTAS (não finalizadas)
  async getViagensAbertas(): Promise<{ success: boolean; data: { checklistsSaida: ChecklistSaida[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const abertas = mockChecklistsSaida.filter((cs) => !cs.viagem_finalizada);
        resolve({
          success: true,
          data: { checklistsSaida: abertas },
        });
      }, 200);
    });
  }

  // CREATE
  async create(data: ChecklistSaidaCreate): Promise<{ success: boolean; data?: { checklistSaida: ChecklistSaida }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newChecklistSaida: ChecklistSaida = {
          ...data,
          id: nextId++,
          viagem_finalizada: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockChecklistsSaida.push(newChecklistSaida);
        resolve({
          success: true,
          data: { checklistSaida: newChecklistSaida },
        });
      }, 400);
    });
  }

  // UPDATE
  async update(id: number, data: ChecklistSaidaUpdate): Promise<{ success: boolean; data?: { checklistSaida: ChecklistSaida }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockChecklistsSaida.findIndex((cs) => cs.id === id);
        if (index !== -1) {
          mockChecklistsSaida[index] = {
            ...mockChecklistsSaida[index],
            ...data,
            updated_at: new Date().toISOString(),
          };
          resolve({
            success: true,
            data: { checklistSaida: mockChecklistsSaida[index] },
          });
        } else {
          resolve({
            success: false,
            message: 'Check-list de saída não encontrado',
          });
        }
      }, 400);
    });
  }

  // DELETE
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockChecklistsSaida.findIndex((cs) => cs.id === id);
        if (index !== -1) {
          mockChecklistsSaida.splice(index, 1);
          resolve({
            success: true,
            message: 'Check-list de saída deletado com sucesso',
          });
        } else {
          resolve({
            success: false,
            message: 'Check-list de saída não encontrado',
          });
        }
      }, 300);
    });
  }

  // FINALIZAR VIAGEM (marcar como finalizada)
  async finalizarViagem(id: number, checklistRetornoId: number): Promise<{ success: boolean; data?: { checklistSaida: ChecklistSaida }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockChecklistsSaida.findIndex((cs) => cs.id === id);
        if (index !== -1) {
          mockChecklistsSaida[index] = {
            ...mockChecklistsSaida[index],
            viagem_finalizada: true,
            checklist_retorno_id: checklistRetornoId,
            updated_at: new Date().toISOString(),
          };
          resolve({
            success: true,
            data: { checklistSaida: mockChecklistsSaida[index] },
          });
        } else {
          resolve({
            success: false,
            message: 'Check-list de saída não encontrado',
          });
        }
      }, 300);
    });
  }
}

export default new ChecklistsSaidaService();
