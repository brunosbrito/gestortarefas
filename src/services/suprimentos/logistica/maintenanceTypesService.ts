// Service para Tipos de Manutenção
import { MaintenanceType, MaintenanceTypeCreate, MaintenanceTypeUpdate } from '@/interfaces/suprimentos/logistica/MaintenanceTypeInterface';

// Mock data - Será substituído por API real no futuro
let mockMaintenanceTypes: MaintenanceType[] = [
  {
    id: 1,
    nome: 'Revisão Geral',
    categoria: 'preventiva',
    descricao: 'Revisão completa do veículo conforme manual do fabricante',
    frequencia: 'mensal',
    periodicidade_km: 5000,
    periodicidade_dias: 30,
    checklist_items: [
      'Verificar nível de óleo',
      'Verificar filtro de ar',
      'Verificar pastilhas de freio',
      'Verificar pneus e calibragem',
      'Verificar sistema elétrico',
      'Verificar fluidos (freio, radiador)',
    ],
    custo_estimado: 500.00,
    tempo_estimado: 120,
    ativo: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 2,
    nome: 'Troca de Óleo',
    categoria: 'preventiva',
    descricao: 'Troca de óleo do motor e filtro',
    frequencia: 'mensal',
    periodicidade_km: 5000,
    periodicidade_dias: 30,
    checklist_items: [
      'Drenar óleo usado',
      'Trocar filtro de óleo',
      'Completar com óleo novo',
      'Verificar vazamentos',
    ],
    custo_estimado: 200.00,
    tempo_estimado: 30,
    ativo: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 3,
    nome: 'Reparo de Freios',
    categoria: 'corretiva',
    descricao: 'Correção de problemas no sistema de freios',
    frequencia: 'sob_demanda',
    checklist_items: [
      'Diagnosticar problema',
      'Trocar pastilhas/lonas',
      'Verificar discos',
      'Sangrar sistema hidráulico',
      'Testar freios',
    ],
    custo_estimado: 800.00,
    tempo_estimado: 180,
    ativo: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 4,
    nome: 'Troca de Pneus',
    categoria: 'preventiva',
    descricao: 'Substituição de pneus desgastados',
    frequencia: 'sob_demanda',
    periodicidade_km: 40000,
    checklist_items: [
      'Verificar profundidade do sulco',
      'Remover pneus antigos',
      'Instalar pneus novos',
      'Balanceamento',
      'Alinhamento',
    ],
    custo_estimado: 1500.00,
    tempo_estimado: 90,
    ativo: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 5,
    nome: 'Manutenção Elétrica',
    categoria: 'corretiva',
    descricao: 'Reparos no sistema elétrico',
    frequencia: 'sob_demanda',
    checklist_items: [
      'Diagnosticar falha elétrica',
      'Testar bateria',
      'Verificar alternador',
      'Revisar chicote elétrico',
      'Trocar fusíveis defeituosos',
    ],
    custo_estimado: 400.00,
    tempo_estimado: 120,
    ativo: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 6,
    nome: 'Limpeza de Injetores',
    categoria: 'preditiva',
    descricao: 'Limpeza preventiva do sistema de injeção',
    frequencia: 'semestral',
    periodicidade_km: 30000,
    checklist_items: [
      'Remover injetores',
      'Limpeza ultrassônica',
      'Testar vazão',
      'Reinstalar',
      'Testar funcionamento',
    ],
    custo_estimado: 600.00,
    tempo_estimado: 150,
    ativo: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 7,
    nome: 'Troca de Correia Dentada',
    categoria: 'preventiva',
    descricao: 'Substituição da correia dentada conforme recomendação',
    frequencia: 'anual',
    periodicidade_km: 60000,
    periodicidade_dias: 365,
    checklist_items: [
      'Remover correia antiga',
      'Verificar tensionadores',
      'Instalar correia nova',
      'Ajustar tensão',
      'Testar funcionamento',
    ],
    custo_estimado: 1200.00,
    tempo_estimado: 240,
    ativo: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 8,
    nome: 'Socorro Mecânico',
    categoria: 'emergencial',
    descricao: 'Atendimento emergencial para quebra na estrada',
    frequencia: 'sob_demanda',
    checklist_items: [
      'Localizar veículo',
      'Diagnosticar problema',
      'Reparo no local (se possível)',
      'Reboque (se necessário)',
      'Relatório de ocorrência',
    ],
    custo_estimado: 1000.00,
    tempo_estimado: 300,
    ativo: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
];

let nextId = 9;

class MaintenanceTypesService {
  // GET ALL
  async getAll(): Promise<{ success: boolean; data: { maintenanceTypes: MaintenanceType[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { maintenanceTypes: [...mockMaintenanceTypes] },
        });
      }, 300);
    });
  }

  // GET BY ID
  async getById(id: number): Promise<{ success: boolean; data?: { maintenanceType: MaintenanceType }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const maintenanceType = mockMaintenanceTypes.find((mt) => mt.id === id);
        if (maintenanceType) {
          resolve({
            success: true,
            data: { maintenanceType: { ...maintenanceType } },
          });
        } else {
          resolve({
            success: false,
            message: 'Tipo de manutenção não encontrado',
          });
        }
      }, 200);
    });
  }

  // CREATE
  async create(data: MaintenanceTypeCreate): Promise<{ success: boolean; data?: { maintenanceType: MaintenanceType }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMaintenanceType: MaintenanceType = {
          ...data,
          id: nextId++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockMaintenanceTypes.push(newMaintenanceType);
        resolve({
          success: true,
          data: { maintenanceType: newMaintenanceType },
        });
      }, 400);
    });
  }

  // UPDATE
  async update(id: number, data: MaintenanceTypeUpdate): Promise<{ success: boolean; data?: { maintenanceType: MaintenanceType }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockMaintenanceTypes.findIndex((mt) => mt.id === id);
        if (index !== -1) {
          mockMaintenanceTypes[index] = {
            ...mockMaintenanceTypes[index],
            ...data,
            updated_at: new Date().toISOString(),
          };
          resolve({
            success: true,
            data: { maintenanceType: mockMaintenanceTypes[index] },
          });
        } else {
          resolve({
            success: false,
            message: 'Tipo de manutenção não encontrado',
          });
        }
      }, 400);
    });
  }

  // DELETE
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockMaintenanceTypes.findIndex((mt) => mt.id === id);
        if (index !== -1) {
          mockMaintenanceTypes.splice(index, 1);
          resolve({
            success: true,
            message: 'Tipo de manutenção deletado com sucesso',
          });
        } else {
          resolve({
            success: false,
            message: 'Tipo de manutenção não encontrado',
          });
        }
      }, 300);
    });
  }

  // GET BY CATEGORIA
  async getByCategoria(categoria: string): Promise<{ success: boolean; data: { maintenanceTypes: MaintenanceType[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockMaintenanceTypes.filter((mt) => mt.categoria === categoria);
        resolve({
          success: true,
          data: { maintenanceTypes: filtered },
        });
      }, 200);
    });
  }

  // GET ATIVOS
  async getActive(): Promise<{ success: boolean; data: { maintenanceTypes: MaintenanceType[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const actives = mockMaintenanceTypes.filter((mt) => mt.ativo);
        resolve({
          success: true,
          data: { maintenanceTypes: actives },
        });
      }, 200);
    });
  }
}

export default new MaintenanceTypesService();
