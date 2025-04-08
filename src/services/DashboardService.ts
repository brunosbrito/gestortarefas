
import axios from 'axios';
import { FilteredActivity } from '@/interfaces/DashboardFilters';
import { getAllActivities } from './ActivityService';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';
import { filterDataByPeriod } from '@/utils/dateFilter';

export const getFilteredActivities = async (
  macroTaskId?: number | null, 
  processId?: number | null,
  obraId?: number | null,
  serviceOrderId?: number | null,
  period?: PeriodFilterType
): Promise<FilteredActivity[]> => {
  try {
    const activities = await getAllActivities();

    // Filtra as atividades com base nos parâmetros fornecidos
    const filteredActivities = activities
      .filter(activity => {
        let matchMacroTask = true;
        let matchProcess = true;
        let matchObra = true;
        let matchServiceOrder = true;

        if (macroTaskId) {
          matchMacroTask = activity.macroTask?.id === macroTaskId;
        }

        if (processId) {
          matchProcess = activity.process?.id === processId;
        }

        if (obraId) {
          matchObra = activity.project?.id === obraId;
        }

        if (serviceOrderId) {
          matchServiceOrder = activity.serviceOrder?.id === serviceOrderId;
        }

        return matchMacroTask && matchProcess && matchObra && matchServiceOrder;
      })
      .map(activity => ({
        id: activity.id,
        description: activity.description,
        status: activity.status || 'Não especificado',
        macroTask: activity.macroTask?.name || 'Não especificado',
        macroTaskId: activity.macroTask?.id || null,
        process: activity.process?.name || 'Não especificado',
        processId: activity.process?.id || null,
        projectName: activity.project?.name || 'N/A',
        projectId: activity.project?.id || null,
        createdAt: activity.createdAt,
        serviceOrder: activity.serviceOrder
      }));

    // Aplica filtro de período se necessário
    if (period && period !== 'todos') {
      return filterDataByPeriod(filteredActivities, period);
    }

    return filteredActivities;
  } catch (error) {
    console.error('Erro ao buscar atividades filtradas:', error);
    return [];
  }
};
