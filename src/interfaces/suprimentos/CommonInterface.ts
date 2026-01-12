// Common and Shared Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Chat types
export interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  type?: 'text' | 'action' | 'analysis';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: any;
  action: string;
}

// Invoice types (simplified for backward compatibility)
export interface InvoiceItem {
  id: number;
  invoice_id: number;
  descricao: string;
  centro_custo: string;
  unidade?: string;
  quantidade?: number;
  peso?: number;
  valor_unitario?: number;
  valor_total: number;
  peso_divergente?: number;
  valor_divergente?: number;
  justificativa_divergencia?: string;
  created_at?: string;
}

export interface Invoice {
  id: number;
  contract_id?: number;
  purchase_order_id?: number;
  numero_nf: string;
  fornecedor?: string;
  valor_total: number;
  data_emissao: string;
  data_vencimento?: string;
  data_pagamento?: string;
  arquivo_original?: string;
  observacoes?: string;
  created_at?: string;
  items_count?: number;
}

export interface InvoiceUploadResponse {
  success: boolean;
  message: string;
  processed_count: number;
  failed_count: number;
  invoices: Invoice[];
  errors: string[];
}

export interface InvoicesSummary {
  total_invoices: number;
  total_value: number;
  recent_invoices: Invoice[];
}

// OneDrive integration types
export interface OneDriveFile {
  id: string;
  name: string;
  path: string;
  size: number;
  lastModified: string;
  type: 'nf' | 'contract' | 'report' | 'other';
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface OneDriveSync {
  id: number;
  status: 'running' | 'completed' | 'error';
  filesProcessed: number;
  totalFiles: number;
  startTime: string;
  endTime?: string;
  errors: string[];
}

export interface OneDriveUrlRequest {
  folder_url: string;
}

// Audit and History Types
export interface AuditLog {
  id: string;
  entityType: 'nf' | 'contract' | 'purchase' | 'classification' | 'budget';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'classify' | 'link';
  userId: string;
  userName: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}
