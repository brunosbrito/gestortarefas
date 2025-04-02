
import { Card } from '@/components/ui/card';
import { HardDrive } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { MacroTaskStatistic } from '@/interfaces/ActivityStatistics';

interface MacroTasksChartProps {
  macroTasks: MacroTaskStatistic[];
  formatarPorcentagem: (valor: number) => string;
}

export const MacroTasksChart = ({ macroTasks, formatarPorcentagem }: MacroTasksChartProps) => {
  const hasData = macroTasks.length > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <HardDrive className="w-5 h-5 mr-2 text-[#FF7F0E]" />
        <h3 className="text-lg font-semibold">Atividades por Tarefa Macro</h3>
      </div>
      <div className="h-64">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Nenhum dado disponível para o período selecionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={macroTasks}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                        <p className="font-medium">{payload[0].payload.name}</p>
                        <p>Atividades: {payload[0].payload.activityCount}</p>
                        <p>Horas Previstas: {payload[0].payload.estimatedHours}h</p>
                        <p>Horas Trabalhadas: {payload[0].payload.actualHours}h</p>
                        <p>Diferença: {formatarPorcentagem(payload[0].payload.hoursDifference)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="activityCount"
                name="Quantidade de Atividades"
                fill="#FF7F0E"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
