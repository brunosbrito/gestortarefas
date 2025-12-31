import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FilteredActivity } from '@/interfaces/DashboardFilters';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Activity, Clock, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilteredActivitiesTableProps {
  activities: FilteredActivity[];
  loading: boolean;
}

export const FilteredActivitiesTable = ({
  activities,
  loading,
}: FilteredActivitiesTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Calcular dados da paginação
  const totalItems = activities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = activities.slice(startIndex, endIndex);

  // Reset página quando atividades mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [activities]);

  const getStatusConfig = (status: string) => {
    if (status.toLowerCase().includes('planejada')) {
      return {
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-700 dark:text-purple-300',
        dotColor: 'bg-purple-500',
      };
    } else if (status.toLowerCase().includes('execução')) {
      return {
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        dotColor: 'bg-green-500',
      };
    } else if (status.toLowerCase().includes('concluída')) {
      return {
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-700 dark:text-blue-300',
        dotColor: 'bg-blue-500',
      };
    } else if (status.toLowerCase().includes('paralizada')) {
      return {
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        dotColor: 'bg-yellow-500',
      };
    } else {
      return {
        bgColor: 'bg-gray-100 dark:bg-gray-900/30',
        textColor: 'text-gray-700 dark:text-gray-300',
        dotColor: 'bg-gray-500',
      };
    }
  };

  const formatTime = (hours?: number) => {
    if (hours === undefined || hours === null) return '-';

    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    const formattedMinutes = m.toString().padStart(2, '0');
    return `${h}h${formattedMinutes}`;
  };

  const formatTeam = (team?: Array<{ collaboratorId: number; name: string }>) => {
    if (!team || team.length === 0) return '-';

    if (team.length === 1) return team[0].name;
    return `${team[0].name} +${team.length - 1}`;
  };

  const parseTempoEstimado = (tempo: string): number => {
    const match = tempo.match(/(\d+)h(\d+)min/);
    if (!match) return 0;

    const horas = parseInt(match[1], 10);
    const minutos = parseInt(match[2], 10);
    return horas * 60 + minutos;
  };

  const CalculateEfficiency = (totalMin: number, tempoEstimadoStr: string) => {
    const tempoEstimadoMin = parseTempoEstimado(tempoEstimadoStr);
    const eficiencia = (totalMin / tempoEstimadoMin) * 100;
    return eficiencia;
  };

  const getEfficiencyColor = (totalMin: number, tempoEstimadoStr: string) => {
    const eficiencia = CalculateEfficiency(totalMin, tempoEstimadoStr);

    if (eficiencia <= 0) return 'text-muted-foreground';
    if (eficiencia > 0 && eficiencia <= 100) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground">Carregando atividades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {activities && activities.length > 0 ? (
        <div className="space-y-4">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                  <TableHead className="w-[200px] font-semibold text-foreground border-r border-border/30">Descrição</TableHead>
                  <TableHead className="w-[150px] font-semibold text-foreground border-r border-border/30">Tarefa Macro</TableHead>
                  <TableHead className="w-[120px] font-semibold text-foreground border-r border-border/30">Processo</TableHead>
                  <TableHead className="w-16 text-center font-semibold text-foreground border-r border-border/30">OS</TableHead>
                  <TableHead className="w-[150px] font-semibold text-foreground border-r border-border/30">Fábrica/Obra</TableHead>
                  <TableHead className="w-20 text-center font-semibold text-foreground border-r border-border/30">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      T. Total
                    </div>
                  </TableHead>
                  <TableHead className="w-20 text-center font-semibold text-foreground border-r border-border/30">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      T. Prev.
                    </div>
                  </TableHead>
                  <TableHead className="w-24 text-center font-semibold text-foreground border-r border-border/30">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-4 h-4" />
                      Equipe
                    </div>
                  </TableHead>
                  <TableHead className="w-20 text-center font-semibold text-foreground border-r border-border/30">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Efic.
                    </div>
                  </TableHead>
                  <TableHead className="w-28 font-semibold text-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((activity, index) => {
                  const statusConfig = getStatusConfig(activity.status);

                  return (
                    <TableRow
                      key={activity.id}
                      className={cn(
                        "transition-all duration-200 border-b",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20",
                        "hover:bg-accent/50 hover:shadow-sm"
                      )}
                    >
                      <TableCell className="max-w-[200px] py-4 border-r border-border/30">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate font-semibold text-foreground">
                              {activity.description}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="max-w-[150px] py-4 border-r border-border/30">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate text-muted-foreground">{activity.macroTask}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.macroTask}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="max-w-[120px] py-4 border-r border-border/30">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate text-muted-foreground">{activity.process}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.process}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center text-sm py-4 font-medium border-r border-border/30">
                        {activity.serviceOrder?.serviceOrderNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-[150px] py-4 border-r border-border/30">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate text-muted-foreground">
                              {activity.projectName}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.projectName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center text-sm font-bold tabular-nums py-4 border-r border-border/30">
                        {formatTime(parseFloat(activity.totalTime.toFixed(2)))}
                      </TableCell>
                      <TableCell className="text-center text-sm tabular-nums py-4 font-medium border-r border-border/30">
                        {activity.estimatedTime}
                      </TableCell>
                      <TableCell className="text-center py-4 border-r border-border/30">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span className="font-medium">{formatTeam(activity.team)}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {activity.team?.map(member => member.name).join(', ') || 'Sem equipe definida'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm font-bold tabular-nums py-4 border-r border-border/30">
                        <span
                          className={cn(
                            "text-base",
                            getEfficiencyColor(
                              activity.totalTime || 0,
                              activity.estimatedTime.toString()
                            )
                          )}
                        >
                          {CalculateEfficiency(
                            activity.totalTime || 0,
                            activity.estimatedTime.toString()
                          ).toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={cn(
                            "flex items-center gap-1.5 w-fit px-3 py-1.5 font-medium",
                            statusConfig.bgColor,
                            statusConfig.textColor
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)} />
                          {activity.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>

          {totalPages > 1 && (
            <div className="flex items-center justify-center p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      className={cn(
                        "transition-all",
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer hover:bg-accent'
                      )}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className={cn(
                            "cursor-pointer transition-all",
                            currentPage === pageNumber
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                              : "hover:bg-accent"
                          )}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      className={cn(
                        "transition-all",
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer hover:bg-accent'
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <div className="p-4 rounded-full bg-muted/50">
            <Activity className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">
              Nenhuma atividade encontrada
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Ajuste os filtros para ver mais resultados
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
