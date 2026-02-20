import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Activity, Clock, Users, TrendingUp, ExternalLink, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilteredActivitiesTableProps {
  activities: FilteredActivity[];
  loading: boolean;
  /** Callback chamado após navegar para a OS (ex: fechar o dialog pai) */
  onNavigate?: () => void;
}

export const FilteredActivitiesTable = ({
  activities,
  loading,
  onNavigate,
}: FilteredActivitiesTableProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  // Filtros locais
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProcess, setFilterProcess] = useState('all');
  const [filterMacro, setFilterMacro] = useState('all');
  const [filterCollaborator, setFilterCollaborator] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  const getActivityUrl = (activity: FilteredActivity): string | null => {
    // NormalizedActivity guarda projectId diretamente; FilteredActivity via serviceOrder.projectId.id
    const projectId =
      activity.projectId ??
      (activity.serviceOrder as any)?.projectId?.id;
    const serviceOrderId =
      activity.serviceOrderId ??
      activity.serviceOrder?.id;
    if (!projectId || !serviceOrderId) return null;
    return `/obras/${projectId}/os/${serviceOrderId}/atividades`;
  };

  const handleRowClick = (activity: FilteredActivity) => {
    const url = getActivityUrl(activity);
    if (!url) return;
    navigate(url);
    onNavigate?.();
  };

  const formatAtv = (activity: FilteredActivity): string => {
    const seq = activity.cod_sequencial;
    if (seq) return `ATV-${String(seq).padStart(3, '0')}`;
    return `#${activity.id}`;
  };

  // Opções únicas para filtros
  const uniqueStatuses = useMemo(
    () => Array.from(new Set(activities.map(a => a.status))).sort(),
    [activities]
  );
  const uniqueProcesses = useMemo(
    () => Array.from(new Set(activities.map(a => a.process).filter(Boolean))).sort(),
    [activities]
  );
  const uniqueMacros = useMemo(
    () => Array.from(new Set(activities.map(a => a.macroTask).filter(Boolean))).sort(),
    [activities]
  );
  const uniqueCollaborators = useMemo(() => {
    const names = new Set<string>();
    activities.forEach(a => a.team?.forEach(m => names.add(m.name)));
    return Array.from(names).sort();
  }, [activities]);
  const uniqueProjects = useMemo(
    () => Array.from(new Set(activities.map(a => a.projectName).filter(Boolean))).sort(),
    [activities]
  );

  const hasActiveFilters =
    searchText !== '' ||
    filterStatus !== 'all' ||
    filterProcess !== 'all' ||
    filterMacro !== 'all' ||
    filterCollaborator !== 'all' ||
    filterProject !== 'all';

  const clearFilters = () => {
    setSearchText('');
    setFilterStatus('all');
    setFilterProcess('all');
    setFilterMacro('all');
    setFilterCollaborator('all');
    setFilterProject('all');
  };

  // Aplicar filtros locais
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      if (searchText && !a.description.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (filterProcess !== 'all' && a.process !== filterProcess) return false;
      if (filterMacro !== 'all' && a.macroTask !== filterMacro) return false;
      if (filterCollaborator !== 'all' && !a.team?.some(m => m.name === filterCollaborator)) return false;
      if (filterProject !== 'all' && a.projectName !== filterProject) return false;
      return true;
    });
  }, [activities, searchText, filterStatus, filterProcess, filterMacro, filterCollaborator, filterProject]);

  // Calcular dados da paginação
  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredActivities.slice(startIndex, endIndex);

  // Reset página quando atividades ou filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [activities, searchText, filterStatus, filterProcess, filterMacro, filterCollaborator, filterProject]);

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('planejad') || s.includes('pendente')) {
      return {
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-700 dark:text-purple-300',
        dotColor: 'bg-purple-500',
      };
    } else if (s.includes('andamento') || s.includes('execu')) {
      return {
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        dotColor: 'bg-green-500',
      };
    } else if (s.includes('conclu') || s.includes('finaliz')) {
      return {
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-700 dark:text-blue-300',
        dotColor: 'bg-blue-500',
      };
    } else if (s.includes('paraliz') || s.includes('paralis') || s.includes('pausad')) {
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
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  const formatTeam = (team?: Array<{ collaboratorId: number; name: string }>) => {
    if (!team || team.length === 0) return '-';
    if (team.length === 1) return team[0].name;
    return `${team[0].name} +${team.length - 1}`;
  };

  // Converte estimatedTime (string "10h" / "2h 30min" / "45min" ou número em horas) para horas
  const parseEstimatedToHours = (tempo: string | number | undefined): number => {
    if (!tempo) return 0;
    if (typeof tempo === 'number') return tempo;
    // Formato "Xh Ymin" ou "Xh" ou "Ymin"
    const matchFull = tempo.match(/(\d+)h\s*(\d+)min/);
    if (matchFull) return parseInt(matchFull[1], 10) + parseInt(matchFull[2], 10) / 60;
    const matchH = tempo.match(/(\d+)h/);
    if (matchH) return parseInt(matchH[1], 10);
    const matchMin = tempo.match(/(\d+)min/);
    if (matchMin) return parseInt(matchMin[1], 10) / 60;
    return 0;
  };

  // totalTime em horas, estimatedTime em horas (ou string) → eficiência %
  const calculateEfficiency = (totalTime: number, estimatedTime: string | number | undefined) => {
    const estimated = parseEstimatedToHours(estimatedTime);
    if (estimated <= 0) return null;
    return (totalTime / estimated) * 100;
  };

  const getEfficiencyColor = (eff: number | null) => {
    if (eff === null || eff <= 0) return 'text-muted-foreground';
    if (eff <= 100) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400';
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

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className="p-4 rounded-full bg-muted/50">
          <Activity className="w-12 h-12 text-muted-foreground opacity-50" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">Nenhuma atividade encontrada</p>
          <p className="text-sm text-muted-foreground max-w-md">Ajuste os filtros para ver mais resultados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto space-y-3">
      {/* Filtros inline */}
      <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar descrição..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {uniqueStatuses.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {uniqueProcesses.length > 1 && (
          <Select value={filterProcess} onValueChange={setFilterProcess}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Processo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os processos</SelectItem>
              {uniqueProcesses.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {uniqueMacros.length > 1 && (
          <Select value={filterMacro} onValueChange={setFilterMacro}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Tarefa Macro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as macros</SelectItem>
              {uniqueMacros.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {uniqueCollaborators.length > 1 && (
          <Select value={filterCollaborator} onValueChange={setFilterCollaborator}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Colaborador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os colaboradores</SelectItem>
              {uniqueCollaborators.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {uniqueProjects.length > 1 && (
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue placeholder="Fábrica/Obra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as obras</SelectItem>
              {uniqueProjects.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs gap-1">
            <X className="w-3 h-3" />
            Limpar
          </Button>
        )}

        <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
          {totalItems} {totalItems === 1 ? 'atividade' : 'atividades'}
          {hasActiveFilters && activities.length !== totalItems && ` (de ${activities.length})`}
        </span>
      </div>

      <div className="space-y-4">
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-2">
                <TableHead className="w-[80px] text-center font-semibold text-foreground border-r border-border/30">ATV</TableHead>
                <TableHead className="w-[180px] font-semibold text-foreground border-r border-border/30">Descrição</TableHead>
                <TableHead className="w-[140px] font-semibold text-foreground border-r border-border/30">Tarefa Macro</TableHead>
                <TableHead className="w-[110px] font-semibold text-foreground border-r border-border/30">Processo</TableHead>
                <TableHead className="w-[140px] font-semibold text-foreground border-r border-border/30">Fábrica/Obra</TableHead>
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
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-sm">
                    Nenhuma atividade corresponde aos filtros aplicados
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((activity, index) => {
                  const statusConfig = getStatusConfig(activity.status);
                  const activityUrl = getActivityUrl(activity);
                  const eff = calculateEfficiency(activity.totalTime || 0, activity.estimatedTime);

                  return (
                    <TableRow
                      key={activity.id}
                      onClick={() => handleRowClick(activity)}
                      className={cn(
                        'transition-all duration-200 border-b',
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                        'hover:bg-accent/50 hover:shadow-sm',
                        activityUrl && 'cursor-pointer'
                      )}
                    >
                      <TableCell className="text-center text-xs py-4 font-mono font-medium border-r border-border/30">
                        {formatAtv(activity)}
                      </TableCell>
                      <TableCell className="max-w-[180px] py-4 border-r border-border/30">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="truncate font-semibold text-foreground">
                                {activity.description}
                              </span>
                              {activityUrl && (
                                <ExternalLink className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.description}</p>
                            {activityUrl && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Clique para abrir na OS
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="max-w-[140px] py-4 border-r border-border/30">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate text-muted-foreground">{activity.macroTask}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.macroTask}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="max-w-[110px] py-4 border-r border-border/30">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate text-muted-foreground">{activity.process}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.process}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="max-w-[140px] py-4 border-r border-border/30">
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
                        {formatTime(parseFloat((activity.totalTime || 0).toFixed(2)))}
                      </TableCell>
                      <TableCell className="text-center text-sm tabular-nums py-4 font-medium border-r border-border/30">
                        {activity.estimatedTime ?? '-'}
                      </TableCell>
                      <TableCell className="text-center py-4 border-r border-border/30">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center gap-1 text-sm">
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
                      </TableCell>
                      <TableCell className="text-center text-sm font-bold tabular-nums py-4 border-r border-border/30">
                        <span className={cn('text-base', getEfficiencyColor(eff))}>
                          {eff !== null ? `${eff.toFixed(1)}%` : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={cn(
                            'flex items-center gap-1.5 w-fit px-3 py-1.5 font-medium',
                            statusConfig.bgColor,
                            statusConfig.textColor
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dotColor)} />
                          {activity.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TooltipProvider>

        {totalPages > 1 && (
          <div className="flex items-center justify-center p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={cn(
                      'transition-all',
                      currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'
                    )}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number;
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
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className={cn(
                          'cursor-pointer transition-all',
                          currentPage === pageNumber
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold'
                            : 'hover:bg-accent'
                        )}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={cn(
                      'transition-all',
                      currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-accent'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};
