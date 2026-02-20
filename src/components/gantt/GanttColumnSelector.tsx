import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Columns3 } from 'lucide-react';
import { GanttColumnConfig, DEFAULT_GANTT_COLUMNS } from '@/interfaces/GanttInterface';

const STORAGE_KEY = 'gantt-visible-columns-v5';

// Store global para sincronizar estado entre componentes
let listeners: Array<() => void> = [];
let columnsCache: GanttColumnConfig[] | null = null;

function getColumnsFromStorage(): GanttColumnConfig[] {
  if (columnsCache) return columnsCache;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const savedColumns = JSON.parse(saved) as GanttColumnConfig[];
      columnsCache = DEFAULT_GANTT_COLUMNS.map(defaultCol => {
        const savedCol = savedColumns.find(c => c.field === defaultCol.field);
        return savedCol ? { ...defaultCol, visible: savedCol.visible } : defaultCol;
      });
      return columnsCache;
    } catch {
      columnsCache = DEFAULT_GANTT_COLUMNS;
      return columnsCache;
    }
  }
  columnsCache = DEFAULT_GANTT_COLUMNS;
  return columnsCache;
}

function setColumnsToStorage(newColumns: GanttColumnConfig[]) {
  columnsCache = newColumns;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newColumns));
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function getSnapshot() {
  return getColumnsFromStorage();
}

interface GanttColumnSelectorProps {
  onColumnsChange?: (columns: GanttColumnConfig[]) => void;
  variant?: 'default' | 'compact';
}

export function useGanttColumns() {
  const columns = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const toggleColumn = useCallback((field: string) => {
    const currentColumns = getColumnsFromStorage();
    const newColumns = currentColumns.map(col =>
      col.field === field && !col.required
        ? { ...col, visible: !col.visible }
        : col
    );
    setColumnsToStorage(newColumns);
  }, []);

  const visibleColumns = columns.filter(col => col.visible);

  return { columns, visibleColumns, toggleColumn };
}

export function GanttColumnSelector({
  onColumnsChange,
  variant = 'default',
}: GanttColumnSelectorProps) {
  const { columns, toggleColumn } = useGanttColumns();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (onColumnsChange) {
      onColumnsChange(columns);
    }
  }, [columns, onColumnsChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === 'compact' ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <Columns3 className="h-3.5 w-3.5" />
            Colunas
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <Columns3 className="h-4 w-4" />
            Colunas
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 z-[200]" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-3">Colunas Visíveis</h4>
          {columns.map((column) => (
            <div key={column.field} className="flex items-center space-x-2">
              <Checkbox
                id={`col-${column.field}`}
                checked={column.visible}
                disabled={column.required}
                onCheckedChange={() => toggleColumn(column.field)}
              />
              <label
                htmlFor={`col-${column.field}`}
                className={`text-sm cursor-pointer flex-1 ${
                  column.required ? 'text-muted-foreground' : ''
                }`}
              >
                {column.headerText}
                {column.required && (
                  <span className="text-xs text-muted-foreground ml-1">(obrigatória)</span>
                )}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
