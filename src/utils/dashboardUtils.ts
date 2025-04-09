
import { ActivityStatusCounts } from '@/interfaces/DashboardDataTypes';

/**
 * Conta as atividades por status
 */
export const countActivitiesByStatus = (activities: any[]): ActivityStatusCounts => {
  return activities.reduce((counts: ActivityStatusCounts, activity) => {
    const status = activity.status || 'Não especificado';
    
    // Conta baseada nos status da atividade
    if (status.toLowerCase().includes('planejada')) counts.planejadas++;
    else if (status.toLowerCase().includes('execução')) counts.emExecucao++;
    else if (status.toLowerCase().includes('concluída')) counts.concluidas++;
    else if (status.toLowerCase().includes('paralizada')) counts.paralizadas++;
    
    return counts;
  }, { planejadas: 0, emExecucao: 0, concluidas: 0, paralizadas: 0 });
};

/**
 * Filtra atividades por obra ID
 */
export const filterActivitiesByObra = (activities: any[], obraId: number | null | undefined): any[] => {
  if (obraId === null || obraId === undefined) {
    return activities;
  }
  
  return activities.filter(activity => {
    if (!activity.project) return false;
    
    const activityProjectId = typeof activity.project.id === 'string' 
      ? Number(activity.project.id) 
      : activity.project.id;
      
    return activityProjectId === obraId;
  });
};

/**
 * Filtra atividades por ordem de serviço ID
 */
export const filterActivitiesByServiceOrder = (activities: any[], serviceOrderId: number | null | undefined): any[] => {
  if (serviceOrderId === null || serviceOrderId === undefined) {
    return activities;
  }
  
  return activities.filter(activity => {
    if (!activity.serviceOrder) return false;
    
    const activityServiceOrderId = typeof activity.serviceOrder.id === 'string' 
      ? Number(activity.serviceOrder.id) 
      : activity.serviceOrder.id;
      
    return activityServiceOrderId === serviceOrderId;
  });
};
