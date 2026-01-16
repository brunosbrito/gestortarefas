import api from '@/lib/axios';
import {
  Fornecedor,
  FornecedorCreate,
  FornecedorUpdate,
  FornecedorFilters
} from '@/interfaces/suprimentos/FornecedorInterface';

const MOCK_FORNECEDORES: Fornecedor[] = [
  {
    id: 1,
    razao_social: 'AÇOS LTDA',
    nome_fantasia: 'Aços Premium',
    cnpj: '12.345.678/0001-90',
    inscricao_estadual: '123.456.789.012',
    tipo: 'material',
    email: 'vendas@acospremium.com.br',
    telefone: '(11) 3456-7890',
    whatsapp: '(11) 98765-4321',
    contato_nome: 'Carlos Silva',
    cep: '01310-100',
    endereco: 'Av. Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    banco: '001 - Banco do Brasil',
    agencia: '1234-5',
    conta: '12345-6',
    pix: 'vendas@acospremium.com.br',
    rating: 4.5,
    observacoes: 'Fornecedor confiável, entregas pontuais',
    status: 'ativo',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    razao_social: 'PARAFUSOS E CIA LTDA',
    nome_fantasia: 'Parafusos Express',
    cnpj: '98.765.432/0001-10',
    inscricao_estadual: '987.654.321.098',
    tipo: 'material',
    email: 'contato@parafusosexpress.com.br',
    telefone: '(11) 2345-6789',
    whatsapp: '(11) 97654-3210',
    contato_nome: 'Ana Costa',
    cep: '04567-000',
    endereco: 'Rua das Flores',
    numero: '500',
    bairro: 'Vila Mariana',
    cidade: 'São Paulo',
    estado: 'SP',
    rating: 4.0,
    observacoes: 'Preços competitivos',
    status: 'ativo',
    created_at: '2024-02-01T14:30:00Z',
    updated_at: '2024-02-01T14:30:00Z',
  },
  {
    id: 3,
    razao_social: 'TRANSPORTES RÁPIDOS LTDA',
    nome_fantasia: 'TR Logística',
    cnpj: '11.222.333/0001-44',
    tipo: 'servico',
    email: 'operacao@trlogistica.com.br',
    telefone: '(11) 3333-4444',
    whatsapp: '(11) 99999-8888',
    contato_nome: 'João Oliveira',
    cep: '08000-000',
    endereco: 'Rod. Presidente Dutra',
    numero: 'Km 225',
    bairro: 'Industrial',
    cidade: 'Guarulhos',
    estado: 'SP',
    rating: 5.0,
    observacoes: 'Excelente serviço, sempre cumpre prazos',
    status: 'ativo',
    created_at: '2024-03-10T09:00:00Z',
    updated_at: '2024-03-10T09:00:00Z',
  },
  {
    id: 4,
    razao_social: 'METALÚRGICA INDUSTRIAL S/A',
    nome_fantasia: 'MetalPro',
    cnpj: '22.333.444/0001-55',
    tipo: 'ambos',
    email: 'vendas@metalpro.com.br',
    telefone: '(11) 4444-5555',
    rating: 3.5,
    status: 'inativo',
    created_at: '2023-12-01T08:00:00Z',
    updated_at: '2024-01-20T16:00:00Z',
  },
];

class FornecedoresService {
  private useMock = true; // Alterar para false quando backend estiver pronto

  async getAll(filters?: FornecedorFilters): Promise<{ fornecedores: Fornecedor[] }> {
    if (this.useMock) {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));

      let filtered = [...MOCK_FORNECEDORES];

      // Aplicar filtros
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(f =>
          f.razao_social.toLowerCase().includes(search) ||
          f.nome_fantasia?.toLowerCase().includes(search) ||
          f.cnpj.includes(search)
        );
      }

      if (filters?.tipo) {
        filtered = filtered.filter(f => f.tipo === filters.tipo);
      }

      if (filters?.status) {
        filtered = filtered.filter(f => f.status === filters.status);
      }

      if (filters?.rating !== undefined) {
        filtered = filtered.filter(f => (f.rating || 0) >= filters.rating!);
      }

      return { fornecedores: filtered };
    }

    const response = await api.get('/suprimentos/fornecedores', { params: filters });
    return response.data;
  }

  async getById(id: number): Promise<{ fornecedor: Fornecedor }> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const fornecedor = MOCK_FORNECEDORES.find(f => f.id === id);
      if (!fornecedor) throw new Error('Fornecedor não encontrado');
      return { fornecedor };
    }

    const response = await api.get(`/suprimentos/fornecedores/${id}`);
    return response.data;
  }

  async create(data: FornecedorCreate): Promise<{ fornecedor: Fornecedor }> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const novoFornecedor: Fornecedor = {
        ...data,
        id: Math.max(...MOCK_FORNECEDORES.map(f => f.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_FORNECEDORES.push(novoFornecedor);
      return { fornecedor: novoFornecedor };
    }

    const response = await api.post('/suprimentos/fornecedores', data);
    return response.data;
  }

  async update(id: number, data: FornecedorUpdate): Promise<{ fornecedor: Fornecedor }> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = MOCK_FORNECEDORES.findIndex(f => f.id === id);
      if (index === -1) throw new Error('Fornecedor não encontrado');

      MOCK_FORNECEDORES[index] = {
        ...MOCK_FORNECEDORES[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return { fornecedor: MOCK_FORNECEDORES[index] };
    }

    const response = await api.put(`/suprimentos/fornecedores/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = MOCK_FORNECEDORES.findIndex(f => f.id === id);
      if (index === -1) throw new Error('Fornecedor não encontrado');
      MOCK_FORNECEDORES.splice(index, 1);
      return;
    }

    await api.delete(`/suprimentos/fornecedores/${id}`);
  }
}

export default new FornecedoresService();
