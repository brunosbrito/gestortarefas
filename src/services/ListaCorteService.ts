/**
 * Serviço de Lista de Corte
 * Gerencia listas de corte, extrai peças de orçamentos
 */

import axios from 'axios';
import API_URL from '@/config';
import {
  ListaCorteInterface,
  ListaCorteCreateDTO,
  ListaCorteFiltros,
  PecaCorte,
} from '@/interfaces/ListaCorteInterface';

class ListaCorteService {
  private baseURL = `${API_URL}/listas-corte`;

  /**
   * Busca todas as listas de corte com filtros opcionais
   */
  async getAll(filtros?: ListaCorteFiltros): Promise<ListaCorteInterface[]> {
    const response = await axios.get(this.baseURL, { params: filtros });
    return response.data;
  }

  /**
   * Busca uma lista de corte por ID
   */
  async getById(id: number): Promise<ListaCorteInterface> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Cria nova lista de corte
   */
  async create(data: ListaCorteCreateDTO): Promise<ListaCorteInterface> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  /**
   * Deleta uma lista de corte
   */
  async delete(id: number): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Extrai peças de um orçamento para gerar lista de corte
   */
  async extrairPecasDoOrcamento(orcamentoId: number): Promise<PecaCorte[]> {
    const response = await axios.get(
      `${API_URL}/orcamentos/${orcamentoId}/pecas-corte`
    );
    return response.data;
  }

  /**
   * Detecta a geometria predominante nas peças
   */
  detectarGeometria(pecas: PecaCorte[]): string {
    if (pecas.length === 0) return 'Diversos';

    // Contar ocorrências de cada perfil
    const contagem = new Map<string, number>();
    let maxCount = 0;
    let geometriaPredominante = '';

    for (const peca of pecas) {
      const perfil = peca.perfil;
      const count = (contagem.get(perfil) || 0) + peca.quantidade;
      contagem.set(perfil, count);

      if (count > maxCount) {
        maxCount = count;
        geometriaPredominante = perfil;
      }
    }

    // Se houver muita variedade, retornar "Diversos"
    if (contagem.size > 5) {
      return 'Diversos';
    }

    return geometriaPredominante;
  }

  /**
   * Exporta lista de corte para Excel
   */
  async exportarExcel(listaId: number): Promise<Blob> {
    const response = await axios.get(`${this.baseURL}/${listaId}/export/excel`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Exporta lista de corte para PDF
   */
  async exportarPDF(listaId: number): Promise<Blob> {
    const response = await axios.get(`${this.baseURL}/${listaId}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new ListaCorteService();
