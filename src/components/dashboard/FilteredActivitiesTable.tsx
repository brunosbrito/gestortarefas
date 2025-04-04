
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FilteredActivity } from '@/interfaces/DashboardFilters';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface FilteredActivitiesTableProps {
  activities: FilteredActivity[];
  loading: boolean;
}

export const FilteredActivitiesTable = ({ activities, loading }: FilteredActivitiesTableProps) => {
  const getStatusColor = (status: string) => {
    if (status.includes('Planejada')) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    } else if (status.includes('execução')) {
      return 'bg-green-100 text-green-800 border-green-300';
    } else if (status.includes('Concluída')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (status.includes('Paralizada')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-300';
    }
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
      
      {activities.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Tarefa Macro</TableHead>
              <TableHead>Processo</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.description}</TableCell>
                <TableCell>{activity.macroTask}</TableCell>
                <TableCell>{activity.process}</TableCell>
                <TableCell>{activity.serviceOrderNumber}</TableCell>
                <TableCell>{activity.projectName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex justify-center items-center h-40 bg-gray-50 rounded-md">
          <p className="text-gray-500">Nenhuma atividade encontrada com os filtros selecionados</p>
        </div>
      )}
    </Card>
  );
};
