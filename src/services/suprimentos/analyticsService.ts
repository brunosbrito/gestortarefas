import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { Analytics } from '@/interfaces/suprimentos/AnalyticsInterface';

const URL = `${API_URL}/api/suprimentos/analytics`;
const USE_MOCK = true;

// ==================== Mock Data ====================

interface CostByCategory {
  category: string;
  value: number;
  percentage: number;
  items: number;
  avgTicket: number;
}

interface CostEvolution {
  month: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

interface SupplierAnalysis {
  id: number;
  name: string;
  totalValue: number;
  orders: number;
  avgDeliveryTime: number;
  rating: number;
  onTimeDelivery: number;
  qualityScore: number;
  priceCompetitiveness: number;
}

interface ContractPerformance {
  contractId: number;
  contractName: string;
  budget: number;
  spent: number;
  variance: number;
  variancePercent: number;
  executionPercent: number;
  status: 'under_budget' | 'on_budget' | 'over_budget';
}

interface CategoryTrend {
  category: string;
  data: Array<{ month: string; value: number }>;
}

// Mock Analytics Data
const mockCostsByCategory: CostByCategory[] = [
  {
    category: 'Matéria-Prima Metalúrgica',
    value: 285000,
    percentage: 42.5,
    items: 156,
    avgTicket: 1826.92,
  },
  {
    category: 'Mão de Obra Especializada',
    value: 195000,
    percentage: 29.1,
    items: 45,
    avgTicket: 4333.33,
  },
  {
    category: 'Consumíveis de Soldagem',
    value: 98000,
    percentage: 14.6,
    items: 23,
    avgTicket: 4260.87,
  },
  {
    category: 'Serviços de Usinagem',
    value: 62000,
    percentage: 9.2,
    items: 18,
    avgTicket: 3444.44,
  },
  {
    category: 'Tratamento Superficial',
    value: 30500,
    percentage: 4.6,
    items: 89,
    avgTicket: 342.70,
  },
];

const mockCostEvolution: CostEvolution[] = [
  { month: 'Jan/24', planned: 95000, actual: 87500, variance: -7500, variancePercent: -7.9 },
  { month: 'Fev/24', planned: 110000, actual: 118000, variance: 8000, variancePercent: 7.3 },
  { month: 'Mar/24', planned: 105000, actual: 102000, variance: -3000, variancePercent: -2.9 },
  { month: 'Abr/24', planned: 120000, actual: 115000, variance: -5000, variancePercent: -4.2 },
  { month: 'Mai/24', planned: 115000, actual: 125000, variance: 10000, variancePercent: 8.7 },
  { month: 'Jun/24', planned: 125000, actual: 123000, variance: -2000, variancePercent: -1.6 },
];

const mockSupplierAnalysis: SupplierAnalysis[] = [
  {
    id: 1,
    name: 'Gerdau Aços Longos S.A.',
    totalValue: 124500,
    orders: 18,
    avgDeliveryTime: 5.2,
    rating: 4.7,
    onTimeDelivery: 94.4,
    qualityScore: 4.6,
    priceCompetitiveness: 8.5,
  },
  {
    id: 2,
    name: 'Usiminas Mecânica S.A.',
    totalValue: 98750,
    orders: 15,
    avgDeliveryTime: 6.8,
    rating: 4.3,
    onTimeDelivery: 86.7,
    qualityScore: 4.4,
    priceCompetitiveness: 7.2,
  },
  {
    id: 3,
    name: 'ESAB Soldas do Brasil',
    totalValue: 87200,
    orders: 12,
    avgDeliveryTime: 4.5,
    rating: 4.8,
    onTimeDelivery: 100,
    qualityScore: 4.9,
    priceCompetitiveness: 6.8,
  },
  {
    id: 4,
    name: 'White Martins Gases Industriais',
    totalValue: 65300,
    orders: 22,
    avgDeliveryTime: 7.5,
    rating: 4.0,
    onTimeDelivery: 77.3,
    qualityScore: 4.1,
    priceCompetitiveness: 9.2,
  },
  {
    id: 5,
    name: 'Sherwin-Williams do Brasil',
    totalValue: 54200,
    orders: 14,
    avgDeliveryTime: 6.0,
    rating: 4.4,
    onTimeDelivery: 92.9,
    qualityScore: 4.5,
    priceCompetitiveness: 7.8,
  },
];

const mockContractPerformance: ContractPerformance[] = [
  {
    contractId: 1,
    contractName: 'Reforma Britador - Mina Vale do Rio Doce',
    budget: 2500000,
    spent: 2235000,
    variance: -265000,
    variancePercent: -10.6,
    executionPercent: 89.4,
    status: 'under_budget',
  },
  {
    contractId: 2,
    contractName: 'Fabricação Estrutura Metálica - Planta CSN',
    budget: 850000,
    spent: 892000,
    variance: 42000,
    variancePercent: 4.9,
    executionPercent: 104.9,
    status: 'over_budget',
  },
  {
    contractId: 3,
    contractName: 'Reparo Correias Transportadoras - Usiminas',
    budget: 1200000,
    spent: 1185000,
    variance: -15000,
    variancePercent: -1.3,
    executionPercent: 98.8,
    status: 'on_budget',
  },
];

const mockCategoryTrends: CategoryTrend[] = [
  {
    category: 'Matéria-Prima Metalúrgica',
    data: [
      { month: 'Jan', value: 42000 },
      { month: 'Fev', value: 48000 },
      { month: 'Mar', value: 45000 },
      { month: 'Abr', value: 52000 },
      { month: 'Mai', value: 51000 },
      { month: 'Jun', value: 47000 },
    ],
  },
  {
    category: 'Mão de Obra Especializada',
    data: [
      { month: 'Jan', value: 28000 },
      { month: 'Fev', value: 32000 },
      { month: 'Mar', value: 31000 },
      { month: 'Abr', value: 35000 },
      { month: 'Mai', value: 36000 },
      { month: 'Jun', value: 33000 },
    ],
  },
  {
    category: 'Consumíveis de Soldagem',
    data: [
      { month: 'Jan', value: 12000 },
      { month: 'Fev', value: 18000 },
      { month: 'Mar', value: 15000 },
      { month: 'Abr', value: 16000 },
      { month: 'Mai', value: 19000 },
      { month: 'Jun', value: 18000 },
    ],
  },
];

// ==================== Service Class ====================

class AnalyticsService {
  // Get general analytics overview
  async get(): Promise<ApiResponse<Analytics>> {
    if (USE_MOCK) {
      const totalSpent = mockCostEvolution.reduce((sum, item) => sum + item.actual, 0);
      const totalPlanned = mockCostEvolution.reduce((sum, item) => sum + item.planned, 0);
      const totalVariance = totalSpent - totalPlanned;
      const variancePercent = (totalVariance / totalPlanned) * 100;

      const mockAnalytics: Analytics = {
        roi: 15.5,
        averageQuoteTime: 48,
        activeSuppliers: mockSupplierAnalysis.length,
        accumulatedSavings: Math.abs(
          mockContractPerformance
            .filter((c) => c.status === 'under_budget')
            .reduce((sum, c) => sum + c.variance, 0)
        ),
        costEvolution: mockCostEvolution.map((item) => ({
          month: item.month,
          value: item.actual,
        })),
        supplierPerformance: mockSupplierAnalysis.slice(0, 5).map((s) => ({
          name: s.name,
          score: s.rating,
        })),
        insights: {
          positive: [
            `Economia acumulada de R$ ${(265000).toLocaleString('pt-BR')} em contratos`,
            `${mockSupplierAnalysis.filter((s) => s.onTimeDelivery >= 90).length} fornecedores com entregas pontuais acima de 90%`,
            'Redução média de custos de 6.2% comparado ao planejado',
          ],
          attention: [
            '1 contrato com estouros de orçamento (Edifício Comercial XYZ)',
            `${mockSupplierAnalysis.filter((s) => s.onTimeDelivery < 80).length} fornecedores com entregas abaixo de 80% de pontualidade`,
            'Aumento de 8.7% nos custos em Maio/24',
          ],
        },
        recommendations: [
          {
            title: 'Consolidar compras com Materiais Premium Ltda',
            description:
              'Fornecedor com melhor desempenho (100% entregas pontuais, nota 4.9). Potencial economia de 5-8% com contratos de volume.',
          },
          {
            title: 'Revisar contrato Edifício Comercial XYZ',
            description:
              'Contrato 4.9% acima do orçamento. Necessário análise de causas e plano de ação.',
          },
          {
            title: 'Diversificar fornecedores de equipamentos',
            description:
              'Categoria com maior variação de preços. Ampliar base de fornecedores pode reduzir custos em 10-15%.',
          },
        ],
      };

      return Promise.resolve({
        data: mockAnalytics,
        success: true,
      });
    }
    const response = await axios.get(URL);
    return response.data;
  }

  // Get costs by category
  async getCostsByCategory(): Promise<ApiResponse<CostByCategory[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockCostsByCategory,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/costs-by-category`);
    return response.data;
  }

  // Get cost evolution over time
  async getCostEvolution(): Promise<ApiResponse<CostEvolution[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockCostEvolution,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/cost-evolution`);
    return response.data;
  }

  // Get supplier analysis
  async getSupplierAnalysis(): Promise<ApiResponse<SupplierAnalysis[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockSupplierAnalysis,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/supplier-analysis`);
    return response.data;
  }

  // Get contract performance
  async getContractPerformance(): Promise<ApiResponse<ContractPerformance[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockContractPerformance,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/contract-performance`);
    return response.data;
  }

  // Get category trends
  async getCategoryTrends(): Promise<ApiResponse<CategoryTrend[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockCategoryTrends,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/category-trends`);
    return response.data;
  }

  // Get summary statistics
  async getSummaryStats(): Promise<
    ApiResponse<{
      totalSpent: number;
      totalBudget: number;
      variance: number;
      variancePercent: number;
      activeContracts: number;
      completedPurchases: number;
      avgDeliveryTime: number;
      topSupplier: string;
    }>
  > {
    if (USE_MOCK) {
      const totalSpent = mockContractPerformance.reduce((sum, c) => sum + c.spent, 0);
      const totalBudget = mockContractPerformance.reduce((sum, c) => sum + c.budget, 0);
      const variance = totalSpent - totalBudget;
      const variancePercent = (variance / totalBudget) * 100;

      const topSupplier = mockSupplierAnalysis.reduce((best, current) =>
        current.totalValue > best.totalValue ? current : best
      );

      return Promise.resolve({
        data: {
          totalSpent,
          totalBudget,
          variance,
          variancePercent,
          activeContracts: mockContractPerformance.length,
          completedPurchases: mockSupplierAnalysis.reduce((sum, s) => sum + s.orders, 0),
          avgDeliveryTime:
            mockSupplierAnalysis.reduce((sum, s) => sum + s.avgDeliveryTime, 0) /
            mockSupplierAnalysis.length,
          topSupplier: topSupplier.name,
        },
        success: true,
      });
    }
    const response = await axios.get(`${URL}/summary-stats`);
    return response.data;
  }
}

export default new AnalyticsService();

// Export types for use in hooks
export type {
  CostByCategory,
  CostEvolution,
  SupplierAnalysis,
  ContractPerformance,
  CategoryTrend,
};
