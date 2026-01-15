// Service para Manutenções de Veículos
import { Manutencao, ManutencaoCreate, ManutencaoUpdate } from '@/interfaces/suprimentos/logistica/ManutencaoInterface';

// Mock data - Será substituído por API real no futuro
let mockManutencoes: Manutencao[] = [
  {
    id: 1,
    veiculo_id: 1,
    veiculo_placa: 'ABC1234',
    veiculo_modelo: 'Fiat Toro 2022',
    tipo_manutencao_id: 1,
    tipo_manutencao_nome: 'Preventiva',
    fornecedor_servico_id: 1,
    fornecedor_servico_nome: 'Oficina Central Auto Peças',
    km_atual: 45000,
    proxima_manutencao_km: 50000,
    status: 'concluida',
    data_agendada: '2026-01-10T08:00:00Z',
    data_inicio: '2026-01-10T08:30:00Z',
    data_conclusao: '2026-01-10T12:00:00Z',
    pecas_trocadas: [
      {
        id: '1',
        descricao: 'Filtro de óleo',
        quantidade: 1,
        valor_unitario: 45.00,
        valor_total: 45.00,
      },
      {
        id: '2',
        descricao: 'Óleo motor 5W30',
        quantidade: 4,
        valor_unitario: 35.00,
        valor_total: 140.00,
      },
      {
        id: '3',
        descricao: 'Filtro de ar',
        quantidade: 1,
        valor_unitario: 65.00,
        valor_total: 65.00,
      },
    ],
    custo_pecas: 250.00,
    custo_mao_obra: 150.00,
    custo_total: 400.00,
    fotos_documentos: ['data:image/png;base64,mock-nota-fiscal'],
    numero_nf: 'NF-2026-001234',
    descricao: 'Manutenção preventiva de 45.000 km - Troca de óleo, filtros e revisão geral',
    observacoes: 'Veículo em perfeitas condições. Próxima revisão em 5.000 km.',
    responsavel_id: 1,
    responsavel_nome: 'João Silva Santos',
    created_at: '2026-01-10T07:00:00Z',
    updated_at: '2026-01-10T12:30:00Z',
  },
  {
    id: 2,
    veiculo_id: 3,
    veiculo_placa: 'DEF5678',
    veiculo_modelo: 'Mercedes-Benz Sprinter 2021',
    tipo_manutencao_id: 2,
    tipo_manutencao_nome: 'Corretiva',
    fornecedor_servico_id: 2,
    fornecedor_servico_nome: 'Borracharia São José',
    km_atual: 68000,
    status: 'concluida',
    data_agendada: '2026-01-12T14:00:00Z',
    data_inicio: '2026-01-12T14:15:00Z',
    data_conclusao: '2026-01-12T16:00:00Z',
    pecas_trocadas: [
      {
        id: '1',
        descricao: 'Pneu 225/75R16 (dianteiro esquerdo)',
        quantidade: 1,
        valor_unitario: 850.00,
        valor_total: 850.00,
      },
    ],
    custo_pecas: 850.00,
    custo_mao_obra: 80.00,
    custo_total: 930.00,
    fotos_documentos: [],
    numero_nf: 'NF-2026-005678',
    descricao: 'Substituição de pneu dianteiro esquerdo devido a desgaste irregular',
    observacoes: 'Pneu apresentava desgaste irregular na lateral. Recomendado alinhamento e balanceamento.',
    responsavel_id: 2,
    responsavel_nome: 'Maria Oliveira Costa',
    created_at: '2026-01-12T13:00:00Z',
    updated_at: '2026-01-12T16:30:00Z',
  },
  {
    id: 3,
    veiculo_id: 2,
    veiculo_placa: 'EMP0001',
    veiculo_modelo: 'Toyota 8FG25 Empilhadeira',
    tipo_manutencao_id: 1,
    tipo_manutencao_nome: 'Preventiva',
    fornecedor_servico_id: 3,
    fornecedor_servico_nome: 'Tecnofrota Manutenção Industrial',
    km_atual: 1250, // Horímetro
    proxima_manutencao_km: 1500,
    status: 'agendada',
    data_agendada: '2026-01-20T09:00:00Z',
    pecas_trocadas: [],
    custo_pecas: 0,
    custo_mao_obra: 0,
    custo_total: 0,
    fotos_documentos: [],
    descricao: 'Manutenção preventiva programada - Lubrificação e inspeção do sistema hidráulico',
    observacoes: '',
    responsavel_id: 3,
    responsavel_nome: 'Carlos Eduardo Mendes',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
];

let nextId = 4;

class ManutencoesService {
  // GET ALL
  async getAll(): Promise<{ success: boolean; data: { manutencoes: Manutencao[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { manutencoes: [...mockManutencoes] },
        });
      }, 300);
    });
  }

  // GET BY ID
  async getById(id: number): Promise<{ success: boolean; data?: { manutencao: Manutencao }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const manutencao = mockManutencoes.find((m) => m.id === id);
        if (manutencao) {
          resolve({
            success: true,
            data: { manutencao: { ...manutencao } },
          });
        } else {
          resolve({
            success: false,
            message: 'Manutenção não encontrada',
          });
        }
      }, 200);
    });
  }

  // GET BY VEICULO
  async getByVeiculo(veiculoId: number): Promise<{ success: boolean; data: { manutencoes: Manutencao[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockManutencoes.filter((m) => m.veiculo_id === veiculoId);
        // Ordenar por data (mais recente primeiro)
        filtered.sort((a, b) => {
          const dateA = new Date(a.data_conclusao || a.data_inicio || a.data_agendada || a.created_at);
          const dateB = new Date(b.data_conclusao || b.data_inicio || b.data_agendada || b.created_at);
          return dateB.getTime() - dateA.getTime();
        });
        resolve({
          success: true,
          data: { manutencoes: filtered },
        });
      }, 200);
    });
  }

  // GET BY STATUS
  async getByStatus(status: string): Promise<{ success: boolean; data: { manutencoes: Manutencao[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockManutencoes.filter((m) => m.status === status);
        resolve({
          success: true,
          data: { manutencoes: filtered },
        });
      }, 200);
    });
  }

  // GET BY TIPO
  async getByTipo(tipoId: number): Promise<{ success: boolean; data: { manutencoes: Manutencao[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockManutencoes.filter((m) => m.tipo_manutencao_id === tipoId);
        resolve({
          success: true,
          data: { manutencoes: filtered },
        });
      }, 200);
    });
  }

  // CREATE
  async create(data: ManutencaoCreate): Promise<{ success: boolean; data?: { manutencao: Manutencao }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newManutencao: Manutencao = {
          ...data,
          id: nextId++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockManutencoes.push(newManutencao);
        resolve({
          success: true,
          data: { manutencao: newManutencao },
        });
      }, 400);
    });
  }

  // UPDATE
  async update(id: number, data: ManutencaoUpdate): Promise<{ success: boolean; data?: { manutencao: Manutencao }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockManutencoes.findIndex((m) => m.id === id);
        if (index !== -1) {
          mockManutencoes[index] = {
            ...mockManutencoes[index],
            ...data,
            updated_at: new Date().toISOString(),
          };
          resolve({
            success: true,
            data: { manutencao: mockManutencoes[index] },
          });
        } else {
          resolve({
            success: false,
            message: 'Manutenção não encontrada',
          });
        }
      }, 400);
    });
  }

  // DELETE
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockManutencoes.findIndex((m) => m.id === id);
        if (index !== -1) {
          mockManutencoes.splice(index, 1);
          resolve({
            success: true,
            message: 'Manutenção deletada com sucesso',
          });
        } else {
          resolve({
            success: false,
            message: 'Manutenção não encontrada',
          });
        }
      }, 300);
    });
  }

  // INICIAR MANUTENÇÃO (mudar status de agendada para em_andamento)
  async iniciarManutencao(id: number): Promise<{ success: boolean; data?: { manutencao: Manutencao }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockManutencoes.findIndex((m) => m.id === id);
        if (index !== -1) {
          if (mockManutencoes[index].status !== 'agendada') {
            resolve({
              success: false,
              message: 'Apenas manutenções agendadas podem ser iniciadas',
            });
            return;
          }

          mockManutencoes[index] = {
            ...mockManutencoes[index],
            status: 'em_andamento',
            data_inicio: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          resolve({
            success: true,
            data: { manutencao: mockManutencoes[index] },
          });
        } else {
          resolve({
            success: false,
            message: 'Manutenção não encontrada',
          });
        }
      }, 300);
    });
  }

  // CONCLUIR MANUTENÇÃO (mudar status para concluida)
  async concluirManutencao(id: number): Promise<{ success: boolean; data?: { manutencao: Manutencao }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockManutencoes.findIndex((m) => m.id === id);
        if (index !== -1) {
          if (mockManutencoes[index].status !== 'em_andamento') {
            resolve({
              success: false,
              message: 'Apenas manutenções em andamento podem ser concluídas',
            });
            return;
          }

          mockManutencoes[index] = {
            ...mockManutencoes[index],
            status: 'concluida',
            data_conclusao: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          resolve({
            success: true,
            data: { manutencao: mockManutencoes[index] },
          });
        } else {
          resolve({
            success: false,
            message: 'Manutenção não encontrada',
          });
        }
      }, 300);
    });
  }
}

export default new ManutencoesService();
