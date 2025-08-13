
import { useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { DashboardFilters } from '@/types/dashboard';
import ObrasService from '@/services/ObrasService';
import { Obra } from '@/interfaces/ObrasInterface';
import { Filter } from 'lucide-react';

// Exportando o tipo PeriodFilterType para uso em outros lugares
export type PeriodFilterType = 'todos' | '7dias' | '1mes' | '3meses' | 'personalizado';

interface PeriodFilterProps {
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  currentFilters: DashboardFilters;
}

export const PeriodFilter = ({
  onFilterChange,
  currentFilters,
}: PeriodFilterProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    currentFilters.startDate || undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    currentFilters.endDate || undefined
  );
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchObras = async () => {
      try {
        setIsLoading(true);
        const obrasData = await ObrasService.getAllObras();
        setObras(obrasData || []);
      } catch (error) {
        console.error('Erro ao buscar obras:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchObras();
  }, []);

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    
    if (date) {
      const newStartDate = new Date(date);
      // Definir hora para o início do dia (00:00:00)
      newStartDate.setHours(0, 0, 0, 0);
      
      onFilterChange({ 
        startDate: newStartDate,
        period: 'personalizado'
      });
    } else {
      onFilterChange({ 
        startDate: undefined,
        period: endDate ? 'personalizado' : 'todos'
      });
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    
    if (date) {
      const newEndDate = new Date(date);
      // Definir hora para o final do dia (23:59:59)
      newEndDate.setHours(23, 59, 59, 999);
      
      onFilterChange({ 
        endDate: newEndDate,
        period: 'personalizado'
      });
    } else {
      onFilterChange({ 
        endDate: undefined,
        period: startDate ? 'personalizado' : 'todos'
      });
    }
  };

  const handleObraChange = (value: string) => {
    try {
      const obraIdValue = value === 'todos' ? null : parseInt(value);
      onFilterChange({ obraId: obraIdValue });
    } catch (error) {
      console.error('Erro ao converter o ID da obra:', error);
      onFilterChange({ obraId: null });
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <Filter className="h-5 w-5 text-[#FF7F0E]" />
          <h3 className="font-medium">Filtrar por:</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="space-y-2">
            <label htmlFor="obra" className="block text-sm font-medium">
              Obra
            </label>
            <Select
              value={currentFilters.obraId?.toString() || 'todos'}
              onValueChange={handleObraChange}
              disabled={isLoading}
            >
              <SelectTrigger id="obra" className="w-full">
                <SelectValue placeholder="Todas as Obras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Obras</SelectItem>
                {obras.map((obra) => (
                  <SelectItem key={obra.id} value={obra.id.toString()}>
                    {obra.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-medium">
              Data Início
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateSelect}
                  disabled={isLoading}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-medium">
              Data Fim
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateSelect}
                  disabled={isLoading}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </Card>
  );
};
