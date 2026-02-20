
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
const isStartDelayed = (atividade: AtividadeStatus): boolean => {
  if (!atividade.plannedStartDate) return false;
  const isPlanned = atividade.status === 'Planejadas' ||
    atividade.status === 'Planejado' ||
    atividade.status === 'Planejada';
  if (!isPlanned) return false;
  const planned = new Date(atividade.plannedStartDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return planned < today;
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
    <CardContent className="p-4 pt-2 space-y-3">
      <div className="space-y-2 text-sm">
        {/* Projeto e OS */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span className="font-medium">{atividade.project.name}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>OS N°: {atividade.serviceOrder.serviceOrderNumber}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Data Criação: {format(parseISO(atividade.createdAt), 'dd/MM/yyyy')}</span>
        </div>

        {/* Progresso */}
        {typeof atividade.quantity === 'number' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">
                Progresso: {calculateProgress().toFixed(0)}% ({atividade.completedQuantity || 0} de {atividade.quantity})
              </span>
            </div>
            <Progress 
              value={calculateProgress()} 
              className="h-2"
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
          <div className="flex items-center gap-2 p-2 bg-warning/10 border border-warning/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-warning text-xs">
              Data Paralisação: {format(parseISO(atividade.pauseDate), 'dd/MM/yyyy')}
            </span>
          </div>
        )}

        {atividade.status === 'Em execução' && atividade.startDate && (
          <div className="flex items-center gap-2 p-2 bg-success/10 border border-success/20 rounded-md">
            <PlayCircle className="w-4 h-4 text-success" />
            <span className="text-success text-xs">
              Data Início: {format(parseISO(atividade.startDate), 'dd/MM/yyyy')}
            </span>
          </div>
        )}

        {atividade.status === 'Concluídas' && atividade.endDate && (
          <div className="flex items-center gap-2 p-2 bg-success/10 border border-success/20 rounded-md">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-success text-xs">
              Data Conclusão: {format(parseISO(atividade.endDate), 'dd/MM/yyyy')}
            </span>
          </div>
        )}

        {/* Tempo */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-primary text-xs">
              Tempo Previsto: {formatEstimatedTime(atividade.estimatedTime)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-secondary" />
            <div className="flex items-center gap-1">
              <span className="text-secondary text-xs">
                {formatTime(elapsedTime)}
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                calculatePercentage(elapsedTime, atividade.estimatedTime) > 100 
                  ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                  : 'bg-success/10 text-success border border-success/20'
              }`}>
                {calculatePercentage(elapsedTime, atividade.estimatedTime)}%
              </span>
            </div>
          </div>
        </div>

        {/* Equipe e Criador */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-accent text-xs font-medium">
              Equipe: {atividade.collaborators.map((c) => c.name).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">
              Criado por: {atividade.createdBy.username}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  );
};
