import { Card, CardContent } from '@/components/ui/card';
import { Calendar, PlayCircle, CheckCircle, PauseCircle, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, hoverScale, tapScale } from '@/lib/animations';

interface ActivityStatusCardsProps {
  activitiesByStatus: {
    planejadas: number;
    emExecucao: number;
    concluidas: number;
    paralizadas: number;
  };
}

export const ActivityStatusCards = ({ activitiesByStatus }: ActivityStatusCardsProps) => {
  const statusCards = [
    {
      title: 'Planejadas',
      value: activitiesByStatus.planejadas,
      icon: Calendar,
      borderColor: 'border-l-purple-500',
      bgTint: 'bg-purple-50/50 dark:bg-purple-950/20',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Em Execução',
      value: activitiesByStatus.emExecucao,
      icon: PlayCircle,
      borderColor: 'border-l-green-500',
      bgTint: 'bg-green-50/50 dark:bg-green-950/20',
      textColor: 'text-green-700 dark:text-green-300',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Concluídas',
      value: activitiesByStatus.concluidas,
      icon: CheckCircle,
      borderColor: 'border-l-blue-500',
      bgTint: 'bg-blue-50/50 dark:bg-blue-950/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Paralizadas',
      value: activitiesByStatus.paralizadas,
      icon: PauseCircle,
      borderColor: 'border-l-yellow-500',
      bgTint: 'bg-yellow-50/50 dark:bg-yellow-950/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    }
  ];

  return (
    <Card className="border border-border/50 shadow-elevation-2 overflow-hidden">
      {/* Header com gradient */}
      <div className="bg-gradient-to-r from-purple-500/10 to-violet-600/10 border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <ListChecks className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Status das Atividades
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Distribuição por estado atual
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {statusCards.map((card, index) => {
            const Icon = card.icon;
            // Add border-r to all except last in row for visual separation
            const isLastInRow = {
              'md': index % 2 === 1,        // 2 cols on md
              'lg': index === statusCards.length - 1  // 4 cols on lg (last item)
            };

            return (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={hoverScale}
                whileTap={tapScale}
                className={cn(
                  "relative",
                  // Vertical separator for desktop
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
                      {/* Icon + Title */}
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          card.iconBg
                        )}>
                          <Icon className={cn("h-5 w-5", card.iconColor)} />
                        </div>
                        <h3 className={cn(
                          "font-semibold text-sm",
                          card.textColor
                        )}>
                          {card.title}
                        </h3>
                      </div>

                      {/* Value */}
                      <span className={cn(
                        "text-2xl font-bold tabular-nums",
                        card.textColor
                      )}>
                        {card.value}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Card>
  );
};
