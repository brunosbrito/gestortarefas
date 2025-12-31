import { Card } from '@/components/ui/card';
import { HardDrive, BarChart3, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Text,
  Legend,
  CartesianGrid
} from 'recharts';
import { MacroTaskStatistic } from '@/interfaces/ActivityStatistics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface MacroTasksChartProps {
  macroTasks: MacroTaskStatistic[];
}

// Componente personalizado para os ticks do eixo X
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const truncatedText = payload.value.length > 8 ? `${payload.value.substring(0, 8)}...` : payload.value;

  return (
    <Text
      x={x}
      y={y}
      textAnchor="end"
      fontSize={11}
      angle={-45}
      dy={8}
    >
      {truncatedText}
    </Text>
  );
};

export const MacroTasksChart = ({ macroTasks }: MacroTasksChartProps) => {
  const hasData = macroTasks && macroTasks.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  const renderChart = (height: string = "h-80") => (
    <div className={height}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <BarChart3 className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhum dado disponível para o período selecionado</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart margin={{ top: 20, right: 30, left: 20, bottom: 100 }} data={macroTasks}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="macroTask"
              tick={<CustomXAxisTick />}
              interval={macroTasks.length > 5 ? Math.ceil(macroTasks.length / 4) - 1 : 0}
              height={80}
            />
            <YAxis
              label={{ value: 'Horas', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, textAnchor: 'middle' } }}
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return value.toString();
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const difference = data.hoursDifference;
                  const differenceColor = difference > 0 ? "text-red-500" : "text-green-500";
                  const efficiency = data.estimatedHours > 0
                    ? ((data.estimatedHours - data.actualHours) / data.estimatedHours * 100).toFixed(1)
                    : 0;

                  return (
                    <div className="bg-card/95 backdrop-blur-sm p-3 border border-border/50 rounded-lg shadow-lg min-w-[200px]">
                      <p className="font-semibold mb-2 text-base">{data.macroTask}</p>
                      <div className="space-y-1.5 text-sm">
                        <p className="flex justify-between">
                          <span>Atividades:</span>
                          <span className="font-medium">{data.activityCount}</span>
                        </p>
                        <div className="h-px bg-border my-1"></div>
                        <p className="flex justify-between">
                          <span>Previsto:</span>
                          <span className="font-medium text-blue-600">{data.estimatedHours}h</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Trabalhado:</span>
                          <span className="font-medium text-orange-600">{data.actualHours}h</span>
                        </p>
                        <div className="h-px bg-border my-1"></div>
                        <p className="flex justify-between items-center">
                          <span>Eficiência:</span>
                          <span className={cn("font-semibold", differenceColor)}>
                            {difference > 0 ? '+' : ''}{difference}%
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="rect"
            />
            <Bar
              dataKey="estimatedHours"
              name="Horas Previstas"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actualHours"
              name="Horas Trabalhadas"
              fill="#FF7F0E"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
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
              {macroTasks.length} tarefas
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
                        Comparação de horas previstas vs trabalhadas - {macroTasks.length} tarefas
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0">
                  {renderChart("h-full")}
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
