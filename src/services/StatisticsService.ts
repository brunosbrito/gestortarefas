
import { ActivityStatistics } from "@/interfaces/ActivityStatistics";
import { subDays } from "date-fns";

// Função para gerar datas aleatórias nos últimos meses
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const today = new Date();
const threeMonthsAgo = subDays(today, 90);

// Dados de exemplo para desenvolvimento
const mockStatistics: ActivityStatistics = {
  macroTasks: [
    { id: 1, name: "Estrutura", activityCount: 24, estimatedHours: 120, actualHours: 132, hoursDifference: 10, createdAt: randomDate(subDays(today, 5), today) },
    { id: 2, name: "Alvenaria", activityCount: 18, estimatedHours: 90, actualHours: 85, hoursDifference: -5.5, createdAt: randomDate(subDays(today, 15), subDays(today, 10)) },
    { id: 3, name: "Elétrica", activityCount: 15, estimatedHours: 60, actualHours: 72, hoursDifference: 20, createdAt: randomDate(subDays(today, 25), subDays(today, 20)) },
    { id: 4, name: "Hidráulica", activityCount: 12, estimatedHours: 48, actualHours: 45, hoursDifference: -6.25, createdAt: randomDate(subDays(today, 40), subDays(today, 30)) },
    { id: 5, name: "Acabamento", activityCount: 20, estimatedHours: 100, actualHours: 115, hoursDifference: 15, createdAt: randomDate(subDays(today, 60), subDays(today, 50)) },
  ],
  processes: [
    { id: 1, name: "Planejamento", activityCount: 10, estimatedHours: 50, actualHours: 45, hoursDifference: -10, createdAt: randomDate(subDays(today, 5), today) },
    { id: 2, name: "Execução", activityCount: 60, estimatedHours: 300, actualHours: 330, hoursDifference: 10, createdAt: randomDate(subDays(today, 20), subDays(today, 10)) },
    { id: 3, name: "Controle", activityCount: 12, estimatedHours: 48, actualHours: 52, hoursDifference: 8.3, createdAt: randomDate(subDays(today, 40), subDays(today, 30)) },
    { id: 4, name: "Finalização", activityCount: 8, estimatedHours: 20, actualHours: 22, hoursDifference: 10, createdAt: randomDate(subDays(today, 80), subDays(today, 70)) },
  ],
  collaborators: [
    { id: 1, name: "João Silva", activityCount: 28, hoursWorked: 140, role: "Engenheiro", createdAt: randomDate(subDays(today, 5), today) },
    { id: 2, name: "Maria Oliveira", activityCount: 22, hoursWorked: 110, role: "Arquiteta", createdAt: randomDate(subDays(today, 20), subDays(today, 10)) },
    { id: 3, name: "Pedro Santos", activityCount: 35, hoursWorked: 175, role: "Mestre de Obras", createdAt: randomDate(subDays(today, 40), subDays(today, 30)) },
    { id: 4, name: "Ana Costa", activityCount: 18, hoursWorked: 90, role: "Técnica", createdAt: randomDate(subDays(today, 60), subDays(today, 50)) },
    { id: 5, name: "Carlos Ferreira", activityCount: 26, hoursWorked: 130, role: "Eletricista", createdAt: randomDate(subDays(today, 80), subDays(today, 70)) },
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
