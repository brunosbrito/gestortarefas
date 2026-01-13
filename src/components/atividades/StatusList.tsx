
import { Badge } from '@/components/ui/badge';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadeCard } from './AtividadeCard';
import { Droppable } from 'react-beautiful-dnd';

interface StatusListProps {
  status: string;
  atividades: AtividadeStatus[];
  droppableId: string;
  onMoveAtividade?: (atividadeId: number, novoStatus: string) => void;
  onDelete?: () => void;
}

export const StatusList = ({ 
  status, 
  atividades, 
  droppableId, 
  onMoveAtividade, 
  onDelete 
}: StatusListProps) => {
  const atividadesFiltradas = atividades.filter((a) => a.status === status);

  return (
    <div className="flex-none w-72">
      <div className="bg-card border border-border rounded-lg p-3 h-full shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base">{status}</h3>
          <Badge variant="outline" className="text-xs">{atividadesFiltradas.length}</Badge>
        </div>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2 overflow-y-auto max-h-[calc(100vh-180px)]"
              style={{ minHeight: '50px' }}
            >
              {atividadesFiltradas.map((atividade, index) => (
                <AtividadeCard
                  key={atividade.id}
                  atividade={atividade}
                  index={index}
                  onMoveAtividade={onMoveAtividade}
                  onDelete={onDelete}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};
