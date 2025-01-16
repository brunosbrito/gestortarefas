import { Badge } from '@/components/ui/badge';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadeCard } from './AtividadeCard';
import { Droppable } from 'react-beautiful-dnd';

interface StatusListProps {
  status: string;
  atividades: AtividadeStatus[];
  droppableId: string;
}

export const StatusList = ({ status, atividades, droppableId }: StatusListProps) => {
  const atividadesFiltradas = atividades.filter((a) => a.status === status);

  return (
    <div className="flex-none w-80">
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{status}</h3>
          <Badge variant="outline">{atividadesFiltradas.length}</Badge>
        </div>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-3"
            >
              {atividadesFiltradas.map((atividade, index) => (
                <AtividadeCard 
                  key={atividade.id} 
                  atividade={atividade} 
                  index={index}
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