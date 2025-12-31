import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, BarChart3, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';
import { useDashboardStore } from '@/stores/dashboardStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { startOfWeek, subWeeks, isWithinInterval } from 'date-fns';

interface TrendDataPoint {
  period: string;         // "Sem 1", "Sem 2", ...
  completedCount: number; // Atividades concluídas
  avgEfficiency: number;  // Eficiência média (%)
  onTimeRate: number;     // Taxa no prazo (%)
}

/**
 * Calcula dados de tendência de produtividade das últimas 12 semanas
 */
const calculateTrendData = (activities: any[]): TrendDataPoint[] => {
  // Filtrar apenas atividades concluídas com endDate
  const completedActivities = activities.filter(a =>
    a.isCompleted && a.endDate
  );

  if (completedActivities.length === 0) return [];

  // Gerar últimas 12 semanas
  const weeks: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }); // Segunda-feira
    const weekEnd = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });

    // Filtrar atividades concluídas nesta semana
    const weekActivities = completedActivities.filter(a => {
      const endDate = new Date(a.endDate);
      return isWithinInterval(endDate, { start: weekStart, end: weekEnd });
    });

    // Calcular métricas para esta semana
    const completedCount = weekActivities.length;

    const avgEfficiency = completedCount > 0
      ? weekActivities.reduce((sum, a) => {
          const est = Number(a.estimatedTime) || 0;
          const act = Number(a.actualTime) || 0;
          const eff = est > 0 ? ((est - act) / est) * 100 : 0;
          return sum + eff;
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
 * Componente de gráfico de tendências de produtividade
 * Exibe atividades concluídas, eficiência e taxa no prazo nas últimas 12 semanas
 */
export const ProductivityTrendsChart = () => {
  const { filteredData } = useDashboardStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calcular dados de tendência com useMemo
  const trendData = useMemo(() =>
    calculateTrendData(filteredData.activities || []),
    [filteredData.activities]
  );

  const hasData = trendData.length > 0 && trendData.some(d => d.completedCount > 0);
  const totalCompleted = trendData.reduce((sum, d) => sum + d.completedCount, 0);

  const renderChart = (height: string = "h-80") => (
    <div className={height}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <BarChart3 className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhuma atividade concluída no período selecionado</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={60}
              style={{ fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              label={{
                value: 'Atividades Concluídas',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              label={{
                value: 'Percentual (%)',
                angle: 90,
                position: 'insideRight',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card/95 backdrop-blur-sm p-3 border border-border/50 rounded-lg shadow-lg min-w-[200px]">
                      <p className="font-semibold mb-2 text-base">{data.period}</p>
                      <div className="space-y-1.5 text-sm">
                        <p className="flex justify-between">
                          <span>Concluídas:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">{data.completedCount}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Eficiência Média:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{data.avgEfficiency}%</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Taxa No Prazo:</span>
                          <span className="font-medium text-orange-600 dark:text-orange-400">{data.onTimeRate}%</span>
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
              yAxisId="left"
              dataKey="completedCount"
              name="Atividades Concluídas"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgEfficiency"
              name="Eficiência Média (%)"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="onTimeRate"
              name="Taxa No Prazo (%)"
              stroke="#FF7F0E"
              strokeWidth={2}
              dot={{ fill: '#FF7F0E', r: 4 }}
              strokeDasharray="5 5"
            />
          </ComposedChart>
        </ResponsiveContainer>
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
