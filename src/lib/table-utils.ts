/**
 * Utilidades para tabelas com ordenação
 */

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

/**
 * Função genérica para ordenar dados
 * Suporta: strings, números, datas (ISO string)
 */
export function sortData<T>(
  data: T[],
  key: keyof T,
  direction: SortDirection
): T[] {
  return [...data].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    // Null/undefined sempre vão pro final
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Números
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      // Tentar como data primeiro
      const aDate = new Date(aValue).getTime();
      const bDate = new Date(bValue).getTime();

      if (!isNaN(aDate) && !isNaN(bDate)) {
        // É uma data válida
        return direction === 'asc' ? aDate - bDate : bDate - aDate;
      }

      // Comparação alfabética (case-insensitive)
      return direction === 'asc'
        ? aValue.toLowerCase().localeCompare(bValue.toLowerCase())
        : bValue.toLowerCase().localeCompare(aValue.toLowerCase());
    }

    return 0;
  });
}

/**
 * Hook para gerenciar estado de ordenação
 */
export function useSortableData<T>(data: T[], initialKey?: keyof T) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig<T> | null>(
    initialKey ? { key: initialKey, direction: 'asc' } : null
  );

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return sortData(data, sortConfig.key, sortConfig.direction);
  }, [data, sortConfig]);

  const requestSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        // Alterna direção
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      // Nova coluna - sempre começa em asc
      return { key, direction: 'asc' };
    });
  };

  return { sortedData, sortConfig, requestSort };
}

// Re-export React para o hook
import React from 'react';
