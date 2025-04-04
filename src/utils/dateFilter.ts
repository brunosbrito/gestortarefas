
import { addDays, isAfter } from 'date-fns';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';

export const filterDataByPeriod = <T extends { createdAt?: string | Date | undefined }>(
  data: T[], 
  periodFilter: PeriodFilterType
): T[] => {
  if (!data || data.length === 0 || periodFilter === 'todos') {
    return data;
  }

  const today = new Date();
  let startDate: Date;

  switch (periodFilter) {
    case '7dias':
      startDate = addDays(today, -7);
      break;
    case '1mes':
      startDate = addDays(today, -30);
      break;
    case '3meses':
      startDate = addDays(today, -90);
      break;
    default:
      return data;
  }

  return data.filter(item => {
    if (!item.createdAt) return true;
    
    const itemDate = typeof item.createdAt === 'string' 
      ? new Date(item.createdAt) 
      : item.createdAt;
    
    if (!(itemDate instanceof Date) || isNaN(itemDate.getTime())) {
      console.warn("Data inválida:", item.createdAt);
      return true;
    }
    
    return isAfter(itemDate, startDate);
  });
};
