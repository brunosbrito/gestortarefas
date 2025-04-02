
import { useState, useEffect } from 'react';
import { Building2, ClipboardList, Activity, Users } from 'lucide-react';
import { StatsSummary } from './dashboard/StatsSummary';
import { MacroTasksChart } from './dashboard/charts/MacroTasksChart';
import { ProcessHoursChart } from './dashboard/charts/ProcessHoursChart';
import { KPIVariationChart } from './dashboard/charts/KPIVariationChart';
import { CollaboratorsChart } from './dashboard/charts/CollaboratorsChart';
import { LoadingSpinner } from './dashboard/LoadingSpinner';
import { ActivityStatistics } from '@/interfaces/ActivityStatistics';
import { getActivityStatistics } from '@/services/StatisticsService';

// Cores para os gráficos
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
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estatísticas do painel
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

  const formatarPorcentagem = (valor: number) => `${valor.toFixed(1)}%`;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <StatsSummary stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statistics?.macroTasks && (
          <MacroTasksChart 
            macroTasks={statistics.macroTasks} 
            formatarPorcentagem={formatarPorcentagem} 
          />
        )}

        {statistics?.processes && (
          <ProcessHoursChart processes={statistics.processes} />
        )}

        {statistics?.processes && (
          <KPIVariationChart processes={statistics.processes} CORES={CORES} />
        )}

        {statistics?.collaborators && (
          <CollaboratorsChart collaborators={statistics.collaborators} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
