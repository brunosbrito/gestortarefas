
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FilteredServiceOrder } from '@/interfaces/DashboardFilters';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilteredServiceOrderTableProps {
  serviceOrders: FilteredServiceOrder[];
  loading: boolean;
}

export const FilteredServiceOrderTable = ({ serviceOrders, loading }: FilteredServiceOrderTableProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return {
          label: 'Em andamento',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-700 dark:text-green-300',
          dotColor: 'bg-green-500',
        };
      case 'concluida':
        return {
          label: 'Concluída',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-700 dark:text-blue-300',
          dotColor: 'bg-blue-500',
        };
      case 'pausada':
        return {
          label: 'Pausada',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          dotColor: 'bg-yellow-500',
        };
      default:
        return {
          label: status,
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground',
          dotColor: 'bg-muted-foreground',
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground">Carregando ordens de serviço...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {serviceOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                <TableHead className="font-semibold text-foreground border-r border-border/30">Nº OS</TableHead>
                <TableHead className="font-semibold text-foreground border-r border-border/30">Descrição</TableHead>
                <TableHead className="font-semibold text-foreground border-r border-border/30">Projeto</TableHead>
                <TableHead className="font-semibold text-foreground border-r border-border/30">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Atividades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceOrders.map((so, index) => {
                const statusConfig = getStatusConfig(so.status);

                return (
                  <TableRow
                    key={so.id}
                    className={cn(
                      "transition-all duration-200 border-b",
                      index % 2 === 0 ? "bg-background" : "bg-muted/20",
                      "hover:bg-accent/50 hover:shadow-sm"
                    )}
                  >
                    <TableCell className="font-bold text-foreground py-4 border-r border-border/30">{so.serviceOrderNumber}</TableCell>
                    <TableCell className="py-4 border-r border-border/30">{so.description}</TableCell>
                    <TableCell className="text-muted-foreground py-4 border-r border-border/30">{so.projectName}</TableCell>
                    <TableCell className="py-4 border-r border-border/30">
                      <Badge
                        className={cn(
                          "flex items-center gap-1.5 w-fit px-3 py-1.5 font-medium",
                          statusConfig.bgColor,
                          statusConfig.textColor
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)} />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-bold tabular-nums">
                        {so.activityCount}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <div className="p-4 rounded-full bg-muted/50">
            <ClipboardList className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Nenhuma ordem de serviço encontrada
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Tente ajustar os filtros para ver mais resultados
            </p>
          </div>
        </div>
      )}
    </>
  );
};
