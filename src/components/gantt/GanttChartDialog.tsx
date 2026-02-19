import { useMemo, useRef } from 'react';
import {
  GanttComponent,
  Inject,
  Selection,
  DayMarkers,
  Filter,
  Sort,
  ColumnsDirective,
  ColumnDirective,
  TaskFieldsModel,
  Toolbar,
} from '@syncfusion/ej2-react-gantt';
import '@/config/syncfusionLocale';
import { Activity } from '@/interfaces/AtividadeInterface';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { GanttTask, GanttGroupBy } from '@/interfaces/GanttInterface';
import { useGanttData } from '@/hooks/useGanttData';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { GanttColumnSelector, useGanttColumns } from './GanttColumnSelector';

// Tipo genérico para atividades
type ActivityLike = Activity | AtividadeStatus;

interface GanttChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: ActivityLike[];
  title?: string;
  groupBy?: GanttGroupBy;
  onTaskClick?: (task: GanttTask) => void;
}

export function GanttChartDialog({
  open,
  onOpenChange,
  activities,
  title = 'Cronograma de Atividades',
  groupBy = null,
  onTaskClick,
}: GanttChartDialogProps) {
  const { theme } = useTheme();
  const ganttRef = useRef<GanttComponent>(null);
  const { visibleColumns } = useGanttColumns();

  // Key para forçar re-render quando colunas mudam
  const columnsKey = visibleColumns.map(c => c.field).join('-');

  const ganttData = useGanttData(activities, groupBy);

  const taskFields: TaskFieldsModel = useMemo(() => ({
    id: 'TaskID',
    name: 'TaskName',
    startDate: 'StartDate',
    endDate: 'EndDate',
    duration: 'Duration',
    progress: 'Progress',
    parentID: 'ParentID',
  }), []);

  const timelineSettings = useMemo(() => ({
    topTier: {
      unit: 'Week' as const,
      format: 'dd/MM/yyyy',
    },
    bottomTier: {
      unit: 'Day' as const,
      format: 'dd',
    },
  }), []);

  const labelSettings = useMemo(() => ({
    leftLabel: 'TaskName',
    rightLabel: 'Progress',
  }), []);

  const toolbarItems = ['ZoomIn', 'ZoomOut', 'ZoomToFit', 'ExpandAll', 'CollapseAll'];

  const filterSettings = useMemo(() => ({
    type: 'Excel' as const,
    hierarchyMode: 'Parent' as const,
  }), []);

  const handleRecordClick = (args: { data?: GanttTask }) => {
    if (args.data && onTaskClick) {
      onTaskClick(args.data);
    }
  };

  const projectStartDate = useMemo(() => {
    const dates = ganttData
      .filter(task => task.StartDate)
      .map(task => task.StartDate!.getTime());

    if (dates.length === 0) return new Date();

    const minDate = new Date(Math.min(...dates));
    minDate.setDate(minDate.getDate() - 7);
    return minDate;
  }, [ganttData]);

  const projectEndDate = useMemo(() => {
    const dates = ganttData
      .filter(task => task.EndDate || task.StartDate)
      .map(task => (task.EndDate || task.StartDate)!.getTime());

    if (dates.length === 0) return new Date();

    const maxDate = new Date(Math.max(...dates));
    maxDate.setDate(maxDate.getDate() + 14);
    return maxDate;
  }, [ganttData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 z-[100]" />
        <DialogPrimitive.Content
          className={`fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-w-[95vw] max-h-[95vh] w-full h-[90vh] border bg-background p-6 shadow-lg rounded-lg z-[100] ${theme === 'dark' ? 'gantt-dark-mode' : ''}`}
          onPointerDownOutside={(e) => {
            // Sempre prevenir fechar ao clicar fora - usuário deve usar o X
            e.preventDefault();
          }}
          onInteractOutside={(e) => {
            // Sempre prevenir fechar ao interagir fora - usuário deve usar o X
            e.preventDefault();
          }}
          onFocusOutside={(e) => {
            // Prevenir fechar ao perder foco
            e.preventDefault();
          }}
        >
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
            <span className="h-4 w-4">✕</span>
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
          <DialogHeader className="flex flex-row items-center justify-between pr-8">
            <DialogTitle>{title}</DialogTitle>
            <GanttColumnSelector variant="compact" />
          </DialogHeader>
        <div className="flex-1 overflow-hidden gantt-chart-container">
          {ganttData.length > 0 ? (
            <GanttComponent
              key={columnsKey}
              ref={ganttRef}
              dataSource={ganttData}
              taskFields={taskFields}
              height="calc(90vh - 80px)"
              highlightWeekends={true}
              timelineSettings={timelineSettings}
              labelSettings={labelSettings}
              projectStartDate={projectStartDate}
              projectEndDate={projectEndDate}
              recordClick={handleRecordClick}
              allowSelection={true}
              allowFiltering={true}
              filterSettings={filterSettings}
              allowSorting={true}
              gridLines="Both"
              treeColumnIndex={0}
              toolbar={toolbarItems}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
            >
              <ColumnsDirective>
                {visibleColumns.map((col) => (
                  <ColumnDirective
                    key={col.field}
                    field={col.field}
                    headerText={col.headerText}
                    width={col.width}
                    textAlign={col.textAlign}
                    allowFiltering={true}
                  />
                ))}
              </ColumnsDirective>
              <Inject services={[Selection, DayMarkers, Filter, Sort, Toolbar]} />
            </GanttComponent>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhuma atividade com datas para exibir no cronograma
            </div>
          )}
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
