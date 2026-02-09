import { useMemo, useRef, useState } from 'react';
import {
  GanttComponent,
  Inject,
  Selection,
  DayMarkers,
  ColumnsDirective,
  ColumnDirective,
  TaskFieldsModel,
} from '@syncfusion/ej2-react-gantt';
import '@/config/syncfusionLocale';
import { Activity } from '@/interfaces/AtividadeInterface';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { GanttTask, GanttGroupBy } from '@/interfaces/GanttInterface';
import { useGanttData } from '@/hooks/useGanttData';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { GanttChartDialog } from './GanttChartDialog';

// Tipo genérico para atividades
type ActivityLike = Activity | AtividadeStatus;

interface GanttChartProps {
  activities: ActivityLike[];
  height?: string;
  title?: string;
  showExpandButton?: boolean;
  groupBy?: GanttGroupBy;
  onTaskClick?: (task: GanttTask) => void;
}

export function GanttChart({
  activities,
  height = '400px',
  title = 'Cronograma de Atividades',
  showExpandButton = true,
  groupBy = null,
  onTaskClick,
}: GanttChartProps) {
  const { theme } = useTheme();
  const ganttRef = useRef<GanttComponent>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  if (ganttData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Nenhuma atividade com datas para exibir no cronograma
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={theme === 'dark' ? 'gantt-dark-mode' : ''}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {showExpandButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDialogOpen(true)}
              title="Expandir"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="gantt-chart-container">
            <GanttComponent
              ref={ganttRef}
              dataSource={ganttData}
              taskFields={taskFields}
              height={height}
              highlightWeekends={true}
              timelineSettings={timelineSettings}
              labelSettings={labelSettings}
              projectStartDate={projectStartDate}
              projectEndDate={projectEndDate}
              recordClick={handleRecordClick}
              allowSelection={true}
              gridLines="Both"
              treeColumnIndex={0}
              locale="pt-BR"
            >
              <ColumnsDirective>
                <ColumnDirective field="TaskName" headerText="Atividade" width={250} />
                <ColumnDirective field="StartDate" headerText="Início" width={100} format="dd/MM/yyyy" />
                <ColumnDirective field="EndDate" headerText="Fim" width={100} format="dd/MM/yyyy" />
                <ColumnDirective field="Duration" headerText="Dias" width={70} textAlign="Center" />
                <ColumnDirective field="Progress" headerText="%" width={60} textAlign="Center" />
                <ColumnDirective field="Status" headerText="Status" width={120} />
              </ColumnsDirective>
              <Inject services={[Selection, DayMarkers]} />
            </GanttComponent>
          </div>
        </CardContent>
      </Card>

      <GanttChartDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        activities={activities}
        title={title}
        groupBy={groupBy}
        onTaskClick={onTaskClick}
      />
    </>
  );
}
