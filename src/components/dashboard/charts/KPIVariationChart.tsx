
import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ProcessStatistic } from '@/interfaces/ActivityStatistics';

interface KPIVariationChartProps {
  processes: ProcessStatistic[];
  CORES: string[];
}

export const KPIVariationChart = ({ processes, CORES }: KPIVariationChartProps) => {
  const hasData = processes.length > 0;
  
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <BarChart3 className="w-5 h-5 mr-2 text-[#F7C948]" />
        <h3 className="text-lg font-semibold">KPI - Variação de Horas</h3>
      </div>
      <div className="h-64">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Nenhum dado disponível para o período selecionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processes}
                dataKey="hoursDifference"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {processes.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CORES[index % CORES.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Variação']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
