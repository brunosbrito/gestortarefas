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
  Logarithmic,
} from '@syncfusion/ej2-react-charts';
import '@/config/syncfusionLocale';
import { ProcessStatistic } from '@/interfaces/ActivityStatistics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ProcessHoursChartProps {
  processes: ProcessStatistic[];
}

export const ProcessHoursChart = ({ processes }: ProcessHoursChartProps) => {
  const hasData = processes && processes.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Preparar dados com valores arredondados e garantir valores mínimos para escala logarítmica
  const chartData = useMemo(() => {
    return processes.map(proc => ({
      ...proc,
      process: proc.process.length > 15 ? `${proc.process.substring(0, 15)}...` : proc.process,
      fullName: proc.process,
      // Para escala logarítmica, valores devem ser > 0
      estimatedHours: Math.max(0.1, Math.round(proc.estimatedHours * 10) / 10),
      actualHours: Math.max(0.1, Math.round(proc.actualHours * 10) / 10),
    }));
  }, [processes]);

  // Verificar se os valores variam muito para usar escala logarítmica
  const useLogScale = useMemo(() => {
    if (!hasData) return false;
    const values = processes.flatMap(p => [p.estimatedHours, p.actualHours]).filter(v => v > 0);
    if (values.length < 2) return false;
    const min = Math.min(...values);
    const max = Math.max(...values);
    return max / min > 100; // Usar log se a variação for maior que 100x
  }, [processes, hasData]);

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

  const primaryYAxis = useMemo(() => ({
    valueType: useLogScale ? 'Logarithmic' as const : 'Double' as const,
    title: useLogScale ? 'Horas (escala log)' : 'Horas',
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
    labelFormat: '{value}h',
    minimum: useLogScale ? 0.1 : 0,
  }), [isDark, useLogScale]);

  const tooltipRender = (args: any) => {
    if (args.point && args.series) {
      const dataIndex = args.point.index;
      const originalData = processes[dataIndex];
      if (originalData) {
        const difference = originalData.hoursDifference;
        const differenceText = difference > 0 ? `+${difference}%` : `${difference}%`;
        const estimatedHours = Math.round(originalData.estimatedHours * 10) / 10;
        const actualHours = Math.round(originalData.actualHours * 10) / 10;

        args.text = `<b>${originalData.process}</b><br/>` +
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
          <Inject services={[ColumnSeries, Legend, Tooltip, DataLabel, Category, Logarithmic]} />
          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={chartData}
              xName="process"
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
              xName="process"
              yName="actualHours"
              name="Horas Trabalhadas"
              type="Column"
              fill="#10B981"
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
      <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Performance por Processo
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comparação de horas previstas vs trabalhadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {processes.length} processos
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
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Performance por Processo</div>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        Comparação de horas previstas vs trabalhadas - {processes.length} processos
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
