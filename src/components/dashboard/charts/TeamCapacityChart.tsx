import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, BarChart3, Maximize2, AlertCircle } from 'lucide-react';
import { InfoTooltip } from '@/components/tooltips/InfoTooltip';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardStore } from '@/stores/dashboardStore';
import { ActivityDrilldownDialog } from '../ActivityDrilldownDialog';
import { FilteredActivity } from '@/interfaces/DashboardFilters';
import { subDays, addDays, isAfter, isBefore } from 'date-fns';
import ColaboradorService from '@/services/ColaboradorService';
import { parseTimeToHours } from '@/utils/timeHelpers';

interface CollaboratorCapacity {
  name: string;
  collaboratorId?: number;
  workedHours: number;      // Horas trabalhadas (últimos 7 dias)
  scheduledHours: number;   // Horas agendadas (próximos 7 dias)
  capacity: number;         // Capacidade (40h/semana)
  utilizationRate: number;  // % de utilização
  activityCount: number;    // Total de atividades
}

// Jornada: Seg-Qui 07h-17h (9h líq.) + Sex 07h-16h (8h líq.) = 44h/semana
const WEEKLY_CAPACITY = 44;

/**
 * Calcula capacidade por colaborador.
 * Pré-popula o mapa com TODOS os colaboradores permitidos (mesmo sem atividades),
 * garantindo que todos os 12 ativos de PRODUÇÃO/ENGENHARIA apareçam.
 */
const calculateTeamCapacity = (
  activities: any[],
  processFilter: string,
  macroFilter: string,
  allowedCollaborators: Array<{ id: number; name: string }> | null
): CollaboratorCapacity[] => {
  // Filtrar atividades por processo/macro se aplicável
  let filteredActivities = activities;

  if (processFilter !== 'all') {
    filteredActivities = filteredActivities.filter(a => a.process === processFilter);
  }

  if (macroFilter !== 'all') {
    filteredActivities = filteredActivities.filter(a => a.macroTask === macroFilter);
  }

  const now = new Date();
  const last7Days = subDays(now, 7);
  const next7Days = addDays(now, 7);

  // Pré-popular o mapa com TODOS os colaboradores permitidos (0h como base)
  const collaboratorsMap = new Map<number, CollaboratorCapacity>();
  const allowedIds: Set<number> | null = allowedCollaborators !== null
    ? new Set(allowedCollaborators.map(c => c.id))
    : null;

  if (allowedCollaborators !== null) {
    allowedCollaborators.forEach(c => {
      collaboratorsMap.set(c.id, {
        name: c.name,
        collaboratorId: c.id,
        workedHours: 0,
        scheduledHours: 0,
        capacity: WEEKLY_CAPACITY,
        utilizationRate: 0,
        activityCount: 0,
      });
    });
  }

  filteredActivities.forEach(activity => {
    const team = activity.team || [];

    team.forEach((member: any) => {
      const collaboratorId = member.collaboratorId || member.id;
      const collaboratorName = member.name;

      if (!collaboratorId || !collaboratorName) return;

      // Pular colaboradores fora da lista permitida
      if (allowedIds !== null && !allowedIds.has(collaboratorId)) return;

      // Fallback: adicionar ao mapa se não estava pré-populado (quando allowedCollaborators é null)
      if (!collaboratorsMap.has(collaboratorId)) {
        collaboratorsMap.set(collaboratorId, {
          name: collaboratorName,
          collaboratorId,
          workedHours: 0,
          scheduledHours: 0,
          capacity: WEEKLY_CAPACITY,
          utilizationRate: 0,
          activityCount: 0,
        });
      }

      const collab = collaboratorsMap.get(collaboratorId)!;
      collab.activityCount += 1;

      const estimatedHours = parseTimeToHours(activity.estimatedTime);
      const actualHours = parseTimeToHours(activity.actualTime) || activity.totalTime || 0;

      // Horas trabalhadas (últimos 7 dias)
      // activity.endDate e startDate já são Date (normalizados por activityHelpers)
      if (activity.endDate) {
        const endDate = new Date(activity.endDate);
        if (isAfter(endDate, last7Days) && isBefore(endDate, now)) {
          collab.workedHours += actualHours / team.length;
        }
      } else if (activity.status === 'Em andamento' && activity.startDate) {
        const startDate = new Date(activity.startDate);
        if (isAfter(startDate, last7Days)) {
          collab.workedHours += actualHours / team.length;
        }
      }

      // Horas agendadas (próximos 7 dias)
      if (activity.startDate) {
        const startDate = new Date(activity.startDate);
        if (isAfter(startDate, now) && isBefore(startDate, next7Days)) {
          collab.scheduledHours += estimatedHours / team.length;
        }
      } else if (activity.status === 'Em andamento' || activity.status === 'Planejado') {
        collab.scheduledHours += estimatedHours / team.length;
      }
    });
  });

  // Calcular utilization rate e ordenar: quem tem mais carga aparece no topo
  const result = Array.from(collaboratorsMap.values()).map(collab => ({
    ...collab,
    utilizationRate: ((collab.workedHours + collab.scheduledHours) / collab.capacity) * 100,
  }));

  return result.sort((a, b) => b.utilizationRate - a.utilizationRate);
};

export const TeamCapacityChart = () => {
  const { filteredData } = useDashboardStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [processFilter, setProcessFilter] = useState<string>('all');
  const [macroFilter, setMacroFilter] = useState<string>('all');
  const [selectedCollaborator, setSelectedCollaborator] = useState<CollaboratorCapacity | null>(null);
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  // Colaboradores ativos de PRODUÇÃO e ENGENHARIA com setor (null = ainda carregando)
  const [allowedCollaborators, setAllowedCollaborators] = useState<Array<{ id: number; name: string; sector: string }> | null>(null);

  useEffect(() => {
    ColaboradorService.getAllColaboradores()
      .then(colaboradores => {
        const allowed = colaboradores
          .filter(c => {
            if (!c.status) return false;
            const setor = (c.sector || '').toUpperCase();
            return setor.startsWith('PRODU') || setor.startsWith('ENGENH');
          })
          .map(c => ({ id: c.id, name: c.name, sector: c.sector }));
        setAllowedCollaborators(allowed);
      })
      .catch(() => {
        setAllowedCollaborators([]);
      });
  }, []);

  // Obter lista de processos e macros únicos para o filtro
  const { availableProcesses, availableMacros } = useMemo(() => {
    const processes = new Set<string>();
    const macros = new Set<string>();

    (filteredData.activities || []).forEach(activity => {
      if (activity.process) processes.add(activity.process);
      if (activity.macroTask) macros.add(activity.macroTask);
    });

    return {
      availableProcesses: Array.from(processes).sort(),
      availableMacros: Array.from(macros).sort(),
    };
  }, [filteredData.activities]);

  // Filtrar colaboradores por setor selecionado
  const sectorFilteredCollaborators = useMemo(() => {
    if (!allowedCollaborators) return null;
    if (sectorFilter === 'all') return allowedCollaborators;
    return allowedCollaborators.filter(c =>
      (c.sector || '').toUpperCase().startsWith(sectorFilter.toUpperCase())
    );
  }, [allowedCollaborators, sectorFilter]);

  // Calcular dados de capacidade
  const teamCapacityData = useMemo(() =>
    calculateTeamCapacity(filteredData.activities || [], processFilter, macroFilter, sectorFilteredCollaborators),
    [filteredData.activities, processFilter, macroFilter, sectorFilteredCollaborators]
  );

  const hasData = teamCapacityData.length > 0;

  // Obter atividades para o drilldown
  const getDrilldownActivities = (collaboratorId: number): FilteredActivity[] => {
    let activities = filteredData.activities || [];

    if (processFilter !== 'all') {
      activities = activities.filter(a => a.process === processFilter);
    }

    if (macroFilter !== 'all') {
      activities = activities.filter(a => a.macroTask === macroFilter);
    }

    // Filtrar atividades onde este colaborador está na equipe
    return activities.filter(a => {
      if (!a.team) return false;
      return a.team.some((member: any) =>
        (member.collaboratorId || member.id) === collaboratorId
      );
    });
  };

  const handleBarClick = (data: any) => {
    if (data && data.name) {
      const collab = teamCapacityData.find(c => c.name === data.name);
      if (collab) {
        setSelectedCollaborator(collab);
        setDrilldownOpen(true);
      }
    }
  };

  const renderChart = (height: string = "h-96") => (
    <div className={height}>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <BarChart3 className="w-12 h-12 opacity-30" />
          <p className="text-sm">Nenhum dado de equipe disponível para o período selecionado</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={teamCapacityData}
            layout="vertical"
            margin={{ top: 20, right: 60, left: 120, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              type="number"
              label={{
                value: 'Horas',
                position: 'insideBottom',
                offset: -10,
                style: { fontSize: 12 }
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              style={{ fontSize: 11 }}
            />

            {/* Linha de referência para capacidade (40h) */}
            <ReferenceLine
              x={WEEKLY_CAPACITY}
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: '40h',
                position: 'top',
                fill: '#EF4444',
                fontSize: 11
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as CollaboratorCapacity;
                  const isOverloaded = data.utilizationRate > 100;

                  return (
                    <div className="bg-card/95 backdrop-blur-sm p-3 border border-border/50 rounded-lg shadow-lg min-w-[220px]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-base">{data.name}</p>
                        {isOverloaded && (
                          <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                        )}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <p className="flex justify-between">
                          <span>Atividades:</span>
                          <span className="font-medium">{data.activityCount}</span>
                        </p>
                        <div className="h-px bg-border my-1"></div>
                        <p className="flex justify-between">
                          <span>Trabalhadas (7d):</span>
                          <span className="font-medium text-blue-600">{data.workedHours.toFixed(1)}h</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Agendadas (7d):</span>
                          <span className="font-medium text-green-600">{data.scheduledHours.toFixed(1)}h</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Capacidade:</span>
                          <span className="font-medium text-muted-foreground">{data.capacity}h/sem</span>
                        </p>
                        <div className="h-px bg-border my-1"></div>
                        <p className="flex justify-between items-center">
                          <span>Utilização:</span>
                          <span className={cn(
                            "font-semibold",
                            data.utilizationRate > 100 ? "text-red-600" :
                            data.utilizationRate > 90 ? "text-orange-600" :
                            data.utilizationRate > 70 ? "text-green-600" :
                            "text-blue-600"
                          )}>
                            {data.utilizationRate.toFixed(1)}%
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">Clique para ver atividades</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="rect"
            />
            <Bar
              dataKey="workedHours"
              name="Horas Trabalhadas (últimos 7d)"
              fill="#3B82F6"
              onClick={handleBarClick}
              cursor="pointer"
            />
            <Bar
              dataKey="scheduledHours"
              name="Horas Agendadas (próximos 7d)"
              fill="#10B981"
              onClick={handleBarClick}
              cursor="pointer"
            >
              {/* Mudar cor para vermelho se sobrecarregado */}
              {teamCapacityData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.utilizationRate > 100 ? '#EF4444' : '#10B981'}
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
      <Card className="border border-border/50 shadow-elevation-2 overflow-hidden">
        {/* Header com gradient */}
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-semibold text-foreground">
                    Carga por Colaborador
                  </h3>
                  <InfoTooltip
                    variant="help"
                    side="top"
                    content={
                      <div className="space-y-1.5">
                        <p className="font-semibold">Carga por Colaborador</p>
                        <p>Compara as horas trabalhadas nos <strong>últimos 7 dias</strong> com as horas agendadas nos <strong>próximos 7 dias</strong> por colaborador.</p>
                        <p>🔵 Horas trabalhadas (retrospectivo) &nbsp; ⚪ Horas agendadas (prospectivo)</p>
                        <p className="text-muted-foreground">Use para identificar quem está sobrecarregado (muitas horas agendadas) ou subutilizado (poucas horas agendadas). Filtre por equipe ou OS para uma visão mais focada.</p>
                      </div>
                    }
                    iconClassName="w-3.5 h-3.5"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Horas trabalhadas (últimos 7d) vs agendadas (próximos 7d)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Filtro de setor */}
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos setores</SelectItem>
                  <SelectItem value="PRODU">Produção</SelectItem>
                  <SelectItem value="ENGENH">Engenharia</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro de processo */}
              <Select value={processFilter} onValueChange={setProcessFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Processo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableProcesses.map(process => (
                    <SelectItem key={process} value={process}>
                      {process.length > 16 ? `${process.substring(0, 16)}...` : process}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro de macro task */}
              <Select value={macroFilter} onValueChange={setMacroFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Macro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {availableMacros.map(macro => (
                    <SelectItem key={macro} value={macro}>
                      {macro.length > 16 ? `${macro.substring(0, 16)}...` : macro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-xs text-muted-foreground">
                {teamCapacityData.length} colaborador{teamCapacityData.length !== 1 ? 'es' : ''}
              </div>

              <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl w-[95vw] h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">Carga por Colaborador</div>
                        <div className="text-xs text-muted-foreground font-normal mt-0.5">
                          {teamCapacityData.length} colaborador{teamCapacityData.length !== 1 ? 'es' : ''}
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
        <div className="p-6">
          {renderChart()}
        </div>
      </Card>

      {/* Dialog de drilldown para atividades */}
      {selectedCollaborator && (
        <ActivityDrilldownDialog
          open={drilldownOpen}
          onOpenChange={setDrilldownOpen}
          title={`Atividades - ${selectedCollaborator.name}`}
          subtitle={`${selectedCollaborator.activityCount} ${selectedCollaborator.activityCount === 1 ? 'atividade' : 'atividades'} • ${selectedCollaborator.utilizationRate.toFixed(1)}% de utilização`}
          activities={getDrilldownActivities(selectedCollaborator.collaboratorId!)}
          loading={false}
        />
      )}
    </>
  );
};
