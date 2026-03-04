
import { CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { format, parseISO } from 'date-fns';
import {
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Clock,
  Timer,
  User,
  Users,
  TrendingUp,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';

interface AtividadeMetadataProps {
  atividade: AtividadeStatus;
  elapsedTime: number;
  calculateProgress: () => number;
  formatTime: (time: number) => string;
  formatEstimatedTime: (time: string) => string;
  calculatePercentage: (elapsedTime: number, estimatedTime: string) => number;
}

// Verifica se o início da atividade está atrasado
// IMPORTANTE: Só considera atrasado se a data prevista for ANTES de hoje (não inclui hoje)
const isStartDelayed = (atividade: AtividadeStatus): boolean => {
  if (!atividade.plannedStartDate) return false;
  const isPlanned = atividade.status === 'Planejadas' ||
    atividade.status === 'Planejado' ||
    atividade.status === 'Planejada';
  if (!isPlanned) return false;

  // Normaliza a data planejada para meia-noite local
  const planned = new Date(atividade.plannedStartDate);
  planned.setHours(0, 0, 0, 0);

  // Normaliza hoje para meia-noite local
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Só está atrasado se a data planejada for ESTRITAMENTE ANTES de hoje
  return planned.getTime() < today.getTime();
};

export const AtividadeMetadata = ({
  atividade,
  elapsedTime,
  calculateProgress,
  formatTime,
  formatEstimatedTime,
  calculatePercentage,
}: AtividadeMetadataProps) => {
  const startDelayed = isStartDelayed(atividade);

  return (
    <CardContent className="px-3 py-2 space-y-1.5">
      <div className="space-y-1 text-xs">
        {/* Projeto e OS na mesma linha */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Building2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{atividade.project.name}</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FileText className="w-3 h-3 shrink-0" />
          <span>OS N°: {atividade.serviceOrder.serviceOrderNumber}</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>Data Criação: {format(parseISO(atividade.createdAt), 'dd/MM/yyyy')}</span>
        </div>

        {/* Progresso */}
        {typeof atividade.quantity === 'number' && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-primary shrink-0" />
              <span className="font-medium text-primary">
                Progresso: {calculateProgress().toFixed(0)}% ({atividade.completedQuantity || 0} de {atividade.quantity})
              </span>
            </div>
            <Progress
              value={calculateProgress()}
              className="h-1.5"
            />
          </div>
        )}

        {/* Início atrasado */}
        {startDelayed && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <span className="text-red-700 dark:text-red-300 text-xs font-semibold">⚠️ Início Atrasado</span>
              <span className="text-red-600 dark:text-red-400 text-xs ml-1">
                — previsto para {format(parseISO(atividade.plannedStartDate!), 'dd/MM/yyyy')}
              </span>
            </div>
          </div>
        )}

        {/* Data início prevista (quando definida e não atrasada) */}
        {atividade.plannedStartDate && !startDelayed && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">
              Início Previsto: {format(parseISO(atividade.plannedStartDate), 'dd/MM/yyyy')}
            </span>
          </div>
        )}

        {/* Status específico com data */}
        {atividade.status === 'Paralizadas' && atividade.pauseDate && (
          <div className="flex items-center gap-1.5 px-1.5 py-1 bg-warning/10 border border-warning/20 rounded">
            <AlertCircle className="w-3 h-3 text-warning shrink-0" />
            <span className="text-warning">
              Data Paralisação: {format(parseISO(atividade.pauseDate), 'dd/MM/yyyy')}
            </span>
          </div>
        )}

        {atividade.status === 'Em execução' && atividade.startDate && (
          <div className="flex items-center gap-1.5 px-1.5 py-1 bg-success/10 border border-success/20 rounded">
            <PlayCircle className="w-3 h-3 text-success shrink-0" />
            <span className="text-success">
              Data Início: {format(parseISO(atividade.startDate), 'dd/MM/yyyy')}
            </span>
          </div>
        )}

        {atividade.status === 'Concluídas' && atividade.endDate && (
          <div className="flex items-center gap-1.5 px-1.5 py-1 bg-success/10 border border-success/20 rounded">
            <CheckCircle className="w-3 h-3 text-success shrink-0" />
            <span className="text-success">
              Data Conclusão: {format(parseISO(atividade.endDate), 'dd/MM/yyyy')}
            </span>
          </div>
        )}

        {/* Tempo */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary shrink-0" />
            <span className="text-primary">
              Tempo Previsto: {formatEstimatedTime(atividade.estimatedTime)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Timer className="w-3 h-3 text-secondary shrink-0" />
            <span className="text-secondary">
              {formatTime(elapsedTime)}
            </span>
            <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
              calculatePercentage(elapsedTime, atividade.estimatedTime) > 100
                ? 'bg-destructive/10 text-destructive'
                : 'bg-success/10 text-success'
            }`}>
              {calculatePercentage(elapsedTime, atividade.estimatedTime)}%
            </span>
          </div>
        </div>

        {/* Criador */}
        <div className="flex items-center gap-1.5 text-muted-foreground pt-1">
          <User className="w-3 h-3 shrink-0" />
          <span>Criado por: {atividade.createdBy.username}</span>
        </div>
      </div>
    </CardContent>
  );
};
