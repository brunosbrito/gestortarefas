
import { Badge } from '@/components/ui/badge';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadeCard } from './AtividadeCard';
import { Droppable } from 'react-beautiful-dnd';
import { cn } from '@/lib/utils';

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
  const isAtrasadas = status === 'Atrasadas';

  return (
    <div className="flex-none w-64 min-w-[256px]">
      <div className={cn(
        "bg-card border rounded-lg p-3 shadow-sm",
        isAtrasadas ? "border-red-500/50 bg-red-500/5" : "border-border"
      )}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn(
            "font-semibold text-base",
            isAtrasadas && "text-red-500"
          )}>{status}</h3>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              isAtrasadas && "border-red-500 text-red-500"
            )}
          >
            {atividadesFiltradas.length}
          </Badge>
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
