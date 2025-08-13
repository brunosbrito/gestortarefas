import { useState, useEffect } from 'react';
import { SwotData, SwotMetrics } from '@/interfaces/SwotInterface';
import { DashboardFilters } from '@/interfaces/DashboardFilters';
import { getAllActivities } from '@/services/ActivityService';
import { filterDataByPeriod } from '@/utils/dateFilter';
import ObrasService from '@/services/ObrasService';
import NonConformityService from '@/services/NonConformityService';

export const useSwotAnalysis = (filters?: DashboardFilters) => {
  const [swotData, setSwotData] = useState<SwotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateSwotMetrics = async (): Promise<SwotMetrics> => {
    try {
      // Buscar todas as atividades e aplicar filtros manualmente
      let activities = await getAllActivities();

      // Aplicar filtros se existirem
      if (filters) {
        if (filters.macroTaskId) {
          activities = activities.filter(a => a.macroTaskId === filters.macroTaskId);
        }
        if (filters.processId) {
          activities = activities.filter(a => a.processId === filters.processId);
        }
        if (filters.obraId) {
          activities = activities.filter(a => a.serviceOrder?.projectId === filters.obraId);
        }
        if (filters.serviceOrderId) {
          activities = activities.filter(a => a.serviceOrderId === filters.serviceOrderId);
        }
        if (filters.collaboratorId) {
          activities = activities.filter(a => 
            a.team?.some(member => member.collaboratorId === filters.collaboratorId)
          );
        }
        if (filters.period && filters.period !== 'todos') {
          activities = filterDataByPeriod(
            activities,
            filters.period as any,
            filters.startDate,
            filters.endDate
          );
        }
      }

      const [obras, rncs] = await Promise.all([
        ObrasService.getAllObras(),
        NonConformityService.getAllRnc()
      ]);

      console.log('Dados SWOT completos:', { 
        activities: activities.length, 
        obras: obras.length, 
        rncs: rncs.length 
      });
      
      // Debug: verificar status das atividades
      const uniqueStatuses = [...new Set(activities.map(a => a.status))];
      console.log('Status únicos encontrados:', uniqueStatuses);
      
      // Exemplo de algumas atividades para debug
      console.log('Exemplos de atividades:', activities.slice(0, 3).map(a => ({
        id: a.id,
        status: a.status,
        totalTime: (a as any).totalTime,
        actualTime: a.actualTime,
        endDate: a.endDate
      })));

      const now = new Date();
      
      // Corrigir status das atividades para usar os valores corretos (plural)
      const completedActivities = activities.filter(a => a.status === 'Concluídas').length;
      const paralyzedActivities = activities.filter(a => a.status === 'Paralizadas').length;
      const plannedActivities = activities.filter(a => a.status === 'Planejadas').length;
      const inProgressActivities = activities.filter(a => a.status === 'Em andamento').length;
      
      // Atividades em atraso: incluir paralizadas e aquelas com prazo vencido
      const delayedActivities = activities.filter(a => {
        const isParalyzed = a.status === 'Paralizadas';
        const isOverdue = a.endDate && new Date(a.endDate) < now && a.status !== 'Concluídas';
        return isParalyzed || isOverdue;
      }).length;
      
      const ongoingProjects = obras.filter(o => o.status === 'em_andamento').length;
      const projectsOnTime = obras.filter(o => 
        o.status === 'em_andamento' && 
        (!o.endDate || new Date(o.endDate) >= now)
      ).length;

      // Cálculo de produtividade da equipe (atividades concluídas vs total)
      const teamProductivity = activities.length > 0 ? 
        Math.round((completedActivities / activities.length) * 100) : 0;

      // Calcular tempo médio real baseado nas atividades com totalTime
      const activitiesWithTime = activities.filter(a => {
        const totalTime = (a as any).totalTime;
        return a.status === 'Concluídas' && totalTime && totalTime > 0;
      });
      
      const averageCompletionTime = activitiesWithTime.length > 0 ? 
        Math.round(activitiesWithTime.reduce((sum, a) => {
          const totalTime = (a as any).totalTime || 0;
          return sum + Math.abs(totalTime); // Usar valor absoluto pois pode ser negativo
        }, 0) / activitiesWithTime.length) : 0;
      
      console.log('Métricas calculadas:', {
        completedActivities,
        paralyzedActivities,
        delayedActivities,
        teamProductivity,
        averageCompletionTime,
        activitiesWithTimeCount: activitiesWithTime.length
      });

      return {
        totalActivities: activities.length,
        completedActivities,
        delayedActivities,
        ongoingProjects,
        totalRNC: rncs.length,
        teamProductivity,
        projectsOnTime,
        averageCompletionTime
      };
    } catch (error) {
      console.error('Erro ao calcular métricas SWOT:', error);
      return {
        totalActivities: 0,
        completedActivities: 0,
        delayedActivities: 0,
        ongoingProjects: 0,
        totalRNC: 0,
        teamProductivity: 0,
        projectsOnTime: 0,
        averageCompletionTime: 0
      };
    }
  };

  const generateSwotAnalysis = (metrics: SwotMetrics): SwotData => {
    return {
      strengths: [
        {
          title: 'Produtividade da Equipe',
          description: `Equipe mantém ${metrics.teamProductivity}% de taxa de conclusão de atividades`,
          metric: metrics.teamProductivity,
          metricLabel: '%'
        },
        {
          title: 'Projetos Ativos',
          description: `${metrics.ongoingProjects} projetos em andamento demonstram capacidade operacional`,
          metric: metrics.ongoingProjects,
          metricLabel: 'projetos'
        }
      ],
      weaknesses: [
        {
          title: 'Atividades em Atraso',
          description: 'Necessário melhorar o cumprimento de prazos estabelecidos',
          metric: metrics.delayedActivities,
          metricLabel: 'atividades'
        },
        {
          title: 'Não Conformidades',
          description: 'Registros de não conformidade requerem atenção para melhoria contínua',
          metric: metrics.totalRNC,
          metricLabel: 'RNCs'
        }
      ],
      opportunities: [
        {
          title: 'Otimização de Processos',
          description: 'Tempo médio de conclusão pode ser reduzido com melhorias',
          metric: metrics.averageCompletionTime,
          metricLabel: 'dias'
        },
        {
          title: 'Atividades Concluídas',
          description: 'Base sólida de atividades finalizadas para análise de melhores práticas',
          metric: metrics.completedActivities,
          metricLabel: 'atividades'
        }
      ],
      threats: [
        {
          title: 'Prazo de Projetos',
          description: 'Monitoramento rigoroso necessário para evitar atrasos',
          metric: metrics.ongoingProjects - metrics.projectsOnTime,
          metricLabel: 'em risco'
        },
        {
          title: 'Carga de Trabalho',
          description: 'Volume total de atividades requer gestão adequada de recursos',
          metric: metrics.totalActivities,
          metricLabel: 'atividades'
        }
      ],
      lastUpdated: new Date()
    };
  };

  const loadSwotData = async () => {
    setIsLoading(true);
    try {
      const metrics = await calculateSwotMetrics();
      const analysis = generateSwotAnalysis(metrics);
      setSwotData(analysis);
    } catch (error) {
      console.error('Erro ao carregar dados SWOT:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSwotData();
  }, [filters]);

  return {
    swotData,
    isLoading,
    refreshSwotData: loadSwotData
  };
};