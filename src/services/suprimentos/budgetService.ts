import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { BudgetRealization, ContractExecution } from '@/interfaces/suprimentos/BudgetInterface';

const URL = `${API_URL}/api/suprimentos/budget`;
const USE_MOCK = true;

// Mock data por contrato
const getMockExecutionByContract = (contractId: number): ContractExecution => {
  const executions: Record<number, ContractExecution> = {
    1: {
      contractId: 1,
      totalPredictedValue: 500000,
      totalRealizedValue: 81200,
      physicalProgress: 35,
      financialProgress: 16.24,
      lastUpdate: new Date().toISOString(),
      items: [
        {
          budgetItemId: 'B1-001',
          predictedValue: 200000,
          realizedValue: 50000,
          predictedQuantity: 40,
          realizedQuantity: 10,
          variance: -150000,
          variancePercent: -75,
          status: 'in_progress',
          linkedNFs: [
            {
              nfId: 1,
              nfItemId: 1,
              value: 50000,
              quantity: 10,
              date: '2024-03-15',
            },
          ],
        },
        {
          budgetItemId: 'B1-002',
          predictedValue: 150000,
          realizedValue: 12000,
          predictedQuantity: 1,
          realizedQuantity: 1,
          variance: -138000,
          variancePercent: -92,
          status: 'in_progress',
          linkedNFs: [
            {
              nfId: 4,
              nfItemId: 4,
              value: 12000,
              quantity: 1,
              date: '2024-05-10',
            },
          ],
        },
        {
          budgetItemId: 'B1-003',
          predictedValue: 100000,
          realizedValue: 19200,
          predictedQuantity: 301,
          realizedQuantity: 301,
          variance: -80800,
          variancePercent: -80.8,
          status: 'in_progress',
          linkedNFs: [
            {
              nfId: 7,
              nfItemId: 9,
              value: 13500,
              quantity: 300,
              date: '2024-05-25',
            },
            {
              nfId: 7,
              nfItemId: 10,
              value: 5700,
              quantity: 1,
              date: '2024-05-25',
            },
          ],
        },
        {
          budgetItemId: 'B1-004',
          predictedValue: 50000,
          realizedValue: 0,
          predictedQuantity: 100,
          realizedQuantity: 0,
          variance: -50000,
          variancePercent: -100,
          status: 'not_started',
          linkedNFs: [],
        },
      ],
      alerts: [
        {
          id: 'A1-001',
          type: 'variance_high',
          severity: 'high',
          message: 'Item B1-002 com variação de -92% - Realizado muito abaixo do previsto',
          budgetItemId: 'B1-002',
          suggestedAction: 'Verificar se orçamento inicial está superestimado ou se há itens não classificados',
        },
        {
          id: 'A1-002',
          type: 'missing_nf',
          severity: 'medium',
          message: 'Item B1-004 sem NFs vinculadas',
          budgetItemId: 'B1-004',
          suggestedAction: 'Verificar se há NFs pendentes de classificação',
        },
      ],
    },
    2: {
      contractId: 2,
      totalPredictedValue: 350000,
      totalRealizedValue: 167250,
      physicalProgress: 20,
      financialProgress: 47.79,
      lastUpdate: new Date().toISOString(),
      items: [
        {
          budgetItemId: 'B2-001',
          predictedValue: 180000,
          realizedValue: 38500,
          predictedQuantity: 650,
          realizedQuantity: 650,
          variance: -141500,
          variancePercent: -78.61,
          status: 'in_progress',
          linkedNFs: [
            {
              nfId: 3,
              nfItemId: 2,
              value: 17500,
              quantity: 500,
              date: '2024-05-05',
            },
            {
              nfId: 3,
              nfItemId: 3,
              value: 19500,
              quantity: 150,
              date: '2024-05-05',
            },
          ],
        },
        {
          budgetItemId: 'B2-002',
          predictedValue: 120000,
          realizedValue: 128750,
          predictedQuantity: 2530,
          realizedQuantity: 2530,
          variance: 8750,
          variancePercent: 7.29,
          status: 'over_budget',
          linkedNFs: [
            {
              nfId: 6,
              nfItemId: 7,
              value: 13750,
              quantity: 2500,
              date: '2024-05-20',
            },
            {
              nfId: 6,
              nfItemId: 8,
              value: 15000,
              quantity: 30,
              date: '2024-05-20',
            },
          ],
        },
        {
          budgetItemId: 'B2-003',
          predictedValue: 50000,
          realizedValue: 0,
          predictedQuantity: 100,
          realizedQuantity: 0,
          variance: -50000,
          variancePercent: -100,
          status: 'not_started',
          linkedNFs: [],
        },
      ],
      alerts: [
        {
          id: 'A2-001',
          type: 'budget_exceeded',
          severity: 'high',
          message: 'Item B2-002 excedeu o orçamento em R$ 8.750,00 (+7,3%)',
          budgetItemId: 'B2-002',
          suggestedAction: 'Revisar necessidade de aditivo contratual ou reclassificar despesas',
        },
        {
          id: 'A2-002',
          type: 'missing_nf',
          severity: 'low',
          message: 'Item B2-003 não iniciado',
          budgetItemId: 'B2-003',
        },
      ],
    },
    3: {
      contractId: 3,
      totalPredictedValue: 600000,
      totalRealizedValue: 0,
      physicalProgress: 0,
      financialProgress: 0,
      lastUpdate: new Date().toISOString(),
      items: [
        {
          budgetItemId: 'B3-001',
          predictedValue: 400000,
          realizedValue: 0,
          predictedQuantity: 5050,
          realizedQuantity: 0,
          variance: -400000,
          variancePercent: -100,
          status: 'not_started',
          linkedNFs: [],
        },
        {
          budgetItemId: 'B3-002',
          predictedValue: 200000,
          realizedValue: 0,
          predictedQuantity: 100,
          realizedQuantity: 0,
          variance: -200000,
          variancePercent: -100,
          status: 'not_started',
          linkedNFs: [],
        },
      ],
      alerts: [
        {
          id: 'A3-001',
          type: 'progress_delayed',
          severity: 'high',
          message: 'Contrato sem execução iniciada - NF rejeitada',
          suggestedAction: 'Verificar motivo de rejeição da NF 12349 e corrigir',
        },
      ],
    },
  };

  return (
    executions[contractId] || {
      contractId,
      totalPredictedValue: 0,
      totalRealizedValue: 0,
      physicalProgress: 0,
      financialProgress: 0,
      items: [],
      lastUpdate: new Date().toISOString(),
      alerts: [],
    }
  );
};

class BudgetService {
  async getByContract(contractId: number): Promise<ApiResponse<ContractExecution>> {
    if (USE_MOCK) {
      const mockExecution = getMockExecutionByContract(contractId);
      return Promise.resolve({
        data: mockExecution,
        success: true,
      });
    }

    const response = await axios.get(`${URL}/contract/${contractId}`);
    return response.data;
  }

  async importBudget(contractId: number, file: File): Promise<ApiResponse<any>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: { imported_items: 10, contract_total_value: 500000 },
        success: true,
        message: 'Orçamento importado (MOCK)',
      });
    }

    const formData = new FormData();
    formData.append('budget_file', file);
    const response = await axios.post(`${URL}/contract/${contractId}/import`, formData);
    return response.data;
  }
}

export default new BudgetService();
