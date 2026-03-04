import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  Activity,
  Users,
  Target,
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, hoverScale, tapScale } from '@/lib/animations';
import { useDashboardStore } from '@/stores/dashboardStore';
import { subDays, isAfter, isBefore } from 'date-fns';
import { InfoTooltip } from '@/components/tooltips/InfoTooltip';
import ColaboradorService from '@/services/ColaboradorService';

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
  meta?: string;
  status: 'critical' | 'warning' | 'good' | 'info';
  tooltip: React.ReactNode;
}

// ─── Subcomponentes ────────────────────────────────────────────────────────────

const KPICard = ({ kpi, index }: { kpi: KPICardData; index: number }) => {
  const Icon = kpi.icon;
  return (
    <motion.div
      key={index}
      variants={staggerItem}
      whileHover={hoverScale}
      whileTap={tapScale}
    >
      <Card
        className={cn(
          "border-l-4 border-y border-r",
          "shadow-elevation-2 cursor-pointer h-full",
          kpi.borderColor,
          kpi.bgTint
        )}
      >
        <CardContent className="p-5 h-full flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {kpi.title}
                </p>
                <InfoTooltip
                  variant="help"
                  side="top"
                  content={kpi.tooltip}
                  iconClassName="w-3 h-3"
                />
              </div>
              <h3 className={cn("text-3xl font-bold tabular-nums leading-tight", kpi.textColor)}>
                {kpi.value}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{kpi.subtitle}</p>
              {kpi.meta && (
                <p className="text-xs text-muted-foreground/70 italic mt-1">{kpi.meta}</p>
              )}
            </div>
            <div className={cn("p-2.5 rounded-lg flex-shrink-0", kpi.iconBg)}>
              <Icon className={cn("h-5 w-5", kpi.iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const KPISection = ({
  label,
  accentColor,
  kpis,
  indexOffset,
}: {
  label: string;
  accentColor: string;
  kpis: KPICardData[];
  indexOffset: number;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <div className={cn("h-1 w-12 rounded-full", accentColor)} />
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </h3>
    </div>
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {kpis.map((kpi, i) => (
        <KPICard key={indexOffset + i} kpi={kpi} index={indexOffset + i} />
      ))}
    </motion.div>
  </div>
);

// ───────────────────────────────────────────────────────────────────────────────

/**
 * Componente de KPIs reformulado para PCP
 * Foco em alertas preditivos e performance acionável
 */
export const DashboardKPIsNew = () => {
  const { filteredData, statistics } = useDashboardStore();
  const [productionCollaboratorsCount, setProductionCollaboratorsCount] = useState<number>(0);

  // Buscar colaboradores de Produção ativos para cálculo de capacidade
  useEffect(() => {
    ColaboradorService.getAllColaboradores()
      .then((colaboradores) => {
        const productionActive = colaboradores.filter((c) => {
          if (!c.status) return false; // Apenas ativos
          const setor = (c.sector || '').toUpperCase();
          return setor.startsWith('PRODU'); // Apenas PRODUÇÃO
        });
        setProductionCollaboratorsCount(productionActive.length);
      })
      .catch((error) => {
        console.error('Erro ao buscar colaboradores para cálculo de capacidade:', error);
        setProductionCollaboratorsCount(0);
      });
  }, []);

  // Calcular KPIs com useMemo para performance
  const kpis = useMemo(() => {
    const activities = filteredData.activities || [];
    const now = new Date();
    const next7Days = subDays(now, -7); // 7 dias no futuro
    const last30Days = subDays(now, 30);

    // ============ SEÇÃO ALERTAS ============

    // 1. ATIVIDADES EM RISCO (em andamento atrasadas, >120% tempo, ou planejadas com início atrasado)
    const inProgressActivities = activities.filter(
      a => a.status === 'Em andamento' || a.status === 'Pendente'
    );

    const startDelayedActivities = activities.filter(
      a => a.status === 'Planejado' && a.isStartDelayed
    );

    const inProgressAtRisk = inProgressActivities.filter(a => {
      const isDelayed = a.isDelayed;
      const estimatedTime = Number(a.estimatedTime) || 0;
      const actualTime = Number(a.actualTime) || 0;
      const isOvertime = estimatedTime > 0 && actualTime > estimatedTime * 1.2;
      return isDelayed || isOvertime;
    });

    const atRiskActivities = [...inProgressAtRisk, ...startDelayedActivities];

    const riskCount = atRiskActivities.length;
    const delayedCount = inProgressAtRisk.filter(a => a.isDelayed).length;
    const overtimeCount = inProgressAtRisk.filter(a => {
      const estimatedTime = Number(a.estimatedTime) || 0;
      const actualTime = Number(a.actualTime) || 0;
      return estimatedTime > 0 && actualTime > estimatedTime * 1.2;
    }).length;
    const startDelayedCount = startDelayedActivities.length;

    // 2. GARGALOS DE PROCESSO (processo com maior % de atividades travadas/paralizadas)
    const processCounts: Record<string, { total: number; blocked: number; name: string }> = {};

    activities.forEach(a => {
      if (!a.processId) return;
      const processKey = a.processId.toString();

      if (!processCounts[processKey]) {
        processCounts[processKey] = {
          total: 0,
          blocked: 0,
          name: typeof a.process === 'string' && a.process
            ? a.process
            : `Processo ${processKey}`
        };
      }

      processCounts[processKey].total++;

      if (a.status === 'Paralizada' || a.isDelayed) {
        processCounts[processKey].blocked++;
      }
    });

    let bottleneckProcess = { name: 'Nenhum', count: 0, percent: 0 };
    Object.values(processCounts).forEach(proc => {
      const percent = proc.total > 0 ? (proc.blocked / proc.total) * 100 : 0;
      if (percent > bottleneckProcess.percent && proc.blocked > 0) {
        bottleneckProcess = {
          name: proc.name,
          count: proc.blocked,
          percent: percent
        };
      }
    });

    // 3. SOBRECARGA PRÓXIMOS 7 DIAS (horas agendadas vs disponíveis)
    // Considera: atividades dos próximos 7 dias + atrasadas pendentes
    const upcomingActivities = activities.filter(a => {
      // Excluir atividades finalizadas ou paralisadas
      if (a.status === 'Concluída' || a.status === 'Paralizada' || a.isCompleted) {
        return false;
      }

      const plannedStart = a.plannedStartDate ? new Date(a.plannedStartDate) : null;
      const actualStart = a.startDate ? new Date(a.startDate) : null;

      // Critério 1: Data de início nos próximos 7 dias
      const plannedInRange = plannedStart && isBefore(plannedStart, next7Days);
      const actualInRange = actualStart && isBefore(actualStart, next7Days);

      // Critério 2: Atividade atrasada (início atrasado ou execução atrasada)
      const isOverdue = a.isStartDelayed || a.isDelayed;

      return plannedInRange || actualInRange || isOverdue;
    });

    // Soma do tempo estimado (tempo previsto) das atividades da semana
    const scheduledHours = upcomingActivities.reduce((sum, a) =>
      sum + (Number(a.estimatedTime) || 0), 0
    );

    // Usa colaboradores de Produção ativos para cálculo de capacidade
    const totalCollaborators = productionCollaboratorsCount || 1;
    // 44h/semana: Seg-Qui 9h líq. × 4 + Sex 8h líq. (alinhado com TeamCapacityChart)
    const WEEKLY_CAPACITY = 44;
    const availableHours = totalCollaborators * WEEKLY_CAPACITY;
    const capacityRate = availableHours > 0 ? (scheduledHours / availableHours) * 100 : 0;

    // ============ SEÇÃO PERFORMANCE ============

    // 4. PROGRESSO GERAL (% concluído vs total)
    const completedActivities = activities.filter(a => a.isCompleted);
    const progressRate = activities.length > 0
      ? (completedActivities.length / activities.length) * 100
      : 0;

    // 5. PONTUALIDADE RECENTE (30 dias - % concluídas no prazo)
    const recentCompleted = activities.filter(a => {
      if (!a.isCompleted || !a.endDate) return false;
      const endDate = new Date(a.endDate);
      return isAfter(endDate, last30Days);
    });

    const recentOnTime = recentCompleted.filter(a =>
      (Number(a.actualTime) || 0) <= (Number(a.estimatedTime) || 0)
    );
    const recentOnTimeRate = recentCompleted.length > 0
      ? (recentOnTime.length / recentCompleted.length) * 100
      : 0;

    // 6. VARIAÇÃO DE CRONOGRAMA (IVC de atividades em andamento)
    const inProgressWithEstimate = inProgressActivities.filter(a =>
      Number(a.estimatedTime) > 0
    );

    const totalEstimatedDays = inProgressWithEstimate.reduce((sum, a) => {
      const hours = Number(a.estimatedTime) || 0;
      return sum + (hours / 8); // Converter horas para dias
    }, 0);

    const totalActualDays = inProgressWithEstimate.reduce((sum, a) => {
      const hours = Number(a.actualTime) || 0;
      return sum + (hours / 8);
    }, 0);

    const scheduleVariance = totalEstimatedDays > 0
      ? totalActualDays / totalEstimatedDays
      : 1;

    // Montar dados dos KPIs
    const kpiData: KPICardData[] = [
      // SEÇÃO ALERTAS
      {
        title: 'Atividades em Risco',
        value: riskCount,
        subtitle: (() => {
          const parts: string[] = [];
          if (startDelayedCount > 0) parts.push(`${startDelayedCount} início atrasado`);
          if (delayedCount > 0) parts.push(`${delayedCount} em atraso`);
          if (overtimeCount > 0) parts.push(`${overtimeCount} acima do tempo`);
          return parts.length > 0 ? parts.join(' + ') : 'Nenhuma atividade em risco';
        })(),
        icon: AlertTriangle,
        borderColor: riskCount > 0 ? 'border-l-red-500' : 'border-l-green-500',
        bgTint: riskCount > 0 ? 'bg-red-50/50 dark:bg-red-950/20' : 'bg-green-50/50 dark:bg-green-950/20',
        textColor: riskCount > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300',
        iconBg: riskCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30',
        iconColor: riskCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
        meta: `Meta: < 10% do total (${Math.round(activities.length * 0.1)})`,
        status: riskCount > activities.length * 0.1 ? 'critical' : 'good',
        tooltip: (
          <div className="space-y-1.5">
            <p className="font-semibold">Atividades em Risco</p>
            <p>Conta atividades que se enquadram em uma das situações de risco:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li><strong>Início Atrasado</strong>: status Planejado mas data início prevista já passou</li>
              <li><strong>Em Atraso</strong>: em andamento com data fim ultrapassada</li>
              <li><strong>Acima do Tempo</strong>: excederam 120% do tempo estimado</li>
            </ul>
            <p className="text-muted-foreground">Meta: manter abaixo de 10% do total de atividades.</p>
          </div>
        )
      },
      {
        title: 'Gargalos de Processo',
        value: bottleneckProcess.name,
        subtitle: bottleneckProcess.count > 0
          ? `${bottleneckProcess.count} atividades (${bottleneckProcess.percent.toFixed(1)}% travadas)`
          : 'Nenhum gargalo identificado',
        icon: Activity,
        borderColor: bottleneckProcess.percent > 10 ? 'border-l-orange-500' : 'border-l-green-500',
        bgTint: bottleneckProcess.percent > 10 ? 'bg-orange-50/50 dark:bg-orange-950/20' : 'bg-green-50/50 dark:bg-green-950/20',
        textColor: bottleneckProcess.percent > 10 ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300',
        iconBg: bottleneckProcess.percent > 10 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30',
        iconColor: bottleneckProcess.percent > 10 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400',
        meta: 'Meta: < 10% por processo',
        status: bottleneckProcess.percent > 10 ? 'warning' : 'good',
        tooltip: (
          <div className="space-y-1.5">
            <p className="font-semibold">Gargalos de Processo</p>
            <p>Identifica o processo com maior percentual de atividades <strong>paralisadas ou atrasadas</strong>, indicando onde o fluxo produtivo está travado.</p>
            <p className="text-muted-foreground">Meta: nenhum processo com mais de 10% das atividades travadas.</p>
          </div>
        )
      },
      {
        title: 'Sobrecarga Próximos 7d',
        value: `${capacityRate.toFixed(1)}%`,
        subtitle: `${scheduledHours.toFixed(0)}h agendadas / ${availableHours.toFixed(0)}h disponíveis`,
        icon: Users,
        borderColor: capacityRate > 90 ? 'border-l-red-500' : capacityRate > 70 ? 'border-l-yellow-500' : 'border-l-green-500',
        bgTint: capacityRate > 90 ? 'bg-red-50/50 dark:bg-red-950/20' : capacityRate > 70 ? 'bg-yellow-50/50 dark:bg-yellow-950/20' : 'bg-green-50/50 dark:bg-green-950/20',
        textColor: capacityRate > 90 ? 'text-red-700 dark:text-red-300' : capacityRate > 70 ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300',
        iconBg: capacityRate > 90 ? 'bg-red-100 dark:bg-red-900/30' : capacityRate > 70 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30',
        iconColor: capacityRate > 90 ? 'text-red-600 dark:text-red-400' : capacityRate > 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400',
        meta: 'Meta: 70-90%',
        status: capacityRate > 95 ? 'critical' : capacityRate > 90 ? 'warning' : 'good',
        tooltip: (
          <div className="space-y-2 max-w-sm">
            <p className="font-semibold">Sobrecarga de Capacidade</p>
            <p className="text-xs">Percentual da capacidade da equipe que será utilizada nos próximos 7 dias.</p>
            <p className="text-xs">🟢 &lt;70%: Ocioso &nbsp; ✅ 70-90%: Ideal &nbsp; 🟡 &gt;90%: Risco &nbsp; 🔴 &gt;95%: Crítico</p>

            {upcomingActivities.length > 0 && (
              <div className="border-t pt-2 mt-2">
                <p className="font-semibold text-xs mb-1">Atividades agendadas ({upcomingActivities.length}):</p>
                <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                  {upcomingActivities.slice(0, 10).map((a, idx) => (
                    <li key={a.id || idx} className="flex justify-between gap-2">
                      <span className="truncate flex-1">{a.description || `Atividade ${a.id}`}</span>
                      <span className="text-muted-foreground whitespace-nowrap">{Number(a.estimatedTime || 0).toFixed(1)}h</span>
                    </li>
                  ))}
                  {upcomingActivities.length > 10 && (
                    <li className="text-muted-foreground italic">... e mais {upcomingActivities.length - 10} atividades</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )
      },

      // SEÇÃO PERFORMANCE
      {
        title: 'Progresso Geral',
        value: `${progressRate.toFixed(1)}%`,
        subtitle: `${completedActivities.length} de ${activities.length} atividades finalizadas`,
        icon: Target,
        borderColor: 'border-l-blue-500',
        bgTint: 'bg-blue-50/50 dark:bg-blue-950/20',
        textColor: 'text-blue-700 dark:text-blue-300',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        meta: `Meta: alinhado com tempo decorrido`,
        status: 'info',
        tooltip: (
          <div className="space-y-1.5">
            <p className="font-semibold">Progresso Geral</p>
            <p>Percentual de atividades concluídas sobre o total no período selecionado. Deve estar alinhado proporcionalmente com o tempo já decorrido do projeto.</p>
            <p className="text-muted-foreground">Ex: se o projeto está a 60% do prazo, espera-se ~60% de progresso.</p>
          </div>
        )
      },
      {
        title: 'Eficiência Operacional',
        value: `${recentOnTimeRate.toFixed(1)}%`,
        subtitle: `${recentOnTime.length} de ${recentCompleted.length} entregas no prazo`,
        icon: Clock,
        borderColor: recentOnTimeRate >= 90 ? 'border-l-green-500' : recentOnTimeRate >= 75 ? 'border-l-yellow-500' : 'border-l-red-500',
        bgTint: recentOnTimeRate >= 90 ? 'bg-green-50/50 dark:bg-green-950/20' : recentOnTimeRate >= 75 ? 'bg-yellow-50/50 dark:bg-yellow-950/20' : 'bg-red-50/50 dark:bg-red-950/20',
        textColor: recentOnTimeRate >= 90 ? 'text-green-700 dark:text-green-300' : recentOnTimeRate >= 75 ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300',
        iconBg: recentOnTimeRate >= 90 ? 'bg-green-100 dark:bg-green-900/30' : recentOnTimeRate >= 75 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30',
        iconColor: recentOnTimeRate >= 90 ? 'text-green-600 dark:text-green-400' : recentOnTimeRate >= 75 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400',
        meta: 'Meta: > 90%',
        status: recentOnTimeRate < 75 ? 'critical' : recentOnTimeRate < 90 ? 'warning' : 'good',
        tooltip: (
          <div className="space-y-1.5">
            <p className="font-semibold">Eficiência Operacional — Últimos 30 Dias</p>
            <p>Percentual de atividades concluídas nos últimos 30 dias que foram entregues dentro do tempo estimado (tempo real ≤ tempo previsto).</p>
            <p>🟢 ≥90%: Excelente &nbsp; 🟡 75-89%: Atenção &nbsp; 🔴 &lt;75%: Crítico</p>
          </div>
        )
      },
      {
        title: 'Variação de Cronograma',
        value: scheduleVariance.toFixed(2),
        subtitle: scheduleVariance > 1
          ? `${((scheduleVariance - 1) * 100).toFixed(1)}% mais lento`
          : scheduleVariance < 1
            ? `${((1 - scheduleVariance) * 100).toFixed(1)}% mais rápido`
            : 'No prazo',
        icon: TrendingUp,
        borderColor: scheduleVariance <= 1.05 ? 'border-l-green-500' : scheduleVariance <= 1.15 ? 'border-l-yellow-500' : 'border-l-red-500',
        bgTint: scheduleVariance <= 1.05 ? 'bg-green-50/50 dark:bg-green-950/20' : scheduleVariance <= 1.15 ? 'bg-yellow-50/50 dark:bg-yellow-950/20' : 'bg-red-50/50 dark:bg-red-950/20',
        textColor: scheduleVariance <= 1.05 ? 'text-green-700 dark:text-green-300' : scheduleVariance <= 1.15 ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300',
        iconBg: scheduleVariance <= 1.05 ? 'bg-green-100 dark:bg-green-900/30' : scheduleVariance <= 1.15 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30',
        iconColor: scheduleVariance <= 1.05 ? 'text-green-600 dark:text-green-400' : scheduleVariance <= 1.15 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400',
        meta: 'Meta: < 1.05 (até 5% atraso)',
        status: scheduleVariance > 1.15 ? 'critical' : scheduleVariance > 1.05 ? 'warning' : 'good',
        tooltip: (
          <div className="space-y-1.5">
            <p className="font-semibold">Variação de Cronograma (IVC)</p>
            <p>Índice que compara o tempo real gasto vs. o tempo estimado nas atividades em andamento.</p>
            <p>🟢 &lt;1.0: Adiantado &nbsp; ✅ 1.0-1.05: No prazo &nbsp; 🟡 1.05-1.15: Atenção &nbsp; 🔴 &gt;1.15: Atrasado</p>
          </div>
        )
      }
    ];

    return kpiData;
  // Usar .length como dependência primitiva — evita re-cálculo por referência instável do array
  }, [filteredData.activities, productionCollaboratorsCount]);

  return (
    <div className="space-y-6">
      <KPISection
        label="Alertas - Ação Imediata"
        accentColor="bg-red-500"
        kpis={kpis.slice(0, 3)}
        indexOffset={0}
      />
      <KPISection
        label="Performance - Acompanhamento"
        accentColor="bg-blue-500"
        kpis={kpis.slice(3, 6)}
        indexOffset={3}
      />
    </div>
  );
};
