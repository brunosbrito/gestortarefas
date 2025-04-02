
import { ActivityStatistics } from "@/interfaces/ActivityStatistics";

// Dados de exemplo para desenvolvimento
const mockStatistics: ActivityStatistics = {
  macroTasks: [
    { id: 1, name: "Estrutura", activityCount: 24, estimatedHours: 120, actualHours: 132, hoursDifference: 10 },
    { id: 2, name: "Alvenaria", activityCount: 18, estimatedHours: 90, actualHours: 85, hoursDifference: -5.5 },
    { id: 3, name: "Elétrica", activityCount: 15, estimatedHours: 60, actualHours: 72, hoursDifference: 20 },
    { id: 4, name: "Hidráulica", activityCount: 12, estimatedHours: 48, actualHours: 45, hoursDifference: -6.25 },
    { id: 5, name: "Acabamento", activityCount: 20, estimatedHours: 100, actualHours: 115, hoursDifference: 15 },
  ],
  processes: [
    { id: 1, name: "Planejamento", activityCount: 10, estimatedHours: 50, actualHours: 45, hoursDifference: -10 },
    { id: 2, name: "Execução", activityCount: 60, estimatedHours: 300, actualHours: 330, hoursDifference: 10 },
    { id: 3, name: "Controle", activityCount: 12, estimatedHours: 48, actualHours: 52, hoursDifference: 8.3 },
    { id: 4, name: "Finalização", activityCount: 8, estimatedHours: 20, actualHours: 22, hoursDifference: 10 },
  ],
  collaborators: [
    { id: 1, name: "João Silva", activityCount: 28, hoursWorked: 140, role: "Engenheiro" },
    { id: 2, name: "Maria Oliveira", activityCount: 22, hoursWorked: 110, role: "Arquiteta" },
    { id: 3, name: "Pedro Santos", activityCount: 35, hoursWorked: 175, role: "Mestre de Obras" },
    { id: 4, name: "Ana Costa", activityCount: 18, hoursWorked: 90, role: "Técnica" },
    { id: 5, name: "Carlos Ferreira", activityCount: 26, hoursWorked: 130, role: "Eletricista" },
  ]
};

// Função para buscar estatísticas das atividades
export const getActivityStatistics = async (): Promise<ActivityStatistics> => {
  // Em um ambiente de produção, aqui você faria uma chamada à API
  // return await api.get('/statistics/activities');
  
  // Para desenvolvimento, retornamos os dados mockados
  return new Promise((resolve) => {
    // Simulando um delay de requisição
    setTimeout(() => {
      resolve(mockStatistics);
    }, 500);
  });
};
