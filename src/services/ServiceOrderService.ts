import api from '@/lib/axios';
import {
  CreateServiceOrder,
  ServiceOrder,
} from '@/interfaces/ServiceOrderInterface';

const URL = '/service-orders';

export const createServiceOrder = async (data: Partial<CreateServiceOrder>) => {
  try {
    const response = await api.post(URL, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    throw error;
  }
};

export const getAllServiceOrders = async (projectId?: number) => {
  try {
    const url = projectId ? `${URL}?projectId=${projectId}` : URL;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    throw error;
  }
};

export const getServiceOrderById = async (serviceOrderId: string) => {
  try {
    const response = await api.get(`${URL}/${serviceOrderId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    throw error;
  }
};

export const getServiceOrderByProjectId = async (projectId: string) => {
  try {
    const response = await api.get(`${URL}/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    throw error;
  }
};

export const updateServiceOrder = async (
  serviceOrderId: string,
  data: Partial<CreateServiceOrder>
) => {
  try {
    const response = await api.put(`${URL}/${serviceOrderId}`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    throw error;
  }
};

export const deleteServiceOrder = async (serviceOrderId: string) => {
  try {
    await api.delete(`${URL}/${serviceOrderId}`);
  } catch (error) {
    console.error('Erro ao excluir ordem de serviço:', error);
    throw error;
  }
};

export const updateServiceOrderProgress = async (
  id: number,
  progress: number
) => {
  return api.patch(`${URL}/progress/${id}`, { progress });
};

// ============================================
// FASE 1 PCP: Métodos de Integração com Orçamento
// ============================================

const USE_MOCK_PCP = true; // Frontend-only mode

/**
 * Vincula orçamento a Service Order
 * FASE 1 PCP - Mock completo para frontend
 */
export const vincularOrcamento = async (
  osId: number,
  orcamentoId: string,
  composicaoIds: string[]
): Promise<ServiceOrder> => {
  if (!USE_MOCK_PCP) {
    const response = await api.post(`${URL}/${osId}/vincular-orcamento`, {
      orcamentoId,
      composicaoIds
    });
    return response.data;
  }

  // MOCK: Simula vinculação (modo frontend-only)
  // Retorna objeto mockado completo sem depender do backend
  const osMock: ServiceOrder = {
    id: osId,
    serviceOrderNumber: `OS-${String(osId).padStart(4, '0')}`,
    description: 'Service Order Mock',
    status: 'em_andamento',
    notes: 'OS vinculada a orçamento via mock',
    createdAt: new Date().toISOString(),
    startDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    quantity: 0,
    weight: '0',
    projectNumber: 'PROJ-001',
    progress: 0,
    projectId: {
      id: 1,
      name: 'Projeto Mock',
      groupNumber: 1,
      client: 'Cliente Mock',
      address: '',
      startDate: new Date().toISOString(),
      endDate: null,
      observation: '',
      status: 'Em andamento'
    },
    assignedUser: null,
    // Campos PCP vinculados
    orcamentoId,
    composicaoIds,
    custoPlanejado: 16132.50,
    custoReal: 0,
    varianceCusto: 0
  };

  return osMock;
};

/**
 * Calcula custo planejado de uma OS (soma das composições vinculadas)
 */
export const calcularCustoPlanejado = async (osId: number): Promise<number> => {
  if (!USE_MOCK_PCP) {
    const response = await api.get(`${URL}/${osId}/custo-planejado`);
    return response.data.custoPlanejado;
  }

  // MOCK: Retorna valor mockado
  return 16132.50;
};

/**
 * Calcula custo real de uma OS (agregação de atividades)
 */
export const calcularCustoReal = async (osId: number): Promise<number> => {
  if (!USE_MOCK_PCP) {
    const response = await api.get(`${URL}/${osId}/custo-real`);
    return response.data.custoReal;
  }

  // MOCK: Simula custo real com alguma variance
  return 16850.20; // 4.4% acima do planejado
};

/**
 * Obtém variance (diferença entre planejado e real)
 */
export const getVariance = async (osId: number): Promise<{
  planejado: number;
  real: number;
  variance: number;
  variancePercentual: number;
}> => {
  if (!USE_MOCK_PCP) {
    const response = await api.get(`${URL}/${osId}/variance`);
    return response.data;
  }

  // MOCK: Calcula variance
  const planejado = await calcularCustoPlanejado(osId);
  const real = await calcularCustoReal(osId);
  const variance = real - planejado;
  const variancePercentual = (variance / planejado) * 100;

  return {
    planejado,
    real,
    variance,
    variancePercentual: Number(variancePercentual.toFixed(2))
  };
};
