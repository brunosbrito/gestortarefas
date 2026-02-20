import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { HardDrive, BarChart3, Maximize2, AlertTriangle, Filter } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Text,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardStore } from '@/stores/dashboardStore';
import { ActivityDrilldownDialog } from '../ActivityDrilldownDialog';
import { FilteredActivity } from '@/interfaces/DashboardFilters';
import { InfoTooltip } from '@/components/tooltips/InfoTooltip';
import { parseTimeToHours } from '@/utils/timeHelpers';

type ViewMode = 'macro' | 'process';

interface ChartItem {
  label: string;
  id?: number;
  estimatedHours: number;
  completedHours: number;
  inProgressHours: number;
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
  riskLevel: number;
}

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const truncatedText = payload.value.length > 8 ? `${payload.value.substring(0, 8)}...` : payload.value;
  return (
    <Text x={x} y={y} textAnchor="end" fontSize={11} angle={-45} dy={8}>
      {truncatedText}
    </Text>
  );
};

export const PerformanceChart = () => {
  const { filteredData } = useDashboardStore();
  const [viewMode, setViewMode] = useState<ViewMode>('macro');
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtros para visão Macro (filtra por processo)
  const [processFilter, setProcessFilter] = useState<string[]>([]);
  // Filtros para visão Processo (filtra por macro + status)
  const [macroTaskFilter, setMacroTaskFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedItem, setSelectedItem] = useState<ChartItem | null>(null);
  const [drilldownOpen, setDrilldownOpen] = useState(false);

  // Listas de opções para filtros
  const { availableProcesses, availableMacroTasks } = useMemo(() => {
    const processes = new Set<string>();
    const macros = new Set<string>();
    (filteredData.activities || []).forEach(activity => {
      if (activity.process) processes.add(activity.process);
      if (activity.macroTask) macros.add(activity.macroTask);
    });
    return {
      availableProcesses: Array.from(processes).sort(),
      availableMacroTasks: Array.from(macros).sort(),
    };
  }, [filteredData.activities]);

  // Dados agregados conforme viewMode
  const chartData = useMemo((): ChartItem[] => {
    let activities = filteredData.activities || [];

    if (viewMode === 'macro') {
      if (processFilter.length > 0) {
        activities = activities.filter(a => a.process && processFilter.includes(a.process));
      }

      const grouped = activities.reduce((acc, activity) => {
        const key = activity.macroTask || 'Sem Macro Task';
        if (!acc[key]) {
          acc[key] = {
            label: key,
            id: activity.macroTaskId,
            estimatedHours: 0, completedHours: 0, inProgressHours: 0,
            completedCount: 0, inProgressCount: 0, totalCount: 0, atRiskCount: 0,
          };
        }
        const est = parseTimeToHours(activity.estimatedTime);
        const act = parseTimeToHours(activity.actualTime) || activity.totalTime || 0;
        acc[key].estimatedHours += est;
        acc[key].totalCount += 1;
        if (activity.isDelayed || (est > 0 && act > est * 1.15)) acc[key].atRiskCount += 1;
        if (activity.status === 'Concluída' || activity.status === 'Concluídas') {
          acc[key].completedHours += act;
          acc[key].completedCount += 1;
        } else if (activity.status === 'Em andamento') {
          acc[key].inProgressHours += act;
          acc[key].inProgressCount += 1;
        }
        return acc;
      }, {} as Record<string, ChartItem & { atRiskCount: number }>);

      return Object.values(grouped).map(item => ({
        ...item,
        riskLevel: item.totalCount > 0 ? (item.atRiskCount / item.totalCount) * 100 : 0,
      }));
    } else {
      if (macroTaskFilter.length > 0) {
        activities = activities.filter(a => a.macroTask && macroTaskFilter.includes(a.macroTask));
      }
      if (statusFilter === 'completed') {
        activities = activities.filter(a => a.status === 'Concluída' || a.status === 'Concluídas');
      } else if (statusFilter === 'in_progress') {
        activities = activities.filter(a => a.status === 'Em andamento');
      }

      const grouped = activities.reduce((acc, activity) => {
        const key = activity.process || 'Sem Processo';
        if (!acc[key]) {
          acc[key] = {
            label: key,
            id: activity.processId,
            estimatedHours: 0, completedHours: 0, inProgressHours: 0,
            completedCount: 0, inProgressCount: 0, totalCount: 0, atRiskCount: 0,
          };
        }
        const est = parseTimeToHours(activity.estimatedTime);
        const act = parseTimeToHours(activity.actualTime) || activity.totalTime || 0;
        acc[key].estimatedHours += est;
        acc[key].totalCount += 1;
        if (activity.isDelayed || (est > 0 && act > est * 1.15)) acc[key].atRiskCount += 1;
        if (activity.status === 'Concluída' || activity.status === 'Concluídas') {
          acc[key].completedHours += act;
          acc[key].completedCount += 1;
        } else if (activity.status === 'Em andamento') {
          acc[key].inProgressHours += act;
          acc[key].inProgressCount += 1;
        }
        return acc;
      }, {} as Record<string, ChartItem & { atRiskCount: number }>);

      return Object.values(grouped).map(item => ({
        ...item,
        riskLevel: item.totalCount > 0 ? (item.atRiskCount / item.totalCount) * 100 : 0,
      }));
    }
  }, [filteredData.activities, viewMode, processFilter, macroTaskFilter, statusFilter]);

  const hasData = chartData.length > 0;
  const itemLabel = viewMode === 'macro' ? 'tarefa' : 'processo';
  const itemLabelPlural = viewMode === 'macro' ? 'tarefas' : 'processos';

  // Drilldown: filtra atividades do item clicado
  const getDrilldownActivities = (itemName: string): FilteredActivity[] => {
    let activities = filteredData.activities || [];
    if (viewMode === 'macro') {
      if (processFilter.length > 0) {
        activities = activities.filter(a => a.process && processFilter.includes(a.process));
      }
      return activities.filter(a => (a.macroTask || 'Sem Macro Task') === itemName);
    } else {
      if (macroTaskFilter.length > 0) {
        activities = activities.filter(a => a.macroTask && macroTaskFilter.includes(a.macroTask));
      }
      if (statusFilter === 'completed') {
        activities = activities.filter(a => a.status === 'Concluída' || a.status === 'Concluídas');
      } else if (statusFilter === 'in_progress') {
        activities = activities.filter(a => a.status === 'Em andamento');
      }
      return activities.filter(a => (a.process || 'Sem Processo') === itemName);
    }
  };

  const handleBarClick = (data: any) => {
    if (data && data.label) {
      setSelectedItem(data);
      setDrilldownOpen(true);
    }
  };

  const toggleProcess = (p: string) =>
    setProcessFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleMacroTask = (m: string) =>
    setMacroTaskFilter(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const renderChart = (height = 'h-96') => (
    <div className={height}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <BarChart3 className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhum dado disponível para o período selecionado</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            data={chartData}
            barCategoryGap="20%"
            style={{ cursor: 'default' }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="label"
              tick={<CustomXAxisTick />}
              interval={chartData.length > 5 ? Math.ceil(chartData.length / 4) - 1 : 0}
              height={80}
            />
            <YAxis
              label={{ value: 'Horas', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, textAnchor: 'middle' } }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as ChartItem;
                  const hasRisk = d.riskLevel > 15;
                  return (
                    <div className="bg-card/95 backdrop-blur-sm p-3 border border-border/50 rounded-lg shadow-lg min-w-[220px]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-base">{d.label}</p>
                        {hasRisk && <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <p className="flex justify-between">
                          <span>Total de Atividades:</span>
                          <span className="font-medium">{d.totalCount}</span>
                        </p>
                        <div className="h-px bg-border my-1" />
                        <p className="flex justify-between">
                          <span>Previsto:</span>
                          <span className="font-medium text-blue-600">{d.estimatedHours.toFixed(1)}h</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Concluído ({d.completedCount}):</span>
                          <span className="font-medium text-green-600">{d.completedHours.toFixed(1)}h</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Em Andamento ({d.inProgressCount}):</span>
                          <span className="font-medium text-amber-600">{d.inProgressHours.toFixed(1)}h</span>
                        </p>
                        {hasRisk && (
                          <>
                            <div className="h-px bg-border my-1" />
                            <p className="flex justify-between items-center">
                              <span>Nível de Risco:</span>
                              <span className="font-semibold text-red-600">{d.riskLevel.toFixed(1)}%</span>
                            </p>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">Clique para ver atividades</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }} iconType="rect" iconSize={10} />
            <Bar dataKey="estimatedHours" name="Horas Previstas" fill="#3B82F6" radius={[4, 4, 0, 0]} onClick={handleBarClick} cursor="pointer" activeBar={false} background={false} />
            <Bar dataKey="completedHours" name="Horas Concluídas" fill="#10B981" radius={[4, 4, 0, 0]} onClick={handleBarClick} cursor="pointer" activeBar={false} background={false} />
            <Bar dataKey="inProgressHours" name="Horas Em Andamento" fill="#F59E0B" radius={[4, 4, 0, 0]} onClick={handleBarClick} cursor="pointer" activeBar={false} background={false}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.riskLevel > 15 ? '#EF4444' : '#F59E0B'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  return (
    <>
      <Card className="border border-border/50 shadow-elevation-2 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border-b border-border/50 p-3">
          {/* Linha 1: ícone + título + tooltip + contador + expand */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-orange-500/20 flex-shrink-0">
                <HardDrive className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-semibold text-foreground leading-tight">
                    Performance por {viewMode === 'macro' ? 'Tarefa Macro' : 'Processo'}
                  </h3>
                  <InfoTooltip
                    variant="help"
                    side="top"
                    content={
                      <div className="space-y-1.5">
                        <p className="font-semibold">Performance de Horas</p>
                        <p>Compara as <strong>horas previstas</strong> com as horas efetivamente trabalhadas.</p>
                        <p>🔵 Previstas &nbsp; 🟢 Concluídas &nbsp; 🟡 Em Andamento</p>
                        <p className="text-muted-foreground">Use o toggle para alternar entre visão por Tarefa Macro ou por Processo. Clique em uma barra para ver atividades detalhadas.</p>
                      </div>
                    }
                    iconClassName="w-3.5 h-3.5"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  Horas previstas vs trabalhadas &bull; {chartData.length} {chartData.length === 1 ? itemLabel : itemLabelPlural}
                </p>
              </div>
            </div>

            {/* Expandir */}
            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl w-[95vw] h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <HardDrive className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        Performance por {viewMode === 'macro' ? 'Tarefa Macro' : 'Processo'}
                      </div>
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        Horas previstas vs trabalhadas — {chartData.length} {chartData.length === 1 ? itemLabel : itemLabelPlural}
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0">
                  {renderChart('h-full')}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Linha 2: toggle + filtros contextuais */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Toggle Macro / Processo */}
            <div className="flex rounded-md border border-border/50 overflow-hidden text-xs h-7">
              <button
                onClick={() => setViewMode('macro')}
                className={`px-3 h-full transition-colors ${viewMode === 'macro' ? 'bg-primary text-primary-foreground font-medium' : 'bg-background text-muted-foreground hover:bg-accent'}`}
              >
                Macro
              </button>
              <button
                onClick={() => setViewMode('process')}
                className={`px-3 h-full transition-colors border-l border-border/50 ${viewMode === 'process' ? 'bg-primary text-primary-foreground font-medium' : 'bg-background text-muted-foreground hover:bg-accent'}`}
              >
                Processo
              </button>
            </div>

            {/* Filtro por Processo (visão Macro) */}
            {viewMode === 'macro' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                    <Filter className="w-3 h-3" />
                    Processos
                    {processFilter.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                        {processFilter.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-3" align="start">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <span className="text-sm font-medium">Filtrar por Processo</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"
                        onClick={() => setProcessFilter(prev => prev.length === availableProcesses.length ? [] : availableProcesses)}>
                        {processFilter.length === availableProcesses.length ? 'Limpar' : 'Todos'}
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {availableProcesses.map(p => (
                        <div key={p} className="flex items-center space-x-2">
                          <Checkbox id={`pf-${p}`} checked={processFilter.includes(p)} onCheckedChange={() => toggleProcess(p)} />
                          <label htmlFor={`pf-${p}`} className="text-sm cursor-pointer flex-1 truncate">{p}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Filtros por Macro + Status (visão Processo) */}
            {viewMode === 'process' && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                      <Filter className="w-3 h-3" />
                      Macros
                      {macroTaskFilter.length > 0 && (
                        <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                          {macroTaskFilter.length}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-3" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b">
                        <span className="text-sm font-medium">Filtrar por Macro</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"
                          onClick={() => setMacroTaskFilter(prev => prev.length === availableMacroTasks.length ? [] : availableMacroTasks)}>
                          {macroTaskFilter.length === availableMacroTasks.length ? 'Limpar' : 'Todos'}
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {availableMacroTasks.map(m => (
                          <div key={m} className="flex items-center space-x-2">
                            <Checkbox id={`mf-${m}`} checked={macroTaskFilter.includes(m)} onCheckedChange={() => toggleMacroTask(m)} />
                            <label htmlFor={`mf-${m}`} className="text-sm cursor-pointer flex-1 truncate" title={m}>{m}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[110px] h-7 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="in_progress">Em And.</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 pt-4 pb-2 flex-1 flex flex-col min-h-0">
          {renderChart("h-full")}
        </div>
      </Card>

      {/* Dialog de drilldown */}
      {selectedItem && (
        <ActivityDrilldownDialog
          open={drilldownOpen}
          onOpenChange={setDrilldownOpen}
          title={`Atividades - ${selectedItem.label}`}
          subtitle={`${selectedItem.totalCount} ${selectedItem.totalCount === 1 ? 'atividade' : 'atividades'} • ${selectedItem.completedCount} concluída(s) • ${selectedItem.inProgressCount} em andamento`}
          activities={getDrilldownActivities(selectedItem.label)}
          loading={false}
        />
      )}
    </>
  );
};
