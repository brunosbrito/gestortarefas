
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FilteredActivity } from '@/interfaces/DashboardFilters';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, Clock, Users, TrendingUp } from 'lucide-react';

interface FilteredActivitiesTableProps {
  activities: FilteredActivity[];
  loading: boolean;
}

export const FilteredActivitiesTable = ({ activities, loading }: FilteredActivitiesTableProps) => {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-[#003366]" />
          <h3 className="text-lg font-semibold">Atividades</h3>
        </div>
        
        {totalItems > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} resultados
            </span>
            <div className="flex items-center gap-2">
              <span>Por página:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
      
      {activities && activities.length > 0 ? (
        <div className="space-y-4">
          <div className="rounded-md border">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Descrição</TableHead>
                    <TableHead className="w-[150px]">Tarefa Macro</TableHead>
                    <TableHead className="w-[120px]">Processo</TableHead>
                    <TableHead className="w-16 text-center">OS</TableHead>
                    <TableHead className="w-[150px]">Fábrica/Obra</TableHead>
                    <TableHead className="w-20 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        T. Total
                      </div>
                    </TableHead>
                    <TableHead className="w-20 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        T. Prev.
                      </div>
                    </TableHead>
                    <TableHead className="w-24 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4" />
                        Equipe
                      </div>
                    </TableHead>
                    <TableHead className="w-20 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Efic.
                      </div>
                    </TableHead>
                    <TableHead className="w-28">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="max-w-[200px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate">
                              {activity.description}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate">
                              {activity.macroTask}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.macroTask}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="max-w-[120px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate">
                              {activity.process}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.process}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {activity.serviceOrder?.serviceOrderNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate">
                              {activity.projectName}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.projectName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {formatTime(activity.totalTime)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {formatTime(activity.estimatedTime)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {formatTeam(activity.team)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{activity.team?.join(', ') || 'Sem equipe definida'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        <span className={getEfficiencyColor(activity.kpis?.efficiency)}>
                          {activity.kpis?.efficiency ? `${activity.kpis.efficiency}%` : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(activity.status)} text-xs`}>
                          {activity.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-40 bg-gray-50 rounded-md">
          <p className="text-gray-500">Nenhuma atividade encontrada com os filtros selecionados</p>
        </div>
      )}
    </Card>
  );
};
