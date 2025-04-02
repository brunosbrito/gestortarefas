import { useState, useEffect } from 'react';
import { Building2, ClipboardList, Activity, Users } from 'lucide-react';
import { StatsSummary } from './dashboard/StatsSummary';
import { MacroTasksChart } from './dashboard/charts/MacroTasksChart';
import { ProcessHoursChart } from './dashboard/charts/ProcessHoursChart';
import { LoadingSpinner } from './dashboard/LoadingSpinner';
import { MacroTaskStatistic, ProcessStatistic } from '@/interfaces/ActivityStatistics';
import { dataMacroTask, dataProcess } from '@/services/StatisticsService';
import { getAllActivities } from '@/services/ActivityService';
import { getAllServiceOrders } from '@/services/ServiceOrderService';
import ObrasService from '@/services/ObrasService';

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
  const [macroTaskStatistic, setMacroTaskStatistic] = useState<MacroTaskStatistic[]>([]);
  const [processStatistic, setProcessStatistic] = useState<ProcessStatistic[]>([]);
  const [totalActivities, setTotalActivities] = useState<Number>(0);
  const [totalProjetos, setTotalProjetos] = useState<Number>(0);
  const [totalServiceOrder, setTotalServiceOrder] = useState<Number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Estatísticas do painel
  

  const TotalActivities = async () => {
    const activities = await getAllActivities();
    setTotalActivities(activities.length)
  }


  const TotalProjects = async  () => {
    const projects = await ObrasService.getAllObras();
    setTotalProjetos(projects.length)
  }

  const TotalServiceOrder = async () => {
    const serviceOrder = await getAllServiceOrders();
    setTotalServiceOrder(serviceOrder.length)
  }

  
  useEffect(() => {
    const getMacroTask = async () => {
      try {
        const dadosMacroTask = await dataMacroTask();
        setMacroTaskStatistic(dadosMacroTask as MacroTaskStatistic[]);
      } catch (error) {
        console.error("Erro ao buscar as atividades", error);
      } finally {
        setIsLoading(false);
      }
    };

    const getProcess = async () => {
      try {
        const dadosProcesso = await dataProcess();
        setProcessStatistic(dadosProcesso as ProcessStatistic[]);
      } catch (error) {
        console.error("Erro ao buscar as atividades", error);
      } finally {
        setIsLoading(false);
      }
    };



    getMacroTask();
    getProcess();
    TotalActivities();
    TotalProjects();
    TotalServiceOrder();
  }, []);

  const stats = [
    {
      title: 'Fabrica/Obra',
      value: totalProjetos.toString(),
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      title: 'Ordens de Serviço',
      value: totalServiceOrder.toString(),
      icon: ClipboardList,
      color: 'bg-green-500',
    },
    {
      title: 'Atividades',
      value: totalActivities.toString(),
      icon: Activity,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <StatsSummary stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {macroTaskStatistic && (
          <MacroTasksChart
            macroTasks={macroTaskStatistic}

          />
        )}

        {processStatistic && (
          <ProcessHoursChart processes={processStatistic} />
        )}

        {/* 

        {statistics?.collaborators && (
          <CollaboratorsChart collaborators={statistics.collaborators} />
        )} */}
      </div>
    </div>
  );
};

export default Dashboard