
import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type PeriodFilterType = '7dias' | '1mes' | '3meses' | 'todos';

interface PeriodFilterProps {
  onFilterChange: (period: PeriodFilterType) => void;
  defaultValue?: PeriodFilterType;
}

export const PeriodFilter = ({ onFilterChange, defaultValue = 'todos' }: PeriodFilterProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilterType>(defaultValue);

  const handleValueChange = (value: string) => {
    if (value) {
      const period = value as PeriodFilterType;
      setSelectedPeriod(period);
      onFilterChange(period);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Filtrar por Período:</h3>
        <ToggleGroup 
          type="single" 
          defaultValue={selectedPeriod} 
          onValueChange={handleValueChange}
          className="justify-end"
        >
          <ToggleGroupItem value="7dias" className="text-xs bg-white border border-gray-200 hover:bg-[#FF7F0E]/10 data-[state=on]:bg-[#FF7F0E]/20 data-[state=on]:text-[#FF7F0E] data-[state=on]:border-[#FF7F0E]">
            7 dias
          </ToggleGroupItem>
          <ToggleGroupItem value="1mes" className="text-xs bg-white border border-gray-200 hover:bg-[#FF7F0E]/10 data-[state=on]:bg-[#FF7F0E]/20 data-[state=on]:text-[#FF7F0E] data-[state=on]:border-[#FF7F0E]">
            1 mês
          </ToggleGroupItem>
          <ToggleGroupItem value="3meses" className="text-xs bg-white border border-gray-200 hover:bg-[#FF7F0E]/10 data-[state=on]:bg-[#FF7F0E]/20 data-[state=on]:text-[#FF7F0E] data-[state=on]:border-[#FF7F0E]">
            3 meses
          </ToggleGroupItem>
          <ToggleGroupItem value="todos" className="text-xs bg-white border border-gray-200 hover:bg-[#FF7F0E]/10 data-[state=on]:bg-[#FF7F0E]/20 data-[state=on]:text-[#FF7F0E] data-[state=on]:border-[#FF7F0E]">
            Todos
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};
