import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { NotaFiscal, NFStats } from '@/interfaces/suprimentos/NotaFiscalInterface';

const URL = `${API_URL}/api/suprimentos/nf`;
const USE_MOCK = true;

// Mock data
let mockNFs: NotaFiscal[] = [
  {
    id: 1,
    numero: '12345',
    serie: '1',
    chave_acesso: '35240112345678901234550010000123451234567890',
    cnpj_fornecedor: '12.345.678/0001-90',
    nome_fornecedor: 'Fornecedor ABC Ltda',
    data_emissao: '2024-03-15',
    valor_total: 50000,
    valor_produtos: 48000,
    valor_impostos: 2000,
    pasta_origem: 'NFsMarco2024',
    status_processamento: 'validado',
    contrato_id: 1,
    items: [
      {
        id: 1,
        numero_item: 1,
        descricao: 'Aço estrutural CA-50',
        quantidade: 10,
        unidade: 'TON',
        valor_unitario: 4800,
        valor_total: 48000,
        status_integracao: 'integrado',
      },
    ],
  },
  {
    id: 2,
    numero: '12346',
    serie: '1',
    cnpj_fornecedor: '98.765.432/0001-10',
    nome_fornecedor: 'Fornecedor XYZ S/A',
    data_emissao: '2024-04-20',
    valor_total: 75000,
    pasta_origem: 'NFsAbril2024',
    status_processamento: 'processado',
    items: [],
  },
  {
    id: 3,
    numero: '12347',
    serie: '2',
    chave_acesso: '35240198765432000110550020000123471234567891',
    cnpj_fornecedor: '11.222.333/0001-44',
    nome_fornecedor: 'Materiais Brasil Ltda',
    data_emissao: '2024-05-05',
    valor_total: 38500,
    valor_produtos: 37000,
    valor_impostos: 1500,
    pasta_origem: 'NFsMaio2024',
    subpasta: 'Semana1',
    status_processamento: 'validado',
    contrato_id: 2,
    items: [
      {
        id: 2,
        numero_item: 1,
        descricao: 'Cimento CP-II 50kg',
        quantidade: 500,
        unidade: 'SC',
        valor_unitario: 35,
        valor_total: 17500,
        status_integracao: 'integrado',
      },
      {
        id: 3,
        numero_item: 2,
        descricao: 'Areia média m³',
        quantidade: 150,
        unidade: 'M3',
        valor_unitario: 130,
        valor_total: 19500,
        status_integracao: 'integrado',
      },
    ],
  },
  {
    id: 4,
    numero: '12348',
    serie: '1',
    chave_acesso: '35240155555555000133550010000123481234567892',
    cnpj_fornecedor: '55.555.555/0001-33',
    nome_fornecedor: 'Transportadora Rápida S/A',
    data_emissao: '2024-05-10',
    valor_total: 12000,
    valor_produtos: 12000,
    pasta_origem: 'NFsMaio2024',
    subpasta: 'Semana2',
    status_processamento: 'processado',
    contrato_id: 1,
    items: [
      {
        id: 4,
        numero_item: 1,
        descricao: 'Frete - Transporte de materiais',
        quantidade: 1,
        unidade: 'SV',
        valor_unitario: 12000,
        valor_total: 12000,
        status_integracao: 'pendente',
      },
    ],
  },
  {
    id: 5,
    numero: '12349',
    serie: '3',
    chave_acesso: '35240177888999000122550030000123491234567893',
    cnpj_fornecedor: '77.888.999/0001-22',
    nome_fornecedor: 'Ferro e Aço Industrial',
    data_emissao: '2024-05-15',
    valor_total: 125000,
    valor_produtos: 118000,
    valor_impostos: 7000,
    pasta_origem: 'NFsMaio2024',
    subpasta: 'Semana2',
    status_processamento: 'rejeitado',
    contrato_id: 3,
    observacoes: 'Divergência de valores com pedido de compra',
    items: [
      {
        id: 5,
        numero_item: 1,
        descricao: 'Vergalhão CA-50 12mm',
        quantidade: 5000,
        unidade: 'KG',
        valor_unitario: 8.5,
        valor_total: 42500,
        status_integracao: 'rejeitado',
      },
      {
        id: 6,
        numero_item: 2,
        descricao: 'Viga metálica I 300mm',
        quantidade: 50,
        unidade: 'UN',
        valor_unitario: 1510,
        valor_total: 75500,
        status_integracao: 'rejeitado',
      },
    ],
  },
  {
    id: 6,
    numero: '12350',
    serie: '1',
    chave_acesso: '35240144444444000155550010000123501234567894',
    cnpj_fornecedor: '44.444.444/0001-55',
    nome_fornecedor: 'Elétrica Total Ltda',
    data_emissao: '2024-05-20',
    valor_total: 28750,
    valor_produtos: 27500,
    valor_impostos: 1250,
    pasta_origem: 'NFsMaio2024',
    subpasta: 'Semana3',
    status_processamento: 'processado',
    contrato_id: 2,
    items: [
      {
        id: 7,
        numero_item: 1,
        descricao: 'Cabo flexível 2.5mm²',
        quantidade: 2500,
        unidade: 'M',
        valor_unitario: 5.5,
        valor_total: 13750,
        status_integracao: 'pendente',
      },
      {
        id: 8,
        numero_item: 2,
        descricao: 'Disjuntor 32A tripolar',
        quantidade: 30,
        unidade: 'UN',
        valor_unitario: 460,
        valor_total: 13800,
        status_integracao: 'pendente',
      },
    ],
  },
  {
    id: 7,
    numero: '12351',
    serie: '2',
    chave_acesso: '35240133222111000188550020000123511234567895',
    cnpj_fornecedor: '33.222.111/0001-88',
    nome_fornecedor: 'Hidráulica Expert',
    data_emissao: '2024-05-25',
    valor_total: 19200,
    valor_produtos: 18500,
    valor_impostos: 700,
    pasta_origem: 'NFsMaio2024',
    subpasta: 'Semana1',
    status_processamento: 'validado',
    contrato_id: 1,
    items: [
      {
        id: 9,
        numero_item: 1,
        descricao: 'Tubo PVC 100mm',
        quantidade: 300,
        unidade: 'M',
        valor_unitario: 45,
        valor_total: 13500,
        status_integracao: 'integrado',
      },
      {
        id: 10,
        numero_item: 2,
        descricao: 'Conexões diversas',
        quantidade: 1,
        unidade: 'LT',
        valor_unitario: 5000,
        valor_total: 5000,
        status_integracao: 'integrado',
      },
    ],
  },
];

let mockIdCounter = 8;

class NFService {
  async getAll(contractId?: number): Promise<ApiResponse<NotaFiscal[]>> {
    if (USE_MOCK) {
      let filtered = mockNFs;
      if (contractId) {
        filtered = mockNFs.filter((nf) => nf.contrato_id === contractId);
      }
      return Promise.resolve({
        data: filtered,
        success: true,
      });
    }

    const url = contractId ? `${URL}?contrato_id=${contractId}` : URL;
    const response = await axios.get(url);
    return response.data;
  }

  async getById(id: number): Promise<ApiResponse<NotaFiscal>> {
    if (USE_MOCK) {
      const nf = mockNFs.find((n) => n.id === id);
      if (!nf) throw new Error('NF não encontrada');
      return Promise.resolve({
        data: nf,
        success: true,
      });
    }

    const response = await axios.get(`${URL}/${id}`);
    return response.data;
  }

  async getStats(): Promise<ApiResponse<NFStats>> {
    if (USE_MOCK) {
      const stats: NFStats = {
        total_nfs: mockNFs.length,
        validated: mockNFs.filter((nf) => nf.status_processamento === 'validado').length,
        pending_validation: mockNFs.filter((nf) => nf.status_processamento === 'pendente').length,
        total_value: mockNFs.reduce((sum, nf) => sum + nf.valor_total, 0),
      };

      return Promise.resolve({
        data: stats,
        success: true,
      });
    }

    const response = await axios.get(`${URL}/stats`);
    return response.data;
  }

  async validate(id: number): Promise<ApiResponse<NotaFiscal>> {
    if (USE_MOCK) {
      const nf = mockNFs.find((n) => n.id === id);
      if (!nf) throw new Error('NF não encontrada');
      nf.status_processamento = 'validado';

      return Promise.resolve({
        data: nf,
        success: true,
        message: 'NF validada com sucesso',
      });
    }

    const response = await axios.post(`${URL}/${id}/validate`);
    return response.data;
  }

  async reject(id: number, reason: string): Promise<ApiResponse<NotaFiscal>> {
    if (USE_MOCK) {
      const nf = mockNFs.find((n) => n.id === id);
      if (!nf) throw new Error('NF não encontrada');
      nf.status_processamento = 'rejeitado';
      nf.observacoes = reason;

      return Promise.resolve({
        data: nf,
        success: true,
        message: 'NF rejeitada',
      });
    }

    const response = await axios.post(`${URL}/${id}/reject`, { reason });
    return response.data;
  }

  async importXML(file: File): Promise<ApiResponse<NotaFiscal>> {
    if (USE_MOCK) {
      const newNF: NotaFiscal = {
        id: mockIdCounter++,
        numero: `NF${mockIdCounter}`,
        serie: '1',
        cnpj_fornecedor: '00.000.000/0001-00',
        nome_fornecedor: 'Fornecedor Importado',
        data_emissao: new Date().toISOString().split('T')[0],
        valor_total: 25000,
        pasta_origem: 'Importação Manual',
        status_processamento: 'processado',
        items: [],
      };
      mockNFs.push(newNF);

      return Promise.resolve({
        data: newNF,
        success: true,
        message: 'NF importada com sucesso (MOCK)',
      });
    }

    const formData = new FormData();
    formData.append('xml_file', file);

    const response = await axios.post(`${URL}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // Download XML da NF
  async downloadXML(id: number): Promise<Blob> {
    if (USE_MOCK) {
      // Gerar XML mock
      const nf = mockNFs.find((n) => n.id === id);
      if (!nf) throw new Error('NF não encontrada');

      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe>
      <ide>
        <nNF>${nf.numero}</nNF>
        <serie>${nf.serie}</serie>
        <dhEmi>${nf.data_emissao}T10:00:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>${nf.cnpj_fornecedor?.replace(/\D/g, '')}</CNPJ>
        <xNome>${nf.nome_fornecedor}</xNome>
      </emit>
      <total>
        <ICMSTot>
          <vNF>${nf.valor_total}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

      return Promise.resolve(new Blob([xmlContent], { type: 'application/xml' }));
    }

    const response = await axios.get(`${URL}/${id}/download/xml`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Download PDF da NF
  async downloadPDF(id: number): Promise<Blob> {
    if (USE_MOCK) {
      // Gerar PDF mock (texto simples como placeholder)
      const nf = mockNFs.find((n) => n.id === id);
      if (!nf) throw new Error('NF não encontrada');

      const pdfContent = `DANFE - Documento Auxiliar da Nota Fiscal Eletrônica

Nota Fiscal: ${nf.numero}
Série: ${nf.serie}
Data de Emissão: ${nf.data_emissao}
Fornecedor: ${nf.nome_fornecedor}
CNPJ: ${nf.cnpj_fornecedor}
Valor Total: R$ ${nf.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

⚠️ Este é um arquivo mock. O PDF real será gerado pelo backend.`;

      return Promise.resolve(new Blob([pdfContent], { type: 'application/pdf' }));
    }

    const response = await axios.get(`${URL}/${id}/download/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Processo de pasta via N8N webhook
  async processFolder(folderName: string): Promise<
    ApiResponse<{
      success: boolean;
      message: string;
      webhook_status: number;
      processing_log_id: number;
      n8n_url: string;
    }>
  > {
    if (USE_MOCK) {
      return Promise.resolve({
        data: {
          success: true,
          message: 'Processamento iniciado via n8n (MOCK - funcionalidade real requer backend)',
          webhook_status: 200,
          processing_log_id: Math.floor(Math.random() * 1000),
          n8n_url: 'https://n8n.example.com/webhook/mock',
        },
        success: true,
        message: '⚠️ N8N webhook é MOCK - backend necessário para funcionalidade real',
      });
    }

    const response = await axios.post(`${URL}/process-folder`, { folder_name: folderName });
    return response.data;
  }
}

export default new NFService();
