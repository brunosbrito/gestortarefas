import axios from 'axios';
import API_URL from '@/config';
import { Certificado, EnvioCertificado } from '@/interfaces/QualidadeInterfaces';

class CertificadoService {
  private baseURL = `${API_URL}/api/certificados`;

  // Criar novo certificado
  async create(data: Partial<Certificado>): Promise<Certificado> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  // Listar todos os certificados
  async getAll(filtros?: {
    projectId?: string;
    status?: string;
    tipo?: string;
  }): Promise<Certificado[]> {
    const response = await axios.get(this.baseURL, { params: filtros });
    return response.data;
  }

  // Buscar certificado por ID
  async getById(id: string): Promise<Certificado> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Buscar certificados por projeto
  async getByProjectId(projectId: string): Promise<Certificado[]> {
    const response = await axios.get(`${this.baseURL}/projeto/${projectId}`);
    return response.data;
  }

  // Atualizar certificado
  async update(id: string, data: Partial<Certificado>): Promise<Certificado> {
    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  // Deletar certificado
  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }

  // Upload de arquivo de certificado
  async uploadFile(formData: FormData): Promise<{
    arquivoUrl: string;
    nomeArquivo: string;
    tipoArquivo: string;
  }> {
    const response = await axios.post(`${this.baseURL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Atualizar status do certificado
  async updateStatus(
    id: string,
    status: string,
    motivoReprovacao?: string
  ): Promise<Certificado> {
    const response = await axios.patch(`${this.baseURL}/${id}/status`, {
      status,
      motivoReprovacao,
    });
    return response.data;
  }

  // Enviar certificado por email
  async enviarEmail(
    certificadoIds: string[],
    emailData: {
      destinatarios: string[];
      assunto: string;
      mensagem: string;
    }
  ): Promise<EnvioCertificado> {
    const response = await axios.post(`${this.baseURL}/enviar-email`, {
      certificadoIds,
      ...emailData,
    });
    return response.data;
  }

  // Histórico de envios de um certificado
  async getEnvios(certificadoId: string): Promise<EnvioCertificado[]> {
    const response = await axios.get(`${this.baseURL}/${certificadoId}/envios`);
    return response.data;
  }

  // Certificados pendentes (não enviados)
  async getPendentes(projectId?: string): Promise<Certificado[]> {
    const params = projectId ? { projectId, status: 'pendente' } : { status: 'pendente' };
    const response = await axios.get(`${this.baseURL}/pendentes`, { params });
    return response.data;
  }

  // Certificados com validade próxima do vencimento
  async getProximosVencimento(dias: number = 30): Promise<Certificado[]> {
    const response = await axios.get(`${this.baseURL}/proximos-vencimento`, {
      params: { dias },
    });
    return response.data;
  }

  // Estatísticas de certificados
  async getStats(projectId?: string): Promise<{
    total: number;
    pendentes: number;
    recebidos: number;
    emAnalise: number;
    aprovados: number;
    reprovados: number;
    enviados: number;
    proximosVencimento: number;
  }> {
    const params = projectId ? { projectId } : {};
    const response = await axios.get(`${this.baseURL}/stats`, { params });
    return response.data;
  }

  // Exportar certificados de um projeto (ZIP)
  async exportarProjeto(projectId: string): Promise<Blob> {
    const response = await axios.get(`${this.baseURL}/projeto/${projectId}/exportar`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new CertificadoService();
