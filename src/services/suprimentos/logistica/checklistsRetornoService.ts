// Service para Check-lists de Retorno
import { ChecklistRetorno, ChecklistRetornoCreate, ChecklistRetornoUpdate } from '@/interfaces/suprimentos/logistica/ChecklistRetornoInterface';
import { checklistTemplates } from '@/interfaces/suprimentos/logistica/ChecklistSaidaInterface';

// Mock data - Será substituído por API real no futuro
let mockChecklistsRetorno: ChecklistRetorno[] = [
  {
    id: 1,
    checklist_saida_id: 2,
    viagem_id: 2,
    veiculo_id: 3,
    veiculo_placa: 'DEF5678',
    veiculo_modelo: 'Mercedes-Benz Sprinter 2021',
    motorista_id: 2,
    motorista_nome: 'Maria Oliveira Costa',
    km_final: 68015,
    km_rodado: 125, // 68015 - 67890 = 125
    combustivel_nivel: '1/2',
    items: [...checklistTemplates.caminhao].map((item, idx) => ({
      ...item,
      checked: true,
      observacao: idx === 0 ? 'Pneu dianteiro esquerdo com desgaste' : undefined,
    })),
    novos_danos: true,
    fotos_danos: ['data:image/png;base64,mock-foto-arranhao-lateral'],
    limpeza_ok: true,
    observacoes: 'Pequeno arranhão na lateral direita durante manobra. Pneu necessita substituição em breve.',
    data_hora_retorno: '2026-01-14T18:45:00Z',
    created_at: '2026-01-14T18:45:00Z',
    updated_at: '2026-01-14T18:45:00Z',
  },
];

let nextId = 2;

class ChecklistsRetornoService {
  // GET ALL
  async getAll(): Promise<{ success: boolean; data: { checklistsRetorno: ChecklistRetorno[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { checklistsRetorno: [...mockChecklistsRetorno] },
        });
      }, 300);
    });
  }

  // GET BY ID
  async getById(id: number): Promise<{ success: boolean; data?: { checklistRetorno: ChecklistRetorno }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const checklistRetorno = mockChecklistsRetorno.find((cr) => cr.id === id);
        if (checklistRetorno) {
          resolve({
            success: true,
            data: { checklistRetorno: { ...checklistRetorno } },
          });
        } else {
          resolve({
            success: false,
            message: 'Check-list de retorno não encontrado',
          });
        }
      }, 200);
    });
  }

  // GET BY CHECKLIST SAIDA ID
  async getByChecklistSaidaId(checklistSaidaId: number): Promise<{ success: boolean; data?: { checklistRetorno: ChecklistRetorno }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const checklistRetorno = mockChecklistsRetorno.find((cr) => cr.checklist_saida_id === checklistSaidaId);
        if (checklistRetorno) {
          resolve({
            success: true,
            data: { checklistRetorno: { ...checklistRetorno } },
          });
        } else {
          resolve({
            success: false,
            message: 'Check-list de retorno não encontrado para esta saída',
          });
        }
      }, 200);
    });
  }

  // GET BY VEICULO
  async getByVeiculo(veiculoId: number): Promise<{ success: boolean; data: { checklistsRetorno: ChecklistRetorno[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockChecklistsRetorno.filter((cr) => cr.veiculo_id === veiculoId);
        resolve({
          success: true,
          data: { checklistsRetorno: filtered },
        });
      }, 200);
    });
  }

  // GET BY MOTORISTA
  async getByMotorista(motoristaId: number): Promise<{ success: boolean; data: { checklistsRetorno: ChecklistRetorno[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockChecklistsRetorno.filter((cr) => cr.motorista_id === motoristaId);
        resolve({
          success: true,
          data: { checklistsRetorno: filtered },
        });
      }, 200);
    });
  }

  // CREATE
  async create(
    data: ChecklistRetornoCreate,
    checklistSaidaData: { km_inicial: number; veiculo_id: number; veiculo_placa: string; veiculo_modelo: string; motorista_id: number; motorista_nome: string }
  ): Promise<{ success: boolean; data?: { checklistRetorno: ChecklistRetorno }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validar que KM final é maior que KM inicial
        if (data.km_final < checklistSaidaData.km_inicial) {
          resolve({
            success: false,
            message: `KM final (${data.km_final}) não pode ser menor que KM inicial (${checklistSaidaData.km_inicial})`,
          });
          return;
        }

        // Calcular KM rodado
        const km_rodado = data.km_final - checklistSaidaData.km_inicial;

        const newChecklistRetorno: ChecklistRetorno = {
          ...data,
          id: nextId++,
          km_rodado,
          veiculo_id: checklistSaidaData.veiculo_id,
          veiculo_placa: checklistSaidaData.veiculo_placa,
          veiculo_modelo: checklistSaidaData.veiculo_modelo,
          motorista_id: checklistSaidaData.motorista_id,
          motorista_nome: checklistSaidaData.motorista_nome,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mockChecklistsRetorno.push(newChecklistRetorno);

        resolve({
          success: true,
          data: { checklistRetorno: newChecklistRetorno },
        });
      }, 400);
    });
  }

  // UPDATE
  async update(id: number, data: ChecklistRetornoUpdate): Promise<{ success: boolean; data?: { checklistRetorno: ChecklistRetorno }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockChecklistsRetorno.findIndex((cr) => cr.id === id);
        if (index !== -1) {
          // Se KM final foi atualizado, recalcular KM rodado
          let km_rodado = mockChecklistsRetorno[index].km_rodado;
          if (data.km_final !== undefined && mockChecklistsRetorno[index].km_final !== data.km_final) {
            // Aqui precisaríamos buscar o KM inicial do check-list de saída
            // Para o mock, vamos apenas recalcular baseado no valor existente
            const kmInicial = (mockChecklistsRetorno[index].km_final || 0) - (mockChecklistsRetorno[index].km_rodado || 0);
            km_rodado = data.km_final - kmInicial;
          }

          mockChecklistsRetorno[index] = {
            ...mockChecklistsRetorno[index],
            ...data,
            km_rodado,
            updated_at: new Date().toISOString(),
          };

          resolve({
            success: true,
            data: { checklistRetorno: mockChecklistsRetorno[index] },
          });
        } else {
          resolve({
            success: false,
            message: 'Check-list de retorno não encontrado',
          });
        }
      }, 400);
    });
  }

  // DELETE
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockChecklistsRetorno.findIndex((cr) => cr.id === id);
        if (index !== -1) {
          mockChecklistsRetorno.splice(index, 1);
          resolve({
            success: true,
            message: 'Check-list de retorno deletado com sucesso',
          });
        } else {
          resolve({
            success: false,
            message: 'Check-list de retorno não encontrado',
          });
        }
      }, 300);
    });
  }
}

export default new ChecklistsRetornoService();
