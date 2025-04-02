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
    const activities = response.data.filter(x => x.status == 'Concluídas');

    // Agrupar por macroTask
    const groupedData = activities.reduce((acc, activity) => {
      const { macroTask, estimatedTime, totalTime } = activity;

      if (!acc[macroTask]) {
        acc[macroTask] = {
          macroTask,
          activityCount: 0,
          estimatedHours: 0,
          actualHours: 0,
          hoursDifference: 0,
        };
      }

      const estimatedHours = parseTimeToHours(estimatedTime);
      const actualHours = totalTime;

      acc[macroTask].activityCount += 1;
      acc[macroTask].estimatedHours += Math.round(estimatedHours);
      acc[macroTask].actualHours += Math.round(actualHours);
      acc[macroTask].hoursDifference = Math.round((acc[macroTask].actualHours / acc[macroTask].estimatedHours) * 100) ;

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
    const activities = response.data.filter(x => x.status == 'Concluídas');

    // Agrupar por process
    const groupedData = activities.reduce((acc, activity) => {
      const { process, estimatedTime, totalTime } = activity;

      if (!acc[process]) {
        acc[process] = {
          process,
          activityCount: 0,
          estimatedHours: 0,
          actualHours: 0,
          hoursDifference: 0,
        };
      }

      const estimatedHours = parseTimeToHours(estimatedTime);
      const actualHours = totalTime;

      acc[process].activityCount += 1;
      acc[process].estimatedHours += Math.round(estimatedHours);
      acc[process].actualHours += Math.round(actualHours);
      acc[process].hoursDifference = Math.round((acc[process].actualHours / acc[process].estimatedHours) * 100) ;

      return acc;
    }, {});

    // Convertendo para um array
    return Object.values(groupedData);
  } catch (error) {
    console.error('Error fetching activities', error);
    throw error;
  }
};
