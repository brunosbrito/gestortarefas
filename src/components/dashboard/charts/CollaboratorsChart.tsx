
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { CollaboratorStatistic } from '@/interfaces/ActivityStatistics';

interface CollaboratorsChartProps {
  collaborators: CollaboratorStatistic[];
}

export const CollaboratorsChart = ({ collaborators }: CollaboratorsChartProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <User className="w-5 h-5 mr-2 text-[#FF7F0E]" />
        <h3 className="text-lg font-semibold">Contribuição por Colaborador</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={collaborators}>
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                      <p className="font-medium">{payload[0].payload.name}</p>
                      <p>Horas Trabalhadas: {payload[0].payload.hoursWorked}h</p>
                      <p>Atividades: {payload[0].payload.activityCount}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="hoursWorked"
              name="Horas Trabalhadas"
              stroke="#FF7F0E"
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="activityCount"
              name="Número de Atividades"
              stroke="#003366"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
