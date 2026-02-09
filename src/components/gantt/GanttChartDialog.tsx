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
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-[95vw] max-h-[95vh] w-full h-[90vh] ${theme === 'dark' ? 'gantt-dark-mode' : ''}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden gantt-chart-container">
          {ganttData.length > 0 ? (
            <GanttComponent
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
              allowSorting={true}
              gridLines="Both"
              treeColumnIndex={0}
              toolbar={toolbarItems}
              locale="pt-BR"
            >
              <ColumnsDirective>
                <ColumnDirective field="TaskName" headerText="Atividade" width={300} />
                <ColumnDirective field="StartDate" headerText="Início" width={120} format="dd/MM/yyyy" />
                <ColumnDirective field="EndDate" headerText="Fim" width={120} format="dd/MM/yyyy" />
                <ColumnDirective field="Duration" headerText="Dias" width={80} textAlign="Center" />
                <ColumnDirective field="Progress" headerText="Progresso" width={100} textAlign="Center" />
                <ColumnDirective field="Status" headerText="Status" width={130} />
                <ColumnDirective field="Collaborators" headerText="Colaboradores" width={150} />
              </ColumnsDirective>
              <Inject services={[Selection, DayMarkers, Filter, Sort, Toolbar]} />
            </GanttComponent>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhuma atividade com datas para exibir no cronograma
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
