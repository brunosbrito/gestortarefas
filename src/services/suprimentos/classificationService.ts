import API_URL from '@/config';
import axios from 'axios';
import { ApiResponse } from '@/interfaces/suprimentos/CommonInterface';
import { CostCenter, ClassificationRule } from '@/interfaces/suprimentos/CostCenterInterface';

const URL = `${API_URL}/api/suprimentos/classification`;
const USE_MOCK = true;

// Mock data - Centros de Custo Hierárquicos
let mockCostCenters: CostCenter[] = [
  // NÍVEL 1: Categorias Principais
  {
    id: 1,
    code: 'MAT',
    name: 'Materiais',
    description: 'Materiais de construção e insumos',
    category: 'material',
    parentId: null,
    level: 1,
    isActive: true,
    budget: {
      allocated: 500000,
      consumed: 127950,
      remaining: 372050,
      percentage: 25.59,
    },
    keywords: ['material', 'insumo', 'produto'],
    color: '#3b82f6',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 2,
    code: 'SER',
    name: 'Serviços',
    description: 'Serviços contratados e mão de obra',
    category: 'service',
    parentId: null,
    level: 1,
    isActive: true,
    budget: {
      allocated: 300000,
      consumed: 12000,
      remaining: 288000,
      percentage: 4.0,
    },
    keywords: ['serviço', 'mão de obra', 'contratação'],
    color: '#10b981',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 3,
    code: 'EQP',
    name: 'Equipamentos',
    description: 'Equipamentos e ferramentas',
    category: 'equipment',
    parentId: null,
    level: 1,
    isActive: true,
    budget: {
      allocated: 200000,
      consumed: 0,
      remaining: 200000,
      percentage: 0,
    },
    keywords: ['equipamento', 'ferramenta', 'máquina'],
    color: '#f59e0b',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 4,
    code: 'LOG',
    name: 'Logística',
    description: 'Transporte e logística',
    category: 'service',
    parentId: null,
    level: 1,
    isActive: true,
    budget: {
      allocated: 100000,
      consumed: 28750,
      remaining: 71250,
      percentage: 28.75,
    },
    keywords: ['frete', 'transporte', 'logística', 'entrega'],
    color: '#8b5cf6',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 5,
    code: 'ADM',
    name: 'Administrativo',
    description: 'Despesas administrativas e overhead',
    category: 'overhead',
    parentId: null,
    level: 1,
    isActive: true,
    budget: {
      allocated: 50000,
      consumed: 0,
      remaining: 50000,
      percentage: 0,
    },
    keywords: ['administrativo', 'despesa', 'overhead'],
    color: '#64748b',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },

  // NÍVEL 2: Subcategorias de Materiais
  {
    id: 11,
    code: 'MAT-CIM',
    name: 'Cimentos e Argamassas',
    description: 'Cimentos, argamassas e produtos secos',
    category: 'material',
    parentId: 1,
    level: 2,
    isActive: true,
    budget: {
      allocated: 150000,
      consumed: 67500,
      remaining: 82500,
      percentage: 45.0,
    },
    keywords: ['cimento', 'argamassa', 'massa', 'reboco', 'cp-ii', 'cp-iii'],
    color: '#3b82f6',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 12,
    code: 'MAT-ACO',
    name: 'Aço e Ferragens',
    description: 'Vergalhões, telas e ferragens',
    category: 'material',
    parentId: 1,
    level: 2,
    isActive: true,
    budget: {
      allocated: 200000,
      consumed: 50000,
      remaining: 150000,
      percentage: 25.0,
    },
    keywords: ['aço', 'vergalhão', 'tela', 'ferragem', 'ca-50', 'ca-60'],
    color: '#3b82f6',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 13,
    code: 'MAT-ELE',
    name: 'Elétricos',
    description: 'Materiais elétricos e instalações',
    category: 'material',
    parentId: 1,
    level: 2,
    isActive: true,
    budget: {
      allocated: 80000,
      consumed: 10450,
      remaining: 69550,
      percentage: 13.06,
    },
    keywords: ['elétrico', 'cabo', 'fio', 'tomada', 'interruptor', 'disjuntor'],
    color: '#3b82f6',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 14,
    code: 'MAT-HID',
    name: 'Hidráulicos',
    description: 'Tubos, conexões e acessórios hidráulicos',
    category: 'material',
    parentId: 1,
    level: 2,
    isActive: true,
    budget: {
      allocated: 70000,
      consumed: 0,
      remaining: 70000,
      percentage: 0,
    },
    keywords: ['tubo', 'cano', 'conexão', 'registro', 'pvc', 'hidráulico'],
    color: '#3b82f6',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },

  // NÍVEL 2: Subcategorias de Serviços
  {
    id: 21,
    code: 'SER-FRE',
    name: 'Frete e Transporte',
    description: 'Serviços de frete e transporte de materiais',
    category: 'service',
    parentId: 2,
    level: 2,
    isActive: true,
    budget: {
      allocated: 100000,
      consumed: 12000,
      remaining: 88000,
      percentage: 12.0,
    },
    keywords: ['frete', 'transporte', 'carreto', 'entrega'],
    color: '#10b981',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 22,
    code: 'SER-INS',
    name: 'Instalações',
    description: 'Serviços de instalações elétricas e hidráulicas',
    category: 'service',
    parentId: 2,
    level: 2,
    isActive: true,
    budget: {
      allocated: 120000,
      consumed: 0,
      remaining: 120000,
      percentage: 0,
    },
    keywords: ['instalação', 'montagem', 'instalador'],
    color: '#10b981',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 23,
    code: 'SER-ACB',
    name: 'Acabamentos',
    description: 'Serviços de acabamento e pintura',
    category: 'service',
    parentId: 2,
    level: 2,
    isActive: true,
    budget: {
      allocated: 80000,
      consumed: 0,
      remaining: 80000,
      percentage: 0,
    },
    keywords: ['acabamento', 'pintura', 'gesso', 'reboco'],
    color: '#10b981',
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
];

// Mock data - Regras de Classificação
let mockRules: ClassificationRule[] = [
  {
    id: 1,
    costCenterId: 11,
    name: 'Cimento CP-II',
    description: 'Classifica automaticamente cimentos CP-II',
    keywords: ['cimento cp-ii', 'cp-ii', 'cimento cp2', 'cimento portland cp-ii'],
    priority: 10,
    isActive: true,
    matchType: 'contains',
    conditions: [
      {
        field: 'description',
        operator: 'contains',
        value: 'cimento',
      },
      {
        field: 'description',
        operator: 'contains',
        value: 'cp-ii',
      },
    ],
    confidence: 95,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 2,
    costCenterId: 12,
    name: 'Vergalhões CA-50',
    description: 'Classifica vergalhões de aço CA-50',
    keywords: ['vergalhão', 'ca-50', 'ca50', 'aço ca-50'],
    priority: 9,
    isActive: true,
    matchType: 'contains',
    conditions: [
      {
        field: 'description',
        operator: 'contains',
        value: 'vergalhão',
      },
    ],
    confidence: 90,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 3,
    costCenterId: 13,
    name: 'Cabos Elétricos',
    description: 'Classifica cabos e fios elétricos',
    keywords: ['cabo', 'fio', 'fio elétrico', 'cabo elétrico', 'flexível'],
    priority: 8,
    isActive: true,
    matchType: 'contains',
    conditions: [
      {
        field: 'description',
        operator: 'contains_any',
        value: 'cabo|fio',
      },
    ],
    confidence: 85,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
  {
    id: 4,
    costCenterId: 21,
    name: 'Serviços de Frete',
    description: 'Classifica serviços de frete e transporte',
    keywords: ['frete', 'transporte', 'carreto', 'entrega'],
    priority: 10,
    isActive: true,
    matchType: 'contains',
    conditions: [
      {
        field: 'description',
        operator: 'contains_any',
        value: 'frete|transporte|carreto',
      },
    ],
    confidence: 98,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-10',
  },
];

let mockIdCounter = 100;
let mockRuleIdCounter = 10;

class ClassificationService {
  // ==================== CRUD de Centros de Custo ====================

  async getCostCenters(): Promise<ApiResponse<CostCenter[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockCostCenters,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/cost-centers`);
    return response.data;
  }

  async getCostCenterById(id: number): Promise<ApiResponse<CostCenter>> {
    if (USE_MOCK) {
      const center = mockCostCenters.find((c) => c.id === id);
      if (!center) {
        return Promise.reject({ message: 'Centro de custo não encontrado' });
      }
      return Promise.resolve({
        data: center,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/cost-centers/${id}`);
    return response.data;
  }

  async createCostCenter(data: Partial<CostCenter>): Promise<ApiResponse<CostCenter>> {
    if (USE_MOCK) {
      const newCenter: CostCenter = {
        id: mockIdCounter++,
        code: data.code || '',
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'material',
        parentId: data.parentId || null,
        level: data.level || 1,
        isActive: data.isActive !== undefined ? data.isActive : true,
        budget: data.budget || {
          allocated: 0,
          consumed: 0,
          remaining: 0,
          percentage: 0,
        },
        keywords: data.keywords || [],
        color: data.color || '#3b82f6',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      mockCostCenters.push(newCenter);
      return Promise.resolve({
        data: newCenter,
        success: true,
      });
    }
    const response = await axios.post(`${URL}/cost-centers`, data);
    return response.data;
  }

  async updateCostCenter(id: number, data: Partial<CostCenter>): Promise<ApiResponse<CostCenter>> {
    if (USE_MOCK) {
      const index = mockCostCenters.findIndex((c) => c.id === id);
      if (index === -1) {
        return Promise.reject({ message: 'Centro de custo não encontrado' });
      }
      mockCostCenters[index] = {
        ...mockCostCenters[index],
        ...data,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return Promise.resolve({
        data: mockCostCenters[index],
        success: true,
      });
    }
    const response = await axios.put(`${URL}/cost-centers/${id}`, data);
    return response.data;
  }

  async deleteCostCenter(id: number): Promise<ApiResponse<void>> {
    if (USE_MOCK) {
      const index = mockCostCenters.findIndex((c) => c.id === id);
      if (index === -1) {
        return Promise.reject({ message: 'Centro de custo não encontrado' });
      }
      mockCostCenters.splice(index, 1);
      return Promise.resolve({
        data: undefined,
        success: true,
      });
    }
    const response = await axios.delete(`${URL}/cost-centers/${id}`);
    return response.data;
  }

  // ==================== Hierarquia ====================

  async getCostCenterChildren(parentId: number): Promise<ApiResponse<CostCenter[]>> {
    if (USE_MOCK) {
      const children = mockCostCenters.filter((c) => c.parentId === parentId);
      return Promise.resolve({
        data: children,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/cost-centers/${parentId}/children`);
    return response.data;
  }

  async getCostCenterTree(): Promise<ApiResponse<CostCenter[]>> {
    if (USE_MOCK) {
      // Retorna apenas os de nível 1 (raízes), a UI constrói a árvore
      const roots = mockCostCenters.filter((c) => c.parentId === null);
      return Promise.resolve({
        data: roots,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/cost-centers/tree`);
    return response.data;
  }

  // ==================== Regras de Classificação ====================

  async getClassificationRules(): Promise<ApiResponse<ClassificationRule[]>> {
    if (USE_MOCK) {
      return Promise.resolve({
        data: mockRules,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/rules`);
    return response.data;
  }

  async getClassificationRuleById(id: number): Promise<ApiResponse<ClassificationRule>> {
    if (USE_MOCK) {
      const rule = mockRules.find((r) => r.id === id);
      if (!rule) {
        return Promise.reject({ message: 'Regra não encontrada' });
      }
      return Promise.resolve({
        data: rule,
        success: true,
      });
    }
    const response = await axios.get(`${URL}/rules/${id}`);
    return response.data;
  }

  async createClassificationRule(
    data: Partial<ClassificationRule>
  ): Promise<ApiResponse<ClassificationRule>> {
    if (USE_MOCK) {
      const newRule: ClassificationRule = {
        id: mockRuleIdCounter++,
        costCenterId: data.costCenterId || 0,
        name: data.name || '',
        description: data.description || '',
        keywords: data.keywords || [],
        priority: data.priority || 5,
        isActive: data.isActive !== undefined ? data.isActive : true,
        matchType: data.matchType || 'contains',
        conditions: data.conditions || [],
        confidence: data.confidence || 80,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      mockRules.push(newRule);
      return Promise.resolve({
        data: newRule,
        success: true,
      });
    }
    const response = await axios.post(`${URL}/rules`, data);
    return response.data;
  }

  async updateClassificationRule(
    id: number,
    data: Partial<ClassificationRule>
  ): Promise<ApiResponse<ClassificationRule>> {
    if (USE_MOCK) {
      const index = mockRules.findIndex((r) => r.id === id);
      if (index === -1) {
        return Promise.reject({ message: 'Regra não encontrada' });
      }
      mockRules[index] = {
        ...mockRules[index],
        ...data,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      return Promise.resolve({
        data: mockRules[index],
        success: true,
      });
    }
    const response = await axios.put(`${URL}/rules/${id}`, data);
    return response.data;
  }

  async deleteClassificationRule(id: number): Promise<ApiResponse<void>> {
    if (USE_MOCK) {
      const index = mockRules.findIndex((r) => r.id === id);
      if (index === -1) {
        return Promise.reject({ message: 'Regra não encontrada' });
      }
      mockRules.splice(index, 1);
      return Promise.resolve({
        data: undefined,
        success: true,
      });
    }
    const response = await axios.delete(`${URL}/rules/${id}`);
    return response.data;
  }

  // ==================== Classificação Automática ====================

  async classifyItem(itemDescription: string): Promise<ApiResponse<{
    costCenter: CostCenter;
    rule: ClassificationRule;
    confidence: number;
  }>> {
    if (USE_MOCK) {
      // Busca regra que corresponda à descrição
      const matchedRule = mockRules
        .filter((r) => r.isActive)
        .sort((a, b) => b.priority - a.priority)
        .find((rule) => {
          return rule.keywords.some((keyword) =>
            itemDescription.toLowerCase().includes(keyword.toLowerCase())
          );
        });

      if (matchedRule) {
        const costCenter = mockCostCenters.find((c) => c.id === matchedRule.costCenterId);
        if (costCenter) {
          return Promise.resolve({
            data: {
              costCenter,
              rule: matchedRule,
              confidence: matchedRule.confidence,
            },
            success: true,
          });
        }
      }

      // Fallback: classifica como Materiais genérico
      return Promise.resolve({
        data: {
          costCenter: mockCostCenters[0], // MAT
          rule: mockRules[0],
          confidence: 50,
        },
        success: true,
      });
    }
    const response = await axios.post(`${URL}/classify`, { description: itemDescription });
    return response.data;
  }

  async batchClassify(items: { id: number; description: string }[]): Promise<
    ApiResponse<{
      itemId: number;
      costCenter: CostCenter;
      rule: ClassificationRule;
      confidence: number;
    }[]>
  > {
    if (USE_MOCK) {
      const results = items.map((item) => {
        const matchedRule = mockRules
          .filter((r) => r.isActive)
          .sort((a, b) => b.priority - a.priority)
          .find((rule) => {
            return rule.keywords.some((keyword) =>
              item.description.toLowerCase().includes(keyword.toLowerCase())
            );
          });

        const costCenter = matchedRule
          ? mockCostCenters.find((c) => c.id === matchedRule.costCenterId)
          : mockCostCenters[0];

        return {
          itemId: item.id,
          costCenter: costCenter || mockCostCenters[0],
          rule: matchedRule || mockRules[0],
          confidence: matchedRule?.confidence || 50,
        };
      });

      return Promise.resolve({
        data: results,
        success: true,
      });
    }
    const response = await axios.post(`${URL}/classify/batch`, { items });
    return response.data;
  }
}

export default new ClassificationService();
