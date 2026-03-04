import { Card, CardContent } from '@/components/ui/card';
import { Calendar, PlayCircle, CheckCircle, PauseCircle, ListChecks, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, hoverScale, tapScale } from '@/lib/animations';
import { InfoTooltip } from '@/components/tooltips/InfoTooltip';

interface ActivityStatusCardsProps {
  activitiesByStatus: {
    planejadas: number;
    emExecucao: number;
    concluidas: number;
    paralizadas: number;
    atrasadas: number;
  };
  /** Quando true, omite o Card/header externo (para uso dentro de accordions) */
  compact?: boolean;
}

export const ActivityStatusCards = ({ activitiesByStatus, compact = false }: ActivityStatusCardsProps) => {
  const statusCards = [
    {
      title: 'Planejadas',
      value: activitiesByStatus.planejadas,
      icon: Calendar,
      borderColor: 'border-l-purple-500',
      bgTint: 'bg-purple-50/50 dark:bg-purple-950/20',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      tooltip: 'Atividades cadastradas que ainda não foram iniciadas. Aguardam início conforme o cronograma planejado.'
    },
    {
      title: 'Em Execução',
      value: activitiesByStatus.emExecucao,
      icon: PlayCircle,
      borderColor: 'border-l-green-500',
      bgTint: 'bg-green-50/50 dark:bg-green-950/20',
      textColor: 'text-green-700 dark:text-green-300',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      tooltip: 'Atividades atualmente em andamento pela equipe. Monitore regularmente para identificar desvios antes que se tornem atrasos.'
    },
    {
      title: 'Concluídas',
      value: activitiesByStatus.concluidas,
      icon: CheckCircle,
      borderColor: 'border-l-blue-500',
      bgTint: 'bg-blue-50/50 dark:bg-blue-950/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      tooltip: 'Atividades finalizadas e entregues dentro do período selecionado nos filtros do dashboard.'
    },
    {
      title: 'Paralizadas',
      value: activitiesByStatus.paralizadas,
      icon: PauseCircle,
      borderColor: 'border-l-yellow-500',
      bgTint: 'bg-yellow-50/50 dark:bg-yellow-950/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      tooltip: 'Atividades interrompidas por impedimentos externos (falta de material, aguardando aprovação, etc.). Requerem ação imediata para desbloqueio.'
    },
    {
      title: 'Atrasadas',
      value: activitiesByStatus.atrasadas,
      icon: AlertTriangle,
      borderColor: 'border-l-red-500',
      bgTint: 'bg-red-50/50 dark:bg-red-950/20',
      textColor: 'text-red-700 dark:text-red-300',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      tooltip: 'Atividades com início ou execução atrasada. Inclui atividades planejadas que já deveriam ter começado e atividades em andamento que ultrapassaram a data de término prevista.'
    }
  ];

  const grid = (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {statusCards.map((card, index) => {
        const Icon = card.icon;
        const isLastInRow = {
          'md': index % 2 === 1,
          'lg': index === statusCards.length - 1
        };

        return (
          <motion.div
            key={index}
            variants={staggerItem}
            whileHover={hoverScale}
            whileTap={tapScale}
            className={cn(
              "relative",
              !isLastInRow.lg && "lg:border-r lg:border-border/30",
              !isLastInRow.md && "md:border-r md:border-border/30 lg:border-r-0"
            )}
          >
            <Card
              className={cn(
                "border-l-4 border-y border-r",
                "shadow-elevation-2 cursor-pointer",
                card.borderColor,
                card.bgTint
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", card.iconBg)}>
                      <Icon className={cn("h-5 w-5", card.iconColor)} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <h3 className={cn("font-semibold text-sm", card.textColor)}>
                        {card.title}
                      </h3>
                      <InfoTooltip
                        variant="help"
                        side="top"
                        content={card.tooltip}
                        iconClassName="w-3 h-3"
                      />
                    </div>
                  </div>
                  <span className={cn("text-2xl font-bold tabular-nums", card.textColor)}>
                    {card.value}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );

  if (compact) {
    return grid;
  }

  return (
    <Card className="border border-border/50 shadow-elevation-2 overflow-hidden">
      {/* Header com gradient */}
      <div className="bg-gradient-to-r from-purple-500/10 to-violet-600/10 border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <ListChecks className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Status das Atividades
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribuição por estado atual
              </p>
            </div>
            <InfoTooltip
              variant="help"
              side="right"
              content={
                <div className="space-y-1">
                  <p className="font-semibold">Visão geral do status</p>
                  <p>Mostra a distribuição de todas as atividades do período selecionado por estado atual. Use para identificar rapidamente o volume de trabalho em cada fase.</p>
                </div>
              }
            />
          </div>
        </div>
      </div>
      <div className="p-6">{grid}</div>
    </Card>
  );
};
