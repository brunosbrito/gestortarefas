
import API_URL from '@/config';
import axios from 'axios';

const parseTimeToHours = (timeString: string | null | undefined): number => {
  if (!timeString || typeof timeString !== 'string') {
    console.warn("Valor inválido para timeString:", timeString);
    return 0; // Retorna 0 horas se o valor for inválido
  }

  const match = timeString.match(/(\d+)h(?:\s*(\d+)min)?/);
  if (!match) {
    console.warn("Formato inválido para timeString:", timeString);
    return 0;
  }

  const hours = parseInt(match[1], 10) || 0;
  const minutes = match[2] ? parseInt(match[2], 10) / 60 : 0;
  
  return hours + minutes;
};


export const dataMacroTask = async () => {
  try {
    const response = await axios.get(`${API_URL}/activities`);
    const activities = response.data.filter((x: any) => x.status === 'Concluídas' || x.status === 'Concluída');

    // Agrupar por macroTaskId
    const groupedData = activities.reduce((acc: any, activity: any) => {
      const macroTaskId = activity.macroTaskId;
      const macroTaskName = activity.macroTask?.name || 'Não especificado';
      
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
      const actualHours = activity.totalTime || 0;

      acc[key].activityCount += 1;
      acc[key].estimatedHours += Math.round(estimatedHours);
      acc[key].actualHours += Math.round(actualHours);
      acc[key].hoursDifference = acc[key].estimatedHours > 0 
        ? Math.round((acc[key].actualHours / acc[key].estimatedHours) * 100)
        : 0;
      
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
    console.error('Error fetching activities', error);
    throw error;
  }
};

export const dataProcess = async () => {
  try {
    const response = await axios.get(`${API_URL}/activities`);
    const activities = response.data.filter((x: any) => x.status === 'Concluídas' || x.status === 'Concluída');

    // Agrupar por processId
    const groupedData = activities.reduce((acc: any, activity: any) => {
      const processId = activity.processId;
      const processName = activity.process?.name || 'Não especificado';
      
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
      const actualHours = activity.totalTime || 0;

      acc[key].activityCount += 1;
      acc[key].estimatedHours += Math.round(estimatedHours);
      acc[key].actualHours += Math.round(actualHours);
      acc[key].hoursDifference = acc[key].estimatedHours > 0 
        ? Math.round((acc[key].actualHours / acc[key].estimatedHours) * 100)
        : 0;
      
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
    console.error('Error fetching activities', error);
    throw error;
  }
};

export const dataCollaborators = async () => {
  try {
    const response = await axios.get(`${API_URL}/activities`);
    const activities = response.data.filter((x: any) => x.status === 'Concluídas' || x.status === 'Concluída');

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
        const totalHours = activity.totalTime || 0;
        const teamSize = activity.team.length;
        const hoursPerMember = teamSize > 0 ? totalHours / teamSize : 0;
        
        acc[key].hoursWorked += Math.round(hoursPerMember);
        
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
    console.error('Error fetching collaborator data', error);
    return [];
  }
};
