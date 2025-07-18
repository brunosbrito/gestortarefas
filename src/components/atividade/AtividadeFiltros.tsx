
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react';
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
  isLoading?: boolean;
}

export const AtividadeFiltrosComponent = ({
  filtros,
  onFiltroChange,
  onLimparFiltros,
  tarefasMacro = [],
  processos = [],
  colaboradores = [],
  isLoading = false
}: AtividadeFiltrosProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#FF7F0E]" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtro Tarefa Macro */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tarefa Macro</label>
            <Select
              value={filtros.tarefaMacroId || 'all'}
              onValueChange={(value) => onFiltroChange({ tarefaMacroId: value === 'all' ? null : value })}
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
              value={filtros.processoId || 'all'}
              onValueChange={(value) => onFiltroChange({ processoId: value === 'all' ? null : value })}
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
              value={filtros.colaboradorId || 'all'}
              onValueChange={(value) => onFiltroChange({ colaboradorId: value === 'all' ? null : value })}
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

          {/* Filtro Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filtros.status || 'all'}
              onValueChange={(value) => onFiltroChange({ status: value === 'all' ? null : value })}
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

          {/* Filtro Data Início */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filtros.dataInicio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filtros.dataInicio ? (
                    format(new Date(filtros.dataInicio), "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecionar data início</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filtros.dataInicio ? new Date(filtros.dataInicio) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      onFiltroChange({ dataInicio: format(date, 'yyyy-MM-dd') });
                    } else {
                      onFiltroChange({ dataInicio: null });
                    }
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro Data Fim */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filtros.dataFim && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filtros.dataFim ? (
                    format(new Date(filtros.dataFim), "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecionar data fim</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filtros.dataFim ? new Date(filtros.dataFim) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      onFiltroChange({ dataFim: format(date, 'yyyy-MM-dd') });
                    } else {
                      onFiltroChange({ dataFim: null });
                    }
                  }}
                  disabled={(date) => 
                    filtros.dataInicio ? date < new Date(filtros.dataInicio) : false
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={onLimparFiltros}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
