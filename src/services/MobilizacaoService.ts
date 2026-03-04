/**
 * Service para gerenciamento de Mobilização e Desmobilização
 * Persistência via localStorage (mock até backend estar disponível)
 */

import {
  ItemMobilizacaoInterface,
  ItemMobilizacaoCreateDTO,
  ItemMobilizacaoUpdateDTO,
  ItemMobilizacaoFiltros,
} from '@/interfaces/MobilizacaoInterface';

const STORAGE_KEY = 'comercial_mobilizacao';

// ==========================================
// Helpers de persistência
// ==========================================

function lerStorage(): ItemMobilizacaoInterface[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function salvarStorage(items: ItemMobilizacaoInterface[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function proximoId(items: ItemMobilizacaoInterface[]): number {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

// ==========================================
// Service
// ==========================================

class MobilizacaoService {
  /**
   * Lista todos os itens (com filtros opcionais)
   */
  async getAll(filtros?: ItemMobilizacaoFiltros): Promise<ItemMobilizacaoInterface[]> {
    let resultado = lerStorage();

    if (filtros?.busca) {
      const b = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (c) => c.codigo.toLowerCase().includes(b) || c.descricao.toLowerCase().includes(b)
      );
    }
    if (filtros?.tipo) {
      resultado = resultado.filter((c) => c.tipo === filtros.tipo);
    }
    if (filtros?.categoria) {
      resultado = resultado.filter((c) => c.categoria === filtros.categoria);
    }
    if (filtros?.ativo !== undefined) {
      resultado = resultado.filter((c) => c.ativo === filtros.ativo);
    }

    return resultado;
  }

  /**
   * Busca item por ID
   */
  async getById(id: number): Promise<ItemMobilizacaoInterface> {
    const item = lerStorage().find((c) => c.id === id);
    if (!item) throw new Error(`Item de mobilização #${id} não encontrado`);
    return item;
  }

  /**
   * Cria novo item
   */
  async create(data: ItemMobilizacaoCreateDTO): Promise<ItemMobilizacaoInterface> {
    const items = lerStorage();
    const novo: ItemMobilizacaoInterface = {
      ...data,
      id: proximoId(items),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    salvarStorage([...items, novo]);
    return novo;
  }

  /**
   * Atualiza item existente
   */
  async update(data: ItemMobilizacaoUpdateDTO): Promise<ItemMobilizacaoInterface> {
    const items = lerStorage();
    const idx = items.findIndex((c) => c.id === data.id);
    if (idx === -1) throw new Error(`Item de mobilização #${data.id} não encontrado`);
    const { id, ...campos } = data;
    const atualizado: ItemMobilizacaoInterface = {
      ...items[idx],
      ...campos,
      updatedAt: new Date(),
    };
    items[idx] = atualizado;
    salvarStorage(items);
    return atualizado;
  }

  /**
   * Exclui item
   */
  async delete(id: number): Promise<void> {
    salvarStorage(lerStorage().filter((c) => c.id !== id));
  }

  /**
   * Ativa/desativa item
   */
  async toggleAtivo(id: number, ativo: boolean): Promise<ItemMobilizacaoInterface> {
    return this.update({ id, ativo });
  }
}

export default new MobilizacaoService();
