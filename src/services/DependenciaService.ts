/**
 * Service para gerenciamento de Dependências entre Tarefas
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 */

import axios from 'axios';
import API_URL from '@/config';
import type { Dependencia, CreateDependencia } from '@/interfaces/CronogramaInterfaces';

class DependenciaService {
  private baseURL = `${API_URL}/api/dependencias-cronograma`;

  /**
   * Criar nova dependência entre tarefas
   * Valida se não há ciclo antes de criar
   */
  async create(data: CreateDependencia): Promise<Dependencia> {
    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar dependência:', error);
      throw error;
    }
  }

  /**
   * Buscar todas as dependências de uma tarefa específica
   * Retorna tanto dependências anteriores quanto posteriores
   */
  async getByTarefaId(tarefaId: string): Promise<{
    dependenciasAnteriores: Dependencia[];
    dependenciasPosteriores: Dependencia[];
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/tarefa/${tarefaId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar dependências da tarefa ${tarefaId}:`, error);
      throw error;
    }
  }

  /**
   * Buscar todas as dependências de um cronograma
   */
  async getByCronogramaId(cronogramaId: string): Promise<Dependencia[]> {
    try {
      const response = await axios.get(`${this.baseURL}/cronograma/${cronogramaId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar dependências do cronograma ${cronogramaId}:`, error);
      throw error;
    }
  }

  /**
   * Deletar dependência
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar dependência ${id}:`, error);
      throw error;
    }
  }

  /**
   * Validar se criar uma dependência causaria ciclo
   * Retorna true se for criar ciclo (inválido), false se for seguro
   */
  async validarCircular(
    tarefaAnteriorId: string,
    tarefaPosteriorId: string
  ): Promise<{ circular: boolean; caminho?: string[] }> {
    try {
      const response = await axios.post(`${this.baseURL}/validar-circular`, {
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
   * Atualizar tipo ou folga de uma dependência existente
   */
  async update(
    id: string,
    data: {
      tipo?: 'fim_inicio' | 'inicio_inicio' | 'fim_fim' | 'inicio_fim';
      folga?: number;
    }
  ): Promise<Dependencia> {
    try {
      const response = await axios.patch(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar dependência ${id}:`, error);
      throw error;
    }
  }

  /**
   * Criar múltiplas dependências de uma vez
   * Útil para importação de atividades ou criação em lote
   */
  async createBatch(dependencias: CreateDependencia[]): Promise<Dependencia[]> {
    try {
      const response = await axios.post(`${this.baseURL}/batch`, { dependencias });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar dependências em lote:', error);
      throw error;
    }
  }

  /**
   * Deletar todas as dependências de uma tarefa
   * Útil quando deletar uma tarefa
   */
  async deleteByTarefaId(tarefaId: string): Promise<{ deletadas: number }> {
    try {
      const response = await axios.delete(`${this.baseURL}/tarefa/${tarefaId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar dependências da tarefa ${tarefaId}:`, error);
      throw error;
    }
  }
}

export default new DependenciaService();
