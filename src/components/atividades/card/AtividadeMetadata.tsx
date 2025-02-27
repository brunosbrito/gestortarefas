
import { CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { format } from 'date-fns';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Clock1,
  Hourglass,
  User,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AtividadeMetadataProps {
  atividade: AtividadeStatus;
  onProgressClick: () => void;
  elapsedTime: number;
  calculateProgress: () => number;
  formatTime: (time: number) => string;
  formatEstimatedTime: (time: string) => string;
  calculatePercentage: (elapsedTime: number, estimatedTime: string) => number;
}

export const AtividadeMetadata = ({
  atividade,
  onProgressClick,
  elapsedTime,
  calculateProgress,
  formatTime,
  formatEstimatedTime,
  calculatePercentage,
}: AtividadeMetadataProps) => {
  return (
    <CardContent className="p-4 pt-0 text-sm text-gray-500">
      <div className="flex items-center mb-2">
        <Building2 className="w-4 h-4 mr-2" />
        {atividade.project?.name}
      </div>
      <div className="flex items-center mb-2">
        <ClipboardList className="w-4 h-4 mr-2" />
        OS Nº: {atividade.serviceOrder.serviceOrderNumber}
      </div>
      <div className="flex items-center mb-2">
        <Calendar className="w-4 h-4 mr-2" />
        Data Criação: {format(new Date(atividade.createdAt), 'dd/MM/yyyy')}
      </div>

      {typeof atividade.quantity === 'number' && (
        <div className="space-y-2 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-[#FF7F0E]" />
              <span>
                Progresso: {Math.round(calculateProgress())}% (
                {atividade.completedQuantity || 0} de {atividade.quantity})
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onProgressClick}>
              <CheckCircle2 size={16} />
            </Button>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
      )}

      {atividade.status !== 'Planejadas' && (
        <div className="flex items-center mb-2">
          <Clock className="w-4 h-4 mr-2" />
          {(() => {
            switch (atividade.status) {
              case 'Em execução':
                return `Data início (${format(
                  new Date(atividade.startDate),
                  'dd/MM/yyyy'
                )})`;
              case 'Paralizadas':
                return `Data Paralisação: ${format(
                  new Date(atividade.pauseDate),
                  'dd/MM/yyyy'
                )}`;
              default:
                return `Data Conclusão: ${format(
                  new Date(atividade.endDate),
                  'dd/MM/yyyy'
                )}`;
            }
          })()}
        </div>
      )}

      <div className="flex items-center mb-2">
        <Clock1 className="w-4 h-4 mr-2" />
        Tempo Previsto: {formatEstimatedTime(atividade.estimatedTime)}
      </div>

      {atividade.status === 'Planejadas' ? null : (
        <div className="flex items-center mb-2">
          <Hourglass className="w-4 h-4 mr-2" />
          Tempo Atividade: {formatTime(elapsedTime)}
          {' | '}
          <span
            style={{
              marginLeft: '5px',
              color:
                calculatePercentage(elapsedTime, atividade.estimatedTime) > 100
                  ? 'red'
                  : 'green',
            }}
          >
            {calculatePercentage(elapsedTime, atividade.estimatedTime)}%
          </span>
        </div>
      )}

      <div className="flex items-center mb-2">
        <Users className="w-4 h-4 mr-2" />
        Equipe: {atividade.collaborators?.map((c) => c.name).join(', ')}
      </div>

      <div className="flex items-center mb-2">
        <User className="w-4 h-4 mr-2" /> Criado por: {atividade.createdBy?.username}
      </div>
    </CardContent>
  );
};
