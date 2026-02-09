import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, Calendar as CalendarIcon, Check, ChevronDown, Layers } from 'lucide-react';
import { AtividadeFiltros } from '@/hooks/useAtividadeData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export type GanttGroupBy = 'obra' | 'tarefaMacro' | 'colaborador' | null;

const STATUS_OPTIONS = [
  { value: 'Planejadas', label: 'Planejadas' },
  { value: 'Em execução', label: 'Em execução' },
  { value: 'Concluídas', label: 'Concluídas' },
  { value: 'Paralizadas', label: 'Paralizadas' },
];

interface MultiSelectFilterProps {
  label: string;
  placeholder: string;
  placeholderSelected: string;
  options: { id: string | number; name: string }[];
  selectedValues: string[] | null;
  onSelectionChange: (values: string[] | null) => void;
  disabled?: boolean;
}

const MultiSelectFilter = ({
  label,
  placeholder,
  placeholderSelected,
  options,
  selectedValues,
  onSelectionChange,
  disabled = false
}: MultiSelectFilterProps) => {
  const toggleOption = (value: string) => {
    const current = selectedValues || [];
    const isSelected = current.includes(value);
    const newValues = isSelected
      ? current.filter(v => v !== value)
      : [...current, value];
    onSelectionChange(newValues.length > 0 ? newValues : null);
  };

  const getDisplayText = () => {
    if (!selectedValues?.length) return placeholder;
    if (selectedValues.length === 1) {
      const selected = options.find(o => o.id.toString() === selectedValues[0]);
      return selected?.name || selectedValues[0];
    }
    return `${selectedValues.length} ${placeholderSelected}`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !selectedValues?.length && "text-muted-foreground"
            )}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <ScrollArea className="h-[200px]">
            <div className="p-2 space-y-1">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded p-2"
                  onClick={() => toggleOption(option.id.toString())}
                >
                  <Checkbox
                    checked={selectedValues?.includes(option.id.toString()) || false}
                    className="pointer-events-none"
                  />
                  <span className="text-sm truncate">{option.name}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
          {selectedValues?.length ? (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => onSelectionChange(null)}
              >
                Limpar seleção
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface AtividadeFiltrosProps {
  filtros: AtividadeFiltros;
  onFiltroChange: (filtros: Partial<AtividadeFiltros>) => void;
  onLimparFiltros: () => void;
  tarefasMacro?: any[];
  processos?: any[];
  colaboradores?: any[];
  obras?: any[];
  isLoading?: boolean;
  // Props para agrupamento do Gantt
  showGroupingSelector?: boolean;
  groupBy?: GanttGroupBy;
  onGroupByChange?: (groupBy: GanttGroupBy) => void;
}

export const AtividadeFiltrosComponent = ({
  filtros,
  onFiltroChange,
  onLimparFiltros,
  tarefasMacro = [],
  processos = [],
  colaboradores = [],
  obras = [],
  isLoading = false,
  showGroupingSelector = false,
  groupBy = null,
  onGroupByChange,
}: AtividadeFiltrosProps) => {
  const [filtrosTemp, setFiltrosTemp] = useState<AtividadeFiltros>(filtros);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: filtros.dataInicio ? new Date(filtros.dataInicio) : undefined,
    to: filtros.dataFim ? new Date(filtros.dataFim) : undefined,
  });

  useEffect(() => {
    setFiltrosTemp(filtros);
    setDateRange({
      from: filtros.dataInicio ? new Date(filtros.dataInicio) : undefined,
      to: filtros.dataFim ? new Date(filtros.dataFim) : undefined,
    });
  }, [filtros]);

  const handleAplicarFiltros = () => {
    const novosDateFiltros = {
      dataInicio: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
      dataFim: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
    };
    onFiltroChange({ ...filtrosTemp, ...novosDateFiltros });
  };

  const handleLimparFiltros = () => {
    setFiltrosTemp({
      tarefaMacroId: null,
      processoId: null,
      colaboradorId: null,
      obraId: null,
      status: null,
      dataInicio: null,
      dataFim: null
    });
    setDateRange({ from: undefined, to: undefined });
    onLimparFiltros();
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#FF7F0E]" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro Tarefa Macro - Múltipla Seleção */}
          <MultiSelectFilter
            label="Tarefa Macro"
            placeholder="Todas as tarefas"
            placeholderSelected="tarefas selecionadas"
            options={tarefasMacro}
            selectedValues={filtrosTemp.tarefaMacroId}
            onSelectionChange={(values) => setFiltrosTemp(prev => ({ ...prev, tarefaMacroId: values }))}
            disabled={isLoading}
          />

          {/* Filtro Processo - Múltipla Seleção */}
          <MultiSelectFilter
            label="Processo"
            placeholder="Todos os processos"
            placeholderSelected="processos selecionados"
            options={processos}
            selectedValues={filtrosTemp.processoId}
            onSelectionChange={(values) => setFiltrosTemp(prev => ({ ...prev, processoId: values }))}
            disabled={isLoading}
          />

          {/* Filtro Colaborador - Múltipla Seleção */}
          <MultiSelectFilter
            label="Colaborador"
            placeholder="Todos os colaboradores"
            placeholderSelected="colaboradores selecionados"
            options={colaboradores}
            selectedValues={filtrosTemp.colaboradorId}
            onSelectionChange={(values) => setFiltrosTemp(prev => ({ ...prev, colaboradorId: values }))}
            disabled={isLoading}
          />

          {/* Filtro Obra - Múltipla Seleção */}
          <MultiSelectFilter
            label="Obra/Projeto"
            placeholder="Todas as obras"
            placeholderSelected="obras selecionadas"
            options={obras}
            selectedValues={filtrosTemp.obraId}
            onSelectionChange={(values) => setFiltrosTemp(prev => ({ ...prev, obraId: values }))}
            disabled={isLoading}
          />

          {/* Filtro Status - Múltipla Seleção */}
          <MultiSelectFilter
            label="Status"
            placeholder="Todos os status"
            placeholderSelected="status selecionados"
            options={STATUS_OPTIONS.map(s => ({ id: s.value, name: s.label }))}
            selectedValues={filtrosTemp.status}
            onSelectionChange={(values) => setFiltrosTemp(prev => ({ ...prev, status: values }))}
            disabled={isLoading}
          />

          {/* Filtro Data Range */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Período</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecionar período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  autoFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Seletor de Agrupamento para Gantt */}
          {showGroupingSelector && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Agrupar Gantt por
              </label>
              <Select
                value={groupBy || 'none'}
                onValueChange={(value) => onGroupByChange?.(value === 'none' ? null : value as GanttGroupBy)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sem agrupamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem agrupamento</SelectItem>
                  <SelectItem value="obra">Obra/Projeto</SelectItem>
                  <SelectItem value="tarefaMacro">Tarefa Macro</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleLimparFiltros}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
          </Button>
          <Button
            onClick={handleAplicarFiltros}
            className="flex items-center gap-2 bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
          >
            <Check className="w-4 h-4" />
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
