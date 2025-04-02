
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ProcessStatistic } from '@/interfaces/ActivityStatistics';

interface ProcessHoursChartProps {
  processes: ProcessStatistic[];
}

export const ProcessHoursChart = ({ processes }: ProcessHoursChartProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <Clock className="w-5 h-5 mr-2 text-[#003366]" />
        <h3 className="text-lg font-semibold">Horas por Processo</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processes}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                      <p className="font-medium">{payload[0].payload.name}</p>
                      <p>Horas Previstas: {payload[0].payload.estimatedHours}h</p>
                      <p>Horas Trabalhadas: {payload[0].payload.actualHours}h</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar
              dataKey="estimatedHours"
              name="Horas Previstas"
              fill="#B0B0B0"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actualHours"
              name="Horas Trabalhadas"
              fill="#003366"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
