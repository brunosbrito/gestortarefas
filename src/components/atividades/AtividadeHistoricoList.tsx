import { HistoricoAtividade } from '@/interfaces/HistoricoAtividade';
import { format } from 'date-fns';

interface AtividadeHistoricoListProps {
  historico: HistoricoAtividade[];
}

export const AtividadeHistoricoList = ({ historico }: AtividadeHistoricoListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Histórico</h3>
      <div className="space-y-3">
        {historico.map((item, index) => (
          <div key={index} className="flex items-start space-x-3 text-sm">
            <span className="text-gray-600 min-w-[100px]">
              {format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm')}
            </span>
            <div className="flex-1">
              <span className="font-medium text-[#003366]">{item.changedBy.username}</span>
              <span className="mx-2">{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};