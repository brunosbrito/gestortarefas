import API_URL from '@/config';
import {
  Orcamento,
  CreateOrcamento,
  UpdateOrcamento,
  ComposicaoCustos,
} from '@/interfaces/OrcamentoInterface';
import api from '@/lib/axios';
import { calcularValoresOrcamento, calcularDRE, recalcularTodasComposicoes } from '@/lib/calculosOrcamento';
import { mockOrcamentosIniciais } from '@/data/mockOrcamentos';

const URL = `${API_URL}/orcamentos`;

// MOCK DATA - Controlado por variável de ambiente
// Para ativar: definir VITE_USE_MOCK_DATA=true no arquivo .env.local
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// LocalStorage keys
const STORAGE_KEY = 'gestortarefas_mock_orcamentos';
const COUNTERS_KEY = 'gestortarefas_mock_counters';

// Função para carregar dados do localStorage
const loadMockData = (): Orcamento[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    // Se não houver dados no localStorage, usar dados iniciais
    if (!stored) {
      console.log('📦 Inicializando localStorage com 3 orçamentos mockados');
      saveMockData(mockOrcamentosIniciais);
      return mockOrcamentosIniciais;
    }

    return JSON.parse(stored);
  } catch (error) {
    console.warn('⚠️ Erro ao carregar mock do localStorage, usando dados iniciais', error);
    return mockOrcamentosIniciais;
  }
};

// Função para salvar dados no localStorage
const saveMockData = (orcamentos: Orcamento[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orcamentos));
  } catch (error) {
    console.error('Erro ao salvar mock no localStorage:', error);
  }
};

// Função para carregar contadores
const loadCounters = () => {
  try {
    const stored = localStorage.getItem(COUNTERS_KEY);

    // Se não houver contadores, inicializar baseado nos dados mockados
    if (!stored) {
      const orcamentos = loadMockData();

      // Extrair números dos IDs e números de orçamento
      const maxId = orcamentos.reduce((max, orc) => {
        const match = orc.id.match(/orc-(\d+)/);
        return match ? Math.max(max, parseInt(match[1])) : max;
      }, 0);

      const servicoCount = orcamentos.filter((o) => o.tipo === 'servico').length;
      const produtoCount = orcamentos.filter((o) => o.tipo === 'produto').length;

      console.log(
        `🔢 Contadores inicializados: ID=${maxId + 1}, Serviço=${servicoCount}, Produto=${produtoCount}`
      );

      return {
        id: maxId + 1,
        servico: servicoCount,
        produto: produtoCount,
      };
    }

    return JSON.parse(stored);
  } catch (error) {
    console.warn('⚠️ Erro ao carregar contadores, usando valores padrão', error);
    return { id: 1, servico: 0, produto: 0 };
  }
};

// Função para salvar contadores
const saveCounters = (counters: { id: number; servico: number; produto: number }) => {
  try {
    localStorage.setItem(COUNTERS_KEY, JSON.stringify(counters));
  } catch (error) {
    console.error('Erro ao salvar contadores:', error);
  }
};

// Inicializar com dados do localStorage
const mockOrcamentos: Orcamento[] = loadMockData();
const counters = loadCounters();
let mockIdCounter = counters.id;
let mockServicoCounter = counters.servico;
let mockProdutoCounter = counters.produto;

// Configuração das composições padrão com seus BDIs específicos
const DEFAULT_COMPOSICOES = [
  { tipo: 'mobilizacao', nome: 'Mobilização', bdiPercentual: 10 },
  { tipo: 'desmobilizacao', nome: 'Desmobilização', bdiPercentual: 10 },
  { tipo: 'mo_fabricacao', nome: 'MO Fabricação', bdiPercentual: 25 },
  { tipo: 'mo_montagem', nome: 'MO Montagem', bdiPercentual: 25 },
  { tipo: 'mo_terceirizados', nome: 'MO Terceirizada', bdiPercentual: 20 },
  { tipo: 'jato_pintura', nome: 'Jato/Pintura', bdiPercentual: 12 },
  { tipo: 'ferramentas', nome: 'Ferramentas Manuais', bdiPercentual: 15 },
  { tipo: 'ferramentas_eletricas', nome: 'Ferramentas Elétricas', bdiPercentual: 15 },
  { tipo: 'consumiveis', nome: 'Consumíveis', bdiPercentual: 10 },
  { tipo: 'materiais', nome: 'Materiais', bdiPercentual: 25 },
] as const;

// Função para gerar as 8 composições padrão vazias
const generateDefaultComposicoes = (orcamentoId: string): ComposicaoCustos[] => {
  return DEFAULT_COMPOSICOES.map((config, index) => ({
    id: `comp-${orcamentoId}-${index + 1}`,
    orcamentoId,
    nome: config.nome,
    tipo: config.tipo as ComposicaoCustos['tipo'],
    itens: [],
    bdi: {
      percentual: config.bdiPercentual,
      valor: 0,
    },
    custoDirecto: 0,
    subtotal: 0,
    percentualDoTotal: 0,
    ordem: index + 1,
  }));
};

const generateMockOrcamento = (data: CreateOrcamento): Orcamento => {
  const id = `orc-${String(mockIdCounter).padStart(3, '0')}`;
  mockIdCounter++;

  // Gerar número no formato: S-2026-001 (serviço) ou P-2026-001 (produto)
  const ano = new Date().getFullYear();
  let numero: string;

  if (data.tipo === 'servico') {
    mockServicoCounter++;
    numero = `S-${ano}-${String(mockServicoCounter).padStart(3, '0')}`;
  } else {
    mockProdutoCounter++;
    numero = `P-${ano}-${String(mockProdutoCounter).padStart(3, '0')}`;
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
    composicoes: generateDefaultComposicoes(id), // Gerar 8 composições padrão
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

      // Salvar no localStorage
      saveMockData(mockOrcamentos);
      saveCounters({ id: mockIdCounter, servico: mockServicoCounter, produto: mockProdutoCounter });

      return orcamento;
    }

    try {
      const response = await api.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  }

  async getAll(): Promise<Orcamento[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Recarregar do localStorage e recalcular valores derivados
      const dados = loadMockData();
      return dados.map((orc) => {
        try {
          const composicoes = recalcularTodasComposicoes(orc.composicoes || []);
          const orcRecalc = { ...orc, composicoes };
          const valores = calcularValoresOrcamento(orcRecalc);
          const dre = calcularDRE(orcRecalc);
          return { ...orcRecalc, ...valores, dre };
        } catch {
          return orc;
        }
      });
    }

    try {
      const response = await api.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Orcamento> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Recarregar do localStorage para garantir dados atualizados
      const dados = loadMockData();
      const orcamento = dados.find((o) => o.id === id);

      if (!orcamento) {
        console.error(`❌ Orçamento ${id} não encontrado. IDs disponíveis:`, dados.map(o => o.id));
        throw new Error('Orçamento não encontrado');
      }

      console.log(`✅ Orçamento ${id} encontrado:`, orcamento.nome);

      // Recalcular valores antes de retornar
      try {
        const composicoes = recalcularTodasComposicoes(orcamento.composicoes || []);
        const orcRecalc = { ...orcamento, composicoes };

        const valores = calcularValoresOrcamento(orcRecalc);
        console.log('📊 Valores calculados:', valores);

        const dre = calcularDRE(orcRecalc);
        console.log('💰 DRE calculado:', dre);

        const resultado = {
          ...orcRecalc,
          ...valores,
          dre,
        };

        console.log('✅ Orçamento completo retornando:', resultado);
        return resultado;
      } catch (error) {
        console.error('❌ Erro ao calcular valores/DRE:', error);
        // Retornar orçamento sem recalcular se houver erro
        return orcamento;
      }
    }

    try {
      const response = await api.get(`${URL}/${id}`);
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

      // Merge dos dados recebidos com o orçamento existente
      const merged = {
        ...mockOrcamentos[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      // Recalcular todas as composições antes de salvar (custoDirecto, bdi.valor, subtotal)
      if (merged.composicoes && merged.composicoes.length > 0) {
        merged.composicoes = recalcularTodasComposicoes(merged.composicoes);
      }

      mockOrcamentos[index] = merged;

      // CRITICAL: Salvar no localStorage
      saveMockData(mockOrcamentos);

      return mockOrcamentos[index];
    }

    try {
      const response = await api.put(`${URL}/${id}`, data);
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
        // CRITICAL: Salvar no localStorage
        saveMockData(mockOrcamentos);
      }
      return;
    }

    try {
      await api.delete(`${URL}/${id}`);
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

      try {
        clonado.composicoes = JSON.parse(JSON.stringify(original.composicoes));
      } catch {
        // Se falhar a clonagem das composições, mantém as composições padrão geradas
        console.warn('⚠️ Falha ao clonar composições, usando composições padrão');
      }
      mockOrcamentos.push(clonado);
      saveMockData(mockOrcamentos);
      return clonado;
    }

    try {
      const response = await api.post(`${URL}/${id}/clonar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao clonar orçamento:', error);
      throw error;
    }
  }

  async calcular(id: string): Promise<Orcamento> {
    try {
      const response = await api.get(`${URL}/${id}/calcular`);
      return response.data;
    } catch (error) {
      console.error('Erro ao calcular orçamento:', error);
      throw error;
    }
  }

  async getProximoNumero(): Promise<string> {
    try {
      const response = await api.get(`${URL}/numero/proximo`);
      return response.data.numero;
    } catch (error) {
      console.error('Erro ao obter próximo número:', error);
      throw error;
    }
  }

  async getByCliente(cnpj: string): Promise<Orcamento[]> {
    try {
      const response = await api.get(`${URL}/cliente/${cnpj}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamentos do cliente:', error);
      throw error;
    }
  }

  async getAnaliseABC(id: string): Promise<any> {
    try {
      const response = await api.get(`${URL}/${id}/analise-abc`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar análise ABC:', error);
      throw error;
    }
  }

  async getDRE(id: string): Promise<any> {
    try {
      const response = await api.get(`${URL}/${id}/dre`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar DRE:', error);
      throw error;
    }
  }
}

export default new OrcamentoService();
