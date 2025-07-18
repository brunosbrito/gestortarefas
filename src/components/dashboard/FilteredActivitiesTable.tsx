
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FilteredActivity } from '@/interfaces/DashboardFilters';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Activity, Clock, Users, TrendingUp } from 'lucide-react';

interface FilteredActivitiesTableProps {
  activities: FilteredActivity[];
  loading: boolean;
}

export const FilteredActivitiesTable = ({ activities, loading }: FilteredActivitiesTableProps) => {
  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('planejada')) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    } else if (status.toLowerCase().includes('execução')) {
      return 'bg-green-100 text-green-800 border-green-300';
    } else if (status.toLowerCase().includes('concluída')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (status.toLowerCase().includes('paralizada')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatTime = (hours?: number) => {
    if (!hours) return '-';
    return `${hours}h`;
  };

  const formatTeam = (team?: string[]) => {
    if (!team || team.length === 0) return '-';
    if (team.length === 1) return team[0];
    return `${team[0]} +${team.length - 1}`;
  };

  const getEfficiencyColor = (efficiency?: number) => {
    if (!efficiency) return 'text-gray-500';
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Activity className="w-5 h-5 mr-2 text-[#003366]" />
          <h3 className="text-lg font-semibold">Atividades</h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003366]"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <Activity className="w-5 h-5 mr-2 text-[#003366]" />
        <h3 className="text-lg font-semibold">Atividades</h3>
      </div>
      
      {activities && activities.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Tarefa Macro</TableHead>
                <TableHead>Processo</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Fábrica/Obra</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    Tempo Total
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    Previsto
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" />
                    Equipe
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Eficiência
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="max-w-xs truncate" title={activity.description}>
                    {activity.description}
                  </TableCell>
                  <TableCell>{activity.macroTask}</TableCell>
                  <TableCell>{activity.process}</TableCell>
                  <TableCell>
                    {activity.serviceOrder?.serviceOrderNumber || 'N/A'}
                  </TableCell>
                  <TableCell>{activity.projectName}</TableCell>
                  <TableCell className="text-center">
                    {formatTime(activity.totalTime)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatTime(activity.estimatedTime)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1" title={activity.team?.join(', ')}>
                      <Users className="w-3 h-3" />
                      {formatTeam(activity.team)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={getEfficiencyColor(activity.kpis?.efficiency)}>
                      {activity.kpis?.efficiency ? `${activity.kpis.efficiency}%` : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex justify-center items-center h-40 bg-gray-50 rounded-md">
          <p className="text-gray-500">Nenhuma atividade encontrada com os filtros selecionados</p>
        </div>
      )}
    </Card>
  );
};
