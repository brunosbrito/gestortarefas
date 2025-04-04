
import { Card } from '@/components/ui/card';
import { HardDrive } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Text
} from 'recharts';
import { MacroTaskStatistic } from '@/interfaces/ActivityStatistics';

interface MacroTasksChartProps {
  macroTasks: MacroTaskStatistic[];
}

// Componente personalizado para os ticks do eixo X
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const truncatedText = payload.value.length > 10 ? `${payload.value.substring(0, 10)}...` : payload.value;

  return (
    <Text
      x={x}
      y={y + 20} // Ajusta a posição abaixo do eixo
      textAnchor="end"
      fontSize={10}
      transform={`rotate(-30, ${x}, ${y})`} // Rotaciona o texto
    >
      {truncatedText}
    </Text>
  );
};

export const MacroTasksChart = ({ macroTasks }: MacroTasksChartProps) => {
  const hasData = macroTasks && macroTasks.length > 0;

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
            <BarChart margin={{ top: 20, right: 30, left: 20, bottom: 50 }} data={macroTasks}>
              {/* Eixo X com labels inclinados */}
              <XAxis
                dataKey="macroTask"
                tick={<CustomXAxisTick />} // Usa o componente customizado para os ticks
                interval={0} // Garante que todos os labels apareçam
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const difference = payload[0].payload.hoursDifference;
                    const differenceColor = difference > 100 ? "text-red-500" : "text-green-500";

                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                        <p className="font-medium">{payload[0].payload.macroTask}</p>
                        <p>ID: {payload[0].payload.macroTaskId}</p>
                        <p>Atividades: {payload[0].payload.activityCount}</p>
                        <p>Horas Previstas: {payload[0].payload.estimatedHours}h</p>
                        <p>Horas Trabalhadas: {payload[0].payload.actualHours}h</p>
                        <p className={differenceColor}>Diferença: {difference}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

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
