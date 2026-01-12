import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { Report, ReportTemplate, GeneratedReport } from '@/interfaces/suprimentos/ReportInterface';

const URL = `${API_URL}/api/suprimentos/reports`;
const USE_MOCK = true;

// ==================== Mock Data ====================

const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'contract-summary',
    name: 'Resumo de Contratos',
    description: 'Relatório consolidado de todos os contratos com status, valores e execução',
    type: 'summary',
    category: 'contract',
    fields: [
      { name: 'contractName', label: 'Nome do Contrato', type: 'text', required: true },
      { name: 'budget', label: 'Orçamento', type: 'currency', required: true },
      { name: 'spent', label: 'Gasto', type: 'currency', required: true },
      { name: 'variance', label: 'Variação', type: 'currency', required: false },
      { name: 'status', label: 'Status', type: 'text', required: true },
    ],
    filters: [
      {
        field: 'status',
        label: 'Status do Contrato',
        type: 'select',
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'active', label: 'Ativos' },
          { value: 'completed', label: 'Concluídos' },
        ],
      },
      {
        field: 'dateRange',
        label: 'Período',
        type: 'date_range',
      },
    ],
    groupBy: ['status'],
    sortBy: ['budget'],
    formatOptions: {
      includeCharts: true,
      includeImages: false,
      pageOrientation: 'portrait',
      footerText: 'Relatório gerado pelo Sistema de Gestão de Suprimentos',
    },
    isDefault: true,
    createdBy: 'Sistema',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'purchase-analysis',
    name: 'Análise de Compras',
    description: 'Relatório detalhado de requisições e pedidos de compra por período',
    type: 'analytical',
    category: 'purchase',
    fields: [
      { name: 'requestNumber', label: 'Nº Requisição', type: 'text', required: true },
      { name: 'items', label: 'Itens', type: 'number', required: true },
      { name: 'totalValue', label: 'Valor Total', type: 'currency', required: true },
      { name: 'status', label: 'Status', type: 'text', required: true },
      { name: 'supplier', label: 'Fornecedor', type: 'text', required: false },
    ],
    filters: [
      {
        field: 'urgency',
        label: 'Urgência',
        type: 'select',
        options: [
          { value: 'all', label: 'Todas' },
          { value: 'critical', label: 'Crítica' },
          { value: 'high', label: 'Alta' },
          { value: 'medium', label: 'Média' },
          { value: 'low', label: 'Baixa' },
        ],
      },
      {
        field: 'dateRange',
        label: 'Período',
        type: 'date_range',
      },
      {
        field: 'valueRange',
        label: 'Faixa de Valor',
        type: 'number_range',
      },
    ],
    groupBy: ['urgency', 'status'],
    sortBy: ['totalValue'],
    formatOptions: {
      includeCharts: true,
      includeImages: false,
      pageOrientation: 'landscape',
      footerText: 'Análise de Compras - Confidencial',
    },
    isDefault: true,
    createdBy: 'Sistema',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'supplier-performance',
    name: 'Performance de Fornecedores',
    description: 'Avaliação completa de fornecedores incluindo pontualidade, qualidade e preços',
    type: 'analytical',
    category: 'operational',
    fields: [
      { name: 'supplierName', label: 'Fornecedor', type: 'text', required: true },
      { name: 'orders', label: 'Pedidos', type: 'number', required: true },
      { name: 'totalValue', label: 'Valor Total', type: 'currency', required: true },
      { name: 'rating', label: 'Nota', type: 'number', required: true },
      { name: 'onTimeDelivery', label: 'Entrega Pontual', type: 'percentage', required: true },
    ],
    filters: [
      {
        field: 'rating',
        label: 'Nota Mínima',
        type: 'number_range',
      },
      {
        field: 'dateRange',
        label: 'Período',
        type: 'date_range',
      },
    ],
    groupBy: ['rating'],
    sortBy: ['totalValue', 'onTimeDelivery'],
    formatOptions: {
      includeCharts: true,
      includeImages: false,
      pageOrientation: 'portrait',
      footerText: 'Avaliação de Fornecedores',
    },
    isDefault: true,
    createdBy: 'Sistema',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'cost-breakdown',
    name: 'Detalhamento de Custos',
    description: 'Breakdown completo de custos por categoria e centro de custo',
    type: 'analytical',
    category: 'financial',
    fields: [
      { name: 'category', label: 'Categoria', type: 'text', required: true },
      { name: 'items', label: 'Itens', type: 'number', required: true },
      { name: 'totalCost', label: 'Custo Total', type: 'currency', required: true },
      { name: 'percentage', label: 'Percentual', type: 'percentage', required: true },
      { name: 'avgTicket', label: 'Ticket Médio', type: 'currency', required: false },
    ],
    filters: [
      {
        field: 'category',
        label: 'Categoria',
        type: 'select',
        options: [
          { value: 'all', label: 'Todas' },
          { value: 'materials', label: 'Materiais' },
          { value: 'labor', label: 'Mão de Obra' },
          { value: 'equipment', label: 'Equipamentos' },
          { value: 'services', label: 'Serviços' },
        ],
      },
      {
        field: 'dateRange',
        label: 'Período',
        type: 'date_range',
      },
    ],
    groupBy: ['category'],
    sortBy: ['totalCost'],
    formatOptions: {
      includeCharts: true,
      includeImages: false,
      pageOrientation: 'portrait',
      footerText: 'Detalhamento Financeiro',
    },
    isDefault: true,
    createdBy: 'Sistema',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'budget-compliance',
    name: 'Conformidade Orçamentária',
    description: 'Relatório de compliance mostrando aderência ao orçamento por contrato',
    type: 'compliance',
    category: 'financial',
    fields: [
      { name: 'contractName', label: 'Contrato', type: 'text', required: true },
      { name: 'budget', label: 'Orçado', type: 'currency', required: true },
      { name: 'actual', label: 'Realizado', type: 'currency', required: true },
      { name: 'variance', label: 'Variação', type: 'percentage', required: true },
      { name: 'status', label: 'Status', type: 'text', required: true },
    ],
    filters: [
      {
        field: 'complianceStatus',
        label: 'Status de Conformidade',
        type: 'select',
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'compliant', label: 'Conforme' },
          { value: 'alert', label: 'Atenção' },
          { value: 'non-compliant', label: 'Não Conforme' },
        ],
      },
      {
        field: 'dateRange',
        label: 'Período',
        type: 'date_range',
      },
    ],
    groupBy: ['status'],
    sortBy: ['variance'],
    formatOptions: {
      includeCharts: true,
      includeImages: false,
      pageOrientation: 'landscape',
      footerText: 'Relatório de Conformidade - Uso Interno',
    },
    isDefault: true,
    createdBy: 'Sistema',
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
];

let mockGeneratedReports: GeneratedReport[] = [
  {
    id: '1',
    templateId: 'contract-summary',
    name: 'Resumo_Contratos_Jun2024',
    filters: { status: 'all', dateRange: { start: '2024-06-01', end: '2024-06-30' } },
    generatedBy: 'João Silva',
    generatedAt: '2024-06-30T14:30:00',
    status: 'completed',
    fileUrl: '/downloads/reports/resumo_contratos_jun2024.pdf',
    fileSize: 524288, // 512KB
    expiresAt: '2024-07-30T14:30:00',
    downloadCount: 3,
  },
  {
    id: '2',
    templateId: 'purchase-analysis',
    name: 'Analise_Compras_Maio2024',
    filters: { urgency: 'high', dateRange: { start: '2024-05-01', end: '2024-05-31' } },
    generatedBy: 'Maria Santos',
    generatedAt: '2024-05-31T16:45:00',
    status: 'completed',
    fileUrl: '/downloads/reports/analise_compras_maio2024.xlsx',
    fileSize: 1048576, // 1MB
    expiresAt: '2024-06-30T16:45:00',
    downloadCount: 5,
  },
  {
    id: '3',
    templateId: 'supplier-performance',
    name: 'Performance_Fornecedores_Q2_2024',
    filters: { rating: { min: 4.0 }, dateRange: { start: '2024-04-01', end: '2024-06-30' } },
    generatedBy: 'Carlos Oliveira',
    generatedAt: '2024-06-28T10:15:00',
    status: 'completed',
    fileUrl: '/downloads/reports/performance_fornecedores_q2.pdf',
    fileSize: 786432, // 768KB
    expiresAt: '2024-07-28T10:15:00',
    downloadCount: 2,
  },
];

let reportIdCounter = mockGeneratedReports.length + 1;

// ==================== Service Class ====================

class ReportsService {
  // Get all report templates
  async getTemplates(): Promise<ApiResponse<ReportTemplate[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockReportTemplates,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/templates`);
    return response.data;
  }

  // Get single template by ID
  async getTemplateById(id: string): Promise<ApiResponse<ReportTemplate>> {
    if (USE_MOCK) {
      const template = mockReportTemplates.find((t) => t.id === id);
      if (!template) {
        return Promise.reject(new Error('Template não encontrado'));
      }
      return Promise.resolve({
        data: template,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/templates/${id}`);
    return response.data;
  }

  // Get all generated reports (history)
  async getAll(): Promise<ApiResponse<GeneratedReport[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockGeneratedReports,
        success: true,
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }

  // Get single generated report by ID
  async getById(id: string): Promise<ApiResponse<GeneratedReport>> {
    if (USE_MOCK) {
      const report = mockGeneratedReports.find((r) => r.id === id);
      if (!report) {
        return Promise.reject(new Error('Relatório não encontrado'));
      }
      return Promise.resolve({
        data: report,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/${id}`);
    return response.data;
  }

  // Generate a new report
  async generate(
    templateId: string,
    filters: any,
    exportFormat: 'pdf' | 'excel' | 'csv' = 'pdf'
  ): Promise<ApiResponse<GeneratedReport>> {
    if (USE_MOCK) {
      const template = mockReportTemplates.find((t) => t.id === templateId);
      if (!template) {
        return Promise.reject(new Error('Template não encontrado'));
      }

      const fileExtensions = {
        pdf: 'pdf',
        excel: 'xlsx',
        csv: 'csv',
      };

      const newReport: GeneratedReport = {
        id: String(reportIdCounter++),
        templateId,
        name: `${template.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}`,
        filters,
        generatedBy: 'Usuário Atual', // TODO: Get from auth context
        generatedAt: new Date().toISOString(),
        status: 'completed',
        fileUrl: `/downloads/reports/${template.name.toLowerCase().replace(/\s/g, '_')}.${fileExtensions[exportFormat]}`,
        fileSize: Math.floor(Math.random() * 2000000) + 500000, // 500KB - 2.5MB
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        downloadCount: 0,
      };

      mockGeneratedReports.unshift(newReport);

      return Promise.resolve({
        data: newReport,
        success: true,
        message: `Relatório gerado com sucesso em formato ${exportFormat.toUpperCase()}`,
      });
    }
    const response = await axios.post(`${URL}/generate`, { templateId, filters, exportFormat });
    return response.data;
  }

  // Download a report
  async download(id: string): Promise<ApiResponse<{ url: string }>> {
    if (USE_MOCK) {
      const report = mockGeneratedReports.find((r) => r.id === id);
      if (!report) {
        return Promise.reject(new Error('Relatório não encontrado'));
      }

      // Increment download count
      report.downloadCount++;

      return Promise.resolve({
        data: { url: report.fileUrl || '' },
        success: true,
        message: 'Download iniciado (MOCK)',
      });
    }
    const response = await axios.get(`${URL}/${id}/download`);
    return response.data;
  }

  // Delete a generated report
  async delete(id: string): Promise<ApiResponse<void>> {
    if (USE_MOCK) {
      mockGeneratedReports = mockGeneratedReports.filter((r) => r.id !== id);
      return Promise.resolve({
        data: undefined,
        success: true,
        message: 'Relatório excluído com sucesso',
      });
    }
    const response = await axios.delete(`${URL}/${id}`);
    return response.data;
  }

  // Get report statistics
  async getStats(): Promise<
    ApiResponse<{
      totalGenerated: number;
      thisMonth: number;
      totalDownloads: number;
      mostUsedTemplate: string;
      avgFileSize: number;
    }>
  > {
    if (USE_MOCK) {
      const totalDownloads = mockGeneratedReports.reduce((sum, r) => sum + r.downloadCount, 0);
      const avgFileSize =
        mockGeneratedReports.reduce((sum, r) => sum + (r.fileSize || 0), 0) /
        mockGeneratedReports.length;

      const templateUsage: Record<string, number> = {};
      mockGeneratedReports.forEach((report) => {
        templateUsage[report.templateId] = (templateUsage[report.templateId] || 0) + 1;
      });

      const mostUsedTemplateId = Object.keys(templateUsage).reduce((a, b) =>
        templateUsage[a] > templateUsage[b] ? a : b
      );

      const mostUsedTemplate =
        mockReportTemplates.find((t) => t.id === mostUsedTemplateId)?.name || 'N/A';

      const now = new Date();
      const thisMonthCount = mockGeneratedReports.filter((r) => {
        const reportDate = new Date(r.generatedAt);
        return (
          reportDate.getMonth() === now.getMonth() &&
          reportDate.getFullYear() === now.getFullYear()
        );
      }).length;

      return Promise.resolve({
        data: {
          totalGenerated: mockGeneratedReports.length,
          thisMonth: thisMonthCount,
          totalDownloads,
          mostUsedTemplate,
          avgFileSize,
        },
        success: true,
      });
    }
    const response = await axios.get(`${URL}/stats`);
    return response.data;
  }
}

export default new ReportsService();
