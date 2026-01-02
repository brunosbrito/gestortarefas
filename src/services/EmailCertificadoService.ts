import API_URL from '@/config';
import axios from 'axios';

export interface TemplateEmail {
  id: string;
  nome: string;
  assunto: string;
  corpo: string;
  variaveis: string[]; // Ex: {{obraNome}}, {{clienteNome}}, {{quantidadeCertificados}}
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnvioEmailCertificado {
  certificadosIds: string[];
  destinatarios: string[];
  assunto: string;
  mensagem: string;
  templateId?: string;
  cc?: string[];
  cco?: string[];
  anexarRelatorioAdicional?: boolean;
}

export interface HistoricoEnvio {
  id: string;
  certificadosIds: string[];
  destinatarios: string[];
  assunto: string;
  dataEnvio: string;
  enviadoPor: string;
  status: 'enviado' | 'falhou' | 'pendente';
  motivoFalha?: string;
  quantidadeAnexos: number;
  tamanhoTotal: number; // em bytes
}

class EmailCertificadoService {
  private baseURL = `${API_URL}/api/qualidade/email-certificados`;

  // ============================================
  // ENVIO DE EMAILS
  // ============================================

  /**
   * Enviar certificados por email
   */
  async enviar(dados: EnvioEmailCertificado): Promise<{
    sucesso: boolean;
    mensagemId?: string;
    erro?: string;
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/enviar`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  /**
   * Enviar email de teste (preview)
   */
  async enviarTeste(dados: {
    templateId?: string;
    emailDestino: string;
    certificadosIds: string[];
  }): Promise<{ sucesso: boolean }> {
    try {
      const response = await axios.post(`${this.baseURL}/enviar-teste`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar email de teste:', error);
      throw error;
    }
  }

  /**
   * Obter preview do email antes de enviar
   */
  async getPreview(dados: {
    templateId?: string;
    certificadosIds: string[];
    mensagemCustom?: string;
  }): Promise<{
    assunto: string;
    corpoHtml: string;
    anexos: { nome: string; tamanho: number }[];
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/preview`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      throw error;
    }
  }

  // ============================================
  // TEMPLATES DE EMAIL
  // ============================================

  /**
   * Listar todos os templates
   */
  async getAllTemplates(): Promise<TemplateEmail[]> {
    try {
      const response = await axios.get(`${this.baseURL}/templates`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      return [];
    }
  }

  /**
   * Buscar template por ID
   */
  async getTemplateById(id: string): Promise<TemplateEmail> {
    try {
      const response = await axios.get(`${this.baseURL}/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      throw error;
    }
  }

  /**
   * Criar novo template
   */
  async createTemplate(template: Partial<TemplateEmail>): Promise<TemplateEmail> {
    try {
      const response = await axios.post(`${this.baseURL}/templates`, template);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  }

  /**
   * Atualizar template
   */
  async updateTemplate(id: string, template: Partial<TemplateEmail>): Promise<TemplateEmail> {
    try {
      const response = await axios.put(`${this.baseURL}/templates/${id}`, template);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      throw error;
    }
  }

  /**
   * Deletar template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/templates/${id}`);
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      throw error;
    }
  }

  /**
   * Ativar/Desativar template
   */
  async toggleTemplate(id: string, ativo: boolean): Promise<TemplateEmail> {
    try {
      const response = await axios.patch(`${this.baseURL}/templates/${id}/toggle`, { ativo });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do template:', error);
      throw error;
    }
  }

  // ============================================
  // HISTÓRICO DE ENVIOS
  // ============================================

  /**
   * Obter histórico de envios
   */
  async getHistorico(params?: {
    limit?: number;
    offset?: number;
    dataInicio?: string;
    dataFim?: string;
    status?: string;
  }): Promise<HistoricoEnvio[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.dataInicio) queryParams.append('dataInicio', params.dataInicio);
      if (params?.dataFim) queryParams.append('dataFim', params.dataFim);
      if (params?.status) queryParams.append('status', params.status);

      const url = queryParams.toString()
        ? `${this.baseURL}/historico?${queryParams.toString()}`
        : `${this.baseURL}/historico`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }

  /**
   * Obter histórico de um certificado específico
   */
  async getHistoricoByCertificado(certificadoId: string): Promise<HistoricoEnvio[]> {
    try {
      const response = await axios.get(`${this.baseURL}/historico/certificado/${certificadoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico do certificado:', error);
      return [];
    }
  }

  /**
   * Reenviar email (mesmos destinatários e conteúdo)
   */
  async reenviar(historicoId: string): Promise<{
    sucesso: boolean;
    mensagemId?: string;
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/reenviar/${historicoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      throw error;
    }
  }

  // ============================================
  // VALIDAÇÕES E UTILIDADES
  // ============================================

  /**
   * Validar emails
   */
  async validarEmails(emails: string[]): Promise<{
    validos: string[];
    invalidos: string[];
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/validar-emails`, { emails });
      return response.data;
    } catch (error) {
      console.error('Erro ao validar emails:', error);
      return {
        validos: [],
        invalidos: emails,
      };
    }
  }

  /**
   * Obter estatísticas de envios
   */
  async getEstatisticas(periodo?: {
    inicio: string;
    fim: string;
  }): Promise<{
    totalEnviados: number;
    totalFalhados: number;
    totalCertificados: number;
    destinatariosUnicos: number;
    taxaSucesso: number;
    mediaAnexosPorEmail: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (periodo) {
        params.append('inicio', periodo.inicio);
        params.append('fim', periodo.fim);
      }

      const url = params.toString()
        ? `${this.baseURL}/estatisticas?${params.toString()}`
        : `${this.baseURL}/estatisticas`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalEnviados: 0,
        totalFalhados: 0,
        totalCertificados: 0,
        destinatariosUnicos: 0,
        taxaSucesso: 0,
        mediaAnexosPorEmail: 0,
      };
    }
  }

  // ============================================
  // TEMPLATES PADRÃO
  // ============================================

  /**
   * Obter template padrão para envio de certificados
   */
  getTemplatePadrao(): TemplateEmail {
    return {
      id: 'padrao',
      nome: 'Template Padrão',
      assunto: 'Certificados de Qualidade - {{obraNome}}',
      corpo: `
Prezado(a) {{clienteNome}},

Segue em anexo os certificados de qualidade referentes à obra {{obraNome}}.

Quantidade de certificados: {{quantidadeCertificados}}

Período: {{periodoInicio}} a {{periodoFim}}

Caso tenha alguma dúvida, estamos à disposição.

Atenciosamente,
Equipe de Qualidade
GMX Industrial
      `.trim(),
      variaveis: [
        '{{obraNome}}',
        '{{clienteNome}}',
        '{{quantidadeCertificados}}',
        '{{periodoInicio}}',
        '{{periodoFim}}',
      ],
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export default new EmailCertificadoService();
