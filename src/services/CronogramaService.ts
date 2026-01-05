/**
 * Service para gerenciamento de Cronogramas
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 */

import axios from 'axios';
import API_URL from '@/config';
import type {
  Cronograma,
  CreateCronograma,
  UpdateCronograma,
  DashboardCronograma,
  FiltrosCronograma,
} from '@/interfaces/CronogramaInterfaces';

class CronogramaService {
  private baseURL = `${API_URL}/api/cronogramas`;

  /**
   * Criar novo cronograma
   */
  async create(data: CreateCronograma): Promise<Cronograma> {
    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cronograma:', error);
      throw error;
    }
  }

  /**
   * Buscar todos os cronogramas (com filtros opcionais)
   */
  async getAll(filtros?: FiltrosCronograma): Promise<Cronograma[]> {
    try {
      const params = new URLSearchParams();

      if (filtros) {
        if (filtros.projectId) params.append('projectId', filtros.projectId);
        if (filtros.status) params.append('status', filtros.status);
        if (filtros.responsavelId) params.append('responsavelId', filtros.responsavelId);
        if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
        if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      }

      const url = params.toString()
        ? `${this.baseURL}?${params.toString()}`
        : this.baseURL;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cronogramas:', error);
      throw error;
    }
  }

  /**
   * Buscar cronograma por ID (com tarefas)
   */
  async getById(id: string): Promise<Cronograma> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar cronograma ${id}:`, error);
      throw error;
    }
  }

  /**
   * Buscar cronogramas de um projeto específico
   */
  async getByProjectId(projectId: string): Promise<Cronograma[]> {
    try {
      const response = await axios.get(`${this.baseURL}/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar cronogramas do projeto ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Atualizar cronograma
   */
  async update(id: string, data: UpdateCronograma): Promise<Cronograma> {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar cronograma ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletar cronograma
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar cronograma ${id}:`, error);
      throw error;
    }
  }

  /**
   * Buscar dashboard/métricas de um cronograma
   */
  async getDashboard(cronogramaId: string): Promise<DashboardCronograma> {
    try {
      const response = await axios.get(`${this.baseURL}/${cronogramaId}/dashboard`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar dashboard do cronograma ${cronogramaId}:`, error);
      // Retorna dados vazios em caso de erro (fallback)
      return {
        cronogramaId,
        totalTarefas: 0,
        tarefasConcluidas: 0,
        tarefasEmAndamento: 0,
        tarefasAtrasadas: 0,
        tarefasBloqueadas: 0,
        progressoGeral: 0,
        diasDecorridos: 0,
        diasTotais: 0,
        colaboradoresAlocados: 0,
        tarefasCriticasProximas: [],
        alertas: [],
      };
    }
  }

  /**
   * Exportar cronograma para PDF
   */
  async exportarPDF(cronogramaId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseURL}/${cronogramaId}/export/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao exportar cronograma ${cronogramaId} para PDF:`, error);
      throw error;
    }
  }

  /**
   * Exportar cronograma para Excel
   */
  async exportarExcel(cronogramaId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseURL}/${cronogramaId}/export/excel`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao exportar cronograma ${cronogramaId} para Excel:`, error);
      throw error;
    }
  }

  /**
   * Salvar baseline (linha de base) do cronograma
   * Fase 2
   */
  async salvarBaseline(cronogramaId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/${cronogramaId}/baseline`);
    } catch (error) {
      console.error(`Erro ao salvar baseline do cronograma ${cronogramaId}:`, error);
      throw error;
    }
  }

  /**
   * Recalcular todas as datas do cronograma baseado em dependências
   * MVP - Recálculo automático
   */
  async recalcularDatas(cronogramaId: string): Promise<Cronograma> {
    try {
      const response = await axios.post(`${this.baseURL}/${cronogramaId}/recalcular`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao recalcular datas do cronograma ${cronogramaId}:`, error);
      throw error;
    }
  }
}

export default new CronogramaService();
