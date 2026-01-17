import axios from 'axios';
import API_URL from '@/config';
import { Certificado, EnvioCertificado } from '@/interfaces/QualidadeInterfaces';

// Mock data storage
const mockCertificados: Certificado[] = [];
const mockEnvios: EnvioCertificado[] = [];
let nextId = 1;
let nextEnvioId = 1;

class CertificadoService {
  private baseURL = `${API_URL}/api/certificados`;
  // TODO: Alterar para false quando backend estiver pronto
  private useMock = true;

  // Criar novo certificado
  async create(data: Partial<Certificado>): Promise<Certificado> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const novoCertificado: Certificado = {
        id: String(nextId++),
        ...data,
        status: data.status || 'pendente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Certificado;

      mockCertificados.push(novoCertificado);
      console.log('✅ Mock: Certificado criado com sucesso', novoCertificado);
      return novoCertificado;
    }

    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  // Listar todos os certificados
  async getAll(filtros?: {
    projectId?: string;
    status?: string;
    tipo?: string;
  }): Promise<Certificado[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let certificados = [...mockCertificados];

      if (filtros) {
        if (filtros.projectId) {
          certificados = certificados.filter(c => c.projectId === filtros.projectId);
        }
        if (filtros.status) {
          certificados = certificados.filter(c => c.status === filtros.status);
        }
        if (filtros.tipo) {
          certificados = certificados.filter(c => c.tipo === filtros.tipo);
        }
      }

      console.log('✅ Mock: Retornando certificados', certificados);
      return certificados;
    }

    const response = await axios.get(this.baseURL, { params: filtros });
    return response.data;
  }

  // Buscar certificado por ID
  async getById(id: string): Promise<Certificado> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const certificado = mockCertificados.find(c => c.id === id);
      if (!certificado) throw new Error('Certificado não encontrado');
      console.log('✅ Mock: Retornando certificado por ID', certificado);
      return certificado;
    }

    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  // Buscar certificados por projeto
  async getByProjectId(projectId: string): Promise<Certificado[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const certificados = mockCertificados.filter(c => c.projectId === projectId);
      console.log('✅ Mock: Retornando certificados por projeto', certificados);
      return certificados;
    }

    const response = await axios.get(`${this.baseURL}/projeto/${projectId}`);
    return response.data;
  }

  // Atualizar certificado
  async update(id: string, data: Partial<Certificado>): Promise<Certificado> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockCertificados.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Certificado não encontrado');

      mockCertificados[index] = {
        ...mockCertificados[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as Certificado;

      console.log('✅ Mock: Certificado atualizado com sucesso', mockCertificados[index]);
      return mockCertificados[index];
    }

    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  // Deletar certificado
  async delete(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockCertificados.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCertificados.splice(index, 1);
        console.log('✅ Mock: Certificado deletado com sucesso');
      }
      return;
    }

    await axios.delete(`${this.baseURL}/${id}`);
  }

  // Upload de arquivo de certificado
  async uploadFile(formData: FormData): Promise<{
    arquivoUrl: string;
    nomeArquivo: string;
    tipoArquivo: string;
  }> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUpload = {
        arquivoUrl: `/mock/certificados/cert_${Date.now()}.pdf`,
        nomeArquivo: 'certificado_mock.pdf',
        tipoArquivo: 'application/pdf',
      };

      console.log('✅ Mock: Arquivo uploaded (simulado)', mockUpload);
      return mockUpload;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockCertificados.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Certificado não encontrado');

      mockCertificados[index] = {
        ...mockCertificados[index],
        status,
        motivoReprovacao,
        updatedAt: new Date().toISOString(),
      } as Certificado;

      console.log('✅ Mock: Status do certificado atualizado', mockCertificados[index]);
      return mockCertificados[index];
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const novoEnvio: EnvioCertificado = {
        id: String(nextEnvioId++),
        certificadoIds,
        destinatarios: emailData.destinatarios,
        assunto: emailData.assunto,
        mensagem: emailData.mensagem,
        dataEnvio: new Date().toISOString(),
        status: 'enviado',
        createdAt: new Date().toISOString(),
      } as EnvioCertificado;

      mockEnvios.push(novoEnvio);

      // Atualizar status dos certificados para "enviado"
      certificadoIds.forEach(certId => {
        const cert = mockCertificados.find(c => c.id === certId);
        if (cert && cert.status !== 'enviado') {
          cert.status = 'enviado';
          cert.updatedAt = new Date().toISOString();
        }
      });

      console.log('✅ Mock: Email enviado com sucesso', novoEnvio);
      return novoEnvio;
    }

    const response = await axios.post(`${this.baseURL}/enviar-email`, {
      certificadoIds,
      ...emailData,
    });
    return response.data;
  }

  // Histórico de envios de um certificado
  async getEnvios(certificadoId: string): Promise<EnvioCertificado[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const envios = mockEnvios.filter(e => e.certificadoIds.includes(certificadoId));
      console.log('✅ Mock: Retornando envios do certificado', envios);
      return envios;
    }

    const response = await axios.get(`${this.baseURL}/${certificadoId}/envios`);
    return response.data;
  }

  // Certificados pendentes (não enviados)
  async getPendentes(projectId?: string): Promise<Certificado[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let certificados = mockCertificados.filter(c => c.status === 'pendente');

      if (projectId) {
        certificados = certificados.filter(c => c.projectId === projectId);
      }

      console.log('✅ Mock: Retornando certificados pendentes', certificados);
      return certificados;
    }

    const params = projectId ? { projectId, status: 'pendente' } : { status: 'pendente' };
    const response = await axios.get(`${this.baseURL}/pendentes`, { params });
    return response.data;
  }

  // Certificados com validade próxima do vencimento
  async getProximosVencimento(dias: number = 30): Promise<Certificado[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      const hoje = new Date();
      const dataLimite = new Date(hoje.getTime() + dias * 24 * 60 * 60 * 1000);

      const certificados = mockCertificados.filter(c => {
        if (!c.validade) return false;

        const dataValidade = new Date(c.validade);
        return dataValidade <= dataLimite && dataValidade >= hoje;
      });

      console.log(`✅ Mock: Retornando certificados vencendo em ${dias} dias`, certificados);
      return certificados;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));

      let certificados = [...mockCertificados];

      if (projectId) {
        certificados = certificados.filter(c => c.projectId === projectId);
      }

      const hoje = new Date();
      const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

      const stats = {
        total: certificados.length,
        pendentes: certificados.filter(c => c.status === 'pendente').length,
        recebidos: certificados.filter(c => c.status === 'recebido').length,
        emAnalise: certificados.filter(c => c.status === 'em_analise').length,
        aprovados: certificados.filter(c => c.status === 'aprovado').length,
        reprovados: certificados.filter(c => c.status === 'reprovado').length,
        enviados: certificados.filter(c => c.status === 'enviado').length,
        proximosVencimento: certificados.filter(c => {
          if (!c.validade) return false;
          const dataValidade = new Date(c.validade);
          return dataValidade <= em30Dias && dataValidade >= hoje;
        }).length,
      };

      console.log('✅ Mock: Retornando estatísticas de certificados', stats);
      return stats;
    }

    const params = projectId ? { projectId } : {};
    const response = await axios.get(`${this.baseURL}/stats`, { params });
    return response.data;
  }

  // Exportar certificados de um projeto (ZIP)
  async exportarProjeto(projectId: string): Promise<Blob> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockBlob = new Blob(['Mock ZIP file content'], { type: 'application/zip' });

      console.log('✅ Mock: Exportação de projeto simulada');
      return mockBlob;
    }

    const response = await axios.get(`${this.baseURL}/projeto/${projectId}/exportar`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export default new CertificadoService();
