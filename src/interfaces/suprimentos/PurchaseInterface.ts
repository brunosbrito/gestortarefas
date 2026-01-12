// Purchase and Quotation Types
export interface Purchase {
  id: number;
  item: string;
  supplier: string;
  contract: string;
  orderNumber: string;
  value: number;
  status: 'Pendente' | 'Aprovado' | 'Entregue' | 'Cancelado';
  date: string;
}

export interface Quotation {
  id: number;
  purchaseRequestId: number;
  supplierId: number;
  supplierName: string;
  items: QuotationItem[];
  totalValue: number;
  validUntil: string;
  status: 'pending' | 'submitted' | 'selected' | 'rejected';
  notes?: string;
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface QuotationItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  brand?: string;
  model?: string;
  deliveryTime?: number; // in days
}

export interface PurchaseRequest {
  id: number;
  contractId: number;
  contractName: string;
  requestedBy: string;
  department: string;
  items: PurchaseRequestItem[];
  totalEstimatedValue: number;
  justification: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requiredDeliveryDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'in_quotation' | 'completed' | 'rejected';
  quotations: Quotation[];
  selectedQuotationId?: number;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequestItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  estimatedTotalPrice: number;
  specifications: string;
  budgetItemId?: string;
  costCenterId?: string;
}
