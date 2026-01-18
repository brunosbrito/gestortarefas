// Service para Rotas/Destinos
import { Route, RouteCreate, RouteUpdate } from '@/interfaces/suprimentos/logistica/RouteInterface';

// Mock data - Será substituído por API real no futuro
let mockRoutes: Route[] = [
  {
    id: 1,
    nome: 'São Paulo - Campinas',
    descricao: 'Rota principal para Campinas via Bandeirantes',
    origem: 'São Paulo, SP',
    destino: 'Campinas, SP',
    km_previsto: 95,
    tempo_medio: 70,
    custo_estimado: 150.00,
    pedagios_quantidade: 3,
    pedagios_valor: 45.80,
    tipo_via: 'rodovia',
    pontos_referencia: ['Rodovia Bandeirantes', 'Pedágio Jaguari', 'Pedágio Valinhos'],
    ativo: true,
    created_at: '2026-01-08T10:00:00Z',
    updated_at: '2026-01-08T10:00:00Z',
  },
  {
    id: 2,
    nome: 'São Paulo - Santos',
    descricao: 'Rota litorânea via Anchieta/Imigrantes',
    origem: 'São Paulo, SP',
    destino: 'Santos, SP',
    km_previsto: 72,
    tempo_medio: 65,
    custo_estimado: 120.00,
    pedagios_quantidade: 2,
    pedagios_valor: 32.20,
    tipo_via: 'rodovia',
    pontos_referencia: ['Rodovia Anchieta', 'Serra do Mar', 'Pedágio Piasseguera'],
    ativo: true,
    created_at: '2026-01-08T10:00:00Z',
    updated_at: '2026-01-08T10:00:00Z',
  },
  {
    id: 3,
    nome: 'São Paulo - Sorocaba',
    descricao: 'Rota para Sorocaba via Raposo Tavares',
    origem: 'São Paulo, SP',
    destino: 'Sorocaba, SP',
    km_previsto: 87,
    tempo_medio: 75,
    custo_estimado: 140.00,
    pedagios_quantidade: 2,
    pedagios_valor: 28.50,
    tipo_via: 'rodovia',
    pontos_referencia: ['Raposo Tavares', 'Cotia', 'Vargem Grande Paulista'],
    ativo: true,
    created_at: '2026-01-08T10:00:00Z',
    updated_at: '2026-01-08T10:00:00Z',
  },
  {
    id: 4,
    nome: 'São Paulo - Guarulhos (Aeroporto)',
    descricao: 'Rota para Aeroporto Internacional de Guarulhos',
    origem: 'São Paulo, SP',
    destino: 'Guarulhos - Aeroporto, SP',
    km_previsto: 28,
    tempo_medio: 35,
    custo_estimado: 50.00,
    tipo_via: 'urbana',
    pontos_referencia: ['Marginal Tietê', 'Rodovia Hélio Smidt'],
    ativo: true,
    created_at: '2026-01-08T10:00:00Z',
    updated_at: '2026-01-08T10:00:00Z',
  },
  {
    id: 5,
    nome: 'São Paulo - Jundiaí',
    descricao: 'Rota via Anhanguera',
    origem: 'São Paulo, SP',
    destino: 'Jundiaí, SP',
    km_previsto: 59,
    tempo_medio: 50,
    custo_estimado: 90.00,
    pedagios_quantidade: 2,
    pedagios_valor: 25.40,
    tipo_via: 'rodovia',
    pontos_referencia: ['Rodovia Anhanguera', 'Pedágio Perus', 'Pedágio Campo Limpo Paulista'],
    ativo: true,
    created_at: '2026-01-08T10:00:00Z',
    updated_at: '2026-01-08T10:00:00Z',
  },
  {
    id: 6,
    nome: 'São Paulo - ABC Paulista',
    descricao: 'Rota urbana para região do ABC',
    origem: 'São Paulo, SP',
    destino: 'São Bernardo do Campo, SP',
    km_previsto: 22,
    tempo_medio: 40,
    custo_estimado: 40.00,
    tipo_via: 'urbana',
    pontos_referencia: ['Avenida Anchieta', 'Diadema', 'Marginal Pinheiros'],
    ativo: true,
    created_at: '2026-01-08T10:00:00Z',
    updated_at: '2026-01-08T10:00:00Z',
  },
];

let nextId = 7;

class RoutesService {
  // GET ALL
  async getAll(): Promise<{ success: boolean; data: { routes: Route[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { routes: [...mockRoutes] },
        });
      }, 300);
    });
  }

  // GET BY ID
  async getById(id: number): Promise<{ success: boolean; data?: { route: Route }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const route = mockRoutes.find((r) => r.id === id);
        if (route) {
          resolve({
            success: true,
            data: { route: { ...route } },
          });
        } else {
          resolve({
            success: false,
            message: 'Rota não encontrada',
          });
        }
      }, 200);
    });
  }

  // CREATE
  async create(data: RouteCreate): Promise<{ success: boolean; data?: { route: Route }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRoute: Route = {
          ...data,
          id: nextId++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockRoutes.push(newRoute);
        resolve({
          success: true,
          data: { route: newRoute },
        });
      }, 400);
    });
  }

  // UPDATE
  async update(id: number, data: RouteUpdate): Promise<{ success: boolean; data?: { route: Route }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockRoutes.findIndex((r) => r.id === id);
        if (index !== -1) {
          mockRoutes[index] = {
            ...mockRoutes[index],
            ...data,
            updated_at: new Date().toISOString(),
          };
          resolve({
            success: true,
            data: { route: mockRoutes[index] },
          });
        } else {
          resolve({
            success: false,
            message: 'Rota não encontrada',
          });
        }
      }, 400);
    });
  }

  // DELETE
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockRoutes.findIndex((r) => r.id === id);
        if (index !== -1) {
          mockRoutes.splice(index, 1);
          resolve({
            success: true,
            message: 'Rota deletada com sucesso',
          });
        } else {
          resolve({
            success: false,
            message: 'Rota não encontrada',
          });
        }
      }, 300);
    });
  }

  // GET ATIVOS
  async getActive(): Promise<{ success: boolean; data: { routes: Route[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const actives = mockRoutes.filter((r) => r.ativo);
        resolve({
          success: true,
          data: { routes: actives },
        });
      }, 200);
    });
  }

  // GET BY TIPO VIA
  async getByTipoVia(tipo: string): Promise<{ success: boolean; data: { routes: Route[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockRoutes.filter((r) => r.tipo_via === tipo);
        resolve({
          success: true,
          data: { routes: filtered },
        });
      }, 200);
    });
  }
}

export default new RoutesService();
