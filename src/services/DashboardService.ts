
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
    console.log('Atividades totais:', activities.length);
    console.log('Filtros aplicados:', { macroTaskId, processId, obraId, serviceOrderId, period });

    // Filtra as atividades com base nos parâmetros fornecidos
    let filteredActivities = activities
      .filter(activity => {
        let matchMacroTask = true;
        let matchProcess = true;
        let matchObra = true;
        let matchServiceOrder = true;

        if (macroTaskId !== null && macroTaskId !== undefined) {
          matchMacroTask = activity.macroTask?.id === macroTaskId;
        }

        if (processId !== null && processId !== undefined) {
          matchProcess = activity.process?.id === processId;
        }

        if (obraId !== null && obraId !== undefined) {
          console.log(`Comparando obraId: ${obraId} com project.id: ${activity.project?.id}`);
          matchObra = activity.project?.id === obraId;
        }

        if (serviceOrderId !== null && serviceOrderId !== undefined) {
          console.log(`Comparando serviceOrderId: ${serviceOrderId} com serviceOrder.id: ${activity.serviceOrder?.id}`);
          matchServiceOrder = Number(activity.serviceOrder?.id) === serviceOrderId;
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
        serviceOrder: activity.serviceOrder || { serviceOrderNumber: 'N/A', id: null }
      }));
    
    console.log('Atividades filtradas após aplicar todos os filtros:', filteredActivities.length);

    // Aplica filtro de período se necessário
    if (period && period !== 'todos') {
      filteredActivities = filterDataByPeriod(filteredActivities, period);
      console.log('Atividades filtradas após aplicar filtro de período:', filteredActivities.length);
    }

    return filteredActivities;
  } catch (error) {
    console.error('Erro ao buscar atividades filtradas:', error);
    return [];
  }
};
