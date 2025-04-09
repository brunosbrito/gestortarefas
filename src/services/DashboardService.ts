
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
    console.log('Atividades totais antes da filtragem:', activities.length);
    console.log('Filtros aplicados:', { macroTaskId, processId, obraId, serviceOrderId, period });

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
          console.log(`Filtro MacroTask para atividade ${activity.id}: ${activity.macroTask?.id} === ${macroTaskId} = ${matchMacroTask}`);
        }

        // Filtro por Processo
        if (processId !== null && processId !== undefined) {
          matchProcess = activity.process?.id === processId;
          console.log(`Filtro Process para atividade ${activity.id}: ${activity.process?.id} === ${processId} = ${matchProcess}`);
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
            console.log(`Filtro Obra para atividade ${activity.id}: ${activityProjectId} === ${obraId} = ${matchObra}`);
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
            console.log(`Filtro OS para atividade ${activity.id}: ${activityServiceOrderId} === ${serviceOrderId} = ${matchServiceOrder}`);
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
    
    console.log('Atividades filtradas após aplicar filtros básicos:', filteredActivities.length);

    // Aplica filtro de período se necessário
    if (period && period !== 'todos') {
      const beforePeriodFilter = filteredActivities.length;
      filteredActivities = filterDataByPeriod(filteredActivities, period);
      console.log(`Atividades filtradas após aplicar filtro de período: ${filteredActivities.length} (redução de ${beforePeriodFilter - filteredActivities.length})`);
    }

    return filteredActivities;
  } catch (error) {
    console.error('Erro ao buscar atividades filtradas:', error);
    return [];
  }
};
