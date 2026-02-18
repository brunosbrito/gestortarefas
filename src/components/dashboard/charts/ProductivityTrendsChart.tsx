import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, BarChart3, Maximize2 } from 'lucide-react';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Legend,
  Category,
  Tooltip,
  ColumnSeries,
  LineSeries,
  AxisModel,
} from '@syncfusion/ej2-react-charts';
import '@/config/syncfusionLocale';
import { useDashboardStore } from '@/stores/dashboardStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { startOfWeek, subWeeks, isWithinInterval, format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from '@/contexts/ThemeContext';

interface TrendDataPoint {
  period: string;
  completedCount: number;
  efficiency: number;    // Eficiência Média (%)
  onTimeRate: number;    // Taxa No Prazo (%)
}

/**
 * Converte totalTime para horas
 * Se for > 500, assumimos que está em minutos e convertemos para horas
 */
const getTotalTimeInHours = (totalTime: number | string | null | undefined): number => {
  if (totalTime === null || totalTime === undefined) return 0;
  const numericValue = typeof totalTime === 'string' ? parseFloat(totalTime) : totalTime;
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
 * Calcula dados de tendencia de produtividade das ultimas 12 semanas
 */
const calculateTrendData = (activities: any[]): TrendDataPoint[] => {
  const completedActivities = activities.filter(a =>
    a.status === 'Concluída' && a.endDate
  );

  const weeks: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const weekEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });

    const weekActivities = completedActivities.filter(a => {
      const endDate = new Date(a.endDate);
      return isWithinInterval(endDate, { start: weekStart, end: weekEnd });
    });

    const completedCount = weekActivities.length;

    // Eficiência: (estimado / trabalhado) * 100, limitado a 0-100%
    // 100% = no prazo ou melhor, < 100% = atrasado
    const efficiency = completedCount > 0
      ? weekActivities.reduce((sum, a) => {
          const est = getEstimatedTimeInHours(a.estimatedTime);
          const act = getTotalTimeInHours(a.totalTime) || getTotalTimeInHours(a.actualTime) || 0;
          // Se terminou no prazo ou antes, eficiência = 100%
          // Se atrasou, eficiência = (estimado/trabalhado) * 100
          const eff = act > 0 && est > 0 ? Math.min(100, (est / act) * 100) : 0;
          return sum + eff;
        }, 0) / completedCount
      : 0;

    // Taxa no prazo: % de atividades que terminaram dentro do tempo estimado
    const onTimeCount = weekActivities.filter(a => {
      const est = getEstimatedTimeInHours(a.estimatedTime);
      const act = getTotalTimeInHours(a.totalTime) || getTotalTimeInHours(a.actualTime) || 0;
      return est > 0 && act > 0 && act <= est;
    }).length;
    const onTimeRate = completedCount > 0
      ? (onTimeCount / completedCount) * 100
      : 0;

    // Formatar label com range de datas: "08-14 fev"
    const weekEndDay = addDays(weekStart, 6);
    const weekLabel = `${format(weekStart, "dd")}-${format(weekEndDay, "dd")} ${format(weekStart, "MMM", { locale: ptBR })}`;

    weeks.push({
      period: weekLabel,
      completedCount,
      efficiency: parseFloat(efficiency.toFixed(1)),
      onTimeRate: parseFloat(onTimeRate.toFixed(1))
    });
  }

  return weeks;
};

export const ProductivityTrendsChart = () => {
  const { filteredData } = useDashboardStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const trendData = useMemo(() =>
    calculateTrendData(filteredData.activities || []),
    [filteredData.activities]
  );

  const hasData = trendData.length > 0 && trendData.some(d => d.completedCount > 0);
  const totalCompleted = trendData.reduce((sum, d) => sum + d.completedCount, 0);

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
        <ChartComponent
          primaryXAxis={primaryXAxis}
          primaryYAxis={primaryYAxis}
          axes={axes}
          tooltip={{ enable: true, shared: false }}
          tooltipRender={tooltipRender}
          enableHtmlSanitizer={false}
          legendSettings={{
            visible: true,
            position: 'Bottom',
            textStyle: { color: isDark ? '#e2e8f0' : '#334155', size: '11px' },
          }}
          background={isDark ? '#0f172a' : '#ffffff'}
          chartArea={{ border: { width: 0 } }}
          height={height}
          locale="pt-BR"
        >
          <Inject services={[ColumnSeries, LineSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            {/* Barras: Atividades Concluídas */}
            <SeriesDirective
              dataSource={trendData}
              xName="period"
              yName="completedCount"
              name="Atividades Concluídas"
              type="Column"
              fill="#3B82F6"
              cornerRadius={{ topLeft: 4, topRight: 4 }}
              columnWidth={0.6}
            />
            {/* Linha: Eficiência Média */}
            <SeriesDirective
              dataSource={trendData}
              xName="period"
              yName="efficiency"
              name="Eficiência Média (%)"
              type="Line"
              fill="#10B981"
              width={2}
              yAxisName="percentAxis"
              marker={{
                visible: true,
                fill: '#10B981',
                width: 8,
                height: 8,
                shape: 'Circle',
              }}
            />
            {/* Linha: Taxa No Prazo */}
            <SeriesDirective
              dataSource={trendData}
              xName="period"
              yName="onTimeRate"
              name="Taxa No Prazo (%)"
              type="Line"
              fill="#F97316"
              width={2}
              dashArray="5,3"
              yAxisName="percentAxis"
              marker={{
                visible: true,
                fill: '#F97316',
                width: 8,
                height: 8,
                shape: 'Triangle',
              }}
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      )}
    </div>
  );

  return (
    <Card className="border border-border/50 shadow-elevation-2 overflow-hidden">
      {/* Header com gradient */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Tendências de Produtividade
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Últimas 12 semanas - Atividades concluídas e eficiência
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {totalCompleted} {totalCompleted === 1 ? 'atividade' : 'atividades'}
            </div>
            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        Últimas 12 semanas - {totalCompleted} {totalCompleted === 1 ? 'atividade concluída' : 'atividades concluídas'}
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
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderChart()}
      </div>
    </Card>
  );
};
