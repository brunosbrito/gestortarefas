/**
 * Service para gerenciamento de Recursos (Alocação de Colaboradores)
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 */

import axios from 'axios';
import API_URL from '@/config';
import type { RecursoCronograma } from '@/interfaces/CronogramaInterfaces';

interface CreateRecurso {
  tarefaId: string;
  colaboradorId: number;
  percentualAlocacao: number; // 0-100
  horasEstimadas?: number;
  papel?: string; // Ex: "Soldador", "Pintor", "Supervisor"
}

interface UpdateRecurso {
  percentualAlocacao?: number;
  horasEstimadas?: number;
  horasReais?: number;
  papel?: string;
}

class RecursoCronogramaService {
  private baseURL = `${API_URL}/api/recursos-cronograma`;

  /**
   * Alocar colaborador a uma tarefa
   */
  async create(data: CreateRecurso): Promise<RecursoCronograma> {
    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao alocar recurso:', error);
      throw error;
    }
  }

  /**
   * Buscar todos os recursos alocados a uma tarefa
   */
  async getByTarefaId(tarefaId: string): Promise<RecursoCronograma[]> {
    try {
      const response = await axios.get(`${this.baseURL}/tarefa/${tarefaId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar recursos da tarefa ${tarefaId}:`, error);
      throw error;
    }
  }

  /**
   * Buscar todos os recursos de um cronograma
   */
  async getByCronogramaId(cronogramaId: string): Promise<RecursoCronograma[]> {
    try {
      const response = await axios.get(`${this.baseURL}/cronograma/${cronogramaId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar recursos do cronograma ${cronogramaId}:`, error);
      throw error;
    }
  }

  /**
   * Buscar todas as alocações de um colaborador
   * Útil para verificar disponibilidade e carga de trabalho
   */
  async getByColaboradorId(colaboradorId: number): Promise<RecursoCronograma[]> {
    try {
      const response = await axios.get(`${this.baseURL}/colaborador/${colaboradorId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar alocações do colaborador ${colaboradorId}:`, error);
      throw error;
    }
  }

  /**
   * Atualizar alocação de recurso
   */
  async update(id: string, data: UpdateRecurso): Promise<RecursoCronograma> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar recurso ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remover alocação de recurso
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error(`Erro ao remover recurso ${id}:`, error);
      throw error;
    }
  }

  /**
   * Calcular carga de trabalho de um colaborador
   * Retorna percentual total de alocação e lista de tarefas
   */
  async calcularCargaTrabalho(
    colaboradorId: number,
    dataInicio?: string,
    dataFim?: string
  ): Promise<{
    colaboradorId: number;
    percentualTotal: number;
    tarefas: {
      tarefaId: string;
      tarefaNome: string;
      percentualAlocacao: number;
      dataInicio: string;
      dataFim: string;
    }[];
    sobrecarregado: boolean; // true se > 100%
  }> {
    try {
      const params = new URLSearchParams();
      params.append('colaboradorId', colaboradorId.toString());
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);

      const url = `${this.baseURL}/carga-trabalho?${params.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Erro ao calcular carga de trabalho do colaborador ${colaboradorId}:`, error);
      throw error;
    }
  }

  /**
   * Verificar disponibilidade de um colaborador para alocação
   * Retorna percentual disponível no período
   */
  async verificarDisponibilidade(
    colaboradorId: number,
    dataInicio: string,
    dataFim: string
  ): Promise<{
    disponivel: boolean;
    percentualDisponivel: number;
    percentualAlocado: number;
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/verificar-disponibilidade`, {
        colaboradorId,
        dataInicio,
        dataFim,
      });
      return response.data;
    } catch (error) {
      console.error(
        `Erro ao verificar disponibilidade do colaborador ${colaboradorId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Atualizar horas reais trabalhadas
   * Fase 2 - Integração com ponto/timesheet
   */
  async atualizarHorasReais(id: string, horasReais: number): Promise<RecursoCronograma> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}/horas-reais`, { horasReais });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar horas reais do recurso ${id}:`, error);
      throw error;
    }
  }

  /**
   * Criar múltiplas alocações de uma vez
   * Útil para importação ou criação em lote
   */
  async createBatch(recursos: CreateRecurso[]): Promise<RecursoCronograma[]> {
    try {
      const response = await axios.post(`${this.baseURL}/batch`, { recursos });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar recursos em lote:', error);
      throw error;
    }
  }
}

export default new RecursoCronogramaService();
