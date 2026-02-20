import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FilteredActivitiesTable } from './FilteredActivitiesTable';
import { FilteredActivity } from '@/interfaces/DashboardFilters';

interface ActivityDrilldownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  activities: FilteredActivity[];
  loading?: boolean;
}

/**
 * Dialog reutilizável para exibir atividades quando o usuário clica em elementos dos gráficos
 * Usado em MacroTasksChart, ProcessHoursChart, ProductivityTrendsChart e TeamCapacityChart
 */
export const ActivityDrilldownDialog = ({
  open,
  onOpenChange,
  title,
  subtitle,
  activities,
  loading = false,
}: ActivityDrilldownDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-auto px-6 pb-6">
          <FilteredActivitiesTable
            activities={activities}
            loading={loading}
            onNavigate={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
