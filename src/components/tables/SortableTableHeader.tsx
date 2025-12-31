import * as React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableTableHeaderProps {
  label: string;
  sortKey: string;
  currentSortKey: string | null;
  currentSortDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const SortableTableHeader = ({
  label,
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
  className,
  align = 'left',
}: SortableTableHeaderProps) => {
  const isActive = currentSortKey === sortKey;
  const isSortedAsc = isActive && currentSortDirection === 'asc';
  const isSortedDesc = isActive && currentSortDirection === 'desc';

  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none group",
        "hover:bg-muted/50 transition-colors",
        align === 'center' && "text-center",
        align === 'right' && "text-right",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <div className={cn(
        "flex items-center gap-2",
        align === 'center' && "justify-center",
        align === 'right' && "justify-end"
      )}>
        <span className={cn(
          "font-semibold text-foreground",
          isActive && "text-primary"
        )}>
          {label}
        </span>

        {/* Sort Icons */}
        <div className="relative w-4 h-4 flex-shrink-0">
          {!isActive && (
            <ArrowUpDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
          {isSortedAsc && (
            <ArrowUp className="w-4 h-4 text-primary animate-in fade-in zoom-in duration-200" />
          )}
          {isSortedDesc && (
            <ArrowDown className="w-4 h-4 text-primary animate-in fade-in zoom-in duration-200" />
          )}
        </div>
      </div>
    </TableHead>
  );
};

/**
 * Hook para gerenciar ordenação de tabelas
 */
export const useTableSort = <T extends Record<string, any>>(
  data: T[],
  defaultSortKey?: string,
  defaultDirection: SortDirection = 'asc'
) => {
  const [sortKey, setSortKey] = React.useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(defaultDirection);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      // Cycling: asc -> desc -> null -> asc
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortKey);
      const bValue = getNestedValue(b, sortKey);

      // Handle null/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // String comparison (case-insensitive)
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aString.localeCompare(bString, 'pt-BR');
      } else {
        return bString.localeCompare(aString, 'pt-BR');
      }
    });
  }, [data, sortKey, sortDirection]);

  return {
    sortedData,
    sortKey,
    sortDirection,
    handleSort,
  };
};

// Helper to get nested object values (e.g., "user.name")
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};
