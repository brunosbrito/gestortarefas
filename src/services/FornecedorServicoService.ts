import api from '@/lib/axios';
import type {
  FornecedorInterface,
  CreateFornecedorDTO,
  UpdateFornecedorDTO,
  FornecedorFiltros,
} from '@/interfaces/FornecedorServicoInterface';

class FornecedorService {
  private baseURL = '/fornecedores';

  async listar(filtros?: FornecedorFiltros): Promise<FornecedorInterface[]> {
    const params = new URLSearchParams();

    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.tipo) params.append('tipo', filtros.tipo);
    if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

    const response = await api.get<FornecedorInterface[]>(
      `${this.baseURL}${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  }

  async buscarPorId(id: number): Promise<FornecedorInterface> {
    const response = await api.get<FornecedorInterface>(`${this.baseURL}/${id}`);
    return response.data;
  }

  async buscarPorTipo(tipo: string): Promise<FornecedorInterface[]> {
    const response = await api.get<FornecedorInterface[]>(`${this.baseURL}/tipo/${tipo}`);
    return response.data;
  }

  async criar(data: CreateFornecedorDTO): Promise<FornecedorInterface> {
    const response = await api.post<FornecedorInterface>(this.baseURL, data);
    return response.data;
  }

  async atualizar(id: number, data: UpdateFornecedorDTO): Promise<FornecedorInterface> {
    const response = await api.put<FornecedorInterface>(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async excluir(id: number): Promise<void> {
    await api.delete(`${this.baseURL}/${id}`);
  }
}

export default new FornecedorService();
