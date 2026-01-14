import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { Report, ReportTemplate, GeneratedReport } from '@/interfaces/suprimentos/ReportInterface';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

// ==================== Mock Data Generators ====================

function generateMockDataForTemplate(templateId: string, obraName: string = 'Shopping Center Plaza Sul'): any[] {
  switch (templateId) {
    case 'contract-summary':
      return [
        {
          obra: obraName,
          contractName: 'Fornecimento de Aço Estrutural',
          budget: 450000,
          spent: 387500,
          variance: -62500,
          status: 'Em Andamento',
        },
        {
          obra: obraName,
          contractName: 'Concreto Pré-Moldado',
          budget: 680000,
          spent: 695000,
          variance: 15000,
          status: 'Em Andamento',
        },
        {
          obra: obraName,
          contractName: 'Pintura Industrial',
          budget: 125000,
          spent: 125000,
          variance: 0,
          status: 'Concluído',
        },
        {
          obra: obraName,
          contractName: 'Instalações Elétricas',
          budget: 280000,
          spent: 195000,
          variance: -85000,
          status: 'Em Andamento',
        },
        {
          obra: obraName,
          contractName: 'Sistema de Climatização',
          budget: 340000,
          spent: 340000,
          variance: 0,
          status: 'Concluído',
        },
      ];

    case 'purchase-analysis':
      return [
        {
          obra: obraName,
          requestNumber: 'REQ-2024-001',
          items: 15,
          totalValue: 45000,
          status: 'Aprovada',
          supplier: 'Aço Brasil Ltda',
        },
        {
          obra: obraName,
          requestNumber: 'REQ-2024-002',
          items: 8,
          totalValue: 23500,
          status: 'Pendente',
          supplier: '-',
        },
        {
          obra: obraName,
          requestNumber: 'REQ-2024-003',
          items: 22,
          totalValue: 67800,
          status: 'Aprovada',
          supplier: 'Concreto Master',
        },
        {
          obra: obraName,
          requestNumber: 'REQ-2024-004',
          items: 5,
          totalValue: 12000,
          status: 'Aprovada',
          supplier: 'Tintas Premium',
        },
        {
          obra: obraName,
          requestNumber: 'REQ-2024-005',
          items: 30,
          totalValue: 89400,
          status: 'Em Cotação',
          supplier: '-',
        },
      ];

    case 'supplier-performance':
      return [
        {
          obra: obraName,
          supplierName: 'Aço Brasil Ltda',
          orders: 24,
          totalValue: 1250000,
          rating: 4.5,
          onTimeDelivery: 92,
        },
        {
          obra: obraName,
          supplierName: 'Concreto Master',
          orders: 18,
          totalValue: 890000,
          rating: 4.8,
          onTimeDelivery: 96,
        },
        {
          obra: obraName,
          supplierName: 'Tintas Premium',
          orders: 12,
          totalValue: 345000,
          rating: 4.2,
          onTimeDelivery: 88,
        },
        {
          obra: obraName,
          supplierName: 'Elétrica Pro',
          orders: 15,
          totalValue: 567000,
          rating: 4.6,
          onTimeDelivery: 94,
        },
        {
          obra: obraName,
          supplierName: 'Clima Tech',
          orders: 10,
          totalValue: 456000,
          rating: 4.4,
          onTimeDelivery: 90,
        },
      ];

    case 'cost-breakdown':
      return [
        {
          obra: obraName,
          category: 'Materiais',
          items: 145,
          totalCost: 2340000,
          percentage: 45,
          avgTicket: 16138,
        },
        {
          obra: obraName,
          category: 'Mão de Obra',
          items: 68,
          totalCost: 1560000,
          percentage: 30,
          avgTicket: 22941,
        },
        {
          obra: obraName,
          category: 'Equipamentos',
          items: 32,
          totalCost: 780000,
          percentage: 15,
          avgTicket: 24375,
        },
        {
          obra: obraName,
          category: 'Serviços',
          items: 41,
          totalCost: 410000,
          percentage: 8,
          avgTicket: 10000,
        },
        {
          obra: obraName,
          category: 'Outros',
          items: 24,
          totalCost: 110000,
          percentage: 2,
          avgTicket: 4583,
        },
      ];

    case 'budget-compliance':
      return [
        {
          obra: obraName,
          contractName: 'Fornecimento de Aço Estrutural',
          budget: 450000,
          actual: 387500,
          variance: -13.9,
          status: 'Conforme',
        },
        {
          obra: obraName,
          contractName: 'Concreto Pré-Moldado',
          budget: 680000,
          actual: 695000,
          variance: 2.2,
          status: 'Atenção',
        },
        {
          obra: obraName,
          contractName: 'Pintura Industrial',
          budget: 125000,
          actual: 125000,
          variance: 0,
          status: 'Conforme',
        },
        {
          obra: obraName,
          contractName: 'Instalações Elétricas',
          budget: 280000,
          actual: 195000,
          variance: -30.4,
          status: 'Conforme',
        },
        {
          obra: obraName,
          contractName: 'Sistema de Climatização',
          budget: 340000,
          actual: 340000,
          variance: 0,
          status: 'Conforme',
        },
      ];

    default:
      return [];
  }
}

// ==================== File Generation Functions ====================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function generatePDF(template: ReportTemplate, data: any[], reportName: string): Blob {
  const doc = new jsPDF({
    orientation: template.formatOptions?.pageOrientation === 'landscape' ? 'landscape' : 'portrait',
  });

  // Extract obra from data (all rows should have the same obra)
  const obraName = data.length > 0 && data[0].obra ? data[0].obra : 'N/A';

  // Try to add company logo (if available)
  try {
    // Note: Logo should be placed in public/logo-gmx.jpg
    // Using a small logo (40mm width x 12mm height for better proportion)
    const logoImg = new Image();
    logoImg.src = '/logo-gmx.jpg';
    doc.addImage(logoImg, 'JPEG', 14, 8, 40, 12);
  } catch (error) {
    // Fallback to text if logo is not available
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 98, 255);
    doc.text('GMX INDUSTRIAL', 14, 15);
    doc.setTextColor(0, 0, 0);
  }

  // Header separator line (below logo)
  doc.setDrawColor(200, 200, 200); // Light gray
  doc.setLineWidth(0.5);
  doc.line(14, 24, doc.internal.pageSize.width - 14, 24);

  // Report Title (positioned below logo with increased spacing)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(template.name, 14, 32);

  // Report ID (right-aligned in header)
  const reportId = `REL-${new Date().getFullYear()}-${String(reportIdCounter).padStart(3, '0')}`;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(reportId, doc.internal.pageSize.width - 14, 32, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Box around Obra + Date section (drawn FIRST, before text, with increased padding)
  doc.setDrawColor(59, 130, 246); // Blue border
  doc.setFillColor(239, 246, 255); // Light blue background
  doc.setLineWidth(0.3);
  doc.roundedRect(12, 36.5, doc.internal.pageSize.width - 24, 21, 2, 2, 'S'); // Increased height to 21mm and adjusted Y

  // Obra/Project (adjusted Y position for better padding inside box)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Obra: ${obraName}`, 16, 42); // Moved from Y=39 to Y=42 (+3mm padding from top of box)

  // Description (removed from box - will be outside)
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(template.description || '', 16, 48); // Adjusted Y

  // Generation date (adjusted Y position for better padding)
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 16, 54); // Moved from Y=52 to Y=54

  // Reset text color for table
  doc.setTextColor(0, 0, 0);

  // Prepare table data (exclude 'obra' field from table columns)
  const headers = template.fields.filter(f => f.name !== 'obra').map((field) => field.label);
  const rows = data.map((row) =>
    template.fields
      .filter(f => f.name !== 'obra')
      .map((field) => {
        const value = row[field.name];
        if (field.type === 'currency' && typeof value === 'number') {
          return formatCurrency(value);
        } else if (field.type === 'percentage' && typeof value === 'number') {
          return formatPercentage(value);
        }
        return value?.toString() || '-';
      })
  );

  // Section title for main data
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246); // Blue to match table header
  doc.text('DADOS DETALHADOS', 14, 62);
  doc.setTextColor(0, 0, 0); // Reset to black

  // Generate table (adjusted startY to give more space for logo and header)
  // Determine column alignment: first column left (text/name), rest centered (numeric data)
  const columnStyles: any = { 0: { halign: 'left' } };
  for (let i = 1; i < headers.length; i++) {
    columnStyles[i] = { halign: 'center' };
  }

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 72, // 10mm spacing between title and table for optimal visual balance
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center', // Centralize all headers
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles, // Apply column-specific alignment
  });

  // Dynamic Totalizers with AV and AH - Calculate totals for currency and numeric fields
  const currencyFields = template.fields.filter(f => f.type === 'currency' && f.name !== 'obra');
  const numericFields = template.fields.filter(f => f.type === 'number' && f.name !== 'obra');

  if (currencyFields.length > 0 || numericFields.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY;

    // Check if we need a new page
    let currentY = finalY + 10;
    if (currentY > doc.internal.pageSize.height - 60) {
      doc.addPage();
      currentY = 20;
    }

    // Section title for totals
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); // Green to match totals header
    doc.text('RESUMO FINANCEIRO', 14, currentY);
    currentY += 6; // Add space after title
    doc.setTextColor(0, 0, 0); // Reset to black

    // Prepare totals data with AV and AH
    const totalsData: any[] = [];

    // Calculate totals and percentages
    const allCurrencyFields = [...currencyFields];
    const currencyTotals = allCurrencyFields.map(field => ({
      field,
      total: data.reduce((sum, row) => sum + (row[field.name] || 0), 0),
    }));

    // Calculate grand total for AV (Análise Vertical)
    const grandTotal = currencyTotals.reduce((sum, item) => sum + item.total, 0);

    // For AH (Análise Horizontal), we need to identify pairs like budget/actual, planned/real
    // Common patterns: "budget" vs "spent", "planned" vs "actual", "orçamento" vs "gasto"
    const budgetField = currencyFields.find(f =>
      f.name.toLowerCase().includes('budget') ||
      f.name.toLowerCase().includes('orcamento') ||
      f.name.toLowerCase().includes('orçado') ||
      f.label.toLowerCase().includes('orçamento') ||
      f.label.toLowerCase().includes('orçado')
    );
    const actualField = currencyFields.find(f =>
      f.name.toLowerCase().includes('spent') ||
      f.name.toLowerCase().includes('gasto') ||
      f.name.toLowerCase().includes('actual') ||
      f.name.toLowerCase().includes('realizado') ||
      f.label.toLowerCase().includes('gasto') ||
      f.label.toLowerCase().includes('realizado')
    );

    // Build totals table data
    currencyTotals.forEach(({ field, total }) => {
      const av = grandTotal > 0 ? (total / grandTotal) * 100 : 0;

      // Calculate AH for actual vs budget
      let ah = null;
      if (actualField && budgetField) {
        if (field.name === actualField.name) {
          const budgetTotal = currencyTotals.find(ct => ct.field.name === budgetField.name)?.total || 0;
          if (budgetTotal > 0) {
            ah = ((total - budgetTotal) / budgetTotal) * 100;
          }
        }
      }

      totalsData.push([
        field.label,
        formatCurrency(total),
        `${av.toFixed(1)}%`,
        ah !== null ? `${ah > 0 ? '+' : ''}${ah.toFixed(1)}%` : '-',
      ]);
    });

    // Add numeric fields
    numericFields.forEach(field => {
      const total = data.reduce((sum, row) => sum + (row[field.name] || 0), 0);
      totalsData.push([
        field.label,
        total.toString(),
        '-', // AV doesn't apply to non-currency
        '-', // AH needs contextual pairs
      ]);
    });

    // Generate totals table
    autoTable(doc, {
      head: [['Descrição', 'Valor Total', 'AV (%)', 'AH (%)']],
      body: totalsData,
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [34, 197, 94], // Green for totals header
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250], // Zebra stripes - same as main table
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [60, 60, 60] }, // Description column
        1: { halign: 'right', fontStyle: 'bold' }, // Value column
        2: { halign: 'center' }, // AV column
        3: { halign: 'center' }, // AH column
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer separator line (above footer text)
    doc.setDrawColor(200, 200, 200); // Light gray
    doc.setLineWidth(0.5);
    doc.line(14, doc.internal.pageSize.height - 15, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 15);

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100);
    const footerText = template.formatOptions?.footerText || 'Relatório Suprimentos';
    doc.text(footerText, 14, doc.internal.pageSize.height - 10);
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
  }

  // Increment report ID counter for next report
  reportIdCounter++;

  return doc.output('blob');
}

function generateExcel(template: ReportTemplate, data: any[], reportName: string): Blob {
  // Extract obra from data
  const obraName = data.length > 0 && data[0].obra ? data[0].obra : 'N/A';

  // Filter fields to exclude 'obra' from columns
  const fieldsToDisplay = template.fields.filter(f => f.name !== 'obra');

  // Create worksheet
  const wsData = [
    // Company name
    ['GMX INDUSTRIAL'],
    // Obra
    [`Obra: ${obraName}`],
    // Title row
    [template.name],
    // Description
    [template.description || ''],
    // Generation date
    [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
    [], // Empty row

    // Header row
    fieldsToDisplay.map((field) => field.label),

    // Data rows
    ...data.map((row) =>
      fieldsToDisplay.map((field) => {
        const value = row[field.name];
        if (field.type === 'currency' && typeof value === 'number') {
          return value;
        } else if (field.type === 'percentage' && typeof value === 'number') {
          return value / 100;
        }
        return value ?? '-';
      })
    ),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = fieldsToDisplay.map(() => ({ wch: 20 }));

  // Merge title cells (adjusted for new header structure)
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: fieldsToDisplay.length - 1 } }, // GMX INDUSTRIAL
    { s: { r: 1, c: 0 }, e: { r: 1, c: fieldsToDisplay.length - 1 } }, // Obra
    { s: { r: 2, c: 0 }, e: { r: 2, c: fieldsToDisplay.length - 1 } }, // Title
    { s: { r: 3, c: 0 }, e: { r: 3, c: fieldsToDisplay.length - 1 } }, // Description
    { s: { r: 4, c: 0 }, e: { r: 4, c: fieldsToDisplay.length - 1 } }, // Date
  ];

  // Apply currency/percentage formatting (adjusted row offset to 7 due to new header)
  fieldsToDisplay.forEach((field, colIndex) => {
    data.forEach((_, rowIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 7, c: colIndex });
      if (!ws[cellAddress]) return;

      if (field.type === 'currency') {
        ws[cellAddress].z = 'R$ #,##0.00';
      } else if (field.type === 'percentage') {
        ws[cellAddress].z = '0.0%';
      }
    });
  });

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function generateCSV(template: ReportTemplate, data: any[], reportName: string): Blob {
  // Extract obra from data
  const obraName = data.length > 0 && data[0].obra ? data[0].obra : 'N/A';

  // Filter fields to exclude 'obra' from columns
  const fieldsToDisplay = template.fields.filter(f => f.name !== 'obra');

  // CSV Header info
  const companyLine = 'GMX INDUSTRIAL';
  const obraLine = `Obra: ${obraName}`;
  const titleLine = template.name;
  const descLine = template.description || '';
  const dateLine = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
  const emptyLine = '';

  // Column headers
  const headers = fieldsToDisplay.map((field) => field.label).join(',');

  // Data rows
  const rows = data
    .map((row) =>
      fieldsToDisplay
        .map((field) => {
          const value = row[field.name];
          if (field.type === 'currency' && typeof value === 'number') {
            return formatCurrency(value);
          } else if (field.type === 'percentage' && typeof value === 'number') {
            return formatPercentage(value);
          }
          // Escape commas and quotes for CSV
          const stringValue = (value?.toString() || '-').replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(',')
    )
    .join('\n');

  const csvContent = `${companyLine}\n${obraLine}\n${titleLine}\n${descLine}\n${dateLine}\n${emptyLine}\n${headers}\n${rows}`;

  // UTF-8 BOM for proper Excel import
  const BOM = '\uFEFF';
  return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
}

function triggerDownload(blob: Blob, filename: string, extension: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

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

      const template = mockReportTemplates.find((t) => t.id === report.templateId);
      if (!template) {
        return Promise.reject(new Error('Template não encontrado'));
      }

      // Generate mock data for this report template
      const mockData = generateMockDataForTemplate(report.templateId);

      // Determine file format from fileUrl extension
      const fileExtension = report.fileUrl?.split('.').pop()?.toLowerCase() || 'pdf';
      let blob: Blob;
      let extension: string;

      // Generate file based on format
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        blob = generateExcel(template, mockData, report.name);
        extension = 'xlsx';
      } else if (fileExtension === 'csv') {
        blob = generateCSV(template, mockData, report.name);
        extension = 'csv';
      } else {
        // Default to PDF
        blob = generatePDF(template, mockData, report.name);
        extension = 'pdf';
      }

      // Trigger browser download
      triggerDownload(blob, report.name, extension);

      // Increment download count
      report.downloadCount++;

      return Promise.resolve({
        data: { url: report.fileUrl || '' },
        success: true,
        message: `Arquivo ${extension.toUpperCase()} baixado com sucesso`,
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
