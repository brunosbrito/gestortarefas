
import API_URL from '@/config';
import axios from 'axios';
import { FilteredActivity, FilteredServiceOrder } from '@/interfaces/DashboardFilters';
import { getAllServiceOrders } from './ServiceOrderService';
import { getAllActivities } from './ActivityService';

export const getFilteredServiceOrders = async (
  macroTaskId?: number | null, 
  processId?: number | null,
  serviceOrderId?: string | null
): Promise<FilteredServiceOrder[]> => {
  try {
    // Busca todas as ordens de serviço
    const serviceOrders = await getAllServiceOrders();
    
    // Se um serviceOrderId específico foi fornecido, filtra diretamente
    if (serviceOrderId) {
      const filteredSO = serviceOrders
        .filter(so => so.id === serviceOrderId)
        .map(so => ({
          id: so.id,
          serviceOrderNumber: so.serviceOrderNumber,
          description: so.description,
          projectName: so.projectId?.name || 'Sem projeto',
          status: so.status,
          activityCount: 0 // Será atualizado abaixo
        }));
      
      // Busca atividades para contar
      const activities = await getAllActivities();
      const activityCount = activities.filter(a => a.orderServiceId === serviceOrderId).length;
      
      if (filteredSO.length > 0) {
        filteredSO[0].activityCount = activityCount;
      }
      
      return filteredSO;
    }
    
    // Busca todas as atividades
    const activities = await getAllActivities();
    
    // Filtra as atividades com base nos filtros
    const filteredActivities = activities.filter(activity => {
      let matchMacroTask = true;
      let matchProcess = true;
      
      if (macroTaskId) {
        matchMacroTask = activity.macroTaskId === macroTaskId;
      }
      
      if (processId) {
        matchProcess = activity.processId === processId;
      }
      
      return matchMacroTask && matchProcess;
    });
    
    // Agrupa atividades por orderServiceId para contar quantas atividades existem por OS
    const activityCountByOS = filteredActivities.reduce((acc: {[key: string]: number}, activity) => {
      if (activity.orderServiceId) {
        const osId = activity.orderServiceId.toString();
        acc[osId] = (acc[osId] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Filtra as ordens de serviço que têm atividades correspondentes aos filtros
    const filteredServiceOrders = serviceOrders
      .filter(so => activityCountByOS[so.id])
      .map(so => ({
        id: so.id,
        serviceOrderNumber: so.serviceOrderNumber,
        description: so.description,
        projectName: so.projectId?.name || 'Sem projeto',
        status: so.status,
        activityCount: activityCountByOS[so.id] || 0
      }));
    
    return filteredServiceOrders;
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço filtradas:', error);
    return [];
  }
};

export const getFilteredActivities = async (
  macroTaskId?: number | null, 
  processId?: number | null,
  serviceOrderId?: string | null
): Promise<FilteredActivity[]> => {
  try {
    const activities = await getAllActivities();
    const serviceOrders = await getAllServiceOrders();
    
    // Mapeia os ids de ordens de serviço para seus números
    const soNumberMap = serviceOrders.reduce((acc: {[key: string]: string}, so) => {
      acc[so.id] = so.serviceOrderNumber;
      return acc;
    }, {});
    
    // Filtra as atividades com base nos parâmetros
    const filteredActivities = activities
      .filter(activity => {
        let matchMacroTask = true;
        let matchProcess = true;
        let matchServiceOrder = true;
        
        if (macroTaskId) {
          matchMacroTask = activity.macroTaskId === macroTaskId;
        }
        
        if (processId) {
          matchProcess = activity.processId === processId;
        }
        
        if (serviceOrderId) {
          matchServiceOrder = activity.orderServiceId === serviceOrderId;
        }
        
        return matchMacroTask && matchProcess && matchServiceOrder;
      })
      .map(activity => ({
        id: activity.id,
        description: activity.description,
        status: activity.status || 'Não especificado',
        macroTask: typeof activity.macroTask === 'object' && activity.macroTask?.name 
          ? activity.macroTask.name 
          : 'Não especificado',
        macroTaskId: activity.macroTaskId,
        process: typeof activity.process === 'object' && activity.process?.name 
          ? activity.process.name 
          : 'Não especificado',
        processId: activity.processId,
        serviceOrderNumber: activity.orderServiceId 
          ? soNumberMap[activity.orderServiceId.toString()] || 'N/A' 
          : 'N/A',
        serviceOrderId: activity.orderServiceId,
        projectName: activity.project?.name || 'N/A'
      }));
    
    return filteredActivities;
  } catch (error) {
    console.error('Erro ao buscar atividades filtradas:', error);
    return [];
  }
};
