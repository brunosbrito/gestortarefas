/**
 * Service para gerenciamento de Tarefas do Cronograma
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 */

import axios from 'axios';
import API_URL from '@/config';
import type {
  TarefaCronograma,
  CreateTarefaCronograma,
  UpdateTarefaCronograma,
  FiltrosTarefa,
  ImportacaoAtividades,
  ResultadoImportacao,
} from '@/interfaces/CronogramaInterfaces';
import { MOCK_TAREFAS } from '@/data/mockCronogramas';

class TarefaCronogramaService {
  private baseURL = `${API_URL}/api/tarefas-cronograma`;
  private useMockData = false;

  /**
   * Criar nova tarefa
   */
  async create(data: CreateTarefaCronograma): Promise<TarefaCronograma> {
    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  /**
   * Buscar todas as tarefas de um cronograma (com filtros)
   */
  async getAll(cronogramaId: string, filtros?: FiltrosTarefa): Promise<TarefaCronograma[]> {
    try {
      const params = new URLSearchParams();
      params.append('cronogramaId', cronogramaId);

      if (filtros) {
        if (filtros.tipo) params.append('tipo', filtros.tipo);
        if (filtros.status) params.append('status', filtros.status);
        if (filtros.responsavelId) params.append('responsavelId', filtros.responsavelId);
        if (filtros.prioridade) params.append('prioridade', filtros.prioridade);
        if (filtros.isMilestone !== undefined) {
          params.append('isMilestone', String(filtros.isMilestone));
        }
      }

      const url = `${this.baseURL}?${params.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.warn(`⚠️ Backend offline, usando dados mockados para tarefas do cronograma ${cronogramaId}`);
      this.useMockData = true;

      // Retorna tarefas mockadas
      let tarefas = MOCK_TAREFAS[cronogramaId] || [];

      // Aplica filtros
      if (filtros && tarefas.length > 0) {
        if (filtros.tipo) {
          tarefas = tarefas.filter(t => t.tipo === filtros.tipo);
        }
        if (filtros.status) {
          tarefas = tarefas.filter(t => t.status === filtros.status);
        }
        if (filtros.prioridade) {
          tarefas = tarefas.filter(t => t.prioridade === filtros.prioridade);
        }
        if (filtros.isMilestone !== undefined) {
          tarefas = tarefas.filter(t => t.isMilestone === filtros.isMilestone);
        }
      }

      return tarefas;
    }
  }

  /**
   * Buscar tarefa por ID
   */
  async getById(id: string): Promise<TarefaCronograma> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tarefa ${id}:`, error);
      throw error;
    }
  }

  /**
   * Atualizar tarefa
   */
  async update(id: string, data: UpdateTarefaCronograma): Promise<TarefaCronograma> {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar tarefa ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletar tarefa
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error: any) {
      console.error(`Erro ao deletar tarefa ${id}:`, error);

      // Se backend offline e usando mock, simular sucesso
      if (this.useMockData || error.response?.status === 404) {
        console.warn('⚠️ Backend offline ou rota não implementada. Simulando deleção de tarefa mock.');
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 300));
        return; // Sucesso simulado
      }

      throw error;
    }
  }

  /**
   * Atualizar progresso de uma tarefa
   * MVP - Atualização manual de progresso
   */
  async updateProgresso(id: string, progresso: number): Promise<TarefaCronograma> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/progresso`, { progresso });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar progresso da tarefa ${id}:`, error);
      throw error;
    }
  }

  /**
   * Atualizar datas de uma tarefa
   * MVP - Usado quando o usuário edita datas via Dialog (sem drag-and-drop)
   */
  async updateDatas(
    id: string,
    dataInicio: string,
    dataFim: string
  ): Promise<TarefaCronograma> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/datas`, {
        dataInicioPlanejada: dataInicio,
        dataFimPlanejada: dataFim,
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar datas da tarefa ${id}:`, error);
      throw error;
    }
  }

  /**
   * Importar atividades de OS para o cronograma
   * MVP - Funcionalidade essencial
   */
  async importarAtividades(data: ImportacaoAtividades): Promise<ResultadoImportacao> {
    try {
      const response = await axios.post(`${this.baseURL}/importar-atividades`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao importar atividades:', error);
      throw error;
    }
  }

  /**
   * Sincronizar progresso das tarefas com atividades reais
   * MVP - Botão "Sincronizar Agora" (manual)
   */
  async sincronizarProgresso(cronogramaId: string): Promise<{
    sincronizadas: number;
    tarefas: TarefaCronograma[];
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/sincronizar/${cronogramaId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao sincronizar progresso do cronograma ${cronogramaId}:`, error);
      throw error;
    }
  }

  /**
   * Marcar tarefa como bloqueada por RNC
   * MVP - Integração com RNC
   */
  async bloquearPorRNC(
    id: string,
    rncId: string,
    motivo: string
  ): Promise<TarefaCronograma> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/bloquear`, {
        rncBloqueioId: rncId,
        motivoBloqueio: motivo,
        status: 'bloqueada',
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao bloquear tarefa ${id}:`, error);
      throw error;
    }
  }

  /**
   * Desbloquear tarefa (RNC resolvida)
   */
  async desbloquear(id: string): Promise<TarefaCronograma> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/desbloquear`, {
        rncBloqueioId: null,
        motivoBloqueio: null,
        status: 'planejada',
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao desbloquear tarefa ${id}:`, error);
      throw error;
    }
  }

  /**
   * Recalcular datas de tarefas dependentes
   * MVP - Recálculo automático de dependências (CRÍTICO)
   *
   * Quando uma tarefa atrasa, recalcula todas as tarefas dependentes
   */
  async recalcularDependencias(
    tarefaId: string
  ): Promise<{
    tarefasAfetadas: number;
    tarefas: TarefaCronograma[];
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/${tarefaId}/recalcular-dependencias`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao recalcular dependências da tarefa ${tarefaId}:`, error);
      throw error;
    }
  }

  /**
   * Validar dependências circulares
   * Antes de criar uma dependência, valida se não cria um ciclo
   */
  async validarDependenciaCircular(
    tarefaAnteriorId: string,
    tarefaPosteriorId: string
  ): Promise<{ circular: boolean; caminho?: string[] }> {
    try {
      const response = await axios.post(`${this.baseURL}/validar-dependencia`, {
        tarefaAnteriorId,
        tarefaPosteriorId,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao validar dependência circular:', error);
      throw error;
    }
  }

  /**
   * Calcular caminho crítico (CPM)
   * Fase 3 - Funcionalidade avançada
   */
  async calcularCaminhoCritico(cronogramaId: string): Promise<{
    tarefasCriticas: string[];
    duracaoTotal: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/caminho-critico/${cronogramaId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao calcular caminho crítico do cronograma ${cronogramaId}:`, error);
      throw error;
    }
  }
}

export default new TarefaCronogramaService();
