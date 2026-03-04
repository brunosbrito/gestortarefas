import api from '@/lib/axios';
import API_URL from '@/config';
import type {
  FornecedorServicoInterface,
  FornecedorServicoCreateDTO,
  FornecedorServicoUpdateDTO,
  FornecedorServicoFiltros,
} from '@/interfaces/FornecedorServicoInterface';

class FornecedorServicoService {
  private baseURL = `${API_URL}/fornecedores-servico`;

  // Listar todos os fornecedores (com filtros opcionais)
  async listar(filtros?: FornecedorServicoFiltros): Promise<FornecedorServicoInterface[]> {
    try {
      const params = new URLSearchParams();

      if (filtros?.busca) params.append('busca', filtros.busca);
      if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

      const response = await api.get<FornecedorServicoInterface[]>(
        `${this.baseURL}${params.toString() ? `?${params.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao listar fornecedores de serviço:', error);
      throw error;
    }
  }

  // Buscar fornecedor por ID
  async buscarPorId(id: number): Promise<FornecedorServicoInterface> {
    try {
      const response = await api.get<FornecedorServicoInterface>(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar fornecedor ${id}:`, error);
      throw error;
    }
  }

  // Criar novo fornecedor
  async criar(data: FornecedorServicoCreateDTO): Promise<FornecedorServicoInterface> {
    try {
      const response = await api.post<FornecedorServicoInterface>(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw error;
    }
  }

  // Atualizar fornecedor existente
  async atualizar(id: number, data: FornecedorServicoUpdateDTO): Promise<FornecedorServicoInterface> {
    try {
      const response = await api.put<FornecedorServicoInterface>(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar fornecedor ${id}:`, error);
      throw error;
    }
  }

  // Excluir fornecedor
  async excluir(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir fornecedor ${id}:`, error);
      throw error;
    }
  }
}

export default new FornecedorServicoService();
