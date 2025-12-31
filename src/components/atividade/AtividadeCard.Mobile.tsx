import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Building2, Users, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calcularKPI,
  calcularProgresso,
  formatarKPI,
  formatarProgresso,
  formatarTempoTotal,
  getKPIColor,
  obterCodigoSequencial,
} from '@/utils/atividadeCalculos';

interface AtividadeCardMobileProps {
  atividade: any;
  globalIndex: number;
  onCardClick: (atividade: any) => void;
  formatTeam: (collaborators: any[]) => string;
}

const getStatusConfig = (status: string) => {
  const config = {
    'Planejadas': {
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-700 dark:text-purple-300',
      dotColor: 'bg-purple-500',
      borderColor: 'border-l-purple-500',
      label: 'Planejadas'
    },
    'Em execução': {
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-300',
      dotColor: 'bg-green-500',
      borderColor: 'border-l-green-500',
      label: 'Em Execução'
    },
    'Concluídas': {
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-300',
      dotColor: 'bg-blue-500',
      borderColor: 'border-l-blue-500',
      label: 'Concluídas'
    },
    'Paralizadas': {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      dotColor: 'bg-yellow-500',
      borderColor: 'border-l-yellow-500',
      label: 'Paralizadas'
    }
  };

  return config[status as keyof typeof config] || config['Planejadas'];
};

export const AtividadeCardMobile = ({
  atividade,
  globalIndex,
  onCardClick,
  formatTeam
}: AtividadeCardMobileProps) => {
  const kpi = calcularKPI(atividade);
  const progresso = calcularProgresso(atividade);
  const statusConfig = getStatusConfig(atividade.status);

  return (
    <Card
      onClick={() => onCardClick(atividade)}
      className={cn(
        "border-l-4 cursor-pointer",
        "transition-all duration-200",
        "hover:shadow-elevation-3 hover:scale-[1.02]",
        "active:scale-[0.98]",
        statusConfig.borderColor
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="font-mono text-xs px-2 py-0.5"
              >
                #{obterCodigoSequencial(globalIndex)}
              </Badge>
              <Badge
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-0.5",
                  statusConfig.bgColor,
                  statusConfig.textColor
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)} />
                <span className="text-xs font-semibold">{statusConfig.label}</span>
              </Badge>
            </div>
            <h3 className="font-semibold text-sm line-clamp-2 leading-snug">
              {atividade.description}
            </h3>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Tarefa Macro */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Tarefa Macro
          </div>
          <div className="text-sm font-medium line-clamp-1">
            {typeof atividade.macroTask === 'string'
              ? atividade.macroTask
              : atividade.macroTask?.name || '-'}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Progresso</span>
            <span className="font-bold tabular-nums">{formatarProgresso(progresso)}</span>
          </div>
          <Progress
            value={Math.min(progresso, 100)}
            className="h-2"
          />
        </div>

        {/* Grid 2x2 de informações */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          {/* Tempo */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Tempo</span>
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {formatarTempoTotal(atividade)}
            </div>
          </div>

          {/* KPI */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              KPI
            </div>
            <Badge
              variant="outline"
              className={cn("text-xs font-semibold tabular-nums w-fit", getKPIColor(kpi))}
            >
              {formatarKPI(kpi)}
            </Badge>
          </div>

          {/* Equipe */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>Equipe</span>
            </div>
            <div className="text-sm font-medium line-clamp-1">
              {formatTeam(atividade.collaborators)}
            </div>
          </div>

          {/* Obra */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span>Obra</span>
            </div>
            <div className="text-sm font-medium line-clamp-1">
              {atividade.project?.name || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
