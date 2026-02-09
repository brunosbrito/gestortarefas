import { useMemo } from 'react';
import { Activity } from '@/interfaces/AtividadeInterface';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { GanttTask, GanttGroupBy } from '@/interfaces/GanttInterface';

// Tipo genérico para atividades (aceita Activity ou AtividadeStatus)
type ActivityLike = Activity | AtividadeStatus;

const statusToProgress: Record<string, number> = {
  'Planejado': 0,
  'Planejadas': 0,
  'Pendente': 0,
  'Em andamento': 50,
  'Em execução': 50,
  'Concluída': 100,
  'Concluídas': 100,
  'Paralizadas': 25,
};

function transformActivityToGantt(activity: ActivityLike, parentID?: number): GanttTask {
  // Tentar obter data de início: startDate > originalStartDate > createdAt
  let startDate: Date | null = null;
  if (activity.startDate) {
    startDate = new Date(activity.startDate);
  } else if ('originalStartDate' in activity && activity.originalStartDate) {
    startDate = new Date(activity.originalStartDate);
  } else if ('createdAt' in activity && activity.createdAt) {
    startDate = new Date(activity.createdAt);
  }

  const endDate = activity.endDate ? new Date(activity.endDate) : null;

  let duration: number | undefined;
  if (startDate && endDate) {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  } else if (activity.estimatedTime) {
    const estimatedHours = parseFloat(activity.estimatedTime);
    duration = Math.ceil(estimatedHours / 8) || 1;
  } else {
    // Default de 1 dia para atividades planejadas sem duração definida
    duration = 1;
  }

  const collaboratorCount = Array.isArray(activity.collaborators)
    ? activity.collaborators.length
    : 0;
  const collaboratorNames = collaboratorCount > 0
    ? `${collaboratorCount} colaborador(es)`
    : '';

  return {
    TaskID: activity.id,
    TaskName: activity.description,
    StartDate: startDate,
    EndDate: endDate,
    Duration: duration,
    Progress: statusToProgress[activity.status] ?? 0,
    Status: activity.status,
    Collaborators: collaboratorNames,
    ActivityId: activity.id,
    ParentID: parentID,
    isGroup: false,
  };
}

function getGroupKey(activity: ActivityLike, groupBy: GanttGroupBy): string {
  switch (groupBy) {
    case 'obra':
      // Verificar se é AtividadeStatus (tem project como objeto)
      if ('project' in activity && typeof activity.project === 'object' && activity.project) {
        return activity.project.name || 'Sem Obra';
      }
      return 'Sem Obra';

    case 'tarefaMacro':
      const macro = activity.macroTask;
      if (typeof macro === 'object' && macro !== null) {
        return (macro as any).name || 'Sem Tarefa Macro';
      }
      return macro?.toString() || 'Sem Tarefa Macro';

    case 'colaborador':
      if (Array.isArray(activity.collaborators) && activity.collaborators.length > 0) {
        const firstCollab = activity.collaborators[0];
        if (typeof firstCollab === 'object' && firstCollab !== null) {
          return (firstCollab as any).name || 'Sem Colaborador';
        }
        return firstCollab?.toString() || 'Sem Colaborador';
      }
      return 'Sem Colaborador';

    default:
      return 'default';
  }
}

function getGroupId(groupKey: string, groupBy: GanttGroupBy): number {
  // Criar ID único negativo para grupos baseado no hash da string
  let hash = 0;
  const str = `${groupBy}-${groupKey}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return -Math.abs(hash) - 1;
}

function calculateGroupProgress(activities: ActivityLike[]): number {
  if (activities.length === 0) return 0;
  const totalProgress = activities.reduce((sum, activity) => {
    return sum + (statusToProgress[activity.status] ?? 0);
  }, 0);
  return Math.round(totalProgress / activities.length);
}

function getActivityStartDate(activity: ActivityLike): Date | null {
  if (activity.startDate) {
    return new Date(activity.startDate);
  }
  if ('originalStartDate' in activity && activity.originalStartDate) {
    return new Date(activity.originalStartDate);
  }
  if ('createdAt' in activity && activity.createdAt) {
    return new Date(activity.createdAt);
  }
  return null;
}

function createGroupTask(
  groupKey: string,
  groupBy: GanttGroupBy,
  activities: ActivityLike[]
): GanttTask {
  const groupId = getGroupId(groupKey, groupBy);

  const dates = activities
    .map(a => getActivityStartDate(a))
    .filter((d): d is Date => d !== null)
    .map(d => d.getTime());

  const endDates = activities
    .filter(a => a.endDate)
    .map(a => new Date(a.endDate!).getTime());

  const startDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
  const endDate = endDates.length > 0 ? new Date(Math.max(...endDates)) : null;

  let duration: number | undefined;
  if (startDate && endDate) {
    duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  }

  return {
    TaskID: groupId,
    TaskName: groupKey,
    StartDate: startDate,
    EndDate: endDate,
    Duration: duration,
    Progress: calculateGroupProgress(activities),
    Status: 'Grupo',
    isGroup: true,
    Collaborators: `${activities.length} atividade(s)`,
  };
}

export function useGanttData(
  activities: ActivityLike[],
  groupBy: GanttGroupBy = null
): GanttTask[] {
  return useMemo(() => {
    if (!activities || activities.length === 0) return [];

    // Sem agrupamento - lista plana
    if (!groupBy) {
      return activities.map(activity => transformActivityToGantt(activity));
    }

    // Com agrupamento - criar hierarquia
    const groups = new Map<string, ActivityLike[]>();

    activities.forEach(activity => {
      const key = getGroupKey(activity, groupBy);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(activity);
    });

    const result: GanttTask[] = [];

    // Ordenar grupos alfabeticamente
    const sortedKeys = Array.from(groups.keys()).sort();

    sortedKeys.forEach(groupKey => {
      const groupActivities = groups.get(groupKey)!;

      // Criar tarefa pai (grupo)
      const parentTask = createGroupTask(groupKey, groupBy, groupActivities);
      result.push(parentTask);

      // Criar tarefas filhas
      groupActivities.forEach(activity => {
        const task = transformActivityToGantt(activity, parentTask.TaskID);
        result.push(task);
      });
    });

    return result;
  }, [activities, groupBy]);
}

export function transformActivitiesToGantt(
  activities: ActivityLike[],
  groupBy: GanttGroupBy = null
): GanttTask[] {
  if (!activities || activities.length === 0) return [];

  if (!groupBy) {
    return activities.map(activity => transformActivityToGantt(activity));
  }

  const groups = new Map<string, ActivityLike[]>();

  activities.forEach(activity => {
    const key = getGroupKey(activity, groupBy);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(activity);
  });

  const result: GanttTask[] = [];
  const sortedKeys = Array.from(groups.keys()).sort();

  sortedKeys.forEach(groupKey => {
    const groupActivities = groups.get(groupKey)!;
    const parentTask = createGroupTask(groupKey, groupBy, groupActivities);
    result.push(parentTask);

    groupActivities.forEach(activity => {
      const task = transformActivityToGantt(activity, parentTask.TaskID);
      result.push(task);
    });
  });

  return result;
}
