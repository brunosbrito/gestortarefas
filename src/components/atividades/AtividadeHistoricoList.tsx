import { HistoricoAtividade } from '@/interfaces/HistoricoAtividade';
import { getActivityHistoryById } from '@/services/ActivityHistoryService';
import { format } from 'date-fns';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AtividadeHistoricoListProps {
  activityId: number;
}

export const AtividadeHistoricoList = ({
  activityId,
}: AtividadeHistoricoListProps) => {
  const [historico, setHistorico] = useState<HistoricoAtividade[]>([]);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await getActivityHistoryById(activityId);
        setHistorico(response); // Armazena o histórico no estado
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };

    fetchHistorico();
  }, [activityId]);

  return (
    <div className="space-y-3">
      {historico.map((item) => (
        <div
          key={item.id}
          className="flex items-start space-x-3 bg-white p-3 rounded-md shadow-sm"
        >
          <User className="w-5 h-5 text-construction-600 mt-1" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-construction-800">
                {item.changedBy.username}
              </span>
              <span className="text-sm text-construction-500">
                {format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
            <p className="text-construction-700 mt-1">
              {(() => {
                switch (item.description) {
                  case 'Planejadas':
                    return 'Atividade Criada';
                  case 'Em execução':
                    return 'Atividade Iniciada';
                  case 'Concluídas':
                    return 'Atividade Concluída';
                  default:
                    return item.description;
                }
              })()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
