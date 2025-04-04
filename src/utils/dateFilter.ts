
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
  today.setHours(0, 0, 0, 0); // Garante que estamos comparando apenas a data, sem horário

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
    if (!item.createdAt) return false;

    let itemDate: Date;
    if (typeof item.createdAt === 'string') {
      itemDate = new Date(item.createdAt);
    } else {
      itemDate = item.createdAt;
    }

    if (isNaN(itemDate.getTime())) {
      console.warn("Data inválida:", item.createdAt);
      return false;
    }

    itemDate.setHours(0, 0, 0, 0); // Remove a influência do horário

    return itemDate >= startDate;
  });
};
