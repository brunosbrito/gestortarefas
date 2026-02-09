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
import { startOfWeek, subWeeks, isWithinInterval } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';

interface TrendDataPoint {
  period: string;         // "Sem 1", "Sem 2", ...
  completedCount: number; // Atividades concluidas
  avgEfficiency: number;  // Eficiencia media (%)
  onTimeRate: number;     // Taxa no prazo (%)
}

/**
 * Calcula dados de tendencia de produtividade das ultimas 12 semanas
 */
const calculateTrendData = (activities: any[]): TrendDataPoint[] => {
  // Filtrar apenas atividades concluidas com endDate
  const completedActivities = activities.filter(a =>
    a.isCompleted && a.endDate
  );

  if (completedActivities.length === 0) return [];

  // Gerar ultimas 12 semanas
  const weeks: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }); // Segunda-feira
    const weekEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });

    // Filtrar atividades concluidas nesta semana
    const weekActivities = completedActivities.filter(a => {
      const endDate = new Date(a.endDate);
      return isWithinInterval(endDate, { start: weekStart, end: weekEnd });
    });

    // Calcular metricas para esta semana
    const completedCount = weekActivities.length;

    const avgEfficiency = completedCount > 0
      ? weekActivities.reduce((sum, a) => {
          const est = Number(a.estimatedTime) || 0;
          const act = Number(a.actualTime) || 0;
          const eff = est > 0 ? ((est - act) / est) * 100 : 0;
          // Limitar eficiencia entre -100 e 100
          return sum + Math.max(-100, Math.min(100, eff));
        }, 0) / completedCount
      : 0;

    const onTimeCount = weekActivities.filter(a =>
      (Number(a.actualTime) || 0) <= (Number(a.estimatedTime) || 0)
    ).length;
    const onTimeRate = completedCount > 0
      ? (onTimeCount / completedCount) * 100
      : 0;

    weeks.push({
      period: `Sem ${12 - i}`,
      completedCount,
      avgEfficiency: parseFloat(avgEfficiency.toFixed(1)),
      onTimeRate: parseFloat(onTimeRate.toFixed(1))
    });
  }

  return weeks;
};

/**
 * Componente de grafico de tendencias de produtividade
 * Exibe atividades concluidas, eficiencia e taxa no prazo nas ultimas 12 semanas
 */
export const ProductivityTrendsChart = () => {
  const { filteredData } = useDashboardStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calcular dados de tendencia com useMemo
  const trendData = useMemo(() =>
    calculateTrendData(filteredData.activities || []),
    [filteredData.activities]
  );

  const hasData = trendData.length > 0 && trendData.some(d => d.completedCount > 0);
  const totalCompleted = trendData.reduce((sum, d) => sum + d.completedCount, 0);

  const primaryXAxis = useMemo<AxisModel>(() => ({
    valueType: 'Category',
    labelRotation: -45,
    labelStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '11px',
    },
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
  }), [isDark]);

  const primaryYAxis = useMemo<AxisModel>(() => ({
    title: 'Atividades Concluidas',
    titleStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '12px',
    },
    labelStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
    },
    majorGridLines: {
      width: 1,
      color: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(0, 0, 0, 0.1)',
      dashArray: '3,3',
    },
    lineStyle: { width: 0 },
    minimum: 0,
  }), [isDark]);

  const secondaryYAxis = useMemo<AxisModel[]>(() => [{
    name: 'percentAxis',
    opposedPosition: true,
    title: 'Percentual (%)',
    titleStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '12px',
    },
    labelStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
    },
    majorGridLines: { width: 0 },
    lineStyle: { width: 0 },
    minimum: 0,
    maximum: 100,
    labelFormat: '{value}%',
  }], [isDark]);

  const tooltipRender = (args: any) => {
    if (args.point && args.series) {
      const dataIndex = args.point.index;
      const data = trendData[dataIndex];
      if (data) {
        args.text = `<b>${data.period}</b><br/>` +
          `Concluídas: ${data.completedCount}<br/>` +
          `Eficiência Média: ${data.avgEfficiency}%<br/>` +
          `Taxa No Prazo: ${data.onTimeRate}%`;
      }
    }
  };

  const renderChart = (height: string = '320px') => (
    <div style={{ height }}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <BarChart3 className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhuma atividade concluida no periodo selecionado</p>
        </div>
      ) : (
        <ChartComponent
          primaryXAxis={primaryXAxis}
          primaryYAxis={primaryYAxis}
          axes={secondaryYAxis}
          tooltip={{ enable: true, shared: false, enableMarker: true }}
          tooltipRender={tooltipRender}
          enableHtmlSanitizer={false}
          legendSettings={{
            visible: true,
            position: 'Bottom',
            textStyle: { color: isDark ? '#e2e8f0' : '#334155' },
          }}
          background={isDark ? '#0f172a' : '#ffffff'}
          chartArea={{ border: { width: 0 } }}
          height={height}
          locale="pt-BR"
        >
          <Inject services={[ColumnSeries, LineSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={trendData}
              xName="period"
              yName="completedCount"
              name="Atividades Concluidas"
              type="Column"
              fill="#3B82F6"
              cornerRadius={{ topLeft: 4, topRight: 4 }}
              columnWidth={0.6}
            />
            <SeriesDirective
              dataSource={trendData}
              xName="period"
              yName="avgEfficiency"
              name="Eficiencia Media (%)"
              type="Line"
              fill="#10B981"
              width={2}
              yAxisName="percentAxis"
              marker={{
                visible: true,
                fill: '#10B981',
                width: 8,
                height: 8,
              }}
            />
            <SeriesDirective
              dataSource={trendData}
              xName="period"
              yName="onTimeRate"
              name="Taxa No Prazo (%)"
              type="Line"
              fill="#FF7F0E"
              width={2}
              dashArray="5,5"
              yAxisName="percentAxis"
              marker={{
                visible: true,
                fill: '#FF7F0E',
                width: 8,
                height: 8,
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
                Tendencias de Produtividade
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ultimas 12 semanas - Atividades concluidas e eficiencia
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
                      <div className="text-lg font-semibold">Tendencias de Produtividade</div>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        Ultimas 12 semanas - {totalCompleted} {totalCompleted === 1 ? 'atividade concluida' : 'atividades concluidas'}
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
      <div className="p-6">
        {renderChart()}
      </div>
    </Card>
  );
};
