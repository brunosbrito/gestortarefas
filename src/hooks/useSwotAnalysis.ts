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
      const isOverdue = activity.endDate && new Date(activity.endDate) < now && 
                        activity.status !== ACTIVITY_STATUS.CONCLUIDA;
      return isOverdue;
    }).length;

    const paralyzedActivities = activities.filter(activity => 
      activity.status === ACTIVITY_STATUS.PARALIZADA
    ).length;
    
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

    // Calcular eficiência estimado vs real
    const activitiesWithEstimate = activities.filter(a => a.estimatedTime && a.totalTime);
    const estimatedVsActualTime = activitiesWithEstimate.length > 0
      ? Math.round(
          activitiesWithEstimate.reduce((sum, a) => {
            const efficiency = (a.estimatedTime! / (a.totalTime || 1)) * 100;
            return sum + Math.min(efficiency, 200); // Cap at 200% for outliers
          }, 0) / activitiesWithEstimate.length
        )
      : 100;

    // Índice de qualidade (baseado em RNCs vs atividades)
    const qualityIndex = activities.length > 0 
      ? Math.round((1 - (rncs.length / activities.length)) * 100)
      : 100;

    // Eficiência de colaboradores (atividades concluídas por colaborador ativo)
    const activeCollaborators = new Set();
    activities.forEach(activity => {
      if (activity.team) {
        activity.team.forEach(member => activeCollaborators.add(member.collaboratorId));
      }
    });
    const collaboratorEfficiency = activeCollaborators.size > 0
      ? Math.round(statusCounts.concluidas / activeCollaborators.size)
      : 0;

    // Eficiência de processos (média de conclusão por processo)
    const processMap = new Map();
    activities.forEach(activity => {
      if (activity.process) {
        // Garantir que temos um processId válido
        let processId = activity.process;
        if (typeof processId === 'object' && processId !== null) {
          processId = (processId as any).id || (processId as any).name || 'unknown';
        }
        
        if (!processMap.has(processId)) {
          processMap.set(processId, { total: 0, completed: 0 });
        }
        const data = processMap.get(processId);
        data.total++;
        if (activity.status === ACTIVITY_STATUS.CONCLUIDA) {
          data.completed++;
        }
      }
    });
    
    const processEfficiencies = Array.from(processMap.values()).map(p => 
      p.total > 0 ? (p.completed / p.total) * 100 : 0
    );
    const processEfficiency = processEfficiencies.length > 0
      ? Math.round(processEfficiencies.reduce((sum, eff) => sum + eff, 0) / processEfficiencies.length)
      : 0;

    // Nível de risco (baseado em atrasos, paralizações e RNCs)
    const totalProblems = delayedActivities + paralyzedActivities + rncs.length;
    const riskLevel = activities.length > 0
      ? Math.round((totalProblems / activities.length) * 100)
      : 0;

    return {
      totalActivities: activities.length,
      completedActivities: statusCounts.concluidas,
      delayedActivities,
      paralyzedActivities,
      ongoingProjects,
      totalRNC: rncs.length,
      teamProductivity,
      projectsOnTime,
      averageCompletionTime,
      estimatedVsActualTime,
      qualityIndex,
      collaboratorEfficiency,
      processEfficiency,
      riskLevel,
    };
  };

  const generateSwotAnalysis = (metrics: SwotMetrics): SwotData => {
    const strengths = [];
    const weaknesses = [];
    const opportunities = [];
    const threats = [];

    // === FORÇAS ===
    // Produtividade alta
    if (metrics.teamProductivity >= 80) {
      strengths.push({
        title: 'Alta Produtividade da Equipe',
        description: `Excelente performance com ${metrics.teamProductivity}% de conclusão`,
        metric: metrics.teamProductivity,
        metricLabel: '%',
        trend: 'up' as const,
        severity: 'low' as const,
        recommendation: 'Manter padrões e processos atuais'
      });
    } else if (metrics.teamProductivity >= 60) {
      strengths.push({
        title: 'Produtividade Satisfatória',
        description: `Boa performance com ${metrics.teamProductivity}% de conclusão`,
        metric: metrics.teamProductivity,
        metricLabel: '%',
        trend: 'stable' as const,
        severity: 'low' as const,
        recommendation: 'Oportunidade de melhoria contínua'
      });
    }

    // Qualidade alta
    if (metrics.qualityIndex >= 90) {
      strengths.push({
        title: 'Excelente Qualidade',
        description: `Baixíssimo índice de não conformidades (${metrics.qualityIndex}%)`,
        metric: metrics.qualityIndex,
        metricLabel: '%',
        trend: 'up' as const,
        severity: 'low' as const,
        recommendation: 'Padronizar processos de qualidade'
      });
    }

    // Eficiência de colaboradores
    if (metrics.collaboratorEfficiency >= 5) {
      strengths.push({
        title: 'Equipe Eficiente',
        description: `${metrics.collaboratorEfficiency} atividades concluídas por colaborador`,
        metric: metrics.collaboratorEfficiency,
        metricLabel: ' ativ/colab',
        trend: 'up' as const,
        severity: 'low' as const,
        recommendation: 'Compartilhar melhores práticas'
      });
    }

    // Projetos no prazo
    if (metrics.projectsOnTime >= metrics.ongoingProjects * 0.8) {
      strengths.push({
        title: 'Projetos no Prazo',
        description: `${metrics.projectsOnTime} de ${metrics.ongoingProjects} projetos dentro do cronograma`,
        metric: metrics.projectsOnTime,
        metricLabel: ` projetos`,
        trend: 'stable' as const,
        severity: 'low' as const,
        recommendation: 'Manter controle de cronograma'
      });
    }

    // === FRAQUEZAS ===
    // Atividades atrasadas
    if (metrics.delayedActivities > 0) {
      const severity = metrics.delayedActivities > 10 ? 'high' : 
                      metrics.delayedActivities > 5 ? 'medium' : 'low';
      weaknesses.push({
        title: 'Atividades em Atraso',
        description: `${metrics.delayedActivities} atividades perderam prazo de entrega`,
        metric: metrics.delayedActivities,
        metricLabel: ' atividades',
        trend: 'up' as const,
        severity,
        recommendation: 'Revisar planejamento e recursos alocados'
      });
    }

    // Atividades paralizadas
    if (metrics.paralyzedActivities > 0) {
      const severity = metrics.paralyzedActivities > 5 ? 'high' : 'medium';
      weaknesses.push({
        title: 'Atividades Paralizadas',
        description: `${metrics.paralyzedActivities} atividades paradas precisam de atenção`,
        metric: metrics.paralyzedActivities,
        metricLabel: ' atividades',
        trend: 'stable' as const,
        severity,
        recommendation: 'Identificar bloqueios e resolver impedimentos'
      });
    }

    // Baixa produtividade
    if (metrics.teamProductivity < 60) {
      weaknesses.push({
        title: 'Produtividade Baixa',
        description: `Apenas ${metrics.teamProductivity}% de conclusão das atividades`,
        metric: metrics.teamProductivity,
        metricLabel: '%',
        trend: 'down' as const,
        severity: 'high' as const,
        recommendation: 'Revisar processos e treinamento da equipe'
      });
    }

    // Eficiência vs estimativa
    if (metrics.estimatedVsActualTime < 80) {
      weaknesses.push({
        title: 'Estouro de Prazos',
        description: `Atividades levam ${100 - metrics.estimatedVsActualTime}% mais tempo que estimado`,
        metric: Math.round(100 - metrics.estimatedVsActualTime),
        metricLabel: '% a mais',
        trend: 'up' as const,
        severity: 'medium' as const,
        recommendation: 'Melhorar estimativas e acompanhamento'
      });
    }

    // === OPORTUNIDADES ===
    // Otimização de processos
    if (metrics.processEfficiency < 90) {
      opportunities.push({
        title: 'Otimização de Processos',
        description: `Processos podem melhorar para ${100 - metrics.processEfficiency}% mais eficiência`,
        metric: Math.round(100 - metrics.processEfficiency),
        metricLabel: '% melhoria',
        trend: 'up' as const,
        severity: 'medium' as const,
        recommendation: 'Analisar gargalos e automatizar tarefas'
      });
    }

    // Capacidade da equipe
    if (metrics.collaboratorEfficiency < 8 && metrics.collaboratorEfficiency > 0) {
      opportunities.push({
        title: 'Potencial da Equipe',
        description: `Colaboradores podem aumentar produtividade individual`,
        metric: Math.round(8 - metrics.collaboratorEfficiency),
        metricLabel: ' ativ extras',
        trend: 'up' as const,
        severity: 'low' as const,
        recommendation: 'Investir em treinamento e ferramentas'
      });
    }

    // Melhoria da qualidade
    if (metrics.qualityIndex < 95 && metrics.totalRNC > 0) {
      opportunities.push({
        title: 'Melhoria de Qualidade',
        description: `Reduzir RNCs pode aumentar qualidade para ${100 - metrics.qualityIndex}%`,
        metric: Math.round(100 - metrics.qualityIndex),
        metricLabel: '% melhoria',
        trend: 'up' as const,
        severity: 'low' as const,
        recommendation: 'Implementar controles preventivos'
      });
    }

    // Padronização
    if (metrics.averageCompletionTime > 0) {
      opportunities.push({
        title: 'Padronização de Tempo',
        description: `Tempo médio de ${metrics.averageCompletionTime}h pode ser otimizado`,
        metric: metrics.averageCompletionTime,
        metricLabel: 'h médias',
        trend: 'stable' as const,
        severity: 'low' as const,
        recommendation: 'Criar templates e automatizar processos'
      });
    }

    // === AMEAÇAS ===
    // Alto nível de risco
    if (metrics.riskLevel > 30) {
      threats.push({
        title: 'Alto Nível de Risco',
        description: `${metrics.riskLevel}% das atividades têm problemas críticos`,
        metric: metrics.riskLevel,
        metricLabel: '% risco',
        trend: 'up' as const,
        severity: 'critical' as const,
        recommendation: 'Ação imediata: revisar e mitigar riscos'
      });
    } else if (metrics.riskLevel > 15) {
      threats.push({
        title: 'Risco Moderado',
        description: `${metrics.riskLevel}% das atividades requerem atenção`,
        metric: metrics.riskLevel,
        metricLabel: '% risco',
        trend: 'stable' as const,
        severity: 'medium' as const,
        recommendation: 'Monitorar e criar planos de contingência'
      });
    }

    // RNCs crescentes
    if (metrics.totalRNC > 0) {
      const severity = metrics.totalRNC > 10 ? 'high' : 
                      metrics.totalRNC > 5 ? 'medium' : 'low';
      threats.push({
        title: 'Não Conformidades',
        description: `${metrics.totalRNC} RNCs podem impactar qualidade e prazos`,
        metric: metrics.totalRNC,
        metricLabel: ' RNCs',
        trend: 'up' as const,
        severity,
        recommendation: 'Análise de causa raiz e ações corretivas'
      });
    }

    // Sobrecarga da equipe
    if (metrics.paralyzedActivities + metrics.delayedActivities > metrics.completedActivities * 0.3) {
      threats.push({
        title: 'Sobrecarga Potencial',
        description: `Muitas atividades problemáticas podem sobrecarregar equipe`,
        metric: metrics.paralyzedActivities + metrics.delayedActivities,
        metricLabel: ' problemas',
        trend: 'up' as const,
        severity: 'medium' as const,
        recommendation: 'Redistribuir cargas e priorizar atividades'
      });
    }

    // Prazos apertados
    if (metrics.projectsOnTime < metrics.ongoingProjects * 0.7) {
      threats.push({
        title: 'Prazos em Risco',
        description: `${metrics.ongoingProjects - metrics.projectsOnTime} projetos podem atrasar`,
        metric: metrics.ongoingProjects - metrics.projectsOnTime,
        metricLabel: ' projetos',
        trend: 'up' as const,
        severity: 'high' as const,
        recommendation: 'Acelerar entregas críticas e realocar recursos'
      });
    }

    return {
      strengths,
      weaknesses,
      opportunities,
      threats,
      lastUpdated: new Date()
    };
  };

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