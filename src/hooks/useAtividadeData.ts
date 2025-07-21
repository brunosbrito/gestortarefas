
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllActivities } from '@/services/ActivityService';
import TarefaMacroService from '@/services/TarefaMacroService';
import ProcessService from '@/services/ProcessService';
import ColaboradorService from '@/services/ColaboradorService';
import ProjectService from '@/services/ObrasService';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';

export interface AtividadeFiltros {
  tarefaMacroId: string | null;
  processoId: string | null;
  colaboradorId: string | null;
  obraId: string | null;
  status: string | null;
  dataInicio: string | null;
  dataFim: string | null;
}

export const useAtividadeData = () => {
  const [filtros, setFiltros] = useState<AtividadeFiltros>({
    tarefaMacroId: null,
    processoId: null,
    colaboradorId: null,
    obraId: null,
    status: null,
    dataInicio: null,
    dataFim: null
  });

  const [atividadesFiltradas, setAtividadesFiltradas] = useState<AtividadeStatus[]>([]);

  const { 
    data: todasAtividades, 
    isLoading: isLoadingAtividades, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['all-activities'],
    queryFn: getAllActivities,
  });

  const { data: tarefasMacro, isLoading: isLoadingTarefas } = useQuery({
    queryKey: ['tarefas-macro'],
    queryFn: () => TarefaMacroService.getAll().then(res => res.data),
  });

  const { data: processos, isLoading: isLoadingProcessos } = useQuery({
    queryKey: ['processos'],
    queryFn: () => ProcessService.getAll().then(res => res.data),
  });

  const { data: colaboradores, isLoading: isLoadingColaboradores } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => ColaboradorService.getAll(),
  });

  const { data: obras, isLoading: isLoadingObras } = useQuery({
    queryKey: ['obras'],
    queryFn: () => ProjectService.getAllObras(),
  });

  useEffect(() => {
    if (todasAtividades) {
      let atividadesFiltradas = [...todasAtividades];

      // Filtro por tarefa macro
      if (filtros.tarefaMacroId) {
        atividadesFiltradas = atividadesFiltradas.filter((atividade: AtividadeStatus) => {
          const macroTaskId = typeof atividade.macroTask === 'object' 
            ? atividade.macroTask?.id?.toString() 
            : atividade.macroTask;
          return macroTaskId === filtros.tarefaMacroId;
        });
      }

      // Filtro por processo
      if (filtros.processoId) {
        atividadesFiltradas = atividadesFiltradas.filter((atividade: AtividadeStatus) => {
          const processId = typeof atividade.process === 'object' 
            ? atividade.process?.id?.toString() 
            : atividade.process;
          return processId === filtros.processoId;
        });
      }

      // Filtro por colaborador
      if (filtros.colaboradorId) {
        atividadesFiltradas = atividadesFiltradas.filter((atividade: AtividadeStatus) => {
          return atividade.collaborators?.some(colaborador => 
            colaborador.id?.toString() === filtros.colaboradorId
          );
        });
      }

      // Filtro por obra
      if (filtros.obraId) {
        atividadesFiltradas = atividadesFiltradas.filter((atividade: AtividadeStatus) => {
          return atividade.project?.id?.toString() === filtros.obraId;
        });
      }

      // Filtro por status
      if (filtros.status && filtros.status !== 'todos') {
        atividadesFiltradas = atividadesFiltradas.filter((atividade: AtividadeStatus) => 
          atividade.status === filtros.status
        );
      }

      // Filtro por data
      if (filtros.dataInicio || filtros.dataFim) {
        atividadesFiltradas = atividadesFiltradas.filter((atividade: AtividadeStatus) => {
          const dataAtividade = atividade.startDate 
            ? new Date(atividade.startDate)
            : new Date(atividade.createdAt);
          
          const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
          const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;

          if (dataInicio && dataAtividade < dataInicio) return false;
          if (dataFim && dataAtividade > dataFim) return false;
          return true;
        });
      }

      setAtividadesFiltradas(atividadesFiltradas);
    }
  }, [todasAtividades, filtros]);

  const handleFiltroChange = (novosFiltros: Partial<AtividadeFiltros>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  const limparFiltros = () => {
    setFiltros({
      tarefaMacroId: null,
      processoId: null,
      colaboradorId: null,
      obraId: null,
      status: null,
      dataInicio: null,
      dataFim: null
    });
  };

  return {
    atividadesFiltradas,
    filtros,
    isLoadingAtividades,
    isLoadingTarefas,
    isLoadingProcessos,
    isLoadingColaboradores,
    isLoadingObras,
    error,
    refetch,
    tarefasMacro,
    processos,
    colaboradores,
    obras,
    totalAtividades: atividadesFiltradas.length,
    handleFiltroChange,
    limparFiltros
  };
};
