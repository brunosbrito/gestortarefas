
import { addDays, isAfter } from 'date-fns';
import { PeriodFilterType } from '@/components/dashboard/PeriodFilter';

export const filterDataByPeriod = <T extends { createdAt?: string | Date }>(
  data: T[], 
  periodFilter: PeriodFilterType
): T[] => {
  if (!data || periodFilter === 'todos') {
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
    
    return isAfter(itemDate, startDate);
  });
};
