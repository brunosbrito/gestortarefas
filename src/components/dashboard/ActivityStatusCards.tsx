
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, PlayCircle, CheckCircle, PauseCircle } from 'lucide-react';

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
      color: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300',
      iconColor: 'text-purple-500 dark:text-purple-400'
    },
    {
      title: 'Em Execução',
      value: activitiesByStatus.emExecucao,
      icon: PlayCircle,
      color: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300',
      iconColor: 'text-green-500 dark:text-green-400'
    },
    {
      title: 'Concluídas',
      value: activitiesByStatus.concluidas,
      icon: CheckCircle,
      color: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300',
      iconColor: 'text-blue-500 dark:text-blue-400'
    },
    {
      title: 'Paralizadas',
      value: activitiesByStatus.paralizadas,
      icon: PauseCircle,
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300',
      iconColor: 'text-yellow-500 dark:text-yellow-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusCards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className={`${card.color} border`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  <h3 className="font-medium">{card.title}</h3>
                </div>
                <span className="text-2xl font-bold">{card.value}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
