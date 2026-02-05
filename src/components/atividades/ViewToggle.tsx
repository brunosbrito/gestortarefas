import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, Table2 } from 'lucide-react';

export type ViewMode = 'kanban' | 'table';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <ToggleGroup
      type="single"
      value={view}
      onValueChange={(value) => value && onViewChange(value as ViewMode)}
      variant="outline"
    >
      <ToggleGroupItem value="kanban" aria-label="Visualização Kanban">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Visualização Tabela">
        <Table2 className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
