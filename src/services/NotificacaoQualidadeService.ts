import API_URL from '@/config';
import axios from 'axios';

export interface NotificacaoQualidade {
  id: string;
  tipo: 'calibracao' | 'rnc' | 'certificado' | 'acao_corretiva' | 'inspecao';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  titulo: string;
  descricao: string;
  referenciaId: string; // ID do item relacionado
  referenciaUrl?: string; // URL para navegar ao item
  dataGeracao: string;
  lida: boolean;
  usuarioId?: string;
  metadata?: {
    diasVencimento?: number;
    nomeEquipamento?: string;
    numeroRNC?: string;
    numeroCertificado?: string;
    obraNome?: string;
  };
}

export interface AlertaResumo {
  total: number;
  naoLidas: number;
  urgentes: number;
  porTipo: {
    calibracao: number;
    rnc: number;
    certificado: number;
    acao_corretiva: number;
    inspecao: number;
  };
}

class NotificacaoQualidadeService {
  private baseURL = `${API_URL}/api/qualidade/notificacoes`;

  // ============================================
  // NOTIFICAÇÕES
  // ============================================

  /**
   * Buscar todas as notificações do usuário
   */
  async getAll(params?: {
    lida?: boolean;
    tipo?: string;
    prioridade?: string;
    limit?: number;
  }): Promise<NotificacaoQualidade[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.lida !== undefined) {
        queryParams.append('lida', params.lida.toString());
      }
      if (params?.tipo) {
        queryParams.append('tipo', params.tipo);
      }
      if (params?.prioridade) {
        queryParams.append('prioridade', params.prioridade);
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = queryParams.toString()
        ? `${this.baseURL}?${queryParams.toString()}`
        : this.baseURL;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }

  /**
   * Marcar notificação como lida
   */
  async marcarComoLida(id: string): Promise<void> {
    try {
      await axios.patch(`${this.baseURL}/${id}/lida`);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async marcarTodasComoLidas(): Promise<void> {
    try {
      await axios.patch(`${this.baseURL}/marcar-todas-lidas`);
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      throw error;
    }
  }

  /**
   * Deletar notificação
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      throw error;
    }
  }

  /**
   * Obter resumo de alertas
   */
  async getResumo(): Promise<AlertaResumo> {
    try {
      const response = await axios.get(`${this.baseURL}/resumo`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar resumo de alertas:', error);
      return {
        total: 0,
        naoLidas: 0,
        urgentes: 0,
        porTipo: {
          calibracao: 0,
          rnc: 0,
          certificado: 0,
          acao_corretiva: 0,
          inspecao: 0,
        },
      };
    }
  }

  // ============================================
  // ALERTAS AUTOMÁTICOS (BACKEND GERA)
  // ============================================

  /**
   * Força verificação de alertas (normalmente executado por CRON no backend)
   */
  async verificarAlertas(): Promise<{
    gerados: number;
    tipos: string[];
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/verificar-alertas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
      throw error;
    }
  }

  /**
   * Buscar calibrações próximas do vencimento (30 dias)
   */
  async getCalibracoesVencendo(): Promise<{
    equipamentoId: string;
    equipamentoNome: string;
    diasRestantes: number;
    proximaCalibracao: string;
  }[]> {
    try {
      const response = await axios.get(`${this.baseURL}/calibracoes-vencendo`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar calibrações vencendo:', error);
      return [];
    }
  }

  /**
   * Buscar RNCs atrasadas
   */
  async getRNCsAtrasadas(): Promise<{
    rncId: string;
    rncCodigo: number;
    descricao: string;
    diasAtraso: number;
    responsavel?: string;
  }[]> {
    try {
      const response = await axios.get(`${this.baseURL}/rncs-atrasadas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar RNCs atrasadas:', error);
      return [];
    }
  }

  /**
   * Buscar certificados pendentes
   */
  async getCertificadosPendentes(): Promise<{
    certificadoId: string;
    tipoCertificado: string;
    obraNome: string;
    diasPendente: number;
  }[]> {
    try {
      const response = await axios.get(`${this.baseURL}/certificados-pendentes`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar certificados pendentes:', error);
      return [];
    }
  }

  /**
   * Buscar ações corretivas atrasadas
   */
  async getAcoesAtrasadas(): Promise<{
    acaoId: string;
    oQue: string;
    quem: string;
    quando: string;
    diasAtraso: number;
  }[]> {
    try {
      const response = await axios.get(`${this.baseURL}/acoes-atrasadas`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ações atrasadas:', error);
      return [];
    }
  }

  // ============================================
  // CONFIGURAÇÕES DE NOTIFICAÇÕES
  // ============================================

  /**
   * Obter configurações de notificações do usuário
   */
  async getConfiguracoes(): Promise<{
    emailAtivo: boolean;
    notificacaoSistema: boolean;
    diasAntecedenciaCalibracao: number;
    notificarRNCAtrasada: boolean;
    notificarCertificadoPendente: boolean;
    notificarAcaoAtrasada: boolean;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/configuracoes`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return {
        emailAtivo: true,
        notificacaoSistema: true,
        diasAntecedenciaCalibracao: 30,
        notificarRNCAtrasada: true,
        notificarCertificadoPendente: true,
        notificarAcaoAtrasada: true,
      };
    }
  }

  /**
   * Atualizar configurações de notificações
   */
  async updateConfiguracoes(config: {
    emailAtivo?: boolean;
    notificacaoSistema?: boolean;
    diasAntecedenciaCalibracao?: number;
    notificarRNCAtrasada?: boolean;
    notificarCertificadoPendente?: boolean;
    notificarAcaoAtrasada?: boolean;
  }): Promise<void> {
    try {
      await axios.put(`${this.baseURL}/configuracoes`, config);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  }
}

export default new NotificacaoQualidadeService();
