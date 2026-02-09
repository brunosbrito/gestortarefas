import api from '@/lib/axios';

/**
 * Converte string de tempo (formato "Xh Ymin" ou "Xh" ou "Ymin") para horas decimais
 */
const parseTimeToHours = (timeString: string | null | undefined): number => {
  if (!timeString || typeof timeString !== 'string') {
    return 0;
  }

  // Tenta extrair horas e minutos do formato "Xh Ymin"
  const hoursMatch = timeString.match(/(\d+)\s*h/i);
  const minutesMatch = timeString.match(/(\d+)\s*min/i);

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

  return hours + (minutes / 60);
};

/**
 * Converte totalTime (que vem em minutos da API) para horas decimais
 */
const getTotalTimeInHours = (totalTime: number | string | null | undefined): number => {
  if (totalTime === null || totalTime === undefined) {
    return 0;
  }

  // Se for string, tenta converter para número
  const numericValue = typeof totalTime === 'string' ? parseFloat(totalTime) : totalTime;

  if (isNaN(numericValue) || numericValue < 0) {
    return 0;
  }

  // totalTime vem em minutos, converter para horas
  return numericValue / 60;
};

export const dataMacroTask = async (obraId?: number | null, serviceOrderId?: number | null) => {
  try {
    const response = await api.get('/activities');
    let activities = response.data.filter((x: any) => x.status === 'Concluídas' || x.status === 'Concluída');

    // Aplicar filtros antes da agregação
    if (obraId !== null && obraId !== undefined) {
      activities = activities.filter(activity => {
        if (!activity.project) return false;
        
        const activityProjectId = typeof activity.project.id === 'string' 
          ? Number(activity.project.id) 
          : activity.project.id;
          
        return activityProjectId === obraId;
      });
    }

    if (serviceOrderId !== null && serviceOrderId !== undefined) {
      activities = activities.filter(activity => {
        if (!activity.serviceOrder) return false;
        
        const activityServiceOrderId = typeof activity.serviceOrder.id === 'string' 
          ? Number(activity.serviceOrder.id) 
          : activity.serviceOrder.id;
          
        return activityServiceOrderId === serviceOrderId;
      });
    }

    // Agrupar por macroTaskId
    const groupedData = activities.reduce((acc: any, activity: any) => {
      // Verificar se macroTask existe antes de acessar suas propriedades
      if (!activity.macroTask) return acc;

      const macroTaskId = activity.macroTask.id;
      const macroTaskName = activity.macroTask.name || 'Não especificado';

      if (!macroTaskId) return acc;
      
      const key = macroTaskId.toString();
      
      if (!acc[key]) {
        acc[key] = {
          macroTaskId,
          macroTask: macroTaskName,
          activityCount: 0,
          estimatedHours: 0,
          actualHours: 0,
          hoursDifference: 0,
          createdAt: new Date(activity.createdAt) // Adiciona data de criação para filtro
        };
      }

      const estimatedHours = parseTimeToHours(activity.estimatedTime);
      const actualHours = getTotalTimeInHours(activity.totalTime);

      acc[key].activityCount += 1;
      acc[key].estimatedHours += estimatedHours;
      acc[key].actualHours += actualHours;

      // Calcular diferença percentual limitada entre -100% e 100%
      if (acc[key].estimatedHours > 0) {
        const diff = ((acc[key].actualHours - acc[key].estimatedHours) / acc[key].estimatedHours) * 100;
        acc[key].hoursDifference = Math.max(-100, Math.min(100, Math.round(diff)));
      } else {
        acc[key].hoursDifference = 0;
      }
      
      // Usa a data mais recente se existir múltiplas atividades
      if (activity.createdAt) {
        const activityDate = new Date(activity.createdAt);
        if (!acc[key].createdAt || activityDate > acc[key].createdAt) {
          acc[key].createdAt = activityDate;
        }
      }

      return acc;
    }, {});

    // Convertendo para um array
    return Object.values(groupedData);
  } catch (error) {
    return [];
  }
};

export const dataProcess = async (obraId?: number | null, serviceOrderId?: number | null) => {
  try {
    const response = await api.get('/activities');
    let activities = response.data.filter((x: any) => x.status === 'Concluídas' || x.status === 'Concluída');

    // Aplicar filtros antes da agregação
    if (obraId !== null && obraId !== undefined) {
      activities = activities.filter(activity => {
        if (!activity.project) return false;
        
        const activityProjectId = typeof activity.project.id === 'string' 
          ? Number(activity.project.id) 
          : activity.project.id;
          
        return activityProjectId === obraId;
      });
    }

    if (serviceOrderId !== null && serviceOrderId !== undefined) {
      activities = activities.filter(activity => {
        if (!activity.serviceOrder) return false;
        
        const activityServiceOrderId = typeof activity.serviceOrder.id === 'string' 
          ? Number(activity.serviceOrder.id) 
          : activity.serviceOrder.id;
          
        return activityServiceOrderId === serviceOrderId;
      });
    }

    // Agrupar por processId
    const groupedData = activities.reduce((acc: any, activity: any) => {
      // Verificar se process existe antes de acessar suas propriedades
      if (!activity.process) return acc;

      const processId = activity.process.id;
      const processName = activity.process.name || 'Não especificado';

      if (!processId) return acc;
      
      const key = processId.toString();
      
      if (!acc[key]) {
        acc[key] = {
          processId,
          process: processName,
          activityCount: 0,
          estimatedHours: 0,
          actualHours: 0,
          hoursDifference: 0,
          createdAt: new Date(activity.createdAt) // Adiciona data de criação para filtro
        };
      }

      const estimatedHours = parseTimeToHours(activity.estimatedTime);
      const actualHours = getTotalTimeInHours(activity.totalTime);

      acc[key].activityCount += 1;
      acc[key].estimatedHours += estimatedHours;
      acc[key].actualHours += actualHours;

      // Calcular diferença percentual limitada entre -100% e 100%
      if (acc[key].estimatedHours > 0) {
        const diff = ((acc[key].actualHours - acc[key].estimatedHours) / acc[key].estimatedHours) * 100;
        acc[key].hoursDifference = Math.max(-100, Math.min(100, Math.round(diff)));
      } else {
        acc[key].hoursDifference = 0;
      }
      
      // Usa a data mais recente se existir múltiplas atividades
      if (activity.createdAt) {
        const activityDate = new Date(activity.createdAt);
        if (!acc[key].createdAt || activityDate > acc[key].createdAt) {
          acc[key].createdAt = activityDate;
        }
      }

      return acc;
    }, {});

    // Convertendo para um array
    return Object.values(groupedData);
  } catch (error) {
    return [];
  }
};

export const dataCollaborators = async (obraId?: number | null, serviceOrderId?: number | null) => {
  try {
    const response = await api.get('/activities');
    let activities = response.data.filter((x: any) => x.status === 'Concluídas' || x.status === 'Concluída');

    // Aplicar filtros antes da agregação
    if (obraId !== null && obraId !== undefined) {
      activities = activities.filter(activity => {
        if (!activity.project) return false;
        
        const activityProjectId = typeof activity.project.id === 'string' 
          ? Number(activity.project.id) 
          : activity.project.id;
          
        return activityProjectId === obraId;
      });
    }

    if (serviceOrderId !== null && serviceOrderId !== undefined) {
      activities = activities.filter(activity => {
        if (!activity.serviceOrder) return false;
        
        const activityServiceOrderId = typeof activity.serviceOrder.id === 'string' 
          ? Number(activity.serviceOrder.id) 
          : activity.serviceOrder.id;
          
        return activityServiceOrderId === serviceOrderId;
      });
    }

    // Agrupar por colaboradorId
    const groupedData = activities.reduce((acc: any, activity: any) => {
      // Verifica se tem equipe atribuída
      if (!activity.team || !Array.isArray(activity.team)) return acc;
      
      // Processa cada membro da equipe
      activity.team.forEach((member: any) => {
        const id = member.id;
        const name = member.name || 'Não especificado';
        const role = member.role || 'Não especificado';
        
        if (!id) return;
        
        const key = id.toString();
        
        if (!acc[key]) {
          acc[key] = {
            id,
            name,
            role,
            activityCount: 0,
            hoursWorked: 0,
            createdAt: new Date(activity.createdAt)
          };
        }
        
        acc[key].activityCount += 1;

        // Calcula horas trabalhadas, considerando a distribuição por membro
        const totalHours = getTotalTimeInHours(activity.totalTime);
        const teamSize = activity.team.length;
        const hoursPerMember = teamSize > 0 ? totalHours / teamSize : totalHours;

        acc[key].hoursWorked += hoursPerMember;
        
        // Atualiza a data mais recente
        if (activity.createdAt) {
          const activityDate = new Date(activity.createdAt);
          if (!acc[key].createdAt || activityDate > acc[key].createdAt) {
            acc[key].createdAt = activityDate;
          }
        }
      });
      
      return acc;
    }, {});

    // Convertendo para um array
    return Object.values(groupedData);
  } catch (error) {
    return [];
  }
};
