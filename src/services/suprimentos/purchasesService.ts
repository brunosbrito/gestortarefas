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
    contractName: 'Reforma Britador - Mina Vale do Rio Doce',
    requestedBy: 'João Silva',
    department: 'Caldeiraria',
    items: [
      {
        id: 1,
        description: 'Chapa de Aço Carbono SAE 1020 - 3/8" (9,5mm)',
        quantity: 15,
        unit: 'chapa',
        estimatedUnitPrice: 1850.0,
        estimatedTotalPrice: 27750.0,
        specifications: 'Chapa 3000x1500mm, espessura 9,5mm (3/8"), aço carbono SAE 1020',
        budgetItemId: 'B1-001',
        costCenterId: '11',
      },
      {
        id: 2,
        description: 'Eletrodo de Solda E7018 3,25mm',
        quantity: 120,
        unit: 'kg',
        estimatedUnitPrice: 18.5,
        estimatedTotalPrice: 2220.0,
        specifications: 'Eletrodo revestido AWS E7018, diâmetro 3,25mm (1/8")',
        budgetItemId: 'B1-002',
        costCenterId: '12',
      },
    ],
    totalEstimatedValue: 29970.0,
    justification: 'Material para reparo estrutural do chassi do britador primário',
    urgency: 'high',
    requiredDeliveryDate: '2024-07-15',
    status: 'in_quotation',
    quotations: [
      {
        id: 1,
        purchaseRequestId: 1,
        supplierId: 1,
        supplierName: 'Usiminas Mecânica S.A.',
        items: [
          {
            id: 1,
            description: 'Chapa de Aço Carbono SAE 1020 - 3/8" (9,5mm)',
            quantity: 15,
            unit: 'chapa',
            unitPrice: 1780.0,
            totalPrice: 26700.0,
            specifications: 'Chapa 3000x1500mm, esp. 9,5mm, aço SAE 1020',
            brand: 'Usiminas',
            deliveryTime: 7,
          },
          {
            id: 2,
            description: 'Eletrodo de Solda E7018 3,25mm',
            quantity: 120,
            unit: 'kg',
            unitPrice: 17.8,
            totalPrice: 2136.0,
            specifications: 'Eletrodo AWS E7018, Ø 3,25mm',
            brand: 'ESAB',
            deliveryTime: 5,
          },
        ],
        totalValue: 28836.0,
        validUntil: '2024-07-10',
        status: 'submitted',
        notes: 'Material com certificado de qualidade incluso',
        attachments: [],
        submittedAt: '2024-06-28',
      },
      {
        id: 2,
        purchaseRequestId: 1,
        supplierId: 2,
        supplierName: 'Gerdau Aços Longos S.A.',
        items: [
          {
            id: 1,
            description: 'Chapa de Aço Carbono SAE 1020 - 3/8" (9,5mm)',
            quantity: 15,
            unit: 'chapa',
            unitPrice: 1720.0,
            totalPrice: 25800.0,
            brand: 'Gerdau',
            deliveryTime: 5,
          },
          {
            id: 2,
            description: 'Eletrodo de Solda E7018 3,25mm',
            quantity: 120,
            unit: 'kg',
            unitPrice: 17.2,
            totalPrice: 2064.0,
            brand: 'Conarco',
            deliveryTime: 3,
          },
        ],
        totalValue: 27864.0,
        validUntil: '2024-07-08',
        status: 'submitted',
        notes: 'Melhor prazo de entrega, frete incluso',
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
    contractName: 'Fabricação Estrutura Metálica - Planta Siderúrgica CSN',
    requestedBy: 'Maria Santos',
    department: 'Pintura Industrial',
    items: [
      {
        id: 3,
        description: 'Tinta Epóxi Anticorrosiva (Primer)',
        quantity: 180,
        unit: 'galão',
        estimatedUnitPrice: 145.0,
        estimatedTotalPrice: 26100.0,
        specifications: 'Primer epóxi bi-componente, alto teor de sólidos, espessura 80-100μm',
        budgetItemId: 'B2-001',
        costCenterId: '13',
      },
    ],
    totalEstimatedValue: 26100.0,
    justification: 'Pintura anticorrosiva das vigas estruturais da nova ponte rolante',
    urgency: 'medium',
    requiredDeliveryDate: '2024-07-20',
    status: 'approved',
    quotations: [
      {
        id: 3,
        purchaseRequestId: 2,
        supplierId: 3,
        supplierName: 'Sherwin-Williams do Brasil',
        items: [
          {
            id: 1,
            description: 'Tinta Epóxi Anticorrosiva (Primer)',
            quantity: 180,
            unit: 'galão',
            unitPrice: 138.0,
            totalPrice: 24840.0,
            brand: 'Sherwin-Williams',
            deliveryTime: 10,
          },
        ],
        totalValue: 24840.0,
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
    contractName: 'Reforma Britador - Mina Vale do Rio Doce',
    requestedBy: 'Pedro Costa',
    department: 'Usinagem',
    items: [
      {
        id: 4,
        description: 'Perfil U 6" x 3" (152 x 76mm) #12,2kg/m',
        quantity: 48,
        unit: 'm',
        estimatedUnitPrice: 68.0,
        estimatedTotalPrice: 3264.0,
        specifications: 'Perfil U laminado ASTM A36, 6"x3", esp. aba 11mm',
        costCenterId: '14',
      },
      {
        id: 5,
        description: 'Disco de Corte 14" (355mm) para Aço',
        quantity: 45,
        unit: 'un',
        estimatedUnitPrice: 12.5,
        estimatedTotalPrice: 562.5,
        specifications: 'Disco abrasivo 355x3,2x25,4mm, grão 30, velocidade máx 4.400rpm',
        costCenterId: '14',
      },
    ],
    totalEstimatedValue: 3826.5,
    justification: 'Reforço estrutural lateral do chassi e consumíveis de corte',
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
    item: 'Chapa Aço SAE 1020 3/8" + Eletrodo E7018',
    supplier: 'Gerdau Aços Longos S.A.',
    contract: 'Reforma Britador - Mina Vale do Rio Doce',
    orderNumber: 'PO-2024-001',
    value: 27864.0,
    status: 'Aprovado',
    date: '2024-07-01',
  },
  {
    id: 2,
    item: 'Tinta Epóxi Anticorrosiva (Primer)',
    supplier: 'Sherwin-Williams do Brasil',
    contract: 'Fabricação Estrutura Metálica - Planta CSN',
    orderNumber: 'PO-2024-002',
    value: 24840.0,
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
