// Service para Fornecedores de Serviços
import { ServiceProvider, ServiceProviderCreate, ServiceProviderUpdate } from '@/interfaces/suprimentos/logistica/ServiceProviderInterface';

// Mock data - Será substituído por API real no futuro
let mockServiceProviders: ServiceProvider[] = [
  {
    id: 1,
    razao_social: 'Oficina do João Ltda',
    nome_fantasia: 'Oficina do João',
    cnpj: '12345678000190',
    tipo: 'oficina',
    telefone: '(11) 98765-4321',
    email: 'contato@oficinadojoao.com.br',
    contato_nome: 'João Silva',
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    rating: 5,
    ativo: true,
    credenciado: true,
    especialidades: ['Revisão geral', 'Troca de óleo', 'Suspensão', 'Freios'],
    prazo_pagamento: 30,
    desconto_padrao: 10,
    observacoes: 'Oficina credenciada, ótimo atendimento',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 2,
    razao_social: 'Borracharia Central ME',
    nome_fantasia: 'Borracharia Central',
    cnpj: '98765432000112',
    tipo: 'borracharia',
    telefone: '(11) 91234-5678',
    email: 'central@borracharia.com.br',
    contato_nome: 'Carlos Mendes',
    endereco: 'Av. Principal, 456',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01235-890',
    rating: 4,
    ativo: true,
    credenciado: true,
    especialidades: ['Troca de pneus', 'Balanceamento', 'Alinhamento', 'Conserto de pneus'],
    prazo_pagamento: 15,
    desconto_padrao: 5,
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 3,
    razao_social: 'Funilaria e Pintura Silva',
    nome_fantasia: 'Funilaria Silva',
    cnpj: '11122233000145',
    tipo: 'funilaria',
    telefone: '(11) 99876-5432',
    email: 'funilaria@silva.com.br',
    contato_nome: 'Pedro Silva',
    endereco: 'Rua Industrial, 789',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01236-111',
    rating: 4,
    ativo: true,
    credenciado: false,
    especialidades: ['Funilaria', 'Pintura', 'Martelinho de ouro', 'Polimento'],
    prazo_pagamento: 45,
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 4,
    razao_social: 'Elétrica Automotiva Moderna',
    nome_fantasia: 'Elétrica Moderna',
    cnpj: '22233344000167',
    tipo: 'eletrica',
    telefone: '(11) 98888-7777',
    email: 'contato@eletricamoderna.com.br',
    contato_nome: 'Roberto Santos',
    endereco: 'Rua da Tecnologia, 321',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01237-222',
    rating: 5,
    ativo: true,
    credenciado: true,
    especialidades: ['Injeção eletrônica', 'Ar condicionado', 'Alarmes', 'Som automotivo'],
    prazo_pagamento: 30,
    desconto_padrao: 8,
    observacoes: 'Especializada em injeção eletrônica',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 5,
    razao_social: 'Seguradora Porto Seguro S.A.',
    nome_fantasia: 'Porto Seguro',
    cnpj: '33344455000189',
    tipo: 'seguradora',
    telefone: '0800-727-2884',
    email: 'atendimento@portoseguro.com.br',
    contato_nome: 'Central de Atendimento',
    cidade: 'São Paulo',
    estado: 'SP',
    rating: 4,
    ativo: true,
    credenciado: true,
    prazo_pagamento: 0,
    observacoes: 'Seguros de frota',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 6,
    razao_social: 'Despachante Rápido ME',
    nome_fantasia: 'Despachante Rápido',
    cnpj: '44455566000123',
    tipo: 'despachante',
    telefone: '(11) 97777-8888',
    email: 'contato@despachanterapido.com.br',
    contato_nome: 'Ana Paula',
    endereco: 'Rua dos Documentos, 111',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01238-333',
    rating: 5,
    ativo: true,
    credenciado: true,
    especialidades: ['Licenciamento', 'Transferências', 'Multas', 'IPVA'],
    prazo_pagamento: 7,
    observacoes: 'Atendimento rápido, resolve em 24h',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
  },
];

let nextId = 7;

class ServiceProvidersService {
  // GET ALL
  async getAll(): Promise<{ success: boolean; data: { serviceProviders: ServiceProvider[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { serviceProviders: [...mockServiceProviders] },
        });
      }, 300);
    });
  }

  // GET BY ID
  async getById(id: number): Promise<{ success: boolean; data?: { serviceProvider: ServiceProvider }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const serviceProvider = mockServiceProviders.find((sp) => sp.id === id);
        if (serviceProvider) {
          resolve({
            success: true,
            data: { serviceProvider: { ...serviceProvider } },
          });
        } else {
          resolve({
            success: false,
            message: 'Fornecedor de serviços não encontrado',
          });
        }
      }, 200);
    });
  }

  // CREATE
  async create(data: ServiceProviderCreate): Promise<{ success: boolean; data?: { serviceProvider: ServiceProvider }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newServiceProvider: ServiceProvider = {
          ...data,
          id: nextId++,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockServiceProviders.push(newServiceProvider);
        resolve({
          success: true,
          data: { serviceProvider: newServiceProvider },
        });
      }, 400);
    });
  }

  // UPDATE
  async update(id: number, data: ServiceProviderUpdate): Promise<{ success: boolean; data?: { serviceProvider: ServiceProvider }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockServiceProviders.findIndex((sp) => sp.id === id);
        if (index !== -1) {
          mockServiceProviders[index] = {
            ...mockServiceProviders[index],
            ...data,
            updated_at: new Date().toISOString(),
          };
          resolve({
            success: true,
            data: { serviceProvider: mockServiceProviders[index] },
          });
        } else {
          resolve({
            success: false,
            message: 'Fornecedor de serviços não encontrado',
          });
        }
      }, 400);
    });
  }

  // DELETE
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockServiceProviders.findIndex((sp) => sp.id === id);
        if (index !== -1) {
          mockServiceProviders.splice(index, 1);
          resolve({
            success: true,
            message: 'Fornecedor de serviços deletado com sucesso',
          });
        } else {
          resolve({
            success: false,
            message: 'Fornecedor de serviços não encontrado',
          });
        }
      }, 300);
    });
  }

  // GET BY TIPO
  async getByTipo(tipo: string): Promise<{ success: boolean; data: { serviceProviders: ServiceProvider[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockServiceProviders.filter((sp) => sp.tipo === tipo);
        resolve({
          success: true,
          data: { serviceProviders: filtered },
        });
      }, 200);
    });
  }

  // GET CREDENCIADOS
  async getCredenciados(): Promise<{ success: boolean; data: { serviceProviders: ServiceProvider[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const credenciados = mockServiceProviders.filter((sp) => sp.credenciado && sp.ativo);
        resolve({
          success: true,
          data: { serviceProviders: credenciados },
        });
      }, 200);
    });
  }

  // GET ATIVOS
  async getActive(): Promise<{ success: boolean; data: { serviceProviders: ServiceProvider[] }; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const actives = mockServiceProviders.filter((sp) => sp.ativo);
        resolve({
          success: true,
          data: { serviceProviders: actives },
        });
      }, 200);
    });
  }
}

export default new ServiceProvidersService();
