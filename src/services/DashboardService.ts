import { FilteredActivity } from '@/interfaces/DashboardFilters';
import { getAllActivities } from './ActivityService';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';
import { filterDataByPeriod } from '@/utils/dateFilter';

export const getFilteredActivities = async (
  macroTaskId?: number | null,
  processId?: number | null,
  obraId?: number | null,
  serviceOrderId?: number | null,
  collaboratorId?: number | null,
  period?: PeriodFilterType,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<FilteredActivity[]> => {
  try {
    const activities = await getAllActivities();

    // Filtra as atividades com base nos parâmetros fornecidos
    let filteredActivities = activities
      .filter((activity) => {
        let matchMacroTask = true;
        let matchProcess = true;
        let matchObra = true;
        let matchServiceOrder = true;
        let matchCollaborator = true;

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
            const activityProjectId =
              typeof activity.project.id === 'string'
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
            const activityServiceOrderId =
              typeof activity.serviceOrder.id === 'string'
                ? Number(activity.serviceOrder.id)
                : activity.serviceOrder.id;

            matchServiceOrder = activityServiceOrderId === serviceOrderId;
          }
        }

        // Filtro por Colaborador
        if (collaboratorId !== null && collaboratorId !== undefined) {
          if (!activity.collaborators || activity.collaborators.length === 0) {
            matchCollaborator = false;
          } else {
            matchCollaborator = activity.collaborators.some((collaborator) => {
              const colabId =
                typeof collaborator.id === 'string'
                  ? Number(collaborator.id)
                  : collaborator.id;
              return colabId === collaboratorId;
            });
          }
        }

        const shouldInclude =
          matchMacroTask &&
          matchProcess &&
          matchObra &&
          matchServiceOrder &&
          matchCollaborator;
        return shouldInclude;
      })
      .map((activity) => {
        // Calcular tempo total baseado nas horas trabalhadas
        const totalTime = activity.totalTime || 0;

        // Tempo estimado da atividade
        const estimatedTime = activity.estimatedTime || 0;

        // Equipe da atividade
        const team = activity.collaborators?.map((collab) => collab.name) || [];

        // Calcular KPIs
        const progress = activity.progress || 0;

        return {
          id: activity.id,
          description: activity.description,
          status: activity.status || 'Não especificado',
          macroTask: activity.macroTask?.name || 'Não especificado',
          macroTaskId: activity.macroTask?.id || null,
          process: activity.process?.name || 'Não especificado',
          processId: activity.process?.id || null,
          projectName: activity.project?.name || 'N/A',
          projectId: activity.project?.id || null,
          totalTime,
          estimatedTime,
          team,
          progress,
          createdAt: activity.createdAt,
          serviceOrder: activity.serviceOrder || {
            serviceOrderNumber: 'N/A',
            id: null,
          },
        };
      });

    // Aplica filtro de período ou datas personalizadas se necessário
    if (period) {
      if (period === 'personalizado' && (startDate || endDate)) {
        // Usa datas personalizadas
        filteredActivities = filterDataByPeriod(
          filteredActivities,
          period,
          startDate,
          endDate
        );
      } else if (period !== 'todos') {
        // Usa períodos predefinidos
        filteredActivities = filterDataByPeriod(filteredActivities, period);
      }
    }

    return filteredActivities;
  } catch (error) {
    console.error('Erro ao buscar atividades filtradas:', error);
    return [];
  }
};
