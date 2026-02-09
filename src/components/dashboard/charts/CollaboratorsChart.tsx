import { Card } from '@/components/ui/card';
import { User, LineChart as LineChartIcon, Maximize2 } from 'lucide-react';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Legend,
  Category,
  Tooltip,
  LineSeries,
  AxisModel,
} from '@syncfusion/ej2-react-charts';
import '@/config/syncfusionLocale';
import { CollaboratorStatistic } from '@/interfaces/ActivityStatistics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CollaboratorsChartProps {
  collaborators: CollaboratorStatistic[];
}

export const CollaboratorsChart = ({ collaborators }: CollaboratorsChartProps) => {
  const hasData = collaborators.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Preparar dados com valores arredondados
  const chartData = useMemo(() => {
    return collaborators.map(collab => ({
      ...collab,
      name: collab.name.length > 12 ? `${collab.name.substring(0, 12)}...` : collab.name,
      fullName: collab.name,
      hoursWorked: Math.round(collab.hoursWorked * 10) / 10,
    }));
  }, [collaborators]);

  const primaryXAxis = useMemo<AxisModel>(() => ({
    valueType: 'Category',
    labelRotation: collaborators.length > 5 ? -45 : 0,
    labelStyle: {
      color: isDark ? '#94a3b8' : '#64748b',
      size: '11px',
    },
    majorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
  }), [isDark, collaborators.length]);

  const primaryYAxis = useMemo<AxisModel>(() => ({
    title: 'Horas',
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
    labelFormat: '{value}h',
  }), [isDark]);

  const secondaryYAxis = useMemo<AxisModel[]>(() => [{
    name: 'activityAxis',
    opposedPosition: true,
    title: 'Atividades',
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
  }], [isDark]);

  const tooltipRender = (args: any) => {
    if (args.point && args.series) {
      const dataIndex = args.point.index;
      const originalData = collaborators[dataIndex];
      if (originalData) {
        const hoursWorked = Math.round(originalData.hoursWorked * 10) / 10;
        args.text = `<b>${originalData.name}</b><br/>` +
          `Horas Trabalhadas: ${hoursWorked}h<br/>` +
          `Atividades: ${originalData.activityCount}`;
      }
    }
  };

  const renderChart = (height: string = '320px') => (
    <div style={{ height }}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <LineChartIcon className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhum dado disponivel para o periodo selecionado</p>
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
          <Inject services={[LineSeries, Legend, Tooltip, Category]} />
          <SeriesCollectionDirective>
            <SeriesDirective
              dataSource={chartData}
              xName="name"
              yName="hoursWorked"
              name="Horas Trabalhadas"
              type="Line"
              fill="#FF7F0E"
              width={2}
              marker={{
                visible: true,
                fill: '#FF7F0E',
                width: 8,
                height: 8,
              }}
            />
            <SeriesDirective
              dataSource={chartData}
              xName="name"
              yName="activityCount"
              name="Numero de Atividades"
              type="Line"
              fill="#3B82F6"
              width={2}
              yAxisName="activityAxis"
              marker={{
                visible: true,
                fill: '#3B82F6',
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
      <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Contribuicao por Colaborador
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Horas trabalhadas e numero de atividades
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {collaborators.length} colaboradores
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
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Contribuicao por Colaborador</div>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        Horas trabalhadas e numero de atividades - {collaborators.length} colaboradores
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
