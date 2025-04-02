
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FilteredServiceOrder } from '@/interfaces/DashboardFilters';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

interface FilteredServiceOrderTableProps {
  serviceOrders: FilteredServiceOrder[];
  loading: boolean;
}

export const FilteredServiceOrderTable = ({ serviceOrders, loading }: FilteredServiceOrderTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'concluida':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pausada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em andamento';
      case 'concluida':
        return 'Concluída';
      case 'pausada':
        return 'Pausada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <ClipboardList className="w-5 h-5 mr-2 text-[#FF7F0E]" />
          <h3 className="text-lg font-semibold">Ordens de Serviço</h3>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F0E]"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <ClipboardList className="w-5 h-5 mr-2 text-[#FF7F0E]" />
        <h3 className="text-lg font-semibold">Ordens de Serviço</h3>
      </div>
      
      {serviceOrders.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº OS</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atividades</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceOrders.map((so) => (
              <TableRow key={so.id}>
                <TableCell>{so.serviceOrderNumber}</TableCell>
                <TableCell>{so.description}</TableCell>
                <TableCell>{so.projectName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(so.status)}>
                    {getStatusText(so.status)}
                  </Badge>
                </TableCell>
                <TableCell>{so.activityCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex justify-center items-center h-40 bg-gray-50 rounded-md">
          <p className="text-gray-500">Nenhuma ordem de serviço encontrada com os filtros selecionados</p>
        </div>
      )}
    </Card>
  );
};
