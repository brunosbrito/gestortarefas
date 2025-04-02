
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
import { PeriodFilter, PeriodFilterType } from './dashboard/PeriodFilter';
import { filterDataByPeriod } from '@/utils/dateFilter';

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
  const [filteredStatistics, setFilteredStatistics] = useState<ActivityStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterType>('todos');

  // Estatísticas do painel
  const stats = [
    {
      title: 'Total de Obras',
      value: '12',
      icon: Building2,
      color: 'bg-[#FF7F0E]',
    },
    {
      title: 'Ordens de Serviço',
      value: '48',
      icon: ClipboardList,
      color: 'bg-[#003366]',
    },
    {
      title: 'Atividades',
      value: '156',
      icon: Activity,
      color: 'bg-[#F7C948]',
    },
    {
      title: 'Usuários',
      value: '24',
      icon: Users,
      color: 'bg-[#B0B0B0]',
    },
  ];

  // Buscar estatísticas das atividades
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const data = await getActivityStatistics();
        setStatistics(data);
        setFilteredStatistics(data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  // Efeito para filtrar os dados quando o período muda
  useEffect(() => {
    if (!statistics) return;

    if (periodFilter === 'todos') {
      setFilteredStatistics(statistics);
      return;
    }

    const filtered: ActivityStatistics = {
      macroTasks: filterDataByPeriod(statistics.macroTasks, periodFilter),
      processes: filterDataByPeriod(statistics.processes, periodFilter),
      collaborators: filterDataByPeriod(statistics.collaborators, periodFilter)
    };

    setFilteredStatistics(filtered);
  }, [periodFilter, statistics]);

  const handlePeriodFilterChange = (period: PeriodFilterType) => {
    setPeriodFilter(period);
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
      <StatsSummary stats={stats} />
      
      <PeriodFilter onFilterChange={handlePeriodFilterChange} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStatistics?.macroTasks && (
          <MacroTasksChart 
            macroTasks={filteredStatistics.macroTasks} 
            formatarPorcentagem={formatarPorcentagem} 
          />
        )}

        {filteredStatistics?.processes && (
          <ProcessHoursChart processes={filteredStatistics.processes} />
        )}

        {filteredStatistics?.processes && (
          <KPIVariationChart processes={filteredStatistics.processes} CORES={CORES} />
        )}

        {filteredStatistics?.collaborators && (
          <CollaboratorsChart collaborators={filteredStatistics.collaborators} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
