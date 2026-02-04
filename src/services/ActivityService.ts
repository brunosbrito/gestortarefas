import api from '@/lib/axios';

export const createActivity = async (data: FormData) => {
  try {
    const response = await api.post('/activities', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating activity', error);
    throw error;
  }
};

// Função para obter todas as atividades
export const getAllActivities = async () => {
  try {
    const response = await api.get('/activities');
    return response.data;
  } catch (error) {
    console.error('Error fetching activities', error);
    throw error;
  }
};

// Função para obter apenas atividades programadas
export const getScheduledActivities = async () => {
  try {
    const response = await api.get('/activities?status=Planejadas');
    return response.data;
  } catch (error) {
    console.error('Error fetching scheduled activities', error);
    throw error;
  }
};

export const getActivitiesByServiceOrderId = async (serviceOrderId: string | undefined) => {
  if (!serviceOrderId) {
    throw new Error('Service Order ID is required');
  }

  try {
    const response = await api.get(`/activities/service-order/${serviceOrderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activities', error);
    throw error;
  }
};

// Função para atualizar uma atividade
export const updateActivity = async (id: number, data: any) => {
  try {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating activity', error);
    throw error;
  }
};

export const updateCompletedQuantity = async (
  id: number,
  completedQuantity: number,
  changedBy: number
) => {
  try {
    const response = await api.patch(`/activities/${id}/completedQuantity`, {
      completedQuantity,
      changedBy,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating activity', error);
    throw error;
  }
};

// Função para excluir uma atividade
export const deleteActivity = async (id: number) => {
  try {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting activity', error);
    throw error;
  }
};

// ============================================
// FASE 1 PCP: Métodos de Integração com Orçamento
// ============================================

const USE_MOCK_PCP = true; // Frontend-only mode

/**
 * Vincula atividade a item de composição do orçamento
 */
export const vincularItemOrcamento = async (
  atividadeId: number,
  itemComposicaoId: string
): Promise<any> => {
  if (!USE_MOCK_PCP) {
    const response = await api.post(`/activities/${atividadeId}/vincular-item-orcamento`, {
      itemComposicaoId
    });
    return response.data;
  }

  // MOCK: Simula vinculação
  return {
    id: atividadeId,
    itemComposicaoId,
    custoPlanejado: 4250, // Mock
    quantidadePlanejada: 500,
    message: 'Item do orçamento vinculado com sucesso'
  };
};

/**
 * Registra consumo de materiais e horas trabalhadas em uma atividade
 */
export const registrarConsumo = async (
  atividadeId: number,
  consumo: {
    materiais?: Array<{ itemId: string; quantidade: number; }>;
    horasTrabalhadas?: number;
    quantidadeExecutada?: number;
  }
): Promise<any> => {
  if (!USE_MOCK_PCP) {
    const response = await api.post(`/activities/${atividadeId}/registrar-consumo`, consumo);
    return response.data;
  }

  // MOCK: Simula registro de consumo
  const custoMateriais = consumo.materiais?.reduce((sum, m) => sum + (m.quantidade * 8.50), 0) || 0;
  const custoHoras = (consumo.horasTrabalhadas || 0) * 35; // R$ 35/hora mock
  const custoTotal = custoMateriais + custoHoras;

  return {
    id: atividadeId,
    materiais: consumo.materiais,
    horasTrabalhadas: consumo.horasTrabalhadas,
    quantidadeRealizada: consumo.quantidadeExecutada,
    custoReal: custoTotal,
    message: 'Consumo registrado com sucesso'
  };
};

/**
 * Calcula custo real de uma atividade
 */
export const calcularCustoReal = async (atividadeId: number): Promise<{
  custoPlanejado: number;
  custoReal: number;
  variance: number;
  quantidadePlanejada: number;
  quantidadeRealizada: number;
}> => {
  if (!USE_MOCK_PCP) {
    const response = await api.get(`/activities/${atividadeId}/custo-real`);
    return response.data;
  }

  // MOCK: Retorna dados mockados com alguma variance
  return {
    custoPlanejado: 4250,
    custoReal: 4420, // 4% acima do planejado
    variance: 170,
    quantidadePlanejada: 500,
    quantidadeRealizada: 520 // Consumiu mais material
  };
};
