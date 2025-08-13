import { useState, useEffect } from 'react';
import { SwotData, SwotMetrics } from '@/interfaces/SwotInterface';
import { getAllActivities } from '@/services/ActivityService';
import ObrasService from '@/services/ObrasService';
import NonConformityService from '@/services/NonConformityService';

export const useSwotAnalysis = () => {
  const [swotData, setSwotData] = useState<SwotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateSwotMetrics = async (): Promise<SwotMetrics> => {
    try {
      const [activities, obras, rncs] = await Promise.all([
        getAllActivities(),
        ObrasService.getAllObras(),
        NonConformityService.getAllRnc()
      ]);

      const now = new Date();
      const completedActivities = activities.filter(a => a.status === 'concluido').length;
      const delayedActivities = activities.filter(a => 
        a.endDate && new Date(a.endDate) < now && a.status !== 'concluido'
      ).length;
      const ongoingProjects = obras.filter(o => o.status === 'em_andamento').length;
      const projectsOnTime = obras.filter(o => 
        o.status === 'em_andamento' && 
        (!o.endDate || new Date(o.endDate) >= now)
      ).length;

      // Cálculo de produtividade da equipe (atividades concluídas vs total)
      const teamProductivity = activities.length > 0 ? 
        Math.round((completedActivities / activities.length) * 100) : 0;

      // Tempo médio de conclusão (simulado - seria calculado com dados reais)
      const averageCompletionTime = completedActivities > 0 ? 
        Math.round(Math.random() * 10 + 5) : 0;

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
  }, []);

  return {
    swotData,
    isLoading,
    refreshSwotData: loadSwotData
  };
};