/**
 * Service para gerenciamento de Mobilização e Desmobilização
 * Integrado com API backend
 */

import api from '@/lib/axios';
import API_URL from '@/config';
import {
  ItemMobilizacaoInterface,
  ItemMobilizacaoCreateDTO,
  ItemMobilizacaoUpdateDTO,
  ItemMobilizacaoFiltros,
} from '@/interfaces/MobilizacaoInterface';

class MobilizacaoServiceClass {
  private readonly baseUrl = `${API_URL}/mobilizacao`;

  /**
   * Lista todos os itens (com filtros opcionais)
   */
  async getAll(filtros?: ItemMobilizacaoFiltros): Promise<ItemMobilizacaoInterface[]> {
    const params = new URLSearchParams();

    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.tipo) params.append('tipo', filtros.tipo);
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

    const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
    const response = await api.get<any[]>(url);

    return this.mapItemsResponse(response.data);
  }

  /**
   * Lista apenas itens ativos
   */
  async getAtivos(): Promise<ItemMobilizacaoInterface[]> {
    const response = await api.get<any[]>(`${this.baseUrl}/ativos`);
    return this.mapItemsResponse(response.data);
  }

  /**
   * Busca item por ID
   */
  async getById(id: number): Promise<ItemMobilizacaoInterface> {
    const response = await api.get<any>(`${this.baseUrl}/${id}`);
    return this.mapItemResponse(response.data);
  }

  /**
   * Cria novo item
   */
  async create(data: ItemMobilizacaoCreateDTO): Promise<ItemMobilizacaoInterface> {
    const response = await api.post<any>(this.baseUrl, data);
    return this.mapItemResponse(response.data);
  }

  /**
   * Atualiza item existente
   */
  async update(data: ItemMobilizacaoUpdateDTO): Promise<ItemMobilizacaoInterface> {
    const { id, ...updateData } = data;
    const response = await api.put<any>(`${this.baseUrl}/${id}`, updateData);
    return this.mapItemResponse(response.data);
  }

  /**
   * Exclui item
   */
  async delete(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Ativa/desativa item
   */
  async toggleAtivo(id: number): Promise<ItemMobilizacaoInterface> {
    const response = await api.patch<any>(`${this.baseUrl}/${id}/toggle-ativo`);
    return this.mapItemResponse(response.data);
  }

  /**
   * Popula itens iniciais (seed)
   */
  async seed(): Promise<{ message: string; total: number }> {
    const response = await api.post<{ message: string; total: number }>(
      `${this.baseUrl}/seed`
    );
    return response.data;
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private mapItemResponse(item: any): ItemMobilizacaoInterface {
    return {
      ...item,
      precoUnitario: Number(item.precoUnitario),
      createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
    };
  }

  private mapItemsResponse(items: any[]): ItemMobilizacaoInterface[] {
    return items.map((i) => this.mapItemResponse(i));
  }
}

export default new MobilizacaoServiceClass();
