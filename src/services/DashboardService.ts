
import { FilteredActivity } from '@/interfaces/DashboardFilters';
import { getAllActivities } from './ActivityService';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';
import { filterDataByPeriod } from '@/utils/dateFilter';

export const getFilteredActivities = async (
  macroTaskId?: number | null, 
  processId?: number | null,
  obraId?: number | null,
  serviceOrderId?: number | null,
  period?: PeriodFilterType,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<FilteredActivity[]> => {
  try {
    const activities = await getAllActivities();

    // Filtra as atividades com base nos parâmetros fornecidos
    let filteredActivities = activities
      .filter(activity => {
        let matchMacroTask = true;
        let matchProcess = true;
        let matchObra = true;
        let matchServiceOrder = true;

        // Filtro por Tarefa Macro
        if (macroTaskId !== null && macroTaskId !== undefined) {
          matchMacroTask = activity.macroTask?.id === macroTaskId;
        }

        // Filtro por Processo
        if (processId !== null && processId !== undefined) {
          matchProcess = activity.process?.id === processId;
        }

        // Filtro por Obra/Projeto
        if (obraId !== null && obraId !== undefined) {
          if (!activity.project) {
            matchObra = false;
          } else {
            const activityProjectId = typeof activity.project.id === 'string' 
              ? Number(activity.project.id) 
              : activity.project.id;
              
            matchObra = activityProjectId === obraId;
          }
        }

        // Filtro por Ordem de Serviço
        if (serviceOrderId !== null && serviceOrderId !== undefined) {
          if (!activity.serviceOrder) {
            matchServiceOrder = false;
          } else {
            const activityServiceOrderId = typeof activity.serviceOrder.id === 'string' 
              ? Number(activity.serviceOrder.id) 
              : activity.serviceOrder.id;
              
            matchServiceOrder = activityServiceOrderId === serviceOrderId;
          }
        }

        const shouldInclude = matchMacroTask && matchProcess && matchObra && matchServiceOrder;
        return shouldInclude;
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

    // Aplica filtro de período ou datas personalizadas se necessário
    if (period) {
      if (period === 'personalizado' && (startDate || endDate)) {
        // Usa datas personalizadas
        filteredActivities = filterDataByPeriod(filteredActivities, period, startDate, endDate);
      } else if (period !== 'todos') {
        // Usa períodos predefinidos
        filteredActivities = filterDataByPeriod(filteredActivities, period);
      }
    }

    return filteredActivities;
  } catch (error) {
    return [];
  }
};
