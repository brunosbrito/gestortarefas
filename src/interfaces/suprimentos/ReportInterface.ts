// Report and Template Types
export interface Report {
  id: number;
  name: string;
  contract: string;
  type: 'Analítico' | 'Conta Corrente' | 'Dashboard';
  date: string;
  size: string;
  status: 'Processando' | 'Finalizado' | 'Erro' | 'Disponível';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'analytical' | 'summary' | 'dashboard' | 'compliance';
  category: 'contract' | 'purchase' | 'financial' | 'operational';
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'currency' | 'percentage';
    required: boolean;
    defaultValue?: any;
  }>;
  filters: Array<{
    field: string;
    label: string;
    type: 'select' | 'date_range' | 'number_range' | 'text';
    options?: Array<{
      value: string;
      label: string;
    }>;
  }>;
  groupBy?: string[];
  sortBy?: string[];
  formatOptions: {
    includeCharts: boolean;
    includeImages: boolean;
    pageOrientation: 'portrait' | 'landscape';
    headerImage?: string;
    footerText?: string;
  };
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  filters: Record<string, any>;
  generatedBy: string;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  expiresAt?: string;
  downloadCount: number;
  error?: string;
}
