import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, BarChart3, Maximize2 } from 'lucide-react';
import { InfoTooltip } from '@/components/tooltips/InfoTooltip';
import { cn } from '@/lib/utils';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { useDashboardStore } from '@/stores/dashboardStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { startOfWeek, subWeeks, isWithinInterval, isAfter } from 'date-fns';
import { ActivityDrilldownDialog } from '../ActivityDrilldownDialog';
import { FilteredActivity } from '@/interfaces/DashboardFilters';

interface TrendDataPoint {
  period: string;         // "Sem 1", "Sem 2", ...
  weekStart: Date;        // Para filtrar atividades no drilldown
  weekEnd: Date;          // Para filtrar atividades no drilldown
  completedCount: number; // Atividades concluídas
  startedCount: number;   // Atividades iniciadas (NOVA MÉTRICA)
  avgEfficiency: number;  // Eficiência média (%)
  onTimeRate: number;     // Taxa no prazo (%)
}

// Aceita número (horas) ou string "Xh", "Xh Ymin", "Ymin"
const parseTimeToHours = (time: string | number | null | undefined): number => {
  if (time === null || time === undefined) return 0;
  if (typeof time === 'number') return time;
  if (typeof time !== 'string' || !time) return 0;
  const matchFull = time.match(/(\d+)h\s*(\d+)min/);
  if (matchFull) return parseInt(matchFull[1], 10) + parseInt(matchFull[2], 10) / 60;
  const matchH = time.match(/(\d+)h/);
  if (matchH) return parseInt(matchH[1], 10);
  const matchMin = time.match(/(\d+)min/);
  if (matchMin) return parseInt(matchMin[1], 10) / 60;
  return 0;
};

/**
 * Calcula dados de tendência de produtividade das últimas N semanas
 */
const calculateTrendData = (activities: any[], weeks: number, processFilter: string): TrendDataPoint[] => {
  // Filtrar atividades por processo se aplicável
  let filteredActivities = activities;
  if (processFilter !== 'all') {
    filteredActivities = activities.filter(a => a.process === processFilter);
  }

  // Gerar últimas N semanas
  const weekData: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }); // Segunda-feira
    const weekEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });

    // Atividades CONCLUÍDAS nesta semana
    const completedActivities = filteredActivities.filter(a => {
      if (!a.isCompleted || !a.endDate) return false;
      const endDate = new Date(a.endDate);
      return isWithinInterval(endDate, { start: weekStart, end: weekEnd });
    });

    // Atividades INICIADAS nesta semana (NOVA MÉTRICA)
    const startedActivities = filteredActivities.filter(a => {
      if (!a.startDate) return false;
      const startDate = new Date(a.startDate);
      return isWithinInterval(startDate, { start: weekStart, end: weekEnd });
    });

    // Calcular métricas para esta semana
    const completedCount = completedActivities.length;
    const startedCount = startedActivities.length;

    // Eficiência: só considera atividades com ambos os tempos preenchidos
    const activitiesWithData = completedActivities.filter(a => {
      const est = parseTimeToHours(a.estimatedTime);
      const act = parseTimeToHours(a.actualTime);
      return est > 0 && act > 0;
    });
    const avgEfficiency = activitiesWithData.length > 0
      ? activitiesWithData.reduce((sum, a) => {
          const est = parseTimeToHours(a.estimatedTime);
          const act = parseTimeToHours(a.actualTime);
          // Clamp em [-100, 100] para evitar escala extrema no gráfico
          const eff = Math.max(-100, Math.min(100, ((est - act) / est) * 100));
          return sum + eff;
        }, 0) / activitiesWithData.length
      : 0;

    // Taxa no prazo: dentre as com dados válidos, quantas entregaram dentro do estimado
    const activitiesForOnTime = completedActivities.filter(a => {
      const est = parseTimeToHours(a.estimatedTime);
      const act = parseTimeToHours(a.actualTime);
      return est > 0 && act > 0;
    });
    const onTimeCount = activitiesForOnTime.filter(a => {
      const est = parseTimeToHours(a.estimatedTime);
      const act = parseTimeToHours(a.actualTime);
      return act <= est;
    }).length;

    const onTimeRate = activitiesForOnTime.length > 0
      ? (onTimeCount / activitiesForOnTime.length) * 100
      : 0;

    weekData.push({
      period: `Sem ${weeks - i}`,
      weekStart,
      weekEnd,
      completedCount,
      startedCount,
      avgEfficiency: parseFloat(avgEfficiency.toFixed(1)),
      onTimeRate: parseFloat(onTimeRate.toFixed(1))
    });
  }

  return weekData;
};

/**
 * Componente de gráfico de tendências de produtividade
 * Exibe atividades concluídas, iniciadas, eficiência e taxa no prazo nas últimas N semanas
 */
export const ProductivityTrendsChart = () => {
  const { filteredData } = useDashboardStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [weeksFilter, setWeeksFilter] = useState<number>(12);
  const [processFilter, setProcessFilter] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<TrendDataPoint | null>(null);
  const [drilldownOpen, setDrilldownOpen] = useState(false);

  // Obter lista de processos únicos para o filtro
  const availableProcesses = useMemo(() => {
    const processes = new Set<string>();
    (filteredData.activities || []).forEach(activity => {
      if (activity.process) {
        processes.add(activity.process);
      }
    });
    return Array.from(processes).sort();
  }, [filteredData.activities]);

  const trendData = useMemo(() =>
    calculateTrendData(filteredData.activities || [], weeksFilter, processFilter),
    [filteredData.activities, weeksFilter, processFilter]
  );

  const hasData = trendData.length > 0 && trendData.some(d => d.completedCount > 0 || d.startedCount > 0);
  const totalCompleted = trendData.reduce((sum, d) => sum + d.completedCount, 0);
  const totalStarted = trendData.reduce((sum, d) => sum + d.startedCount, 0);

  // Obter atividades para o drilldown
  const getDrilldownActivities = (week: TrendDataPoint): FilteredActivity[] => {
    let activities = filteredData.activities || [];

    if (processFilter !== 'all') {
      activities = activities.filter(a => a.process === processFilter);
    }

    // Retornar atividades que foram concluídas OU iniciadas nesta semana
    return activities.filter(a => {
      const completed = a.isCompleted && a.endDate
        ? isWithinInterval(new Date(a.endDate), { start: week.weekStart, end: week.weekEnd })
        : false;

      const started = a.startDate
        ? isWithinInterval(new Date(a.startDate), { start: week.weekStart, end: week.weekEnd })
        : false;

      return completed || started;
    });
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const weekData = data.activePayload[0].payload as TrendDataPoint;
      setSelectedWeek(weekData);
      setDrilldownOpen(true);
    }
  };

  // Calcular intervalo do eixo Y para atividades
  const maxCompleted = useMemo(() => {
    const max = Math.max(...trendData.map(d => d.completedCount), 1);
    return max;
  }, [trendData]);

  const yAxisInterval = useMemo(() => {
    if (maxCompleted <= 5) return 1;
    if (maxCompleted <= 10) return 2;
    if (maxCompleted <= 20) return 5;
    if (maxCompleted <= 50) return 10;
    return 20;
  }, [maxCompleted]);

  // Eixo X
  const primaryXAxis = useMemo<AxisModel>(() => ({
    valueType: 'Category',
    labelStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '10px',
    },
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
  }), [isDark]);

  // Eixo Y primário (Atividades Concluídas - esquerda)
  const primaryYAxis = useMemo<AxisModel>(() => ({
    title: 'Atividades Concluídas',
    titleStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '11px',
    },
    labelStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '10px',
    },
    majorGridLines: { width: 0 },
    minorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    minorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    minimum: 0,
    interval: yAxisInterval,
  }), [isDark, yAxisInterval]);

  // Configuração dos eixos secundários
  const axes = useMemo(() => [{
    name: 'percentAxis',
    opposedPosition: true,
    title: 'Percentual (%)',
    titleStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '11px',
    },
    labelStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '10px',
    },
    majorGridLines: { width: 0 },
    minorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    minorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    minimum: 0,
    maximum: 120,
    interval: 20,
    labelFormat: '{value}%',
  }], [isDark]);

  const tooltipRender = (args: any) => {
    if (args.point && args.series) {
      const dataIndex = args.point.index;
      const data = trendData[dataIndex];
      if (data) {
        const seriesName = args.series.name;
        if (seriesName.includes('Atividades')) {
          args.text = `<b>${data.period}</b><br/>Concluídas: ${data.completedCount}`;
        } else if (seriesName.includes('Eficiência')) {
          args.text = `<b>${data.period}</b><br/>Eficiência: ${data.efficiency}%`;
        } else {
          args.text = `<b>${data.period}</b><br/>Taxa No Prazo: ${data.onTimeRate}%`;
        }
      }
    }
  };

  const renderChart = (height: string = '320px') => (
    <div style={{ height }}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <BarChart3 className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhuma atividade concluída no período selecionado</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={trendData}
            margin={{ top: 10, right: 50, left: 10, bottom: 5 }}
            onClick={handleChartClick}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={60}
              style={{ fontSize: 11 }}
            />
            {/* Eixo esquerdo: contagem de atividades */}
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              width={35}
            />
            {/* Eixo direito: percentuais (0-100%) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[-100, 100]}
              tickFormatter={(v) => `${v}%`}
              width={52}
            />

            {/* Linha de meta em 90% para Taxa No Prazo */}
            <ReferenceLine
              yAxisId="right"
              y={90}
              stroke="#EF4444"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: 'Meta 90%',
                position: 'insideTopRight',
                fill: '#EF4444',
                fontSize: 10,
                dy: -6
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TrendDataPoint;
                  return (
                    <div className="bg-card/95 backdrop-blur-sm p-3 border border-border/50 rounded-lg shadow-lg min-w-[220px]">
                      <p className="font-semibold mb-2 text-base">{data.period}</p>
                      <div className="space-y-1.5 text-sm">
                        <p className="flex justify-between">
                          <span>Concluídas:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">{data.completedCount}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Iniciadas:</span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">{data.startedCount}</span>
                        </p>
                        <div className="h-px bg-border my-1"></div>
                        <p className="flex justify-between">
                          <span>Eficiência Média:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{data.avgEfficiency.toFixed(1)}%</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Taxa No Prazo:</span>
                          <span className={cn(
                            "font-medium",
                            data.onTimeRate >= 90 ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
                          )}>
                            {data.onTimeRate.toFixed(1)}%
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">Clique para ver atividades</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              iconType="rect"
              iconSize={10}
            />
            <Bar
              yAxisId="left"
              dataKey="completedCount"
              name="Atividades Concluídas"
              type="Column"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
            />
            <Bar
              yAxisId="left"
              dataKey="startedCount"
              name="Atividades Iniciadas"
              fill="#A855F7"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
            />
            {/* Linha: Eficiência Média */}
            <SeriesDirective
              dataSource={trendData}
              xName="period"
              yName="efficiency"
              name="Eficiência Média (%)"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
              cursor="pointer"
            />
            {/* Linha: Taxa No Prazo */}
            <SeriesDirective
              dataSource={trendData}
              xName="period"
              yName="onTimeRate"
              name="Taxa No Prazo (%)"
              stroke="#FF7F0E"
              strokeWidth={2}
              dot={{ fill: '#FF7F0E', r: 4 }}
              strokeDasharray="5 5"
              cursor="pointer"
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      )}
    </div>
  );

  return (
    <>
      <Card className="border border-border/50 shadow-elevation-2 overflow-hidden h-full flex flex-col">
        {/* Header com gradient — 2 linhas para caber em meia largura */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 border-b border-border/50 p-3">
          {/* Linha 1: ícone + título + expand */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-semibold text-foreground leading-tight truncate">
                    Tendências de Produtividade
                  </h3>
                  <InfoTooltip
                    variant="help"
                    side="top"
                    content={
                      <div className="space-y-1.5">
                        <p className="font-semibold">Tendências de Produtividade</p>
                        <p>Evolução semanal das atividades concluídas, iniciadas e da eficiência da equipe ao longo das últimas semanas.</p>
                        <p>📊 Barras: atividades concluídas e iniciadas por semana</p>
                        <p>📈 Linha: eficiência (% de atividades concluídas no prazo)</p>
                        <p className="text-muted-foreground">Use o filtro de semanas para ampliar ou reduzir o horizonte de análise.</p>
                      </div>
                    }
                    iconClassName="w-3.5 h-3.5"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  Últimas {weeksFilter} semanas — Atividades e eficiência
                </p>
              </div>
            </div>

            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl w-[95vw] h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20">
                      <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Tendências de Produtividade</div>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        Últimas {weeksFilter} semanas — {totalCompleted} concluída{totalCompleted !== 1 ? 's' : ''} • {totalStarted} iniciada{totalStarted !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0">
                  {renderChart('calc(90vh - 120px)')}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Linha 2: filtros + contador */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Select value={weeksFilter.toString()} onValueChange={(v) => setWeeksFilter(Number(v))}>
              <SelectTrigger className="w-[110px] h-7 text-xs">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 semanas</SelectItem>
                <SelectItem value="8">8 semanas</SelectItem>
                <SelectItem value="12">12 semanas</SelectItem>
                <SelectItem value="24">24 semanas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={processFilter} onValueChange={setProcessFilter}>
              <SelectTrigger className="w-[130px] h-7 text-xs">
                <SelectValue placeholder="Processo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Processos</SelectItem>
                {availableProcesses.map(process => (
                  <SelectItem key={process} value={process}>
                    {process.length > 18 ? `${process.substring(0, 18)}...` : process}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-xs text-muted-foreground ml-auto">
              {totalCompleted} concluída{totalCompleted !== 1 ? 's' : ''} • {totalStarted} iniciada{totalStarted !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-2 flex-1 flex flex-col min-h-0">
          {renderChart("h-full")}
        </div>
      </Card>

      {/* Dialog de drilldown para atividades */}
      {selectedWeek && (
        <ActivityDrilldownDialog
          open={drilldownOpen}
          onOpenChange={setDrilldownOpen}
          title={`Atividades - ${selectedWeek.period}`}
          subtitle={`${selectedWeek.completedCount} concluída(s) • ${selectedWeek.startedCount} iniciada(s) nesta semana`}
          activities={getDrilldownActivities(selectedWeek)}
          loading={false}
        />
      )}
    </>
  );
};
