import API_URL from '@/config';
import axios from 'axios';
import {
  Databook,
  SecaoDatabook,
  DocumentoDatabook,
  HistoricoDatabook
} from '@/interfaces/QualidadeInterfaces';

// Mock data storage
const mockDatabooks: Databook[] = [];
const mockHistorico: Map<string, HistoricoDatabook[]> = new Map();
let nextId = 1;
let nextSecaoId = 1;
let nextDocId = 1;

class DatabookService {
  private baseURL = `${API_URL}/api/databooks`;
  // TODO: Alterar para false quando backend estiver pronto
  private useMock = true;

  // ============================================
  // CRUD BÁSICO
  // ============================================

  async getAll(): Promise<Databook[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('✅ Mock: Retornando databooks', mockDatabooks);
      return mockDatabooks;
    }

    try {
      const response = await axios.get(this.baseURL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar databooks:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Databook> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const databook = mockDatabooks.find(d => d.id === id);
      if (!databook) throw new Error('Databook não encontrado');
      console.log('✅ Mock: Retornando databook por ID', databook);
      return databook;
    }

    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar databook:', error);
      throw error;
    }
  }

  async getByProject(projectId: string): Promise<Databook[]> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const databooks = mockDatabooks.filter(d => d.projectId === projectId);
      console.log('✅ Mock: Retornando databooks do projeto', databooks);
      return databooks;
    }

    try {
      const response = await axios.get(`${this.baseURL}/projeto/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar databooks do projeto:', error);
      throw error;
    }
  }

  async create(data: Partial<Databook>): Promise<Databook> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const novoDatabook: Databook = {
        id: String(nextId++),
        ...data,
        revisao: 0,
        status: 'rascunho',
        secoes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Databook;

      mockDatabooks.push(novoDatabook);
      mockHistorico.set(novoDatabook.id, []);
      console.log('✅ Mock: Databook criado com sucesso', novoDatabook);
      return novoDatabook;
    }

    try {
      const response = await axios.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar databook:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Databook>): Promise<Databook> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockDatabooks.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Databook não encontrado');

      mockDatabooks[index] = {
        ...mockDatabooks[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as Databook;

      console.log('✅ Mock: Databook atualizado com sucesso', mockDatabooks[index]);
      return mockDatabooks[index];
    }

    try {
      const response = await axios.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar databook:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockDatabooks.findIndex(d => d.id === id);
      if (index !== -1) {
        mockDatabooks.splice(index, 1);
        mockHistorico.delete(id);
        console.log('✅ Mock: Databook deletado com sucesso');
      }
      return;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const databookAuto: Databook = {
        id: String(nextId++),
        projectId,
        titulo: 'Databook Automático',
        descricao: periodo
          ? `Gerado automaticamente para o período de ${periodo.inicio} a ${periodo.fim}`
          : 'Gerado automaticamente com todos os documentos da obra',
        revisao: 0,
        status: 'rascunho',
        secoes: [
          {
            id: String(nextSecaoId++),
            titulo: 'Certificados',
            ordem: 0,
            documentos: [],
          },
          {
            id: String(nextSecaoId++),
            titulo: 'Inspeções',
            ordem: 1,
            documentos: [],
          },
          {
            id: String(nextSecaoId++),
            titulo: 'Relatórios de Não Conformidade',
            ordem: 2,
            documentos: [],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Databook;

      mockDatabooks.push(databookAuto);
      mockHistorico.set(databookAuto.id, []);
      console.log('✅ Mock: Databook gerado automaticamente', databookAuto);
      return databookAuto;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const novaSecao: SecaoDatabook = {
        id: String(nextSecaoId++),
        ...secao,
        ordem: databook.secoes?.length || 0,
        documentos: [],
      } as SecaoDatabook;

      if (!databook.secoes) {
        databook.secoes = [];
      }
      databook.secoes.push(novaSecao);
      databook.updatedAt = new Date().toISOString();

      console.log('✅ Mock: Seção adicionada com sucesso', novaSecao);
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const secaoIndex = databook.secoes?.findIndex(s => s.id === secaoId) ?? -1;
      if (secaoIndex === -1) throw new Error('Seção não encontrada');

      if (databook.secoes) {
        databook.secoes[secaoIndex] = {
          ...databook.secoes[secaoIndex],
          ...secao,
        };
        databook.updatedAt = new Date().toISOString();
      }

      console.log('✅ Mock: Seção atualizada com sucesso', databook.secoes?.[secaoIndex]);
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      if (databook.secoes) {
        const index = databook.secoes.findIndex(s => s.id === secaoId);
        if (index !== -1) {
          databook.secoes.splice(index, 1);
          databook.updatedAt = new Date().toISOString();
          console.log('✅ Mock: Seção deletada com sucesso');
        }
      }
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      if (databook.secoes) {
        // Reordenar seções de acordo com a nova ordem
        const novaOrdem = secoesOrdenadas.map(id =>
          databook.secoes!.find(s => s.id === id)!
        ).filter(Boolean);

        // Atualizar ordem
        novaOrdem.forEach((secao, index) => {
          secao.ordem = index;
        });

        databook.secoes = novaOrdem;
        databook.updatedAt = new Date().toISOString();
      }

      console.log('✅ Mock: Seções reordenadas com sucesso');
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const secao = databook.secoes?.find(s => s.id === secaoId);
      if (!secao) throw new Error('Seção não encontrada');

      const novoDocumento: DocumentoDatabook = {
        id: String(nextDocId++),
        ...documento,
        ordem: secao.documentos?.length || 0,
        incluir: true,
      } as DocumentoDatabook;

      if (!secao.documentos) {
        secao.documentos = [];
      }
      secao.documentos.push(novoDocumento);
      databook.updatedAt = new Date().toISOString();

      console.log('✅ Mock: Documento adicionado com sucesso', novoDocumento);
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const secao = databook.secoes?.find(s => s.id === secaoId);
      if (!secao) throw new Error('Seção não encontrada');

      const documentoUpload: DocumentoDatabook = {
        id: String(nextDocId++),
        tipo: 'externo',
        titulo: 'Documento Externo Upload',
        arquivoUrl: `/mock/databooks/documento_${Date.now()}.pdf`,
        ordem: secao.documentos?.length || 0,
        incluir: true,
      } as DocumentoDatabook;

      if (!secao.documentos) {
        secao.documentos = [];
      }
      secao.documentos.push(documentoUpload);
      databook.updatedAt = new Date().toISOString();

      console.log('✅ Mock: Documento externo uploaded', documentoUpload);
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const secao = databook.secoes?.find(s => s.id === secaoId);
      if (!secao) throw new Error('Seção não encontrada');

      if (secao.documentos) {
        const index = secao.documentos.findIndex(d => d.id === documentoId);
        if (index !== -1) {
          secao.documentos.splice(index, 1);
          databook.updatedAt = new Date().toISOString();
          console.log('✅ Mock: Documento deletado com sucesso');
        }
      }
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const secao = databook.secoes?.find(s => s.id === secaoId);
      if (!secao) throw new Error('Seção não encontrada');

      if (secao.documentos) {
        const novaOrdem = documentosOrdenados.map(id =>
          secao.documentos!.find(d => d.id === id)!
        ).filter(Boolean);

        novaOrdem.forEach((doc, index) => {
          doc.ordem = index;
        });

        secao.documentos = novaOrdem;
        databook.updatedAt = new Date().toISOString();
      }

      console.log('✅ Mock: Documentos reordenados com sucesso');
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const secao = databook.secoes?.find(s => s.id === secaoId);
      if (!secao) throw new Error('Seção não encontrada');

      const documento = secao.documentos?.find(d => d.id === documentoId);
      if (!documento) throw new Error('Documento não encontrado');

      documento.incluir = incluir;
      databook.updatedAt = new Date().toISOString();

      console.log('✅ Mock: Inclusão do documento atualizada', documento);
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 700));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const revisaoAnterior = databook.revisao;
      databook.revisao += 1;
      databook.updatedAt = new Date().toISOString();

      // Adicionar ao histórico
      const historico = mockHistorico.get(databookId) || [];
      historico.push({
        id: String(Date.now()),
        databookId,
        revisao: databook.revisao,
        descricao: descricao || `Revisão ${revisaoAnterior} → ${databook.revisao}`,
        data: new Date().toISOString(),
      } as HistoricoDatabook);
      mockHistorico.set(databookId, historico);

      console.log('✅ Mock: Revisão incrementada', databook);
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      databook.status = 'aprovado';
      databook.updatedAt = new Date().toISOString();

      // Adicionar ao histórico
      const historico = mockHistorico.get(databookId) || [];
      historico.push({
        id: String(Date.now()),
        databookId,
        revisao: databook.revisao,
        descricao: 'Marcado como versão final',
        data: new Date().toISOString(),
      } as HistoricoDatabook);
      mockHistorico.set(databookId, historico);

      console.log('✅ Mock: Marcado como final', databook);
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const historico = mockHistorico.get(databookId) || [];
      console.log('✅ Mock: Retornando histórico', historico);
      return historico;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const historico = mockHistorico.get(databookId) || [];
      historico.push({
        id: String(Date.now()),
        databookId,
        ...entrada,
        data: new Date().toISOString(),
      } as HistoricoDatabook);
      mockHistorico.set(databookId, historico);

      databook.updatedAt = new Date().toISOString();
      console.log('✅ Mock: Entrada adicionada ao histórico');
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const pdfUrl = `/mock/databooks/databook_${databookId}_rev${databook.revisao}.pdf`;
      console.log('✅ Mock: PDF gerado', { pdfUrl, opcoes });
      return { pdfUrl };
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      console.log('✅ Mock: Download PDF simulado');
      return mockBlob;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      databook.status = status;
      databook.updatedAt = new Date().toISOString();

      // Adicionar ao histórico
      const historico = mockHistorico.get(databookId) || [];
      historico.push({
        id: String(Date.now()),
        databookId,
        revisao: databook.revisao,
        descricao: `Status alterado para: ${status}`,
        data: new Date().toISOString(),
      } as HistoricoDatabook);
      mockHistorico.set(databookId, historico);

      console.log('✅ Mock: Status alterado', databook);
      return databook;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      // Atualizar status para enviado
      databook.status = 'enviado';
      databook.updatedAt = new Date().toISOString();

      // Adicionar ao histórico
      const historico = mockHistorico.get(databookId) || [];
      historico.push({
        id: String(Date.now()),
        databookId,
        revisao: databook.revisao,
        descricao: `Enviado por email para: ${dados.destinatarios.join(', ')}`,
        data: new Date().toISOString(),
      } as HistoricoDatabook);
      mockHistorico.set(databookId, historico);

      console.log('✅ Mock: Databook enviado por email', dados);
      return;
    }

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
    if (this.useMock) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const databook = mockDatabooks.find(d => d.id === databookId);
      if (!databook) throw new Error('Databook não encontrado');

      const htmlPreview = `
        <html>
          <head>
            <title>${databook.titulo || 'Databook'} - Rev. ${databook.revisao}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1e40af; }
              .secao { margin: 20px 0; padding: 15px; border-left: 3px solid #1e40af; }
              .documento { margin: 10px 0; padding: 10px; background: #f3f4f6; }
            </style>
          </head>
          <body>
            <h1>${databook.titulo || 'Databook'}</h1>
            <p><strong>Revisão:</strong> ${databook.revisao}</p>
            <p><strong>Status:</strong> ${databook.status}</p>
            <p>${databook.descricao || ''}</p>
            ${databook.secoes?.map(secao => `
              <div class="secao">
                <h2>${secao.titulo}</h2>
                ${secao.documentos?.filter(d => d.incluir).map(doc => `
                  <div class="documento">
                    <strong>${doc.titulo}</strong>
                    <p>${doc.tipo || ''}</p>
                  </div>
                `).join('') || '<p>Nenhum documento incluído nesta seção.</p>'}
              </div>
            `).join('') || '<p>Nenhuma seção adicionada ainda.</p>'}
          </body>
        </html>
      `;

      console.log('✅ Mock: Preview HTML gerado');
      return { htmlPreview };
    }

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
