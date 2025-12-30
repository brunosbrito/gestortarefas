import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { AtividadeFiltros } from '@/hooks/useAtividadeData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface AtividadeFiltrosProps {
  filtros: AtividadeFiltros;
  onFiltroChange: (filtros: Partial<AtividadeFiltros>) => void;
  onLimparFiltros: () => void;
  tarefasMacro?: any[];
  processos?: any[];
  colaboradores?: any[];
  obras?: any[];
  isLoading?: boolean;
}

export const AtividadeFiltrosComponent = ({
  filtros,
  onFiltroChange,
  onLimparFiltros,
  tarefasMacro = [],
  processos = [],
  colaboradores = [],
  obras = [],
  isLoading = false
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
          {/* Filtro Tarefa Macro */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tarefa Macro</label>
            <Select
              value={filtrosTemp.tarefaMacroId || 'all'}
              onValueChange={(value) => setFiltrosTemp(prev => ({ ...prev, tarefaMacroId: value === 'all' ? null : value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as tarefas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tarefas</SelectItem>
                {tarefasMacro.map((tarefa) => (
                  <SelectItem key={tarefa.id} value={tarefa.id.toString()}>
                    {tarefa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Processo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Processo</label>
            <Select
              value={filtrosTemp.processoId || 'all'}
              onValueChange={(value) => setFiltrosTemp(prev => ({ ...prev, processoId: value === 'all' ? null : value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os processos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os processos</SelectItem>
                {processos.map((processo) => (
                  <SelectItem key={processo.id} value={processo.id.toString()}>
                    {processo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Colaborador */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Colaborador</label>
            <Select
              value={filtrosTemp.colaboradorId || 'all'}
              onValueChange={(value) => setFiltrosTemp(prev => ({ ...prev, colaboradorId: value === 'all' ? null : value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os colaboradores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os colaboradores</SelectItem>
                {colaboradores.map((colaborador) => (
                  <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
                    {colaborador.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Obra */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Obra/Projeto</label>
            <Select
              value={filtrosTemp.obraId || 'all'}
              onValueChange={(value) => setFiltrosTemp(prev => ({ ...prev, obraId: value === 'all' ? null : value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as obras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as obras</SelectItem>
                {obras.map((obra) => (
                  <SelectItem key={obra.id} value={obra.id.toString()}>
                    {obra.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filtrosTemp.status || 'all'}
              onValueChange={(value) => setFiltrosTemp(prev => ({ ...prev, status: value === 'all' ? null : value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Planejadas">Planejadas</SelectItem>
                <SelectItem value="Em execução">Em execução</SelectItem>
                <SelectItem value="Concluídas">Concluídas</SelectItem>
                <SelectItem value="Paralizadas">Paralizadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Data Range */}
          <div className="space-y-2 md:col-span-3">
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
