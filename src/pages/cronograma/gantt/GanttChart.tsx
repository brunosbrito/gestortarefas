/**
 * Componente de Gráfico Gantt usando SVAR React Gantt
 * Biblioteca: @svar-ui/react-gantt (MIT License)
 * Substituindo frappe-gantt devido a barras invisíveis na v1.0.4
 */

import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { Gantt, Willow, WillowDark } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings2, ZoomIn, ZoomOut, Calendar as CalendarIcon, GripVertical, Plus, Edit, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useTheme } from '@/contexts/ThemeContext';
import type { TarefaCronograma } from '@/interfaces/CronogramaInterfaces';

// ============================================================================
// TYPES
// ============================================================================

interface GanttChartProps {
  tarefas: TarefaCronograma[];
  viewMode: 'Day' | 'Week' | 'Month';
  onViewModeChange: (mode: 'Day' | 'Week' | 'Month') => void;
  onTaskClick?: (tarefa: TarefaCronograma) => void;
  onAddTask?: () => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onReload?: () => void;
}

interface SVARTask {
  id: string;
  text: string;
  start: Date;
  end: Date;
  duration: number;
  progress: number;
  type: 'task' | 'milestone';
  parent?: string;
  custom_class?: string;
  // Custom fields para mapear de volta
  _tarefaOriginal?: TarefaCronograma;
}

interface SVARLink {
  id: string;
  source: string;
  target: string;
  type: 'e2s' | 's2s' | 'e2e' | 's2e'; // end-to-start, start-to-start, end-to-end, start-to-end
}

interface SVARScale {
  unit: 'year' | 'month' | 'week' | 'day' | 'hour';
  step: number;
  format: string;
}

// ============================================================================
// COLUMN CONFIG
// ============================================================================

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width?: number;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  // Colunas Básicas
  { id: 'text', label: 'Nome da Tarefa', visible: true, width: 400 },
  { id: 'eap', label: 'EAP/WBS', visible: true, width: 100 },
  { id: 'start', label: 'Início Planejado', visible: true, width: 130 },
  { id: 'end', label: 'Fim Planejado', visible: true, width: 130 },
  { id: 'duration', label: 'Duração (dias)', visible: true, width: 130 },
  { id: 'progress', label: 'Progresso (%)', visible: false, width: 100 },

  // Hierarquia e Estrutura (MS Project)
  { id: 'nivel', label: 'Nível', visible: false, width: 70 },
  { id: 'ordem', label: 'Ordem', visible: false, width: 70 },

  // Classificação
  { id: 'type', label: 'Tipo', visible: false, width: 120 },
  { id: 'status', label: 'Status', visible: true, width: 120 },
  { id: 'prioridade', label: 'Prioridade', visible: false, width: 100 },
  { id: 'isMilestone', label: 'Marco', visible: false, width: 70 },

  // Responsabilidades
  { id: 'responsavel', label: 'Responsável', visible: false, width: 150 },
  { id: 'equipe', label: 'Equipe/Disciplina', visible: false, width: 150 },

  // Datas Reais (Acompanhamento)
  { id: 'dataInicioReal', label: 'Início Real', visible: false, width: 110 },
  { id: 'dataFimReal', label: 'Fim Real', visible: false, width: 110 },

  // Análise de Caminho Crítico
  { id: 'isCritico', label: 'Crítico', visible: false, width: 70 },
  { id: 'folga', label: 'Folga (dias)', visible: false, width: 100 },

  // Relacionamentos
  { id: 'predecessoras', label: 'Predecessoras', visible: false, width: 150 },
  { id: 'recursos', label: 'Recursos', visible: false, width: 150 },

  // Descrição
  { id: 'descricao', label: 'Descrição', visible: false, width: 250 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: TarefaCronograma['status']): string => {
  switch (status) {
    case 'concluida':
      return 'status-complete';
    case 'em_andamento':
      return 'status-progress';
    case 'atrasada':
      return 'status-delayed';
    case 'bloqueada':
      return 'status-blocked';
    case 'cancelada':
      return 'status-cancelled';
    case 'planejada':
    default:
      return 'status-planned';
  }
};

const formatDate = (dateStr: string): Date => {
  return new Date(dateStr);
};

const calculateDuration = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GanttChart({
  tarefas,
  viewMode,
  onViewModeChange,
  onTaskClick,
  onAddTask,
  onTaskDelete,
  onReload,
}: GanttChartProps) {
  const { theme } = useTheme();
  const apiRef = useRef<any>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Mapear TarefaCronograma para formato SVAR
  const svarTasks = useMemo((): SVARTask[] => {
    return tarefas.map((tarefa) => ({
      // Campos obrigatórios SVAR
      id: tarefa.id,
      text: tarefa.nome,
      start: formatDate(tarefa.dataInicioPlanejada),
      end: formatDate(tarefa.dataFimPlanejada),
      duration: calculateDuration(tarefa.dataInicioPlanejada, tarefa.dataFimPlanejada),
      progress: tarefa.progresso,
      type: tarefa.isMilestone ? 'milestone' : 'task',
      parent: tarefa.tarefaPaiId,
      custom_class: getStatusColor(tarefa.status),

      // Campos customizados (MS Project)
      eap: tarefa.eap || '',
      nivel: tarefa.nivel,
      ordem: tarefa.ordem,
      status: tarefa.status,
      prioridade: tarefa.prioridade || '',
      isMilestone: tarefa.isMilestone ? 'Sim' : 'Não',
      responsavel: tarefa.responsavel?.name || '',
      equipe: tarefa.equipe || '',
      dataInicioReal: tarefa.dataInicioReal ? new Date(tarefa.dataInicioReal).toLocaleDateString('pt-BR') : '',
      dataFimReal: tarefa.dataFimReal ? new Date(tarefa.dataFimReal).toLocaleDateString('pt-BR') : '',
      isCritico: tarefa.isCritico ? 'Sim' : 'Não',
      folga: tarefa.folga !== undefined ? `${tarefa.folga} dias` : '',
      predecessoras: tarefa.dependencias
        ?.map((d) => d.tarefaAnteriorId)
        .filter(Boolean)
        .join(', ') || '',
      recursos: tarefa.recursos
        ?.map((r) => r.colaborador?.name)
        .filter((name): name is string => Boolean(name))
        .join(', ') || '',
      descricao: tarefa.descricao || '',

      // Backup do objeto original
      _tarefaOriginal: tarefa,
    }));
  }, [tarefas]);

  // Mapear dependências para formato SVAR
  const svarLinks = useMemo((): SVARLink[] => {
    const links: SVARLink[] = [];
    let linkId = 1;

    tarefas.forEach((tarefa) => {
      tarefa.dependencias?.forEach((dep) => {
        // Mapear tipo de dependência
        let linkType: SVARLink['type'] = 'e2s'; // padrão: end-to-start

        switch (dep.tipo) {
          case 'fim_inicio':
            linkType = 'e2s';
            break;
          case 'inicio_inicio':
            linkType = 's2s';
            break;
          case 'fim_fim':
            linkType = 'e2e';
            break;
          case 'inicio_fim':
            linkType = 's2e';
            break;
        }

        links.push({
          id: dep.id || `link-${linkId++}`,
          source: dep.tarefaAnteriorId,
          target: dep.tarefaPosteriorId,
          type: linkType,
        });
      });
    });

    return links;
  }, [tarefas]);

  // Configurar escalas de tempo baseado em viewMode
  const scales = useMemo((): SVARScale[] => {
    switch (viewMode) {
      case 'Day':
        return [
          { unit: 'month', step: 1, format: 'MMMM yyyy' },
          { unit: 'day', step: 1, format: 'd' },
        ];
      case 'Week':
        return [
          { unit: 'month', step: 1, format: 'MMMM yyyy' },
          { unit: 'week', step: 1, format: "'Sem' w" },
        ];
      case 'Month':
        return [
          { unit: 'year', step: 1, format: 'yyyy' },
          { unit: 'month', step: 1, format: 'MMM' },
        ];
      default:
        return [
          { unit: 'month', step: 1, format: 'MMMM yyyy' },
          { unit: 'day', step: 1, format: 'd' },
        ];
    }
  }, [viewMode]);

  // Configurar colunas SVAR baseado em visibleColumns
  const svarColumns = useMemo(() => {
    return visibleColumns
      .filter((col) => col.visible)
      .map((col) => {
        const baseColumn: any = {
          id: col.id,
          header: col.label,
          width: col.width || 120,
          flexgrow: col.id === 'text' ? 1 : undefined,
        };

        // Format date columns to Brazilian format (dd/mm/yyyy)
        if (col.id === 'start' || col.id === 'end') {
          baseColumn.template = (task: any) => {
            const date = task[col.id];
            if (!date) return '';
            if (typeof date === 'string') {
              return new Date(date).toLocaleDateString('pt-BR');
            }
            return date.toLocaleDateString('pt-BR');
          };
          baseColumn.editor = { type: 'datepicker' };
        }

        // Enable inline editing for specific columns
        if (col.id === 'text') {
          baseColumn.editor = { type: 'text' };
        } else if (col.id === 'duration') {
          baseColumn.editor = { type: 'text' };
        }

        return baseColumn;
      });
  }, [visibleColumns]);

  // Handler para seleção de tarefa (via API event)
  const handleTaskSelect = useCallback(
    (ev: any) => {
      const taskId = ev.id;
      setSelectedTaskId(taskId);

      // Encontrar a tarefa original
      const task = svarTasks.find(t => t.id === taskId);
      if (task?._tarefaOriginal && onTaskClick) {
        onTaskClick(task._tarefaOriginal);
      }
    },
    [svarTasks, onTaskClick]
  );

  // Registrar evento de seleção via API
  useEffect(() => {
    if (apiRef.current) {
      // Listener para seleção de tarefa
      apiRef.current.on('select-task', handleTaskSelect);

      // Cleanup
      return () => {
        if (apiRef.current) {
          apiRef.current.off('select-task', handleTaskSelect);
        }
      };
    }
  }, [handleTaskSelect]);

  // Handler para adicionar tarefa
  const handleAddTask = useCallback(() => {
    if (onAddTask) {
      onAddTask();
    }
  }, [onAddTask]);

  // Handler para editar tarefa selecionada
  const handleEditTask = useCallback(() => {
    if (selectedTaskId) {
      const task = svarTasks.find(t => t.id === selectedTaskId);
      if (task?._tarefaOriginal && onTaskClick) {
        onTaskClick(task._tarefaOriginal);
      }
    }
  }, [selectedTaskId, svarTasks, onTaskClick]);

  // Handler para deletar tarefa selecionada
  const handleDeleteTask = useCallback(async () => {
    if (selectedTaskId && onTaskDelete) {
      await onTaskDelete(selectedTaskId);
      setSelectedTaskId(null);
      if (onReload) onReload();
    }
  }, [selectedTaskId, onTaskDelete, onReload]);

  // Handler para indent (transformar em subtarefa)
  const handleIndent = useCallback(() => {
    if (selectedTaskId && apiRef.current) {
      // SVAR API: indent task
      const api = apiRef.current;
      api.exec('indent-task', { id: selectedTaskId });
    }
  }, [selectedTaskId]);

  // Handler para outdent (remover hierarquia)
  const handleOutdent = useCallback(() => {
    if (selectedTaskId && apiRef.current) {
      // SVAR API: outdent task
      const api = apiRef.current;
      api.exec('outdent-task', { id: selectedTaskId });
    }
  }, [selectedTaskId]);

  // Alternar visibilidade de coluna
  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Reordenar colunas (drag-and-drop)
  const handleColumnReorder = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(visibleColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setVisibleColumns(items);
  };


  return (
    <div className="gantt-chart-container">
      {/* Toolbar */}
      <div className="gantt-toolbar">
        <div className="gantt-toolbar-left">
          <h3 className="gantt-title">Cronograma Gantt</h3>
          <span className="gantt-task-count">{tarefas.length} tarefas</span>
        </div>

        <div className="gantt-toolbar-right">
          {/* Ações de Tarefa */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTask}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleEditTask}
            disabled={!selectedTaskId}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteTask}
            disabled={!selectedTaskId}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar
          </Button>

          {/* Hierarquia */}
          <div className="flex gap-1 border-l pl-3 ml-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleIndent}
              disabled={!selectedTaskId}
              title="Transformar em subtarefa"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOutdent}
              disabled={!selectedTaskId}
              title="Remover hierarquia"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* View Mode Selector */}
          <div className="border-l pl-3 ml-3">
            <Select value={viewMode} onValueChange={(value) => onViewModeChange(value as any)}>
              <SelectTrigger className="w-[140px]">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Day">Dia</SelectItem>
                <SelectItem value="Week">Semana</SelectItem>
                <SelectItem value="Month">Mês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Zoom Controls */}
          <div className="gantt-zoom-controls">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (viewMode === 'Month') onViewModeChange('Week');
                else if (viewMode === 'Week') onViewModeChange('Day');
              }}
              disabled={viewMode === 'Day'}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (viewMode === 'Day') onViewModeChange('Week');
                else if (viewMode === 'Week') onViewModeChange('Month');
              }}
              disabled={viewMode === 'Month'}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Column Config */}
          <Button variant="outline" size="sm" onClick={() => setColumnSheetOpen(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            Configurar Colunas
          </Button>

          {/* Legend Toggle */}
          <Button
            variant={showLegend ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
          >
            Legenda
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-content">
        {theme === 'dark' ? (
          <WillowDark>
            <Gantt
              tasks={svarTasks}
              links={svarLinks}
              scales={scales}
              columns={svarColumns}
              cellHeight={44}
              cellWidth={100}
              readonly={false}
              init={(api) => {
                apiRef.current = api;
              }}
            />
          </WillowDark>
        ) : (
          <Willow>
            <Gantt
              tasks={svarTasks}
              links={svarLinks}
              scales={scales}
              columns={svarColumns}
              cellHeight={44}
              cellWidth={100}
              readonly={false}
              init={(api) => {
                apiRef.current = api;
              }}
            />
          </Willow>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="gantt-legend">
          <div className="gantt-legend-item">
            <div className="gantt-legend-color status-planned" />
            <span>Planejada</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-color status-progress" />
            <span>Em Andamento</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-color status-complete" />
            <span>Concluída</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-color status-delayed" />
            <span>Atrasada</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-color status-blocked" />
            <span>Bloqueada</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-color status-cancelled" />
            <span>Cancelada</span>
          </div>
        </div>
      )}

      {/* Column Config Sheet */}
      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Configurar Colunas</SheetTitle>
          </SheetHeader>

          <p className="text-sm text-muted-foreground mt-4 mb-2">
            Arraste para reordenar • Marque para exibir
          </p>

          <DragDropContext onDragEnd={handleColumnReorder}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div
                  className="column-config-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {visibleColumns.map((column, index) => (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`column-config-item ${
                            snapshot.isDragging ? 'column-config-item-dragging' : ''
                          }`}
                        >
                          <div className="column-config-drag" {...provided.dragHandleProps}>
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <label className="column-config-label">
                            <input
                              type="checkbox"
                              checked={column.visible}
                              onChange={() => toggleColumnVisibility(column.id)}
                            />
                            <span>{column.label}</span>
                          </label>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </SheetContent>
      </Sheet>

      {/* Styles */}
      <style>{`
        /* Container */
        .gantt-chart-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 200px);
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        /* Toolbar */
        .gantt-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .gantt-toolbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .gantt-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .gantt-task-count {
          font-size: 14px;
          color: #6b7280;
          background: #e5e7eb;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .gantt-toolbar-right {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .gantt-zoom-controls {
          display: flex;
          gap: 4px;
        }

        /* Content */
        .gantt-content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        /* Force grid width via CSS */
        .gantt-content :global(.wx-grid) {
          min-width: 900px;
        }

        /* Legend */
        .gantt-legend {
          display: flex;
          gap: 16px;
          padding: 12px 16px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          flex-wrap: wrap;
        }

        .gantt-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #374151;
        }

        .gantt-legend-color {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        /* Status Colors */
        .status-planned {
          background: #d1d5db;
        }

        .status-progress {
          background: #60a5fa;
        }

        .status-complete {
          background: #34d399;
        }

        .status-delayed {
          background: #f87171;
        }

        .status-blocked {
          background: #fb923c;
        }

        .status-cancelled {
          background: #9ca3af;
          opacity: 0.6;
        }

        /* Column Config */
        .column-config-list {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .column-config-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          background: hsl(var(--muted));
          transition: all 0.2s;
        }

        .column-config-item:hover {
          background: hsl(var(--muted) / 0.8);
        }

        .column-config-item-dragging {
          background: hsl(var(--primary) / 0.1);
          border-color: hsl(var(--primary));
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: rotate(2deg);
        }

        .column-config-drag {
          display: flex;
          align-items: center;
          cursor: grab;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .column-config-drag:hover {
          background: hsl(var(--muted-foreground) / 0.1);
        }

        .column-config-drag:active {
          cursor: grabbing;
        }

        .column-config-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: hsl(var(--foreground));
          flex: 1;
        }

        .column-config-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: hsl(var(--primary));
        }

        /* SVAR Gantt Custom Styles */
        /* Override SVAR default colors with our status colors */
        .wx-gantt .wx-bar.status-planned {
          fill: #d1d5db !important;
          stroke: #9ca3af !important;
        }

        .wx-gantt .wx-bar.status-progress {
          fill: #60a5fa !important;
          stroke: #2563eb !important;
        }

        .wx-gantt .wx-bar.status-complete {
          fill: #34d399 !important;
          stroke: #059669 !important;
        }

        .wx-gantt .wx-bar.status-delayed {
          fill: #f87171 !important;
          stroke: #dc2626 !important;
        }

        .wx-gantt .wx-bar.status-blocked {
          fill: #fb923c !important;
          stroke: #ea580c !important;
        }

        .wx-gantt .wx-bar.status-cancelled {
          fill: #9ca3af !important;
          stroke: #6b7280 !important;
          opacity: 0.5 !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .gantt-toolbar {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .gantt-toolbar-left,
          .gantt-toolbar-right {
            justify-content: space-between;
          }

          .gantt-legend {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
