import API_URL from '@/config';
import {
  Orcamento,
  CreateOrcamento,
  UpdateOrcamento,
} from '@/interfaces/OrcamentoInterface';
import axios from 'axios';

const URL = `${API_URL}/api/orcamentos`;

class OrcamentoService {
  async create(data: CreateOrcamento): Promise<Orcamento> {
    try {
      const response = await axios.post(URL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      throw error;
    }
  }

  async getAll(): Promise<Orcamento[]> {
    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Orcamento> {
    try {
      const response = await axios.get(`${URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<UpdateOrcamento>): Promise<Orcamento> {
    try {
      const response = await axios.put(`${URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${URL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      throw error;
    }
  }

  async clonar(id: string): Promise<Orcamento> {
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
