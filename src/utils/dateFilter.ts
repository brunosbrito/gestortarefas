
import { addDays, isAfter, isBefore, isEqual } from 'date-fns';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';

export const filterDataByPeriod = <T extends { createdAt?: string | Date | undefined }>(
  data: T[], 
  periodFilter: PeriodFilterType,
  startDate?: Date | null,
  endDate?: Date | null
): T[] => {
  if (!data || data.length === 0) {
    return data;
  }

  // Retornar todos os dados se o filtro for "todos" e não há datas personalizadas
  if (periodFilter === 'todos' && !startDate && !endDate) {
    return data;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Garante que estamos comparando apenas a data, sem horário

  let filterStartDate: Date | null = null;
  let filterEndDate: Date | null = null;

  // Se é um período personalizado com datas definidas
  if (periodFilter === 'personalizado' && startDate && endDate) {
    filterStartDate = new Date(startDate);
    filterStartDate.setHours(0, 0, 0, 0);
    
    filterEndDate = new Date(endDate);
    filterEndDate.setHours(23, 59, 59, 999); // Final do dia
  } else {
    // Caso contrário, usa os períodos predefinidos
    switch (periodFilter) {
      case '7dias':
        filterStartDate = addDays(today, -7);
        filterEndDate = today;
        break;
      case '1mes':
        filterStartDate = addDays(today, -30);
        filterEndDate = today;
        break;
      case '3meses':
        filterStartDate = addDays(today, -90);
        filterEndDate = today;
        break;
      default:
        return data; // Se não há filtro definido, retorna todos os dados
    }
  }

  // Se não temos datas para filtrar, retorna todos os dados
  if (!filterStartDate && !filterEndDate) {
    return data;
  }

  return data.filter(item => {
    if (!item.createdAt) return false;

    let itemDate: Date;
    if (typeof item.createdAt === 'string') {
      itemDate = new Date(item.createdAt);
    } else {
      itemDate = item.createdAt;
    }

    if (isNaN(itemDate.getTime())) {
      return false;
    }

    // Normaliza a data do item removendo a influência do horário
    itemDate.setHours(0, 0, 0, 0);

    // Filtra por ambas as datas se temos as duas
    if (filterStartDate && filterEndDate) {
      return (isAfter(itemDate, filterStartDate) || isEqual(itemDate, filterStartDate)) && 
             (isBefore(itemDate, filterEndDate) || isEqual(itemDate, filterEndDate));
    }
    
    // Filtra apenas pela data de início se só temos ela
    if (filterStartDate) {
      return isAfter(itemDate, filterStartDate) || isEqual(itemDate, filterStartDate);
    }
    
    // Filtra apenas pela data final se só temos ela
    if (filterEndDate) {
      return isBefore(itemDate, filterEndDate) || isEqual(itemDate, filterEndDate);
    }

    return true;
  });
};
