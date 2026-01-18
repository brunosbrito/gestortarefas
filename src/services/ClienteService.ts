import API_URL from '@/config';
import {
  Cliente,
  CreateCliente,
  UpdateCliente,
  CNPJResponse,
  CEPResponse,
  EnderecoCliente,
  CreateEnderecoCliente,
  UpdateEnderecoCliente,
} from '@/interfaces/ClienteInterface';
import axios from 'axios';

const URL = `${API_URL}/api/clientes`;

// MOCK DATA - Remover quando backend estiver pronto
const USE_MOCK = true;

const mockClientes: Cliente[] = [];
let mockIdCounter = 1;

const generateMockCliente = (data: CreateCliente): Cliente => {
  const id = `mock-${mockIdCounter++}`;

  const cliente: Cliente = {
    id,
    razaoSocial: data.razaoSocial,
    nomeFantasia: data.nomeFantasia,
    tipoPessoa: data.tipoPessoa,
    cnpj: data.cnpj,
    cpf: data.cpf,
    inscricaoEstadual: data.inscricaoEstadual,
    inscricaoMunicipal: data.inscricaoMunicipal,
    enderecoPrincipal: {
      ...data.enderecoPrincipal,
      id: `end-${mockIdCounter}`,
      clienteId: id,
      ordem: 1,
      principal: true,
    },
    enderecosSecundarios: [],
    telefone: data.telefone,
    telefoneSecundario: data.telefoneSecundario,
    email: data.email,
    emailSecundario: data.emailSecundario,
    website: data.website,
    contatoPrincipal: data.contatoPrincipal,
    segmento: data.segmento,
    porte: data.porte,
    ativo: true,
    observacoes: data.observacoes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1,
  };

  return cliente;
};

class ClienteService {
  // ============================================
  // CRUD BÁSICO
  // ============================================

  async create(data: CreateCliente): Promise<Cliente> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const cliente = generateMockCliente(data);
      mockClientes.push(cliente);
      return cliente;
    }

    try {
      const response = await axios.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async getAll(): Promise<Cliente[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...mockClientes];
    }

    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Cliente> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const cliente = mockClientes.find((c) => c.id === id);
      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      return cliente;
    }

    try {
      const response = await axios.get(`${URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<UpdateCliente>): Promise<Cliente> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const index = mockClientes.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Cliente não encontrado');
      }

      mockClientes[index] = {
        ...mockClientes[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return mockClientes[index];
    }

    try {
      const response = await axios.put(`${URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const index = mockClientes.findIndex((c) => c.id === id);
      if (index !== -1) {
        mockClientes.splice(index, 1);
      }
      return;
    }

    try {
      await axios.delete(`${URL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }

  async toggleAtivo(id: string): Promise<Cliente> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const index = mockClientes.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error('Cliente não encontrado');
      }

      mockClientes[index].ativo = !mockClientes[index].ativo;
      mockClientes[index].updatedAt = new Date().toISOString();

      return mockClientes[index];
    }

    try {
      const response = await axios.patch(`${URL}/${id}/toggle-ativo`);
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      throw error;
    }
  }

  // ============================================
  // ENDEREÇOS SECUNDÁRIOS
  // ============================================

  async addEndereco(data: CreateEnderecoCliente): Promise<EnderecoCliente> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const cliente = mockClientes.find((c) => c.id === data.clienteId);
      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      const endereco: EnderecoCliente = {
        id: `end-${Date.now()}`,
        ...data,
        ordem: cliente.enderecosSecundarios.length + 2,
        pais: data.pais || 'Brasil',
        principal: data.principal || false,
      };

      cliente.enderecosSecundarios.push(endereco);
      return endereco;
    }

    try {
      const response = await axios.post(`${URL}/${data.clienteId}/enderecos`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error);
      throw error;
    }
  }

  async updateEndereco(id: string, data: Partial<UpdateEnderecoCliente>): Promise<EnderecoCliente> {
    try {
      const response = await axios.put(`${URL}/enderecos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      throw error;
    }
  }

  async deleteEndereco(id: string): Promise<void> {
    try {
      await axios.delete(`${URL}/enderecos/${id}`);
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
      throw error;
    }
  }

  // ============================================
  // INTEGRAÇÃO COM APIs EXTERNAS
  // ============================================

  /**
   * Busca dados de CNPJ na API ReceitaWS
   * https://receitaws.com.br/api
   */
  async consultarCNPJ(cnpj: string): Promise<CNPJResponse> {
    try {
      // Remover formatação do CNPJ (apenas números)
      const cnpjLimpo = cnpj.replace(/\D/g, '');

      const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpjLimpo}`);

      if (response.data.status === 'ERROR') {
        throw new Error(response.data.message || 'CNPJ inválido');
      }

      return response.data;
    } catch (error: any) {
      console.error('Erro ao consultar CNPJ:', error);

      if (error.response?.status === 429) {
        throw new Error('Limite de requisições atingido. Tente novamente em alguns minutos.');
      }

      throw new Error(error.message || 'Erro ao consultar CNPJ');
    }
  }

  /**
   * Busca dados de CEP na API ViaCEP
   * https://viacep.com.br/
   */
  async consultarCEP(cep: string): Promise<CEPResponse> {
    try {
      // Remover formatação do CEP (apenas números)
      const cepLimpo = cep.replace(/\D/g, '');

      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }

      return response.data;
    } catch (error: any) {
      console.error('Erro ao consultar CEP:', error);
      throw new Error(error.message || 'Erro ao consultar CEP');
    }
  }

  /**
   * Valida CPF (algoritmo de validação)
   */
  validarCPF(cpf: string): boolean {
    // Remover formatação
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Validar tamanho
    if (cpfLimpo.length !== 11) return false;

    // Validar sequências inválidas (111.111.111-11, etc.)
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    // Validar dígitos verificadores
    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

    return true;
  }

  /**
   * Criar cliente a partir de dados do CNPJ
   */
  async criarDeConsultaCNPJ(cnpj: string): Promise<Partial<CreateCliente>> {
    const dados = await this.consultarCNPJ(cnpj);

    return {
      razaoSocial: dados.razao_social,
      nomeFantasia: dados.nome_fantasia || undefined,
      tipoPessoa: 'juridica',
      cnpj: dados.cnpj,
      telefone: dados.telefone || '',
      email: dados.email || '',
      segmento: dados.atividade_principal?.[0]?.text,
      porte: this.mapearPorte(dados.porte),
      enderecoPrincipal: {
        tipo: 'sede',
        cep: dados.cep,
        logradouro: dados.logradouro,
        numero: dados.numero || 'S/N',
        complemento: dados.complemento || undefined,
        bairro: dados.bairro,
        cidade: dados.municipio,
        uf: dados.uf,
        pais: 'Brasil',
        principal: true,
      },
    };
  }

  /**
   * Mapear porte da ReceitaWS para nosso enum
   */
  private mapearPorte(porte: string): Cliente['porte'] | undefined {
    const mapa: Record<string, Cliente['porte']> = {
      'ME': 'ME',
      'EPP': 'EPP',
      'DEMAIS': 'Medio',
    };

    return mapa[porte] || undefined;
  }

  // ============================================
  // BUSCA E FILTROS
  // ============================================

  async buscar(termo: string): Promise<Cliente[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const termoLower = termo.toLowerCase();
      return mockClientes.filter(
        (c) =>
          c.razaoSocial.toLowerCase().includes(termoLower) ||
          c.nomeFantasia?.toLowerCase().includes(termoLower) ||
          c.cnpj?.includes(termo) ||
          c.cpf?.includes(termo)
      );
    }

    try {
      const response = await axios.get(`${URL}/buscar`, {
        params: { termo },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  async getByCNPJ(cnpj: string): Promise<Cliente | null> {
    try {
      const response = await axios.get(`${URL}/cnpj/${cnpj}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Erro ao buscar cliente por CNPJ:', error);
      throw error;
    }
  }

  async getByCPF(cpf: string): Promise<Cliente | null> {
    try {
      const response = await axios.get(`${URL}/cpf/${cpf}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Erro ao buscar cliente por CPF:', error);
      throw error;
    }
  }
}

export default new ClienteService();
