import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { TarefaMacro } from '@/interfaces/TarefaMacroInterface';
import { Processo } from '@/interfaces/ProcessoInterface';
import TarefaMacroService from '@/services/TarefaMacroService';
import ProcessService from '@/services/ProcessService';
import { Filter } from 'lucide-react';
import { DashboardFilters } from '@/interfaces/DashboardFilters';

interface TaskProcessFilterProps {
  onFilterChange: (filters: DashboardFilters) => void;
  currentFilters: DashboardFilters;
}

export const TaskProcessFilter = ({ onFilterChange, currentFilters }: TaskProcessFilterProps) => {
  const [macroTasks, setMacroTasks] = useState<TarefaMacro[]>([]);
  const [processes, setProcesses] = useState<Processo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [macroTaskResponse, processResponse] = await Promise.all([
          TarefaMacroService.getAll(),
          ProcessService.getAll()
        ]);

        setMacroTasks(macroTaskResponse.data);
        setProcesses(processResponse.data);
      } catch (error) {
        console.error("Erro ao buscar dados para filtros:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMacroTaskChange = (value: string) => {
    const macroTaskId = value === 'todos' ? null : parseInt(value);
    onFilterChange({ ...currentFilters, macroTaskId });
  };

  const handleProcessChange = (value: string) => {
    const processId = value === 'todos' ? null : parseInt(value);
    onFilterChange({ ...currentFilters, processId });
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <Filter className="h-5 w-5 text-[#FF7F0E]" />
          <h3 className="font-medium">Filtrar por:</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div>
            <label htmlFor="macroTask" className="block text-sm mb-1">Tarefa Macro</label>
            <Select 
              value={currentFilters.macroTaskId?.toString() || 'todos'} 
              onValueChange={handleMacroTaskChange}
              disabled={isLoading}
            >
              <SelectTrigger id="macroTask" className="w-full">
                <SelectValue placeholder="Todas Tarefas Macro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Tarefas Macro</SelectItem>
                {macroTasks.map(task => (
                  <SelectItem key={task.id} value={task.id.toString()}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="process" className="block text-sm mb-1">Processo</label>
            <Select 
              value={currentFilters.processId?.toString() || 'todos'} 
              onValueChange={handleProcessChange}
              disabled={isLoading}
            >
              <SelectTrigger id="process" className="w-full">
                <SelectValue placeholder="Todos Processos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Processos</SelectItem>
                {processes.map(process => (
                  <SelectItem key={process.id} value={process.id.toString()}>
                    {process.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
};
