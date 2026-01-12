import API_URL from '@/config';
import {
  Orcamento,
  CreateOrcamento,
  UpdateOrcamento,
} from '@/interfaces/OrcamentoInterface';
import axios from 'axios';
import { calcularValoresOrcamento, calcularDRE } from '@/lib/calculosOrcamento';

const URL = `${API_URL}/api/orcamentos`;

// MOCK DATA - Remover quando backend estiver pronto
const USE_MOCK = true; // Alterar para false quando backend estiver funcionando

const mockOrcamentos: Orcamento[] = [];
let mockIdCounter = 1;
let mockServicoCounter = 0; // Contador separado para S-xxx|2026
let mockProdutoCounter = 0; // Contador separado para P-xxx|2026

const generateMockOrcamento = (data: CreateOrcamento): Orcamento => {
  const id = `mock-${mockIdCounter++}`;

  // Gerar número no formato: S-001|2026 (serviço) ou P-001|2026 (produto)
  const ano = new Date().getFullYear();
  let numero: string;

  if (data.tipo === 'servico') {
    mockServicoCounter++;
    numero = `S-${String(mockServicoCounter).padStart(3, '0')}|${ano}`;
  } else {
    mockProdutoCounter++;
    numero = `P-${String(mockProdutoCounter).padStart(3, '0')}|${ano}`;
  }

  const orcamento: Orcamento = {
    id,
    numero,
    nome: data.nome,
    tipo: data.tipo,
    clienteNome: data.clienteNome,
    codigoProjeto: data.codigoProjeto,
    areaTotalM2: data.areaTotalM2,
    metrosLineares: data.metrosLineares,
    pesoTotalProjeto: data.pesoTotalProjeto,
    composicoes: [],
    tributos: data.tributos || {
      temISS: false,
      aliquotaISS: 3,
      aliquotaSimples: 11.8,
    },
    custoDirectoTotal: 0,
    bdiTotal: 0,
    subtotal: 0,
    tributosTotal: 0,
    totalVenda: 0,
    dre: {
      receitaLiquida: 0,
      lucroBruto: 0,
      margemBruta: 0,
      lucroLiquido: 0,
      margemLiquida: 0,
    },
    bdiMedio: 0,
    custoPorM2: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1,
  };

  return orcamento;
};

class OrcamentoService {
  async create(data: CreateOrcamento): Promise<Orcamento> {
    if (USE_MOCK) {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500));

      const orcamento = generateMockOrcamento(data);
      mockOrcamentos.push(orcamento);
      return orcamento;
    }

    try {
      const response = await axios.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  }

  async getAll(): Promise<Orcamento[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...mockOrcamentos];
    }

    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Orcamento> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const orcamento = mockOrcamentos.find((o) => o.id === id);
      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      // Recalcular valores antes de retornar
      const valores = calcularValoresOrcamento(orcamento);
      const dre = calcularDRE(orcamento);

      return {
        ...orcamento,
        ...valores,
        dre,
      };
    }

    try {
      const response = await axios.get(`${URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<UpdateOrcamento>): Promise<Orcamento> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const index = mockOrcamentos.findIndex((o) => o.id === id);
      if (index === -1) {
        throw new Error('Orçamento não encontrado');
      }

      mockOrcamentos[index] = {
        ...mockOrcamentos[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return mockOrcamentos[index];
    }

    try {
      const response = await axios.put(`${URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const index = mockOrcamentos.findIndex((o) => o.id === id);
      if (index !== -1) {
        mockOrcamentos.splice(index, 1);
      }
      return;
    }

    try {
      await axios.delete(`${URL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      throw error;
    }
  }

  async clonar(id: string): Promise<Orcamento> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const original = mockOrcamentos.find((o) => o.id === id);
      if (!original) {
        throw new Error('Orçamento não encontrado');
      }

      const clonado = generateMockOrcamento({
        nome: `${original.nome} (Cópia)`,
        clienteNome: original.clienteNome,
        codigoProjeto: original.codigoProjeto,
        areaTotalM2: original.areaTotalM2,
        metrosLineares: original.metrosLineares,
        pesoTotalProjeto: original.pesoTotalProjeto,
        tributos: original.tributos,
      });

      clonado.composicoes = JSON.parse(JSON.stringify(original.composicoes));
      mockOrcamentos.push(clonado);
      return clonado;
    }

    try {
      const response = await axios.post(`${URL}/${id}/clonar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao clonar orçamento:', error);
      throw error;
    }
  }

  async calcular(id: string): Promise<Orcamento> {
    try {
      const response = await axios.get(`${URL}/${id}/calcular`);
      return response.data;
    } catch (error) {
      console.error('Erro ao calcular orçamento:', error);
      throw error;
    }
  }

  async getProximoNumero(): Promise<string> {
    try {
      const response = await axios.get(`${URL}/numero/proximo`);
      return response.data.numero;
    } catch (error) {
      console.error('Erro ao obter próximo número:', error);
      throw error;
    }
  }

  async getByCliente(cnpj: string): Promise<Orcamento[]> {
    try {
      const response = await axios.get(`${URL}/cliente/${cnpj}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamentos do cliente:', error);
      throw error;
    }
  }

  async getAnaliseABC(id: string): Promise<any> {
    try {
      const response = await axios.get(`${URL}/${id}/analise-abc`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise ABC:', error);
      throw error;
    }
  }

  async getDRE(id: string): Promise<any> {
    try {
      const response = await axios.get(`${URL}/${id}/dre`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar DRE:', error);
      throw error;
    }
  }
}

export default new OrcamentoService();
