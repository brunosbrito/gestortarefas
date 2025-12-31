import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Users, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, hoverScale, tapScale } from '@/lib/animations';
import { useDashboardStore } from '@/stores/dashboardStore';

interface KPICardData {
  title: string;
  value: string | number;
  subtitle: string;
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
  const { filteredData, statistics, activityStatus } = useDashboardStore();

  // Calcular KPIs com useMemo para performance
  const kpis = useMemo(() => {
    const activities = filteredData.activities || [];

    // 1. Calcular totais de horas (garantir que sejam números)
    const totalEstimated = Number(activities.reduce((sum, a) => sum + (Number(a.estimatedTime) || 0), 0));
    const totalActual = Number(activities.reduce((sum, a) => sum + (Number(a.actualTime) || 0), 0));

    // 2. Calcular eficiência geral
    const overallEfficiency = totalEstimated > 0
      ? ((totalEstimated - totalActual) / totalEstimated) * 100
      : 0;

    // 3. Calcular taxa no prazo (completed on time)
    const completedActivities = activities.filter(a => a.isCompleted);
    const onTimeActivities = completedActivities.filter(a =>
      (Number(a.actualTime) || 0) <= (Number(a.estimatedTime) || 0)
    );
    const onTimeRate = completedActivities.length > 0
      ? (onTimeActivities.length / completedActivities.length) * 100
      : 0;

    // 4. Contar atividades críticas
    const criticalCount = activities.filter(a =>
      a.status === 'Paralizada' ||
      a.isDelayed ||
      (a.actualTime && a.estimatedTime && Number(a.actualTime) > Number(a.estimatedTime) * 1.2)
    ).length;

    // 5. Calcular utilização de equipe
    const activeActivities = activityStatus.emExecucao || 0;
    const totalCollaborators = (statistics.collaborators?.length || 1);
    const utilization = (activeActivities / totalCollaborators);

    // 6. Saldo de horas (diferença)
    const budgetDiff = totalActual - totalEstimated;

    // 7. Eficiência média por atividade concluída
    const avgEfficiency = completedActivities.length > 0
      ? completedActivities.reduce((sum, a) => {
          const est = Number(a.estimatedTime) || 0;
          const act = Number(a.actualTime) || 0;
          const eff = est > 0 ? ((est - act) / est) * 100 : 0;
          return sum + eff;
        }, 0) / completedActivities.length
      : 0;

    const kpiData: KPICardData[] = [
      {
        title: 'Eficiência Geral',
        value: `${overallEfficiency.toFixed(1)}%`,
        subtitle: overallEfficiency >= 0 ? 'Dentro do prazo' : 'Acima do prazo',
        icon: overallEfficiency >= 0 ? TrendingUp : TrendingDown,
        borderColor: overallEfficiency >= 0 ? 'border-l-green-500' : 'border-l-red-500',
        bgTint: overallEfficiency >= 0 ? 'bg-green-50/50 dark:bg-green-950/20' : 'bg-red-50/50 dark:bg-red-950/20',
        textColor: overallEfficiency >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300',
        iconBg: overallEfficiency >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30',
        iconColor: overallEfficiency >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      },
      {
        title: 'Taxa No Prazo',
        value: `${onTimeRate.toFixed(1)}%`,
        subtitle: `${onTimeActivities.length} de ${completedActivities.length}`,
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
        subtitle: `${totalActual.toFixed(1)}h / ${totalEstimated.toFixed(1)}h`,
        icon: Clock,
        borderColor: budgetDiff > 0 ? 'border-l-orange-500' : 'border-l-green-500',
        bgTint: budgetDiff > 0 ? 'bg-orange-50/50 dark:bg-orange-950/20' : 'bg-green-50/50 dark:bg-green-950/20',
        textColor: budgetDiff > 0 ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300',
        iconBg: budgetDiff > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30',
        iconColor: budgetDiff > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
      },
      {
        title: 'Atividades Críticas',
        value: criticalCount,
        subtitle: criticalCount > 0 ? 'Requer atenção' : 'Tudo em ordem',
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
        subtitle: 'Por atividade concluída',
        icon: TrendingUp,
        borderColor: 'border-l-cyan-500',
        bgTint: 'bg-cyan-50/50 dark:bg-cyan-950/20',
        textColor: 'text-cyan-700 dark:text-cyan-300',
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
        iconColor: 'text-cyan-600 dark:text-cyan-400'
      }
    ];

    return kpiData;
  }, [filteredData.activities, statistics.collaborators, activityStatus.emExecucao]);

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
