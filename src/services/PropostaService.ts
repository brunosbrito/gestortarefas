import API_URL from '@/config';
import {
  Proposta,
  CreateProposta,
  UpdateProposta,
  FiltrosProposta,
  AtualizarStatusProposta,
  CreateItemProposta,
  UpdateItemProposta,
  ItemProposta,
} from '@/interfaces/PropostaInterface';
import axios from 'axios';

const URL = `${API_URL}/api/propostas`;

// MOCK DATA - Controlado por variável de ambiente
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const mockPropostas: Proposta[] = [];

class PropostaService {
  async getAll(filtros?: FiltrosProposta): Promise<Proposta[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...mockPropostas];
    }

    try {
      const response = await axios.get(URL, { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Proposta> {
    try {
      const response = await axios.get(`${URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar proposta:', error);
      throw error;
    }
  }

  async create(data: CreateProposta): Promise<Proposta> {
    try {
      const response = await axios.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<UpdateProposta>): Promise<Proposta> {
    try {
      const response = await axios.put(`${URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${URL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar proposta:', error);
      throw error;
    }
  }

  async updateStatus(data: AtualizarStatusProposta): Promise<Proposta> {
    try {
      const response = await axios.patch(`${URL}/${data.propostaId}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  async clonar(id: string): Promise<Proposta> {
    try {
      const response = await axios.post(`${URL}/${id}/clonar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao clonar proposta:', error);
      throw error;
    }
  }

  async exportarPDF(id: string): Promise<Blob> {
    try {
      const response = await axios.get(`${URL}/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
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

  async vincularOrcamento(propostaId: string, orcamentoId: string): Promise<Proposta> {
    try {
      const response = await axios.post(`${URL}/${propostaId}/vincular-orcamento`, { orcamentoId });
      return response.data;
    } catch (error) {
      console.error('Erro ao vincular orçamento:', error);
      throw error;
    }
  }

  async getByCliente(cnpj: string): Promise<Proposta[]> {
    try {
      const response = await axios.get(`${URL}/cliente/${cnpj}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar propostas do cliente:', error);
      throw error;
    }
  }

  // Itens de Proposta
  async createItem(data: CreateItemProposta): Promise<ItemProposta> {
    try {
      const response = await axios.post(`${URL}/${data.propostaId}/itens`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar item:', error);
      throw error;
    }
  }

  async updateItem(propostaId: string, itemId: string, data: Partial<UpdateItemProposta>): Promise<ItemProposta> {
    try {
      const response = await axios.put(`${URL}/${propostaId}/itens/${itemId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  }

  async deleteItem(propostaId: string, itemId: string): Promise<void> {
    try {
      await axios.delete(`${URL}/${propostaId}/itens/${itemId}`);
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      throw error;
    }
  }
}

export default new PropostaService();
