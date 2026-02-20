import API_URL from '@/config';
import {
  ItemCatalogo,
  CreateItemCatalogo,
  UpdateItemCatalogo,
} from '@/interfaces/CatalogoItensInterface';
import { normalizarDescricao } from '@/lib/textUtils';
import axios from 'axios';

const URL = `${API_URL}/api/catalogo-itens`;

// MOCK DATA
const USE_MOCK = true;
let mockIdCounter = 1;

// LocalStorage keys
const STORAGE_KEY = 'gestortarefas_mock_catalogo_itens';

// Função para carregar dados do localStorage
const loadMockData = (): ItemCatalogo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const itens = JSON.parse(stored);

      // Aplicar normalização a todos os itens existentes (migração)
      const itensNormalizados = itens.map((item: ItemCatalogo) => ({
        ...item,
        descricao: normalizarDescricao(item.descricao),
      }));

      // Salvar itens normalizados de volta
      saveMockData(itensNormalizados);

      return itensNormalizados;
    }
    // Se não houver dados, retornar itens iniciais
    return getItensIniciais();
  } catch {
    return getItensIniciais();
  }
};

// Função para salvar dados no localStorage
const saveMockData = (itens: ItemCatalogo[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
  } catch (error) {
    console.error('Erro ao salvar catálogo no localStorage:', error);
  }
};

// Itens pré-cadastrados (ordenados alfabeticamente)
const getItensIniciais = (): ItemCatalogo[] => {
  const itens: Omit<ItemCatalogo, 'id' | 'ordem'>[] = [
    // SOLDA
    { descricao: 'Arame Cobreado 70S6', subcategoria: 'solda', unidade: 'kg', valorUnitario: 25.50, ativo: true },
    { descricao: 'Bocal Conico', subcategoria: 'solda', unidade: 'un', valorUnitario: 8.00, ativo: true },
    { descricao: 'Eletrodo 6013 2,5MM', subcategoria: 'solda', unidade: 'kg', valorUnitario: 18.00, ativo: true },
    { descricao: 'Eletrodo 7018 3,25MM', subcategoria: 'solda', unidade: 'kg', valorUnitario: 22.50, ativo: true },
    { descricao: 'Eletrodo MGM 6013 FS', subcategoria: 'solda', unidade: 'kg', valorUnitario: 19.80, ativo: true },

    // GASES
    { descricao: 'Acetileno', subcategoria: 'gases', unidade: 'CL', valorUnitario: 280.00, ativo: true },
    { descricao: 'Argonio', subcategoria: 'gases', unidade: 'CL', valorUnitario: 350.00, ativo: true },
    { descricao: 'GLP', subcategoria: 'gases', unidade: 'CL', valorUnitario: 450.00, ativo: true },
    { descricao: 'Mistura MIG', subcategoria: 'gases', unidade: 'CL', valorUnitario: 280.00, ativo: true },
    { descricao: 'Oxigenio', subcategoria: 'gases', unidade: 'CL', valorUnitario: 95.00, ativo: true },

    // ABRASIVOS
    { descricao: 'Disco Corte ACO 12"', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 12.50, ativo: true },
    { descricao: 'Disco Corte ACO 14"', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 15.00, ativo: true },
    { descricao: 'Disco Corte ACO 4.1/2"', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 3.80, ativo: true },
    { descricao: 'Disco Corte ACO 7"', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 5.50, ativo: true },
    { descricao: 'Disco Corte ACO 9"', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 8.00, ativo: true },
    { descricao: 'Disco Corte ACO INOX', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 15.80, ativo: true },
    { descricao: 'Disco Desbaste 4.1/2"', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 4.20, ativo: true },
    { descricao: 'Disco Desbaste 7"', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 6.50, ativo: true },
    { descricao: 'Disco Desbaste 9"', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 9.00, ativo: true },
    { descricao: 'Disco Flap 4.1/2" GR 60', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 7.50, ativo: true },
    { descricao: 'Disco Flap 7" GR 60', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 12.00, ativo: true },
    { descricao: 'Escova De ACO', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 25.00, ativo: true },
    { descricao: 'Lixa Ferro GR 80', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 2.50, ativo: true },
    { descricao: 'Serra Fita 1.1/4 X 4-6D - 4,17MT - Classic Pro', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 320.00, ativo: true },
    { descricao: 'Serra Fita IP/1.3/4 X 5-8D 4,17MTS - Starrett', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 450.00, ativo: true },
    { descricao: 'Serra Fita IP/PB1.3/4 X 4-6D 4,17MT - Starrett', subcategoria: 'abrasivos', unidade: 'un', valorUnitario: 410.00, ativo: true },

    // MARCADOR
    { descricao: 'Giz Industrial Branco', subcategoria: 'marcador', unidade: 'un', valorUnitario: 1.80, ativo: true },
    { descricao: 'Marcador Permanente Preto', subcategoria: 'marcador', unidade: 'un', valorUnitario: 3.50, ativo: true },
    { descricao: 'Spray Marcacao Azul', subcategoria: 'marcador', unidade: 'un', valorUnitario: 12.00, ativo: true },
    { descricao: 'Spray Marcacao Vermelho', subcategoria: 'marcador', unidade: 'un', valorUnitario: 12.00, ativo: true },
  ];

  // Ordenar alfabeticamente e adicionar id e ordem
  return itens
    .sort((a, b) => a.descricao.localeCompare(b.descricao))
    .map((item, index) => ({
      ...item,
      id: `cat-${mockIdCounter++}`,
      ordem: index + 1,
    }));
};

// Inicializar com dados do localStorage ou itens iniciais
const mockCatalogo: ItemCatalogo[] = loadMockData();

class CatalogoItensService {
  async getAll(): Promise<ItemCatalogo[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Recarregar do localStorage
      const itens = loadMockData();
      return itens.filter((item) => item.ativo);
    }

    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar catálogo:', error);
      throw error;
    }
  }

  async getBySubcategoria(subcategoria: string): Promise<ItemCatalogo[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const itens = loadMockData();
      return itens
        .filter((item) => item.ativo && item.subcategoria === subcategoria)
        .sort((a, b) => a.descricao.localeCompare(b.descricao));
    }

    try {
      const response = await axios.get(`${URL}/subcategoria/${subcategoria}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar itens por subcategoria:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<ItemCatalogo> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const item = mockCatalogo.find((i) => i.id === id);
      if (!item) {
        throw new Error('Item não encontrado');
      }
      return item;
    }

    try {
      const response = await axios.get(`${URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar item:', error);
      throw error;
    }
  }

  async create(data: CreateItemCatalogo): Promise<ItemCatalogo> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newItem: ItemCatalogo = {
        id: `cat-${mockIdCounter++}`,
        ...data,
        descricao: normalizarDescricao(data.descricao), // Aplicar normalização
        ordem: mockCatalogo.length + 1,
        ativo: true,
      };

      mockCatalogo.push(newItem);

      // Reordenar alfabeticamente
      mockCatalogo.sort((a, b) => a.descricao.localeCompare(b.descricao));
      mockCatalogo.forEach((item, index) => {
        item.ordem = index + 1;
      });

      saveMockData(mockCatalogo);
      return newItem;
    }

    try {
      const response = await axios.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar item:', error);
      throw error;
    }
  }

  async update(data: UpdateItemCatalogo): Promise<ItemCatalogo> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const index = mockCatalogo.findIndex((i) => i.id === data.id);
      if (index === -1) {
        throw new Error('Item não encontrado');
      }

      mockCatalogo[index] = {
        ...mockCatalogo[index],
        ...data,
        // Aplicar normalização se descrição foi modificada
        ...(data.descricao && { descricao: normalizarDescricao(data.descricao) }),
      };

      // Reordenar se descrição mudou
      if (data.descricao) {
        mockCatalogo.sort((a, b) => a.descricao.localeCompare(b.descricao));
        mockCatalogo.forEach((item, index) => {
          item.ordem = index + 1;
        });
      }

      saveMockData(mockCatalogo);
      return mockCatalogo[index];
    }

    try {
      const response = await axios.put(`${URL}/${data.id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const index = mockCatalogo.findIndex((i) => i.id === id);
      if (index !== -1) {
        // Soft delete
        mockCatalogo[index].ativo = false;
        saveMockData(mockCatalogo);
      }
      return;
    }

    try {
      await axios.delete(`${URL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      throw error;
    }
  }

  // Busca por texto (para autocomplete/filtro)
  async search(query: string): Promise<ItemCatalogo[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const itens = loadMockData();
      const lowerQuery = query.toLowerCase();
      return itens
        .filter(
          (item) =>
            item.ativo &&
            item.descricao.toLowerCase().includes(lowerQuery)
        )
        .sort((a, b) => a.descricao.localeCompare(b.descricao));
    }

    try {
      const response = await axios.get(`${URL}/search`, { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      throw error;
    }
  }
}

export default new CatalogoItensService();
