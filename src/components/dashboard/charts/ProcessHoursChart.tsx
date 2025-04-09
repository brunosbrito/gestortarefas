
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
import { ProcessStatistic } from '@/interfaces/ActivityStatistics';

interface ProcessHoursChartProps {
  processes: ProcessStatistic[];
}

// Componente customizado para exibir os rótulos no eixo X inclinados
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

export const ProcessHoursChart = ({ processes }: ProcessHoursChartProps) => {
  const hasData = processes && processes.length > 0;
  
  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <HardDrive className="w-5 h-5 mr-2 text-[#003366]" />
        <h3 className="text-lg font-semibold">Atividades por Processo</h3>
      </div>
      <div className="h-64">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Nenhum dado disponível para o período selecionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart margin={{ top: 20, right: 30, left: 20, bottom: 50 }} data={processes}>
              {/* Eixo X com labels inclinados */}
              <XAxis
                dataKey="process" // Alterado para o campo correto
                tick={<CustomXAxisTick />}
                interval={0} // Garante que todos os labels apareçam
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const difference = payload[0].payload.hoursDifference;
                    const differenceColor = difference > 0 ? "text-red-500" : "text-green-500";

                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                        <p className="font-medium">{payload[0].payload.process}</p>
                        <p>ID: {payload[0].payload.processId}</p>
                        <p>Atividades: {payload[0].payload.activityCount}</p>
                        <p>Horas Previstas: {payload[0].payload.estimatedHours}h</p>
                        <p>Horas Trabalhadas: {payload[0].payload.actualHours}h</p>
                        <p className={differenceColor}>KPI H. Previstas / H. Trabalhadas: {difference}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar
                dataKey="activityCount"
                name="Quantidade de Atividades"
                fill="#003366"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
