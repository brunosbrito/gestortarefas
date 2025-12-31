import { Card, CardContent } from '@/components/ui/card';
import { Calendar, PlayCircle, CheckCircle, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusCards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card
            key={index}
            className={cn(
              "border-l-4 border-y border-r",
              "transition-all duration-200",
              "hover:scale-105 hover:shadow-elevation-3",
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
        );
      })}
    </div>
  );
};
