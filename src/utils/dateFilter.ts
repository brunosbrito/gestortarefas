
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

  // Se não temos datas para filtrar, retorna todos os dados
  if (!startDate && !endDate) {
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
    if (startDate && endDate) {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999); // Final do dia

      return (isAfter(itemDate, startDate) || isEqual(itemDate, startDate)) && 
             (isBefore(itemDate, endDate) || isEqual(itemDate, endDate));
    }
    
    // Filtra apenas pela data de início se só temos ela
    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
      return isAfter(itemDate, startDate) || isEqual(itemDate, startDate);
    }
    
    // Filtra apenas pela data final se só temos ela
    if (endDate) {
      endDate.setHours(23, 59, 59, 999); // Final do dia
      return isBefore(itemDate, endDate) || isEqual(itemDate, endDate);
    }

    return true;
  });
};
