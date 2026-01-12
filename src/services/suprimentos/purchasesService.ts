import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import {
  Purchase,
  PurchaseRequest,
  Quotation,
} from '@/interfaces/suprimentos/PurchaseInterface';

const URL = `${API_URL}/api/suprimentos/purchases`;
const USE_MOCK = true;

// Mock data - Purchase Requests
let mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: 1,
    contractId: 1,
    contractName: 'Obra Shopping Center ABC',
    requestedBy: 'João Silva',
    department: 'Engenharia',
    items: [
      {
        id: 1,
        description: 'Cimento CP-II 50kg',
        quantity: 500,
        unit: 'saco',
        estimatedUnitPrice: 35.0,
        estimatedTotalPrice: 17500.0,
        specifications: 'Cimento Portland CP-II com resistência mínima de 32MPa',
        budgetItemId: 'B1-001',
        costCenterId: '11',
      },
      {
        id: 2,
        description: 'Vergalhão CA-50 12mm',
        quantity: 1000,
        unit: 'kg',
        estimatedUnitPrice: 8.5,
        estimatedTotalPrice: 8500.0,
        specifications: 'Aço CA-50 diâmetro 12mm, comprimento 12m',
        budgetItemId: 'B1-002',
        costCenterId: '12',
      },
    ],
    totalEstimatedValue: 26000.0,
    justification: 'Material necessário para fundação do bloco A',
    urgency: 'high',
    requiredDeliveryDate: '2024-07-15',
    status: 'in_quotation',
    quotations: [
      {
        id: 1,
        purchaseRequestId: 1,
        supplierId: 1,
        supplierName: 'Construtora ABC Materiais',
        items: [
          {
            id: 1,
            description: 'Cimento CP-II 50kg',
            quantity: 500,
            unit: 'saco',
            unitPrice: 33.5,
            totalPrice: 16750.0,
            specifications: 'Cimento Portland CP-II, resistência 32MPa',
            brand: 'Votorantim',
            deliveryTime: 5,
          },
          {
            id: 2,
            description: 'Vergalhão CA-50 12mm',
            quantity: 1000,
            unit: 'kg',
            unitPrice: 8.2,
            totalPrice: 8200.0,
            specifications: 'Aço CA-50 12mm, barra 12m',
            brand: 'Gerdau',
            deliveryTime: 7,
          },
        ],
        totalValue: 24950.0,
        validUntil: '2024-07-10',
        status: 'submitted',
        notes: 'Entrega parcelada possível',
        attachments: [],
        submittedAt: '2024-06-28',
      },
      {
        id: 2,
        purchaseRequestId: 1,
        supplierId: 2,
        supplierName: 'Materiais Delta Ltda',
        items: [
          {
            id: 1,
            description: 'Cimento CP-II 50kg',
            quantity: 500,
            unit: 'saco',
            unitPrice: 34.0,
            totalPrice: 17000.0,
            brand: 'Itambé',
            deliveryTime: 3,
          },
          {
            id: 2,
            description: 'Vergalhão CA-50 12mm',
            quantity: 1000,
            unit: 'kg',
            unitPrice: 7.9,
            totalPrice: 7900.0,
            brand: 'ArcelorMittal',
            deliveryTime: 5,
          },
        ],
        totalValue: 24900.0,
        validUntil: '2024-07-08',
        status: 'submitted',
        notes: 'Prazo de entrega mais curto',
        attachments: [],
        submittedAt: '2024-06-29',
      },
    ],
    createdAt: '2024-06-25',
    updatedAt: '2024-06-29',
  },
  {
    id: 2,
    contractId: 2,
    contractName: 'Reforma Hospital Municipal',
    requestedBy: 'Maria Santos',
    department: 'Obras',
    items: [
      {
        id: 3,
        description: 'Tinta acrílica premium branca',
        quantity: 200,
        unit: 'galão',
        estimatedUnitPrice: 85.0,
        estimatedTotalPrice: 17000.0,
        specifications: 'Tinta lavável, acabamento fosco, rendimento 350m²/galão',
        budgetItemId: 'B2-001',
        costCenterId: '13',
      },
    ],
    totalEstimatedValue: 17000.0,
    justification: 'Pintura das enfermarias reformadas',
    urgency: 'medium',
    requiredDeliveryDate: '2024-07-20',
    status: 'approved',
    quotations: [
      {
        id: 3,
        purchaseRequestId: 2,
        supplierId: 3,
        supplierName: 'Tintas & Acabamentos Pro',
        items: [
          {
            id: 1,
            description: 'Tinta acrílica premium branca',
            quantity: 200,
            unit: 'galão',
            unitPrice: 82.0,
            totalPrice: 16400.0,
            brand: 'Suvinil',
            deliveryTime: 10,
          },
        ],
        totalValue: 16400.0,
        validUntil: '2024-07-15',
        status: 'selected',
        attachments: [],
        submittedAt: '2024-06-30',
        reviewedAt: '2024-07-01',
        reviewedBy: 'Carlos Ferreira',
      },
    ],
    selectedQuotationId: 3,
    approvedBy: 'Carlos Ferreira',
    approvedAt: '2024-07-01',
    createdAt: '2024-06-27',
    updatedAt: '2024-07-01',
  },
  {
    id: 3,
    contractId: 1,
    contractName: 'Obra Shopping Center ABC',
    requestedBy: 'Pedro Costa',
    department: 'Elétrica',
    items: [
      {
        id: 4,
        description: 'Cabo flexível 2,5mm² 750V',
        quantity: 5000,
        unit: 'm',
        estimatedUnitPrice: 3.2,
        estimatedTotalPrice: 16000.0,
        specifications: 'Cabo flexível isolação PVC, bitola 2,5mm²',
        costCenterId: '14',
      },
      {
        id: 5,
        description: 'Disjuntor termomagnético 20A',
        quantity: 50,
        unit: 'un',
        estimatedUnitPrice: 35.0,
        estimatedTotalPrice: 1750.0,
        specifications: 'Disjuntor bipolar, curva C, 20A',
        costCenterId: '14',
      },
    ],
    totalEstimatedValue: 17750.0,
    justification: 'Instalação elétrica setor comercial',
    urgency: 'low',
    requiredDeliveryDate: '2024-08-01',
    status: 'draft',
    quotations: [],
    createdAt: '2024-07-02',
    updatedAt: '2024-07-02',
  },
];

// Mock data - Purchase Orders
let mockPurchases: Purchase[] = [
  {
    id: 1,
    item: 'Cimento CP-II 50kg + Vergalhão CA-50',
    supplier: 'Materiais Delta Ltda',
    contract: 'Obra Shopping Center ABC',
    orderNumber: 'PO-2024-001',
    value: 24900.0,
    status: 'Aprovado',
    date: '2024-07-01',
  },
  {
    id: 2,
    item: 'Tinta acrílica premium branca',
    supplier: 'Tintas & Acabamentos Pro',
    contract: 'Reforma Hospital Municipal',
    orderNumber: 'PO-2024-002',
    value: 16400.0,
    status: 'Entregue',
    date: '2024-07-01',
  },
];

let nextPRId = 4;
let nextQuotationId = 4;
let nextPurchaseId = 3;

class PurchasesService {
  // ==================== Purchase Requests ====================

  async getPurchaseRequests(): Promise<ApiResponse<PurchaseRequest[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockPurchaseRequests,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/requests`);
    return response.data;
  }

  async getPurchaseRequestById(id: number): Promise<ApiResponse<PurchaseRequest>> {
    if (USE_MOCK) {
      const request = mockPurchaseRequests.find((pr) => pr.id === id);
      if (!request) {
        return Promise.reject({ message: 'Purchase request not found' });
      }
      return Promise.resolve({
        data: request,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/requests/${id}`);
    return response.data;
  }

  async createPurchaseRequest(data: Partial<PurchaseRequest>): Promise<ApiResponse<PurchaseRequest>> {
    if (USE_MOCK) {
      const newRequest: PurchaseRequest = {
        id: nextPRId++,
        contractId: data.contractId || 0,
        contractName: data.contractName || '',
        requestedBy: data.requestedBy || '',
        department: data.department || '',
        items: data.items || [],
        totalEstimatedValue: data.totalEstimatedValue || 0,
        justification: data.justification || '',
        urgency: data.urgency || 'medium',
        requiredDeliveryDate: data.requiredDeliveryDate || '',
        status: 'draft',
        quotations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPurchaseRequests.push(newRequest);
      return Promise.resolve({
        data: newRequest,
        success: true,
      });
    }
    const response = await axios.post(`${URL}/requests`, data);
    return response.data;
  }

  async updatePurchaseRequest(
    id: number,
    data: Partial<PurchaseRequest>
  ): Promise<ApiResponse<PurchaseRequest>> {
    if (USE_MOCK) {
      const index = mockPurchaseRequests.findIndex((pr) => pr.id === id);
      if (index === -1) {
        return Promise.reject({ message: 'Purchase request not found' });
      }
      mockPurchaseRequests[index] = {
        ...mockPurchaseRequests[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return Promise.resolve({
        data: mockPurchaseRequests[index],
        success: true,
      });
    }
    const response = await axios.put(`${URL}/requests/${id}`, data);
    return response.data;
  }

  async deletePurchaseRequest(id: number): Promise<ApiResponse<void>> {
    if (USE_MOCK) {
      mockPurchaseRequests = mockPurchaseRequests.filter((pr) => pr.id !== id);
      return Promise.resolve({
        data: undefined,
        success: true,
      });
    }
    const response = await axios.delete(`${URL}/requests/${id}`);
    return response.data;
  }

  async submitPurchaseRequest(id: number): Promise<ApiResponse<PurchaseRequest>> {
    if (USE_MOCK) {
      const index = mockPurchaseRequests.findIndex((pr) => pr.id === id);
      if (index === -1) {
        return Promise.reject({ message: 'Purchase request not found' });
      }
      mockPurchaseRequests[index].status = 'submitted';
      mockPurchaseRequests[index].updatedAt = new Date().toISOString();
      return Promise.resolve({
        data: mockPurchaseRequests[index],
        success: true,
      });
    }
    const response = await axios.post(`${URL}/requests/${id}/submit`);
    return response.data;
  }

  async approvePurchaseRequest(
    id: number,
    approvedBy: string
  ): Promise<ApiResponse<PurchaseRequest>> {
    if (USE_MOCK) {
      const index = mockPurchaseRequests.findIndex((pr) => pr.id === id);
      if (index === -1) {
        return Promise.reject({ message: 'Purchase request not found' });
      }
      mockPurchaseRequests[index].status = 'approved';
      mockPurchaseRequests[index].approvedBy = approvedBy;
      mockPurchaseRequests[index].approvedAt = new Date().toISOString();
      mockPurchaseRequests[index].updatedAt = new Date().toISOString();
      return Promise.resolve({
        data: mockPurchaseRequests[index],
        success: true,
      });
    }
    const response = await axios.post(`${URL}/requests/${id}/approve`, { approvedBy });
    return response.data;
  }

  // ==================== Quotations ====================

  async addQuotation(
    purchaseRequestId: number,
    quotationData: Partial<Quotation>
  ): Promise<ApiResponse<Quotation>> {
    if (USE_MOCK) {
      const requestIndex = mockPurchaseRequests.findIndex((pr) => pr.id === purchaseRequestId);
      if (requestIndex === -1) {
        return Promise.reject({ message: 'Purchase request not found' });
      }

      const newQuotation: Quotation = {
        id: nextQuotationId++,
        purchaseRequestId,
        supplierId: quotationData.supplierId || 0,
        supplierName: quotationData.supplierName || '',
        items: quotationData.items || [],
        totalValue: quotationData.totalValue || 0,
        validUntil: quotationData.validUntil || '',
        status: 'submitted',
        notes: quotationData.notes,
        attachments: quotationData.attachments || [],
        submittedAt: new Date().toISOString(),
      };

      mockPurchaseRequests[requestIndex].quotations.push(newQuotation);
      mockPurchaseRequests[requestIndex].status = 'in_quotation';
      mockPurchaseRequests[requestIndex].updatedAt = new Date().toISOString();

      return Promise.resolve({
        data: newQuotation,
        success: true,
      });
    }
    const response = await axios.post(`${URL}/requests/${purchaseRequestId}/quotations`, quotationData);
    return response.data;
  }

  async selectQuotation(
    purchaseRequestId: number,
    quotationId: number,
    reviewedBy: string
  ): Promise<ApiResponse<PurchaseRequest>> {
    if (USE_MOCK) {
      const requestIndex = mockPurchaseRequests.findIndex((pr) => pr.id === purchaseRequestId);
      if (requestIndex === -1) {
        return Promise.reject({ message: 'Purchase request not found' });
      }

      const quotationIndex = mockPurchaseRequests[requestIndex].quotations.findIndex(
        (q) => q.id === quotationId
      );
      if (quotationIndex === -1) {
        return Promise.reject({ message: 'Quotation not found' });
      }

      // Update quotation status
      mockPurchaseRequests[requestIndex].quotations[quotationIndex].status = 'selected';
      mockPurchaseRequests[requestIndex].quotations[quotationIndex].reviewedAt =
        new Date().toISOString();
      mockPurchaseRequests[requestIndex].quotations[quotationIndex].reviewedBy = reviewedBy;

      // Update other quotations to rejected
      mockPurchaseRequests[requestIndex].quotations.forEach((q, idx) => {
        if (idx !== quotationIndex && q.status === 'submitted') {
          q.status = 'rejected';
        }
      });

      // Update request
      mockPurchaseRequests[requestIndex].selectedQuotationId = quotationId;
      mockPurchaseRequests[requestIndex].status = 'completed';
      mockPurchaseRequests[requestIndex].updatedAt = new Date().toISOString();

      return Promise.resolve({
        data: mockPurchaseRequests[requestIndex],
        success: true,
      });
    }
    const response = await axios.post(`${URL}/requests/${purchaseRequestId}/quotations/${quotationId}/select`, {
      reviewedBy,
    });
    return response.data;
  }

  // ==================== Purchase Orders ====================

  async getAll(): Promise<ApiResponse<Purchase[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockPurchases,
        success: true,
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }

  async getById(id: number): Promise<ApiResponse<Purchase>> {
    if (USE_MOCK) {
      const purchase = mockPurchases.find((p) => p.id === id);
      if (!purchase) {
        return Promise.reject({ message: 'Purchase order not found' });
      }
      return Promise.resolve({
        data: purchase,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/${id}`);
    return response.data;
  }

  async create(data: Partial<Purchase>): Promise<ApiResponse<Purchase>> {
    if (USE_MOCK) {
      const newPurchase: Purchase = {
        id: nextPurchaseId++,
        item: data.item || '',
        supplier: data.supplier || '',
        contract: data.contract || '',
        orderNumber: data.orderNumber || `PO-2024-${String(nextPurchaseId).padStart(3, '0')}`,
        value: data.value || 0,
        status: data.status || 'Pendente',
        date: data.date || new Date().toISOString().split('T')[0],
      };
      mockPurchases.push(newPurchase);

      return Promise.resolve({
        data: newPurchase,
        success: true,
      });
    }
    const response = await axios.post(URL, data);
    return response.data;
  }

  async update(id: number, data: Partial<Purchase>): Promise<ApiResponse<Purchase>> {
    if (USE_MOCK) {
      const index = mockPurchases.findIndex((p) => p.id === id);
      if (index === -1) {
        return Promise.reject({ message: 'Purchase order not found' });
      }
      mockPurchases[index] = {
        ...mockPurchases[index],
        ...data,
      };
      return Promise.resolve({
        data: mockPurchases[index],
        success: true,
      });
    }
    const response = await axios.put(`${URL}/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    if (USE_MOCK) {
      mockPurchases = mockPurchases.filter((p) => p.id !== id);
      return Promise.resolve({
        data: undefined,
        success: true,
      });
    }
    const response = await axios.delete(`${URL}/${id}`);
    return response.data;
  }

  // ==================== Statistics ====================

  async getStats(): Promise<
    ApiResponse<{
      totalRequests: number;
      pendingRequests: number;
      totalOrders: number;
      totalValue: number;
    }>
  > {
    if (USE_MOCK) {
      return Promise.resolve({
        data: {
          totalRequests: mockPurchaseRequests.length,
          pendingRequests: mockPurchaseRequests.filter(
            (pr) => pr.status === 'submitted' || pr.status === 'in_quotation'
          ).length,
          totalOrders: mockPurchases.length,
          totalValue: mockPurchases.reduce((sum, p) => sum + p.value, 0),
        },
        success: true,
      });
    }
    const response = await axios.get(`${URL}/stats`);
    return response.data;
  }
}

export default new PurchasesService();
