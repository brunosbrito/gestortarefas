import axios from 'axios';
import API_URL from '@/config';
import { PlanoInspecao } from '@/interfaces/QualidadeInterfaces';

// Mock data storage
const mockPlanos: PlanoInspecao[] = [];
let nextId = 1;

class PlanoInspecaoService {
  private baseURL = `${API_URL}/api/planos-inspecao`;
  // TODO: Alterar para false quando backend estiver pronto
  private useMock = true;

  // Criar novo plano
  async create(data: Partial<PlanoInspecao>): Promise<PlanoInspecao> {
    if (this.useMock) {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));

      const novoPlano: PlanoInspecao = {
        id: String(nextId++),
        nome: data.nome || '',
        descricao: data.descricao,
        versao: 1,
        tipo: data.tipo || 'recebimento',
        produto: data.produto,
        processo: data.processo,
        campos: data.campos || [],
        frequencia: data.frequencia,
        ativo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as PlanoInspecao;

      mockPlanos.push(novoPlano);
      console.log('✅ Mock: Plano de inspeção criado com sucesso', novoPlano);
      return novoPlano;
    }

    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  // Listar todos os planos
  async getAll(apenasAtivos?: boolean): Promise<PlanoInspecao[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const planos = apenasAtivos
        ? mockPlanos.filter(p => p.ativo)
        : mockPlanos;
      console.log('✅ Mock: Retornando planos de inspeção', planos);
      return planos;
    }

    const params = apenasAtivos ? { ativo: true } : {};
    const response = await axios.get(this.baseURL, { params });
    return response.data;
  }

  // Buscar plano por ID
  async getById(id: string): Promise<PlanoInspecao> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const plano = mockPlanos.find(p => p.id === id);
      if (!plano) throw new Error('Plano não encontrado');
      console.log('✅ Mock: Retornando plano por ID', plano);
      return plano;
    }

    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Buscar planos por tipo
  async getByTipo(tipo: string): Promise<PlanoInspecao[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const planos = mockPlanos.filter(p => p.tipo === tipo);
      console.log('✅ Mock: Retornando planos por tipo', planos);
      return planos;
    }

    const response = await axios.get(`${this.baseURL}/tipo/${tipo}`);
    return response.data;
  }

  // Atualizar plano
  async update(id: string, data: Partial<PlanoInspecao>): Promise<PlanoInspecao> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockPlanos.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Plano não encontrado');

      mockPlanos[index] = {
        ...mockPlanos[index],
        ...data,
        versao: mockPlanos[index].versao, // Manter versão original
        updatedAt: new Date().toISOString(),
      } as PlanoInspecao;

      console.log('✅ Mock: Plano atualizado com sucesso', mockPlanos[index]);
      return mockPlanos[index];
    }

    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  // Deletar plano
  async delete(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockPlanos.findIndex(p => p.id === id);
      if (index !== -1) {
        mockPlanos.splice(index, 1);
        console.log('✅ Mock: Plano deletado com sucesso');
      }
      return;
    }

    await axios.delete(`${this.baseURL}/${id}`);
  }

  // Ativar/Desativar plano
  async toggleAtivo(id: string, ativo: boolean): Promise<PlanoInspecao> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockPlanos.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Plano não encontrado');

      mockPlanos[index] = {
        ...mockPlanos[index],
        ativo,
        updatedAt: new Date().toISOString(),
      };

      console.log('✅ Mock: Status do plano alterado', mockPlanos[index]);
      return mockPlanos[index];
    }

    const response = await axios.patch(`${this.baseURL}/${id}/ativo`, { ativo });
    return response.data;
  }

  // Criar nova revisão
  async criarRevisao(id: string, data: Partial<PlanoInspecao>): Promise<PlanoInspecao> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const planoOriginal = mockPlanos.find(p => p.id === id);
      if (!planoOriginal) throw new Error('Plano não encontrado');

      const novaRevisao: PlanoInspecao = {
        ...planoOriginal,
        ...data,
        id: String(nextId++),
        versao: planoOriginal.versao + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockPlanos.push(novaRevisao);
      console.log('✅ Mock: Nova revisão criada', novaRevisao);
      return novaRevisao;
    }

    const response = await axios.post(`${this.baseURL}/${id}/revisao`, data);
    return response.data;
  }

  // Histórico de revisões
  async getRevisoes(id: string): Promise<PlanoInspecao[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const plano = mockPlanos.find(p => p.id === id);
      if (!plano) throw new Error('Plano não encontrado');

      // Retorna todas as versões com o mesmo nome base
      const revisoes = mockPlanos.filter(p => p.nome === plano.nome);
      console.log('✅ Mock: Retornando revisões do plano', revisoes);
      return revisoes;
    }

    const response = await axios.get(`${this.baseURL}/${id}/revisoes`);
    return response.data;
  }

  // Duplicar plano
  async duplicar(id: string, novoNome: string): Promise<PlanoInspecao> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 700));
      const planoOriginal = mockPlanos.find(p => p.id === id);
      if (!planoOriginal) throw new Error('Plano não encontrado');

      const planoDuplicado: PlanoInspecao = {
        ...planoOriginal,
        id: String(nextId++),
        nome: novoNome,
        versao: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockPlanos.push(planoDuplicado);
      console.log('✅ Mock: Plano duplicado com sucesso', planoDuplicado);
      return planoDuplicado;
    }

    const response = await axios.post(`${this.baseURL}/${id}/duplicar`, { nome: novoNome });
    return response.data;
  }
}

export default new PlanoInspecaoService();
