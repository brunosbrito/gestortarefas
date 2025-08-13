import { useState, useEffect } from 'react';
import { SwotData, SwotMetrics } from '@/interfaces/SwotInterface';
import { useDashboardStore } from '@/stores/dashboardStore';
import NonConformityService from '@/services/NonConformityService';
import { countActivitiesByStatus } from '@/utils/activityHelpers';
import { ACTIVITY_STATUS } from '@/constants/activityStatus';

export const useSwotAnalysis = () => {
  const { filteredData, filters, loading } = useDashboardStore();
  const [swotData, setSwotData] = useState<SwotData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateSwotMetrics = async (): Promise<SwotMetrics> => {
    const activities = filteredData.activities;
    const projects = filteredData.projects;
    
    let rncs = await NonConformityService.getAllRnc();
    
    if (filters.obraId) {
      rncs = rncs.filter(rnc => rnc.projectId === filters.obraId);
    }

    const now = new Date();
    const statusCounts = countActivitiesByStatus(activities);
    
    const delayedActivities = activities.filter(activity => {
      const isParalyzed = activity.status === ACTIVITY_STATUS.PARALIZADA;
      const isOverdue = activity.endDate && new Date(activity.endDate) < now && 
                        activity.status !== ACTIVITY_STATUS.CONCLUIDA;
      return isParalyzed || isOverdue;
    }).length;
    
    const ongoingProjects = projects.filter(p => p.status !== 'Finalizado').length;
    const projectsOnTime = projects.filter(p => {
      if (!p.endDate) return true;
      return new Date(p.endDate) >= now;
    }).length;
    
    const teamProductivity = activities.length > 0 
      ? Math.round((statusCounts.concluidas / activities.length) * 100)
      : 0;
    
    const completedActivitiesWithTime = activities.filter(a => 
      a.status === ACTIVITY_STATUS.CONCLUIDA && a.totalTime && a.totalTime > 0
    );
    
    const averageCompletionTime = completedActivitiesWithTime.length > 0
      ? Math.round(
          completedActivitiesWithTime.reduce((sum, a) => sum + (a.totalTime || 0), 0) / 
          completedActivitiesWithTime.length
        )
      : 0;

    return {
      totalActivities: activities.length,
      completedActivities: statusCounts.concluidas,
      delayedActivities,
      ongoingProjects,
      totalRNC: rncs.length,
      teamProductivity,
      projectsOnTime,
      averageCompletionTime,
    };
  };

  const generateSwotAnalysis = (metrics: SwotMetrics): SwotData => ({
    strengths: [
      {
        title: 'Produtividade da Equipe',
        description: `Equipe mantém ${metrics.teamProductivity}% de taxa de conclusão`,
        metric: metrics.teamProductivity,
        metricLabel: '%'
      }
    ],
    weaknesses: [
      {
        title: 'Atividades em Atraso',
        description: 'Necessário melhorar cumprimento de prazos',
        metric: metrics.delayedActivities,
        metricLabel: 'atividades'
      }
    ],
    opportunities: [
      {
        title: 'Otimização de Processos',
        description: 'Tempo médio pode ser otimizado',
        metric: metrics.averageCompletionTime,
        metricLabel: 'horas'
      }
    ],
    threats: [
      {
        title: 'Não Conformidades',
        description: 'RNCs requerem atenção',
        metric: metrics.totalRNC,
        metricLabel: 'RNCs'
      }
    ],
    lastUpdated: new Date()
  });

  const loadSwotData = async () => {
    if (loading.data || loading.filtered) return;
    
    setIsLoading(true);
    try {
      const metrics = await calculateSwotMetrics();
      const analysis = generateSwotAnalysis(metrics);
      setSwotData(analysis);
    } catch (error) {
      console.error('Erro SWOT:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filteredData.activities.length > 0) {
      loadSwotData();
    }
  }, [filteredData.activities.length, filters.obraId]);

  return {
    swotData,
    isLoading,
    refreshSwotData: loadSwotData
  };
};