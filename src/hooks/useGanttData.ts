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

function getMacroTaskName(activity: ActivityLike): string {
  const macro = activity.macroTask;
  if (typeof macro === 'object' && macro !== null) {
    return (macro as { name?: string }).name || '';
  }
  return macro?.toString() || '';
}

function getProcessName(activity: ActivityLike): string {
  const process = activity.process;
  if (typeof process === 'object' && process !== null) {
    return (process as { name?: string }).name || '';
  }
  return process?.toString() || '';
}

function getProjectName(activity: ActivityLike): string {
  if ('project' in activity && typeof activity.project === 'object' && activity.project) {
    return activity.project.name || '';
  }
  return '';
}

function getServiceOrderNumber(activity: ActivityLike): string {
  if ('serviceOrder' in activity && typeof activity.serviceOrder === 'object' && activity.serviceOrder) {
    const so = activity.serviceOrder as { serviceOrderNumber?: string; description?: string };
    return so.serviceOrderNumber || '';
  }
  return '';
}

function getCreatedByName(activity: ActivityLike): string {
  if ('createdBy' in activity && typeof activity.createdBy === 'object' && activity.createdBy) {
    const user = activity.createdBy as { name?: string };
    return user.name || '';
  }
  return '';
}

function getCollaboratorNames(activity: ActivityLike): string {
  if (!Array.isArray(activity.collaborators) || activity.collaborators.length === 0) {
    return '';
  }

  const firstCollab = activity.collaborators[0];
  if (typeof firstCollab === 'object' && firstCollab !== null) {
    // AtividadeStatus com objetos Colaborador
    const names = activity.collaborators
      .slice(0, 3)
      .map((c: { name?: string }) => c.name || '')
      .filter(Boolean)
      .join(', ');
    if (activity.collaborators.length > 3) {
      return `${names} +${activity.collaborators.length - 3}`;
    }
    return names;
  }

  // Activity com IDs
  return `${activity.collaborators.length} colaborador(es)`;
}

// Função para normalizar data removendo o horário (apenas data)
function normalizeDate(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;
  // Criar nova data apenas com ano, mês e dia (sem horário)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function transformActivityToGantt(activity: ActivityLike, parentID?: number): GanttTask {
  // Debug: verificar dados da atividade
  console.log('Activity data:', {
    id: activity.id,
    project: 'project' in activity ? activity.project : undefined,
    serviceOrder: 'serviceOrder' in activity ? activity.serviceOrder : undefined,
    cod_sequencial: 'cod_sequencial' in activity ? activity.cod_sequencial : undefined,
  });

  // Tentar obter data de início: startDate > originalStartDate > createdAt
  let startDate: Date | null = null;
  if (activity.startDate) {
    startDate = normalizeDate(activity.startDate);
  } else if ('originalStartDate' in activity && activity.originalStartDate) {
    startDate = normalizeDate(activity.originalStartDate);
  } else if ('createdAt' in activity && activity.createdAt) {
    startDate = normalizeDate(activity.createdAt);
  }

  const endDate = normalizeDate(activity.endDate);

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

  // Formatar tempo estimado
  let estimatedTimeFormatted = '';
  if (activity.estimatedTime) {
    const hours = parseFloat(activity.estimatedTime);
    if (hours >= 1) {
      estimatedTimeFormatted = `${hours.toFixed(1)}h`;
    } else {
      estimatedTimeFormatted = `${Math.round(hours * 60)}min`;
    }
  }

  // Formatar data de criação
  let createdAtFormatted = '';
  if ('createdAt' in activity && activity.createdAt) {
    createdAtFormatted = new Date(activity.createdAt).toLocaleDateString('pt-BR');
  }

  // Formatar data prevista
  let plannedStartDateFormatted = '';
  if ('plannedStartDate' in activity && activity.plannedStartDate) {
    plannedStartDateFormatted = new Date(activity.plannedStartDate).toLocaleDateString('pt-BR');
  }

  return {
    TaskID: activity.id,
    TaskName: activity.description,
    StartDate: startDate,
    EndDate: endDate,
    Duration: duration,
    Progress: statusToProgress[activity.status] ?? 0,
    Status: activity.status,
    Collaborators: getCollaboratorNames(activity),
    ActivityId: activity.id,
    ParentID: parentID,
    isGroup: false,
    // Campos adicionais
    MacroTask: getMacroTaskName(activity),
    Process: getProcessName(activity),
    Project: getProjectName(activity),
    ServiceOrder: getServiceOrderNumber(activity),
    EstimatedTime: estimatedTimeFormatted,
    Quantity: 'quantity' in activity ? activity.quantity : undefined,
    CompletedQuantity: 'completedQuantity' in activity ? activity.completedQuantity : undefined,
    Observation: activity.observation || '',
    CreatedBy: getCreatedByName(activity),
    CreatedAt: createdAtFormatted,
    CodSequencial: 'cod_sequencial' in activity ? activity.cod_sequencial : undefined,
    PlannedStartDate: plannedStartDateFormatted || undefined,
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
    return normalizeDate(activity.startDate);
  }
  if ('originalStartDate' in activity && activity.originalStartDate) {
    return normalizeDate(activity.originalStartDate);
  }
  if ('createdAt' in activity && activity.createdAt) {
    return normalizeDate(activity.createdAt);
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
    .map(a => normalizeDate(a.endDate))
    .filter((d): d is Date => d !== null)
    .map(d => d.getTime());

  const startDate = dates.length > 0 ? normalizeDate(new Date(Math.min(...dates))) : null;
  const endDate = endDates.length > 0 ? normalizeDate(new Date(Math.max(...endDates))) : null;

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
      return activities.map((activity, index) => ({
        ...transformActivityToGantt(activity),
        Item: index + 1,
      }));
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
    let itemCounter = 1;

    // Ordenar grupos alfabeticamente
    const sortedKeys = Array.from(groups.keys()).sort();

    sortedKeys.forEach(groupKey => {
      const groupActivities = groups.get(groupKey)!;

      // Criar tarefa pai (grupo)
      const parentTask = createGroupTask(groupKey, groupBy, groupActivities);
      parentTask.Item = itemCounter++;
      result.push(parentTask);

      // Criar tarefas filhas
      groupActivities.forEach(activity => {
        const task = transformActivityToGantt(activity, parentTask.TaskID);
        task.Item = itemCounter++;
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
    return activities.map((activity, index) => ({
      ...transformActivityToGantt(activity),
      Item: index + 1,
    }));
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
  let itemCounter = 1;

  sortedKeys.forEach(groupKey => {
    const groupActivities = groups.get(groupKey)!;
    const parentTask = createGroupTask(groupKey, groupBy, groupActivities);
    parentTask.Item = itemCounter++;
    result.push(parentTask);

    groupActivities.forEach(activity => {
      const task = transformActivityToGantt(activity, parentTask.TaskID);
      task.Item = itemCounter++;
      result.push(task);
    });
  });

  return result;
}
