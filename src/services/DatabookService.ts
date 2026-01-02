import API_URL from '@/config';
import axios from 'axios';
import {
  Databook,
  SecaoDatabook,
  DocumentoDatabook,
  HistoricoDatabook
} from '@/interfaces/QualidadeInterfaces';

class DatabookService {
  private baseURL = `${API_URL}/api/databooks`;

  // ============================================
  // CRUD BÁSICO
  // ============================================

  async getAll(): Promise<Databook[]> {
    try {
      const response = await axios.get(this.baseURL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar databooks:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Databook> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar databook:', error);
      throw error;
    }
  }

  async getByProject(projectId: string): Promise<Databook[]> {
    try {
      const response = await axios.get(`${this.baseURL}/projeto/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar databooks do projeto:', error);
      throw error;
    }
  }

  async create(data: Partial<Databook>): Promise<Databook> {
    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar databook:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Databook>): Promise<Databook> {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar databook:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Erro ao deletar databook:', error);
      throw error;
    }
  }

  // ============================================
  // GERAÇÃO AUTOMÁTICA
  // ============================================

  /**
   * Gera um databook automaticamente coletando todos os documentos de qualidade da obra
   * @param projectId ID da obra
   * @param periodo Período opcional para filtrar documentos
   * @returns Databook gerado com estrutura completa
   */
  async gerarAutomatico(
    projectId: string,
    periodo?: { inicio: string; fim: string }
  ): Promise<Databook> {
    try {
      const response = await axios.post(`${this.baseURL}/gerar-automatico`, {
        projectId,
        periodo,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar databook automático:', error);
      throw error;
    }
  }

  // ============================================
  // GESTÃO DE SEÇÕES E DOCUMENTOS
  // ============================================

  /**
   * Adiciona uma nova seção ao databook
   */
  async addSecao(databookId: string, secao: Partial<SecaoDatabook>): Promise<Databook> {
    try {
      const response = await axios.post(`${this.baseURL}/${databookId}/secoes`, secao);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar seção:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma seção existente
   */
  async updateSecao(
    databookId: string,
    secaoId: string,
    secao: Partial<SecaoDatabook>
  ): Promise<Databook> {
    try {
      const response = await axios.put(
        `${this.baseURL}/${databookId}/secoes/${secaoId}`,
        secao
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar seção:', error);
      throw error;
    }
  }

  /**
   * Remove uma seção
   */
  async deleteSecao(databookId: string, secaoId: string): Promise<Databook> {
    try {
      const response = await axios.delete(`${this.baseURL}/${databookId}/secoes/${secaoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar seção:', error);
      throw error;
    }
  }

  /**
   * Reordena seções (drag-and-drop)
   */
  async reorderSecoes(databookId: string, secoesOrdenadas: string[]): Promise<Databook> {
    try {
      const response = await axios.put(`${this.baseURL}/${databookId}/secoes/reorder`, {
        ordem: secoesOrdenadas,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao reordenar seções:', error);
      throw error;
    }
  }

  /**
   * Adiciona documento a uma seção
   */
  async addDocumento(
    databookId: string,
    secaoId: string,
    documento: Partial<DocumentoDatabook>
  ): Promise<Databook> {
    try {
      const response = await axios.post(
        `${this.baseURL}/${databookId}/secoes/${secaoId}/documentos`,
        documento
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar documento:', error);
      throw error;
    }
  }

  /**
   * Upload de documento externo
   */
  async uploadDocumentoExterno(
    databookId: string,
    secaoId: string,
    formData: FormData
  ): Promise<Databook> {
    try {
      const response = await axios.post(
        `${this.baseURL}/${databookId}/secoes/${secaoId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload de documento:', error);
      throw error;
    }
  }

  /**
   * Remove documento de uma seção
   */
  async deleteDocumento(
    databookId: string,
    secaoId: string,
    documentoId: string
  ): Promise<Databook> {
    try {
      const response = await axios.delete(
        `${this.baseURL}/${databookId}/secoes/${secaoId}/documentos/${documentoId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  }

  /**
   * Reordena documentos dentro de uma seção
   */
  async reorderDocumentos(
    databookId: string,
    secaoId: string,
    documentosOrdenados: string[]
  ): Promise<Databook> {
    try {
      const response = await axios.put(
        `${this.baseURL}/${databookId}/secoes/${secaoId}/documentos/reorder`,
        {
          ordem: documentosOrdenados,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao reordenar documentos:', error);
      throw error;
    }
  }

  /**
   * Marcar/desmarcar documento para inclusão
   */
  async toggleDocumento(
    databookId: string,
    secaoId: string,
    documentoId: string,
    incluir: boolean
  ): Promise<Databook> {
    try {
      const response = await axios.patch(
        `${this.baseURL}/${databookId}/secoes/${secaoId}/documentos/${documentoId}`,
        {
          incluir,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar inclusão do documento:', error);
      throw error;
    }
  }

  // ============================================
  // VERSIONAMENTO
  // ============================================

  /**
   * Incrementa a revisão do databook
   */
  async incrementarRevisao(databookId: string, descricao?: string): Promise<Databook> {
    try {
      const response = await axios.post(`${this.baseURL}/${databookId}/incrementar-revisao`, {
        descricao,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao incrementar revisão:', error);
      throw error;
    }
  }

  /**
   * Marca como revisão final
   */
  async marcarComoFinal(databookId: string): Promise<Databook> {
    try {
      const response = await axios.post(`${this.baseURL}/${databookId}/marcar-final`);
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar como final:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de revisões
   */
  async getHistorico(databookId: string): Promise<HistoricoDatabook[]> {
    try {
      const response = await axios.get(`${this.baseURL}/${databookId}/historico`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }

  /**
   * Adicionar entrada ao histórico
   */
  async addHistorico(
    databookId: string,
    entrada: Partial<HistoricoDatabook>
  ): Promise<Databook> {
    try {
      const response = await axios.post(`${this.baseURL}/${databookId}/historico`, entrada);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
      throw error;
    }
  }

  // ============================================
  // EXPORTAÇÃO PDF
  // ============================================

  /**
   * Gera PDF profissional do databook
   * @param databookId ID do databook
   * @param opcoes Opções de exportação (incluir assinatura, carimbo, etc.)
   * @returns URL do PDF gerado
   */
  async gerarPDF(
    databookId: string,
    opcoes?: {
      incluirAssinatura?: boolean;
      certificadoA1A3?: string;
      carimboRevisao?: boolean;
    }
  ): Promise<{ pdfUrl: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/${databookId}/gerar-pdf`, opcoes);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  /**
   * Download direto do PDF
   */
  async downloadPDF(databookId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseURL}/${databookId}/download-pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      throw error;
    }
  }

  // ============================================
  // STATUS E WORKFLOW
  // ============================================

  /**
   * Alterar status do databook
   */
  async alterarStatus(
    databookId: string,
    status: 'rascunho' | 'em_revisao' | 'aprovado' | 'enviado'
  ): Promise<Databook> {
    try {
      const response = await axios.patch(`${this.baseURL}/${databookId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      throw error;
    }
  }

  /**
   * Enviar databook por email
   */
  async enviarPorEmail(
    databookId: string,
    dados: {
      destinatarios: string[];
      assunto: string;
      mensagem: string;
    }
  ): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/${databookId}/enviar-email`, dados);
    } catch (error) {
      console.error('Erro ao enviar databook por email:', error);
      throw error;
    }
  }

  // ============================================
  // PREVIEW
  // ============================================

  /**
   * Gera preview HTML do databook antes de exportar
   */
  async gerarPreview(databookId: string): Promise<{ htmlPreview: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/${databookId}/preview`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      throw error;
    }
  }
}

export default new DatabookService();
