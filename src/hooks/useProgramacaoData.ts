
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllActivities } from '@/services/ActivityService';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';

export const useProgramacaoData = () => {
  const [atividadesProgramadas, setAtividadesProgramadas] = useState<AtividadeStatus[]>([]);

  const { 
    data: todasAtividades, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['all-activities'],
    queryFn: getAllActivities,
  });

  useEffect(() => {
    if (todasAtividades) {
      // Filtrar apenas atividades com status "Planejadas"
      const programadas = todasAtividades.filter((atividade: AtividadeStatus) => 
        atividade.status === 'Planejadas'
      );
      setAtividadesProgramadas(programadas);
    }
  }, [todasAtividades]);

  return {
    atividadesProgramadas,
    isLoading,
    error,
    refetch,
    totalProgramadas: atividadesProgramadas.length
  };
};
