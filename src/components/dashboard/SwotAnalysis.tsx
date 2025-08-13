import { RefreshCw, TrendingUp, AlertTriangle, Target, Shield } from 'lucide-react';
import { SwotCard } from './SwotCard';
import { LoadingSpinner } from './LoadingSpinner';
import { useSwotAnalysis } from '@/hooks/useSwotAnalysis';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const SwotAnalysis = () => {
  const { swotData, isLoading, refreshSwotData } = useSwotAnalysis();

  if (isLoading || !swotData) {
    return <LoadingSpinner />;
  }

  const swotConfig = [
    {
      title: 'Forças',
      items: swotData.strengths,
      color: 'bg-emerald-600',
      icon: '💪'
    },
    {
      title: 'Fraquezas',
      items: swotData.weaknesses,
      color: 'bg-red-600',
      icon: '⚠️'
    },
    {
      title: 'Oportunidades',
      items: swotData.opportunities,
      color: 'bg-blue-600',
      icon: '🎯'
    },
    {
      title: 'Ameaças',
      items: swotData.threats,
      color: 'bg-orange-600',
      icon: '🛡️'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-construction-900">Análise SWOT</h3>
          <p className="text-sm text-construction-600">
            Última atualização: {format(swotData.lastUpdated, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshSwotData}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {swotConfig.map((config, index) => (
          <SwotCard
            key={index}
            title={config.title}
            items={config.items}
            color={config.color}
            icon={config.icon}
          />
        ))}
      </div>
    </div>
  );
};