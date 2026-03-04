
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TarefaMacro } from '@/interfaces/TarefaMacroInterface';
import { Processo } from '@/interfaces/ProcessoInterface';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import TarefaMacroService from '@/services/TarefaMacroService';
import ProcessService from '@/services/ProcessService';
import ColaboradorService from '@/services/ColaboradorService';
import { DashboardFilters } from '@/types/dashboard';
import { HelpTooltip } from '@/components/tooltips/HelpTooltip';
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent';

interface TaskProcessFilterProps {
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  currentFilters: DashboardFilters;
}

export const TaskProcessFilter = ({ onFilterChange, currentFilters }: TaskProcessFilterProps) => {
  const [macroTasks, setMacroTasks] = useState<TarefaMacro[]>([]);
  const [processes, setProcesses] = useState<Processo[]>([]);
  const [collaborators, setCollaborators] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [macroTaskResponse, processResponse, collaboratorsData] = await Promise.all([
          TarefaMacroService.getAll(),
          ProcessService.getAll(),
          ColaboradorService.getAllColaboradores()
        ]);

        setMacroTasks(macroTaskResponse.data);
        setProcesses(processResponse.data);
        setCollaborators(collaboratorsData);
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
    onFilterChange({ macroTaskId });
  };

  const handleProcessChange = (value: string) => {
    const processId = value === 'todos' ? null : parseInt(value);
    onFilterChange({ processId });
  };

  const handleCollaboratorChange = (value: string) => {
    const collaboratorId = value === 'todos' ? null : parseInt(value);
    onFilterChange({ collaboratorId });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="space-y-2">
            <label htmlFor="macroTask" className="flex items-center gap-1.5 text-sm font-medium">
              Tarefa Macro
              <HelpTooltip content={TOOLTIP_CONTENT.FILTER_MACRO_TASK} />
            </label>
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
          
          <div className="space-y-2">
            <label htmlFor="process" className="flex items-center gap-1.5 text-sm font-medium">
              Processo
              <HelpTooltip content={TOOLTIP_CONTENT.FILTER_PROCESS} />
            </label>
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

          <div className="space-y-2">
            <label htmlFor="collaborator" className="flex items-center gap-1.5 text-sm font-medium">
              Colaborador
              <HelpTooltip content={TOOLTIP_CONTENT.FILTER_COLLABORATOR} />
            </label>
            <Select 
              value={currentFilters.collaboratorId?.toString() || 'todos'} 
              onValueChange={handleCollaboratorChange}
              disabled={isLoading}
            >
              <SelectTrigger id="collaborator" className="w-full">
                <SelectValue placeholder="Todos Colaboradores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Colaboradores</SelectItem>
                {collaborators.map(collaborator => (
                  <SelectItem key={collaborator.id} value={collaborator.id.toString()}>
                    {collaborator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
    </div>
  );
};
