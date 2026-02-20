import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { HardDrive, BarChart3, Maximize2, AlertTriangle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { useDashboardStore } from '@/stores/dashboardStore';
import { ActivityDrilldownDialog } from '../ActivityDrilldownDialog';
import { FilteredActivity } from '@/interfaces/DashboardFilters';
import { InfoTooltip } from '@/components/tooltips/InfoTooltip';
import { parseTimeToHours } from '@/utils/timeHelpers';

interface MacroTaskData {
  macroTask: string;
  macroTaskId?: number;
  estimatedHours: number;
  completedHours: number;
  inProgressHours: number;
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
  riskLevel: number; // % de atividades atrasadas
}

// Componente customizado para exibir os rótulos no eixo X inclinados
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const truncatedText = payload.value.length > 8 ? `${payload.value.substring(0, 8)}...` : payload.value;

  return (
    <Text
      x={x}
      y={y}
      textAnchor="end"
      fontSize={11}
      angle={-45}
      dy={8}
    >
      {truncatedText}
    </Text>
  );
};

export const MacroTasksChart = () => {
  const { filteredData } = useDashboardStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [processFilter, setProcessFilter] = useState<string[]>([]);
  const [selectedMacroTask, setSelectedMacroTask] = useState<MacroTaskData | null>(null);
  const [drilldownOpen, setDrilldownOpen] = useState(false);

  // Obter lista de processos únicos para o filtro
  const availableProcesses = useMemo(() => {
    const processes = new Set<string>();
    (filteredData.activities || []).forEach(activity => {
      if (activity.process) {
        processes.add(activity.process);
      }
    });
    return Array.from(processes).sort();
  }, [filteredData.activities]);

  // Calcular dados agregados por macro task com separação de status
  const macroTasksData = useMemo(() => {
    let activities = filteredData.activities || [];

    // Aplicar filtro local de processo (múltiplos processos)
    if (processFilter.length > 0) {
      activities = activities.filter(a => a.process && processFilter.includes(a.process));
    }

    // Agrupar por macro task
    const grouped = activities.reduce((acc, activity) => {
      const macroName = activity.macroTask || 'Sem Macro Task';

      if (!acc[macroName]) {
        acc[macroName] = {
          macroTask: macroName,
          macroTaskId: activity.macroTaskId,
          estimatedHours: 0,
          completedHours: 0,
          inProgressHours: 0,
          completedCount: 0,
          inProgressCount: 0,
          totalCount: 0,
          atRiskCount: 0,
        };
      }

      const estimatedHours = parseTimeToHours(activity.estimatedTime);
      const actualHours = parseTimeToHours(activity.actualTime) || activity.totalTime || 0;

      acc[macroName].estimatedHours += estimatedHours;
      acc[macroName].totalCount += 1;

      // Verificar se está atrasada (para cálculo de risco)
      const isAtRisk = activity.isDelayed || (estimatedHours > 0 && actualHours > estimatedHours * 1.15);
      if (isAtRisk) {
        acc[macroName].atRiskCount += 1;
      }

      // Separar por status
      if (activity.status === 'Concluída' || activity.status === 'Concluídas') {
        acc[macroName].completedHours += actualHours;
        acc[macroName].completedCount += 1;
      } else if (activity.status === 'Em andamento') {
        acc[macroName].inProgressHours += actualHours;
        acc[macroName].inProgressCount += 1;
      }

      return acc;
    }, {} as Record<string, MacroTaskData & { atRiskCount: number }>);

    // Converter para array e calcular riskLevel
    return Object.values(grouped).map(item => ({
      ...item,
      riskLevel: item.totalCount > 0 ? (item.atRiskCount / item.totalCount) * 100 : 0,
    }));
  }, [filteredData.activities, processFilter]);

  const hasData = macroTasksData.length > 0;

  // Obter atividades para o drilldown
  const getDrilldownActivities = (macroTaskName: string): FilteredActivity[] => {
    let activities = filteredData.activities || [];

    if (processFilter.length > 0) {
      activities = activities.filter(a => a.process && processFilter.includes(a.process));
    }

    return activities.filter(a => (a.macroTask || 'Sem Macro Task') === macroTaskName);
  };

  const handleBarClick = (data: any) => {
    if (data && data.macroTask) {
      setSelectedMacroTask(data);
      setDrilldownOpen(true);
    }
  };

  const toggleProcess = (process: string) => {
    setProcessFilter(prev =>
      prev.includes(process)
        ? prev.filter(p => p !== process)
        : [...prev, process]
    );
  };

  const toggleAllProcesses = () => {
    setProcessFilter(prev =>
      prev.length === availableProcesses.length ? [] : availableProcesses
    );
  };

  const renderChart = (height: string = "h-96") => (
    <div className={height}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <BarChart3 className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhum dado disponível para o período selecionado</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            margin={{ top: 10, right: 30, left: 20, bottom: 80 }}
            data={macroTasksData}
            barCategoryGap="20%"
            style={{ cursor: 'default' }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="macroTask"
              tick={<CustomXAxisTick />}
              interval={macroTasksData.length > 5 ? Math.ceil(macroTasksData.length / 4) - 1 : 0}
              height={80}
            />
            <YAxis
              label={{ value: 'Horas', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, textAnchor: 'middle' } }}
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return value.toString();
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as MacroTaskData;
                  const hasRisk = data.riskLevel > 15;

                  return (
                    <div className="bg-card/95 backdrop-blur-sm p-3 border border-border/50 rounded-lg shadow-lg min-w-[220px]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-base">{data.macroTask}</p>
                        {hasRisk && (
                          <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                        )}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <p className="flex justify-between">
                          <span>Total de Atividades:</span>
                          <span className="font-medium">{data.totalCount}</span>
                        </p>
                        <div className="h-px bg-border my-1"></div>
                        <p className="flex justify-between">
                          <span>Previsto:</span>
                          <span className="font-medium text-blue-600">{data.estimatedHours.toFixed(1)}h</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Concluído ({data.completedCount}):</span>
                          <span className="font-medium text-green-600">{data.completedHours.toFixed(1)}h</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Em Andamento ({data.inProgressCount}):</span>
                          <span className="font-medium text-amber-600">{data.inProgressHours.toFixed(1)}h</span>
                        </p>
                        {hasRisk && (
                          <>
                            <div className="h-px bg-border my-1"></div>
                            <p className="flex justify-between items-center">
                              <span>Nível de Risco:</span>
                              <span className="font-semibold text-red-600">
                                {data.riskLevel.toFixed(1)}%
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '0px' }}
              iconType="rect"
            />
            <Bar
              dataKey="estimatedHours"
              name="Horas Previstas"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
              activeBar={false}
              background={false}
            />
            <Bar
              dataKey="completedHours"
              name="Horas Concluídas"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
              activeBar={false}
              background={false}
            />
            <Bar
              dataKey="inProgressHours"
              name="Horas Em Andamento"
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
              activeBar={false}
              background={false}
            >
              {/* Adicionar indicador visual de risco */}
              {macroTasksData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.riskLevel > 15 ? '#EF4444' : '#F59E0B'}
                />
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
        {/* Header com gradient */}
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-border/50 p-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-1.5 rounded-lg bg-orange-500/20 flex-shrink-0">
                <HardDrive className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-semibold text-foreground leading-tight">
                    Performance por Tarefa Macro
                  </h3>
                  <InfoTooltip
                    variant="help"
                    side="top"
                    content={
                      <div className="space-y-1.5">
                        <p className="font-semibold">Performance por Tarefa Macro</p>
                        <p>Compara as <strong>horas previstas</strong> com as horas efetivamente trabalhadas, agrupadas por Tarefa Macro.</p>
                        <p>🔵 Previstas &nbsp; 🟢 Concluídas &nbsp; 🟡 Em Andamento</p>
                        <p className="text-muted-foreground">Use o filtro para focar em processos específicos. Clique em uma barra para ver as atividades detalhadas.</p>
                      </div>
                    }
                    iconClassName="w-3.5 h-3.5"
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  Horas previstas vs trabalhadas
                </p>
                <p className="text-xs text-muted-foreground/70 leading-tight">
                  {macroTasksData.length} {macroTasksData.length === 1 ? 'tarefa' : 'tarefas'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Filtro local por processo (múltiplo) */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                    <Filter className="w-3 h-3" />
                    Processos
                    {processFilter.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {processFilter.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-3" align="end">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <span className="text-sm font-medium">Filtrar por Processo</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={toggleAllProcesses}
                      >
                        {processFilter.length === availableProcesses.length ? 'Limpar' : 'Todos'}
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {availableProcesses.map(process => (
                        <div key={process} className="flex items-center space-x-2">
                          <Checkbox
                            id={`process-${process}`}
                            checked={processFilter.includes(process)}
                            onCheckedChange={() => toggleProcess(process)}
                          />
                          <label
                            htmlFor={`process-${process}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {process}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        <div className="text-lg font-semibold">Performance por Tarefa Macro</div>
                        <div className="text-xs text-muted-foreground font-normal mt-0.5">
                          Comparação de horas previstas vs trabalhadas - {macroTasksData.length} {macroTasksData.length === 1 ? 'tarefa' : 'tarefas'}
                        </div>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 min-h-0">
                    {renderChart("h-full")}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-2 flex-1">
          {renderChart()}
        </div>
      </Card>

      {/* Dialog de drilldown para atividades */}
      {selectedMacroTask && (
        <ActivityDrilldownDialog
          open={drilldownOpen}
          onOpenChange={setDrilldownOpen}
          title={`Atividades - ${selectedMacroTask.macroTask}`}
          subtitle={`${selectedMacroTask.totalCount} ${selectedMacroTask.totalCount === 1 ? 'atividade' : 'atividades'} • ${selectedMacroTask.completedCount} concluída(s) • ${selectedMacroTask.inProgressCount} em andamento`}
          activities={getDrilldownActivities(selectedMacroTask.macroTask)}
          loading={false}
        />
      )}
    </>
  );
};
