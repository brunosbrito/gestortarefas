
import { Card } from '@/components/ui/card';
import { User, LineChart as LineChartIcon, Maximize2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { CollaboratorStatistic } from '@/interfaces/ActivityStatistics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CollaboratorsChartProps {
  collaborators: CollaboratorStatistic[];
}

export const CollaboratorsChart = ({ collaborators }: CollaboratorsChartProps) => {
  const hasData = collaborators.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  const renderChart = (height: string = "h-80") => (
    <div className={height}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <LineChartIcon className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhum dado disponível para o período selecionado</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }} data={collaborators}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" fontSize={11} />
            <YAxis
              yAxisId="left"
              label={{ value: 'Horas', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, textAnchor: 'middle' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Atividades', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: 12, textAnchor: 'middle' } }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card/95 backdrop-blur-sm p-3 border border-border/50 rounded-lg shadow-lg min-w-[200px]">
                      <p className="font-semibold mb-2 text-base">{data.name}</p>
                      <div className="space-y-1.5 text-sm">
                        <p className="flex justify-between">
                          <span>Horas Trabalhadas:</span>
                          <span className="font-medium text-orange-600">{data.hoursWorked}h</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Atividades:</span>
                          <span className="font-medium text-blue-600">{data.activityCount}</span>
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
              iconType="line"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="hoursWorked"
              name="Horas Trabalhadas"
              stroke="#FF7F0E"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="activityCount"
              name="Número de Atividades"
              stroke="#3B82F6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
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
                Contribuição por Colaborador
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Horas trabalhadas e número de atividades
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
                      <div className="text-lg font-semibold">Contribuição por Colaborador</div>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        Horas trabalhadas e número de atividades - {collaborators.length} colaboradores
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
