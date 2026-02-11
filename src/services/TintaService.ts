import axios from 'axios';
import API_URL from '@/config';
import type {
  TintaInterface,
  TintaCreateDTO,
  TintaUpdateDTO,
  TintaFiltros,
} from '@/interfaces/TintaInterface';

class TintaService {
  private baseURL = `${API_URL}/tintas`;

  // Listar todas as tintas (com filtros opcionais)
  async listar(filtros?: TintaFiltros): Promise<TintaInterface[]> {
    try {
      const params = new URLSearchParams();

      if (filtros?.busca) params.append('busca', filtros.busca);
      if (filtros?.tipo) params.append('tipo', filtros.tipo);
      if (filtros?.fornecedor) params.append('fornecedor', filtros.fornecedor);
      if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

      const response = await axios.get<TintaInterface[]>(
        `${this.baseURL}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao listar tintas:', error);
      throw error;
    }
  }

  // Buscar tinta por ID
  async buscarPorId(id: number): Promise<TintaInterface> {
    try {
      const response = await axios.get<TintaInterface>(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tinta ${id}:`, error);
      throw error;
    }
  }

  // Criar nova tinta
  async criar(data: TintaCreateDTO): Promise<TintaInterface> {
    try {
      const response = await axios.post<TintaInterface>(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar tinta:', error);
      throw error;
    }
  }

  // Atualizar tinta existente
  async atualizar(id: number, data: TintaUpdateDTO): Promise<TintaInterface> {
    try {
      const response = await axios.put<TintaInterface>(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar tinta ${id}:`, error);
      throw error;
    }
  }

  // Excluir tinta
  async excluir(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir tinta ${id}:`, error);
      throw error;
    }
  }

  // Buscar tintas por tipo
  async buscarPorTipo(tipo: string): Promise<TintaInterface[]> {
    try {
      const response = await axios.get<TintaInterface[]>(
        `${this.baseURL}/tipo/${tipo}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tintas do tipo ${tipo}:`, error);
      throw error;
    }
  }

  // Buscar tintas por fornecedor
  async buscarPorFornecedor(fornecedor: string): Promise<TintaInterface[]> {
    try {
      const response = await axios.get<TintaInterface[]>(
        `${this.baseURL}/fornecedor/${fornecedor}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tintas do fornecedor ${fornecedor}:`, error);
      throw error;
    }
  }
}

export default new TintaService();
