import { Card } from '@/components/ui/card';
import { HardDrive, BarChart3, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Legend,
  Category,
  Tooltip,
  DataLabel,
  ColumnSeries,
} from '@syncfusion/ej2-react-charts';
import '@/config/syncfusionLocale';
import { MacroTaskStatistic } from '@/interfaces/ActivityStatistics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface MacroTasksChartProps {
  macroTasks: MacroTaskStatistic[];
}

export const MacroTasksChart = ({ macroTasks }: MacroTasksChartProps) => {
  const hasData = macroTasks && macroTasks.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Preparar dados com valores arredondados para exibição
  const chartData = useMemo(() => {
    return macroTasks.map(task => ({
      ...task,
      macroTask: task.macroTask.length > 15 ? `${task.macroTask.substring(0, 15)}...` : task.macroTask,
      fullName: task.macroTask,
      estimatedHours: Math.round(task.estimatedHours * 10) / 10,
      actualHours: Math.round(task.actualHours * 10) / 10,
    }));
  }, [macroTasks]);

  const primaryXAxis = useMemo(() => ({
    valueType: 'Category' as const,
    labelRotation: -45,
    labelStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '11px',
    },
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
  }), [isDark]);

  // Calcular intervalo ideal baseado no valor máximo
  const maxValue = useMemo(() => {
    if (!hasData) return 50;
    const values = macroTasks.flatMap(t => [t.estimatedHours, t.actualHours]);
    return Math.max(...values, 10);
  }, [macroTasks, hasData]);

  const yAxisInterval = useMemo(() => {
    if (maxValue <= 20) return 2;
    if (maxValue <= 50) return 5;
    if (maxValue <= 100) return 10;
    if (maxValue <= 200) return 25;
    if (maxValue <= 500) return 50;
    if (maxValue <= 1000) return 100;
    if (maxValue <= 5000) return 500;
    return Math.ceil(maxValue / 10);
  }, [maxValue]);

  const primaryYAxis = useMemo(() => ({
    labelStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '11px',
    },
    majorGridLines: { width: 0 },
    minorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    minorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    labelFormat: '{value}h',
    minimum: 0,
    interval: yAxisInterval,
  }), [isDark, yAxisInterval]);

  const tooltipRender = (args: any) => {
    if (args.point && args.series) {
      const dataIndex = args.point.index;
      const originalData = macroTasks[dataIndex];
      if (originalData) {
        const difference = originalData.hoursDifference;
        const differenceText = difference > 0 ? `+${difference}%` : `${difference}%`;
        const estimatedHours = Math.round(originalData.estimatedHours * 10) / 10;
        const actualHours = Math.round(originalData.actualHours * 10) / 10;

        // Usar formato de texto simples para o tooltip
        args.text = `<b>${originalData.macroTask}</b><br/>` +
          `Atividades: ${originalData.activityCount}<br/>` +
          `Previsto: ${estimatedHours}h<br/>` +
          `Trabalhado: ${actualHours}h<br/>` +
          `Eficiência: ${differenceText}`;
      }
    }
  };

  const renderChart = (height: string = '320px') => (
    <div style={{ height }}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <BarChart3 className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhum dado disponível para o período selecionado</p>
        </div>
      ) : (
        <ChartComponent
          primaryXAxis={primaryXAxis}
          primaryYAxis={primaryYAxis}
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
          <Inject services={[ColumnSeries, Legend, Tooltip, DataLabel, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={chartData}
              xName="macroTask"
              yName="estimatedHours"
              name="Horas Previstas"
              type="Column"
              fill="#3B82F6"
              cornerRadius={{ topLeft: 4, topRight: 4 }}
              columnWidth={0.7}
              columnSpacing={0.1}
            />
            <SeriesDirective
              dataSource={chartData}
              xName="macroTask"
              yName="actualHours"
              name="Horas Trabalhadas"
              type="Column"
              fill="#FF7F0E"
              cornerRadius={{ topLeft: 4, topRight: 4 }}
              columnWidth={0.7}
              columnSpacing={0.1}
            />
          </SeriesCollectionDirective>
        </ChartComponent>
      )}
    </div>
  );

  return (
    <Card className="border border-border/50 shadow-elevation-2 overflow-hidden">
      {/* Header com gradient */}
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <HardDrive className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Performance por Tarefa Macro
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comparação de horas previstas vs trabalhadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {macroTasks.length} tarefas macro
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
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <HardDrive className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Performance por Tarefa Macro</div>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        Comparação de horas previstas vs trabalhadas - {macroTasks.length} tarefas macro
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
