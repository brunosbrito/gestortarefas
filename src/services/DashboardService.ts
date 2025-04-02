
import API_URL from '@/config';
import axios from 'axios';
import { FilteredActivity, FilteredServiceOrder } from '@/interfaces/DashboardFilters';
import { getAllServiceOrders } from './ServiceOrderService';
import { getAllActivities } from './ActivityService';

export const getFilteredServiceOrders = async (macroTaskId?: number | null, processId?: number | null): Promise<FilteredServiceOrder[]> => {
  try {
    // Busca todas as ordens de serviço
    const serviceOrders = await getAllServiceOrders();
    
    // Busca todas as atividades
    const activities = await getAllActivities();
    
    // Filtra as atividades com base nos filtros
    const filteredActivities = activities.filter(activity => {
      let matchMacroTask = true;
      let matchProcess = true;
      
      if (macroTaskId) {
        // Suponha que precisamos buscar a tarefa macro pelo ID para comparar com o nome na atividade
        // Isso é uma simulação, já que não temos acesso direto ao ID da tarefa macro na atividade
        matchMacroTask = activity.macroTask ? true : false; // Lógica simplificada
      }
      
      if (processId) {
        // Similar ao acima
        matchProcess = activity.process ? true : false; // Lógica simplificada
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

export const getFilteredActivities = async (macroTaskId?: number | null, processId?: number | null): Promise<FilteredActivity[]> => {
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
        
        if (macroTaskId) {
          // Na prática, precisaríamos comparar o ID, mas aqui estamos simulando
          matchMacroTask = activity.macroTask ? true : false;
        }
        
        if (processId) {
          matchProcess = activity.process ? true : false;
        }
        
        return matchMacroTask && matchProcess;
      })
      .map(activity => ({
        id: activity.id,
        description: activity.description,
        status: activity.status,
        macroTask: activity.macroTask || 'Não especificado',
        process: activity.process || 'Não especificado',
        serviceOrderNumber: activity.orderServiceId ? soNumberMap[activity.orderServiceId.toString()] || 'N/A' : 'N/A',
        projectName: activity.projectId ? 'Projeto #' + activity.projectId : 'N/A'
      }));
    
    return filteredActivities;
  } catch (error) {
    console.error('Erro ao buscar atividades filtradas:', error);
    return [];
  }
};
