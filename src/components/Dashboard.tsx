
import { Card } from '@/components/ui/card';
import {
  Building2,
  ClipboardList,
  Activity,
  Users,
  Check,
  Edit,
  Eye,
  Plus,
  BarChart3,
  Clock,
  HardDrive,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { StatsCard } from './dashboard/StatsCard';
import { getStatusBadge } from './dashboard/ObraStatusBadge';
import { ObraDetalhesDialog } from './dashboard/ObraDetalhesDialog';
import { AtividadesRecentes } from './dashboard/AtividadesRecentes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { EditObraForm } from './obras/EditObraForm';
import { NovaObraForm } from './obras/NovaObraForm';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { ActivityStatistics } from '@/interfaces/ActivityStatistics';
import { getActivityStatistics } from '@/services/StatisticsService';

const stats = [
  {
    title: 'Total de Obras',
    value: '12',
    icon: Building2,
    color: 'bg-blue-500',
  },
  {
    title: 'Ordens de Serviço',
    value: '48',
    icon: ClipboardList,
    color: 'bg-green-500',
  },
  {
    title: 'Atividades',
    value: '156',
    icon: Activity,
    color: 'bg-purple-500',
  },
  {
    title: 'Usuários',
    value: '24',
    icon: Users,
    color: 'bg-orange-500',
  },
];

export interface ObraDetalhes {
  nome: string;
  status: 'em_andamento' | 'finalizado' | 'interrompido';
  dataInicio: string;
  dataFim?: string;
  horasTrabalhadas: number;
  atividades: string[];
  historico: string[];
}

const CORES = [
  '#FF7F0E', // Laranja principal
  '#003366', // Azul Escuro
  '#F7C948', // Amarelo
  '#B0B0B0', // Cinza Concreto
  '#E0E0E0', // Cinza Claro
  '#FFA500', // Laranja Secundário
  '#1E90FF', // Azul Claro
];

const Dashboard = () => {
  const [obraSelecionada, setObraSelecionada] = useState<ObraDetalhes | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editDialogAberto, setEditDialogAberto] = useState(false);
  const [novaObraDialogAberto, setNovaObraDialogAberto] = useState(false);
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar estatísticas das atividades
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const data = await getActivityStatistics();
        setStatistics(data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  const handleEditSuccess = () => {
    setEditDialogAberto(false);
    // Aqui você pode adicionar lógica para atualizar a lista de obras
  };

  const handleNovaObraSuccess = () => {
    setNovaObraDialogAberto(false);
    // Atualizar a lista de obras
    // Você pode adicionar aqui a lógica para buscar as obras atualizadas
  };

  const formatarPorcentagem = (valor: number) => `${valor.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F0E]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Atividades por Tarefa Macro */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <HardDrive className="w-5 h-5 mr-2 text-[#FF7F0E]" />
            <h3 className="text-lg font-semibold">Atividades por Tarefa Macro</h3>
          </div>
          <div className="h-64">
            {statistics?.macroTasks && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.macroTasks}>
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

        {/* Gráfico de Horas por Processo */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2 text-[#003366]" />
            <h3 className="text-lg font-semibold">Horas por Processo</h3>
          </div>
          <div className="h-64">
            {statistics?.processes && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.processes}>
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
            )}
          </div>
        </Card>

        {/* Gráfico de KPI - Variação de Horas */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 mr-2 text-[#F7C948]" />
            <h3 className="text-lg font-semibold">KPI - Variação de Horas</h3>
          </div>
          <div className="h-64">
            {statistics?.processes && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statistics.processes}
                    dataKey="hoursDifference"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statistics.processes.map((entry, index) => (
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

        {/* Gráfico de Contribuição por Colaborador */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 mr-2 text-[#FF7F0E]" />
            <h3 className="text-lg font-semibold">Contribuição por Colaborador</h3>
          </div>
          <div className="h-64">
            {statistics?.collaborators && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statistics.collaborators}>
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
            )}
          </div>
        </Card>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Obras em Andamento</h3>
          <div className="space-y-4">
            {obrasExemplo.map((obra) => (
              <div key={obra.nome} className="flex items-center justify-between p-4 bg-construction-50 rounded-lg border border-construction-100">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-construction-700">{obra.nome}</span>
                  {getStatusBadge(obra.status)}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      setObraSelecionada(obra);
                      setDialogAberto(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#FF7F0E] hover:text-[#FF7F0E]/90"
                    onClick={() => {
                      setObraSelecionada(obra);
                      setEditDialogAberto(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  {obra.status === "em_andamento" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Finalizar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <AtividadesRecentes atividades={atividadesRecentes} />
      </div> */}
    </div>
  );
};

export default Dashboard;
