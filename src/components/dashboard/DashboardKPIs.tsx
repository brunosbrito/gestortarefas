import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Users, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, hoverScale, tapScale } from '@/lib/animations';
import { useDashboardStore } from '@/stores/dashboardStore';
import { ACTIVITY_STATUS } from '@/constants/activityStatus';

/**
 * Converte totalTime/actualTime para horas
 * Se for > 500, assumimos que está em minutos e convertemos para horas
 */
const getTimeInHours = (time: number | string | null | undefined): number => {
  if (time === null || time === undefined) return 0;
  const numericValue = typeof time === 'string' ? parseFloat(time) : time;
  if (isNaN(numericValue) || numericValue < 0) return 0;
  if (numericValue > 500) return numericValue / 60;
  return numericValue;
};

/**
 * Converte estimatedTime para horas (pode ser string "Xh Ymin" ou número)
 */
const getEstimatedTimeInHours = (estimatedTime: number | string | null | undefined): number => {
  if (estimatedTime === null || estimatedTime === undefined) return 0;

  if (typeof estimatedTime === 'string') {
    // Tenta extrair horas e minutos do formato "Xh Ymin"
    const hoursMatch = estimatedTime.match(/(\d+)\s*h/i);
    const minutesMatch = estimatedTime.match(/(\d+)\s*min/i);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

    if (hours > 0 || minutes > 0) {
      return hours + (minutes / 60);
    }

    // Se não encontrar formato "Xh Ymin", tenta converter como número
    const numericValue = parseFloat(estimatedTime);
    if (!isNaN(numericValue) && numericValue > 0) {
      return numericValue > 500 ? numericValue / 60 : numericValue;
    }
    return 0;
  }

  if (estimatedTime > 500) return estimatedTime / 60;
  return estimatedTime;
};

/**
 * Obtém o tempo trabalhado de uma atividade, usando totalTime como fallback
 */
const getActualTimeFromActivity = (activity: any): number => {
  // Tentar usar totalTime primeiro, depois actualTime
  const totalTime = getTimeInHours(activity.totalTime);
  if (totalTime > 0) return totalTime;

  const actualTime = getTimeInHours(activity.actualTime);
  return actualTime;
};

interface KPICardData {
  title: string;
  value: string | number;
  subtitle: string;
  explanation: string;
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
  bgTint: string;
  textColor: string;
  iconBg: string;
  iconColor: string;
}

/**
 * Componente de KPIs agregados do Dashboard
 * Exibe 6 métricas principais calculadas a partir das atividades filtradas
 */
export const DashboardKPIs = () => {
  // Usar selector específico para garantir re-render quando dados mudam
  const filteredActivities = useDashboardStore(state => state.filteredData.activities);

  // Calcular KPIs com useMemo para performance
  const kpis = useMemo(() => {
    const activities = filteredActivities || [];

    // 1. Calcular totais de horas com conversão de unidades
    const totalEstimated = activities.reduce((sum, a) => sum + getEstimatedTimeInHours(a.estimatedTime), 0);
    const totalActual = activities.reduce((sum, a) => sum + getActualTimeFromActivity(a), 0);

    // 2. Calcular eficiência geral (fórmula: estimado/trabalhado * 100)
    // 100% = no prazo, > 100% = eficiente (terminou antes), < 100% = ineficiente (atrasou)
    const overallEfficiency = totalActual > 0 && totalEstimated > 0
      ? Math.min(200, Math.max(0, (totalEstimated / totalActual) * 100))
      : 0;

    // 3. Calcular taxa no prazo (completed on time)
    const completedActivities = activities.filter(a => a.isCompleted);
    const onTimeActivities = completedActivities.filter(a => {
      const est = getEstimatedTimeInHours(a.estimatedTime);
      const act = getActualTimeFromActivity(a);
      return est > 0 && act > 0 && act <= est;
    });
    const onTimeRate = completedActivities.length > 0
      ? (onTimeActivities.length / completedActivities.length) * 100
      : 0;

    // 4. Contar atividades críticas
    const criticalCount = activities.filter(a => {
      if (a.status === ACTIVITY_STATUS.PARALIZADA || a.isDelayed) return true;
      const est = getEstimatedTimeInHours(a.estimatedTime);
      const act = getActualTimeFromActivity(a);
      return est > 0 && act > 0 && act > est * 1.2;
    }).length;

    // 5. Calcular utilização de equipe (usando colaboradores únicos das atividades filtradas)
    const activeActivities = activities.filter(a => a.status === ACTIVITY_STATUS.EM_ANDAMENTO).length;

    // Contar colaboradores únicos de todas as atividades filtradas
    const uniqueCollaboratorIds = new Set<number>();
    activities.forEach(a => {
      // Verificar campo team (normalizado)
      if (a.team && Array.isArray(a.team)) {
        a.team.forEach((member: any) => {
          const memberId = member?.collaboratorId || member?.id;
          if (memberId) uniqueCollaboratorIds.add(memberId);
        });
      }
      // Verificar campo collaborators (pode vir direto da API)
      if ((a as any).collaborators && Array.isArray((a as any).collaborators)) {
        (a as any).collaborators.forEach((member: any) => {
          const memberId = member?.collaboratorId || member?.id;
          if (memberId) uniqueCollaboratorIds.add(memberId);
        });
      }
      // Verificar campo activityCollaborators (tabela de junção)
      if ((a as any).activityCollaborators && Array.isArray((a as any).activityCollaborators)) {
        (a as any).activityCollaborators.forEach((ac: any) => {
          const memberId = ac?.collaboratorId || ac?.collaborator?.id;
          if (memberId) uniqueCollaboratorIds.add(memberId);
        });
      }
      // Fallback para collaboratorId da atividade
      if (a.collaboratorId) uniqueCollaboratorIds.add(a.collaboratorId);
    });
    const totalCollaborators = uniqueCollaboratorIds.size || 1;
    const utilization = (activeActivities / totalCollaborators);

    // 6. Saldo de horas (diferença): positivo = economizou, negativo = gastou mais
    const budgetDiff = totalEstimated - totalActual;

    // 7. Eficiência média por atividade concluída (fórmula: estimado/trabalhado * 100)
    // 100% = no prazo, > 100% = eficiente, < 100% = ineficiente
    const avgEfficiency = completedActivities.length > 0
      ? completedActivities.reduce((sum, a) => {
          const est = getEstimatedTimeInHours(a.estimatedTime);
          const act = getActualTimeFromActivity(a);
          // Limitar eficiência entre 0% e 200% para evitar valores extremos
          const eff = act > 0 && est > 0 ? Math.min(200, Math.max(0, (est / act) * 100)) : 0;
          return sum + eff;
        }, 0) / completedActivities.length
      : 0;

    const kpiData: KPICardData[] = [
      {
        title: 'Eficiência Geral',
        value: `${overallEfficiency.toFixed(1)}%`,
        subtitle: overallEfficiency >= 100 ? 'Dentro do prazo' : 'Acima do prazo',
        explanation: `Estimado: ${totalEstimated.toFixed(1)}h | Trabalhado: ${totalActual.toFixed(1)}h`,
        icon: overallEfficiency >= 100 ? TrendingUp : TrendingDown,
        borderColor: overallEfficiency >= 100 ? 'border-l-green-500' : 'border-l-red-500',
        bgTint: overallEfficiency >= 100 ? 'bg-green-50/50 dark:bg-green-950/20' : 'bg-red-50/50 dark:bg-red-950/20',
        textColor: overallEfficiency >= 100 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300',
        iconBg: overallEfficiency >= 100 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30',
        iconColor: overallEfficiency >= 100 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      },
      {
        title: 'Taxa No Prazo',
        value: `${onTimeRate.toFixed(1)}%`,
        subtitle: `${onTimeActivities.length} de ${completedActivities.length}`,
        explanation: `Atividades concluídas dentro do tempo estimado`,
        icon: Target,
        borderColor: 'border-l-blue-500',
        bgTint: 'bg-blue-50/50 dark:bg-blue-950/20',
        textColor: 'text-blue-700 dark:text-blue-300',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400'
      },
      {
        title: 'Saldo de Horas',
        value: budgetDiff > 0 ? `+${budgetDiff.toFixed(1)}h` : `${budgetDiff.toFixed(1)}h`,
        subtitle: budgetDiff >= 0 ? 'Economia de tempo' : 'Tempo excedido',
        explanation: `Estimado: ${totalEstimated.toFixed(1)}h | Trabalhado: ${totalActual.toFixed(1)}h`,
        icon: Clock,
        borderColor: budgetDiff >= 0 ? 'border-l-green-500' : 'border-l-red-500',
        bgTint: budgetDiff >= 0 ? 'bg-green-50/50 dark:bg-green-950/20' : 'bg-red-50/50 dark:bg-red-950/20',
        textColor: budgetDiff >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300',
        iconBg: budgetDiff >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30',
        iconColor: budgetDiff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      },
      {
        title: 'Atividades Críticas',
        value: criticalCount,
        subtitle: criticalCount > 0 ? 'Requer atenção' : 'Tudo em ordem',
        explanation: `Paralizadas + Atrasadas + Acima de 120% do tempo`,
        icon: AlertTriangle,
        borderColor: criticalCount > 0 ? 'border-l-red-500' : 'border-l-green-500',
        bgTint: criticalCount > 0 ? 'bg-red-50/50 dark:bg-red-950/20' : 'bg-green-50/50 dark:bg-green-950/20',
        textColor: criticalCount > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300',
        iconBg: criticalCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30',
        iconColor: criticalCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
      },
      {
        title: 'Utilização de Equipe',
        value: utilization.toFixed(1),
        subtitle: `${activeActivities} ativ. / ${totalCollaborators} colab.`,
        explanation: `Atividades em execução por colaborador`,
        icon: Users,
        borderColor: 'border-l-purple-500',
        bgTint: 'bg-purple-50/50 dark:bg-purple-950/20',
        textColor: 'text-purple-700 dark:text-purple-300',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400'
      },
      {
        title: 'Eficiência Média',
        value: `${avgEfficiency.toFixed(1)}%`,
        subtitle: avgEfficiency >= 100 ? 'Dentro do prazo' : 'Acima do prazo',
        explanation: `Média de ${completedActivities.length} atividades concluídas`,
        icon: avgEfficiency >= 100 ? TrendingUp : TrendingDown,
        borderColor: avgEfficiency >= 100 ? 'border-l-green-500' : 'border-l-red-500',
        bgTint: avgEfficiency >= 100 ? 'bg-green-50/50 dark:bg-green-950/20' : 'bg-red-50/50 dark:bg-red-950/20',
        textColor: avgEfficiency >= 100 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300',
        iconBg: avgEfficiency >= 100 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30',
        iconColor: avgEfficiency >= 100 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }
    ];

    return kpiData;
  }, [filteredActivities]);

  return (
    <Card className="border border-border/50 shadow-elevation-2 overflow-hidden">
      {/* Header com gradient */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-600/10 border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Indicadores de Performance
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Métricas agregadas das atividades filtradas
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            // Add border-r to all except last in row for visual separation
            const isLastInRow = {
              'md': index % 2 === 1,        // 2 cols on md
              'lg': index % 3 === 2,        // 3 cols on lg
              'xl': index === kpis.length - 1  // 6 cols on xl (last item)
            };

            return (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={hoverScale}
                whileTap={tapScale}
                className={cn(
                  "relative",
                  // Vertical separator for desktop
                  !isLastInRow.xl && "xl:border-r xl:border-border/30",
                  !isLastInRow.lg && "lg:border-r lg:border-border/30 xl:border-r-0",
                  !isLastInRow.md && "md:border-r md:border-border/30 lg:border-r-0"
                )}
              >
                <Card
                  className={cn(
                    "border-l-4 border-y border-r",
                    "shadow-elevation-2 cursor-pointer h-full",
                    kpi.borderColor,
                    kpi.bgTint
                  )}
                >
                  <CardContent className="p-4 h-full flex flex-col justify-between min-h-[120px]">
                    <div className="flex items-start justify-between gap-2">
                      {/* Conteúdo principal */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          {kpi.title}
                        </p>
                        <h3 className={cn("text-2xl font-bold tabular-nums leading-tight", kpi.textColor)}>
                          {kpi.value}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {kpi.subtitle}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 italic mt-1">
                          {kpi.explanation}
                        </p>
                      </div>

                      {/* Icon */}
                      <div className={cn("p-2 rounded-lg flex-shrink-0", kpi.iconBg)}>
                        <Icon className={cn("h-4 w-4", kpi.iconColor)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Card>
  );
};
