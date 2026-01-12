import API_URL from '@/config';
import {
  ItemComposicao,
  CreateItemComposicao,
  UpdateItemComposicao,
  ItemCSV,
} from '@/interfaces/OrcamentoInterface';
import axios from 'axios';
import OrcamentoService from './OrcamentoService';
import {
  calcularSubtotalItem,
  calcularCustoDirectoComposicao,
  calcularBDIComposicao,
  calcularSubtotalComposicao,
  calcularPercentualItem,
  calcularEncargos,
} from '@/lib/calculosOrcamento';

const URL = `${API_URL}/api`;

// MOCK DATA
const USE_MOCK = true;
let mockIdCounter = 1;

class ItemComposicaoService {
  async getByComposicao(composicaoId: string): Promise<ItemComposicao[]> {
    try {
      const response = await axios.get(`${URL}/composicoes/${composicaoId}/itens`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar itens da composição:', error);
      throw error;
    }
  }

  async create(data: CreateItemComposicao): Promise<ItemComposicao> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Buscar todos os orçamentos para encontrar a composição
      const orcamentos = await OrcamentoService.getAll();

      for (const orc of orcamentos) {
        const composicao = orc.composicoes.find((c) => c.id === data.composicaoId);

        if (composicao) {
          // Calcular subtotal do item
          const subtotal = calcularSubtotalItem(data);

          // Criar item
          const item: ItemComposicao = {
            id: `item-${mockIdCounter++}`,
            composicaoId: data.composicaoId,
            codigo: data.codigo,
            descricao: data.descricao,
            quantidade: data.quantidade,
            unidade: data.unidade,
            peso: data.peso,
            valorUnitario: data.valorUnitario,
            subtotal,
            percentual: 0, // Será recalculado abaixo
            tipoItem: data.tipoItem,
            cargo: data.cargo,
            ordem: composicao.itens.length + 1,
          };

          // Adicionar encargos se for mão de obra
          if (item.tipoItem === 'mao_obra') {
            const valorEncargos = calcularEncargos(subtotal);
            item.encargos = {
              percentual: 50.72,
              valor: valorEncargos,
            };
          }

          // Adicionar item à composição
          composicao.itens.push(item);

          // Recalcular composição
          const custoDirecto = calcularCustoDirectoComposicao(composicao.itens);
          const bdiValor = calcularBDIComposicao(custoDirecto, composicao.bdi.percentual);
          const subtotalComposicao = calcularSubtotalComposicao(custoDirecto, bdiValor);

          composicao.custoDirecto = custoDirecto;
          composicao.bdi.valor = bdiValor;
          composicao.subtotal = subtotalComposicao;

          // Recalcular percentuais dos itens
          composicao.itens.forEach((it) => {
            it.percentual = calcularPercentualItem(it, custoDirecto);
          });

          // Salvar orçamento atualizado
          await OrcamentoService.update(orc.id, {
            id: orc.id,
            composicoes: orc.composicoes,
          });

          return item;
        }
      }

      throw new Error('Composição não encontrada');
    }

    try {
      const response = await axios.post(`${URL}/composicoes/${data.composicaoId}/itens`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar item:', error);
      throw error;
    }
  }

  async importarCSV(composicaoId: string, itens: ItemCSV[]): Promise<ItemComposicao[]> {
    try {
      const response = await axios.post(`${URL}/composicoes/${composicaoId}/itens/csv`, { itens });
      return response.data;
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      throw error;
    }
  }

  async update(data: Partial<UpdateItemComposicao> & { id: string }): Promise<ItemComposicao> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Buscar todos os orçamentos
      const orcamentos = await OrcamentoService.getAll();

      for (const orc of orcamentos) {
        for (const composicao of orc.composicoes) {
          const itemIndex = composicao.itens.findIndex((it) => it.id === data.id);

          if (itemIndex !== -1) {
            // Atualizar item
            composicao.itens[itemIndex] = {
              ...composicao.itens[itemIndex],
              ...data,
            };

            // Recalcular subtotal
            const item = composicao.itens[itemIndex];
            item.subtotal = calcularSubtotalItem(item);

            // Recalcular encargos se for mão de obra
            if (item.tipoItem === 'mao_obra') {
              item.encargos = {
                percentual: 50.72,
                valor: calcularEncargos(item.subtotal),
              };
            }

            // Recalcular composição
            const custoDirecto = calcularCustoDirectoComposicao(composicao.itens);
            const bdiValor = calcularBDIComposicao(custoDirecto, composicao.bdi.percentual);
            const subtotalComposicao = calcularSubtotalComposicao(custoDirecto, bdiValor);

            composicao.custoDirecto = custoDirecto;
            composicao.bdi.valor = bdiValor;
            composicao.subtotal = subtotalComposicao;

            // Recalcular percentuais dos itens
            composicao.itens.forEach((it) => {
              it.percentual = calcularPercentualItem(it, custoDirecto);
            });

            // Salvar orçamento
            await OrcamentoService.update(orc.id, {
              id: orc.id,
              composicoes: orc.composicoes,
            });

            return item;
          }
        }
      }

      throw new Error('Item não encontrado');
    }

    try {
      const response = await axios.put(`${URL}/itens-composicao/${data.id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Buscar todos os orçamentos
      const orcamentos = await OrcamentoService.getAll();

      for (const orc of orcamentos) {
        for (const composicao of orc.composicoes) {
          const itemIndex = composicao.itens.findIndex((it) => it.id === id);

          if (itemIndex !== -1) {
            // Remover item
            composicao.itens.splice(itemIndex, 1);

            // Recalcular composição
            const custoDirecto = calcularCustoDirectoComposicao(composicao.itens);
            const bdiValor = calcularBDIComposicao(custoDirecto, composicao.bdi.percentual);
            const subtotalComposicao = calcularSubtotalComposicao(custoDirecto, bdiValor);

            composicao.custoDirecto = custoDirecto;
            composicao.bdi.valor = bdiValor;
            composicao.subtotal = subtotalComposicao;

            // Recalcular percentuais dos itens restantes
            composicao.itens.forEach((it) => {
              it.percentual = calcularPercentualItem(it, custoDirecto);
            });

            // Salvar orçamento
            await OrcamentoService.update(orc.id, {
              id: orc.id,
              composicoes: orc.composicoes,
            });

            return;
          }
        }
      }

      return;
    }

    try {
      await axios.delete(`${URL}/itens-composicao/${id}`);
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      throw error;
    }
  }

  async calcularABC(itemId: string): Promise<ItemComposicao> {
    try {
      const response = await axios.post(`${URL}/itens-composicao/${itemId}/calcular-abc`);
      return response.data;
    } catch (error) {
      console.error('Erro ao calcular ABC:', error);
      throw error;
    }
  }
}

export default new ItemComposicaoService();
