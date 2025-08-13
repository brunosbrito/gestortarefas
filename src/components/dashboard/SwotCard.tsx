import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SwotItem } from '@/interfaces/SwotInterface';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

interface SwotCardProps {
  title: string;
  items: SwotItem[];
  color: string;
  icon: string;
}

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-red-500 bg-red-50 border-red-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-construction-600 bg-construction-50 border-construction-200';
  }
};

const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
    case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
    case 'stable': return <Minus className="w-3 h-3 text-construction-600" />;
    default: return null;
  }
};

export const SwotCard = ({ title, items, color, icon }: SwotCardProps) => {
  return (
    <Card className="h-full flex flex-col min-h-[600px]">
      <CardHeader className={`${color} text-white rounded-t-lg flex-shrink-0 p-4`}>
        <CardTitle className="flex items-center gap-3 text-lg font-bold">
          <span className="text-2xl">{icon}</span>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 pr-2">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-construction-500">
                <CheckCircle className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm text-center">Nenhum item identificado nesta categoria</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(item.severity)} transition-all hover:shadow-sm`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <h4 className="font-semibold text-sm text-construction-900 break-words leading-tight">
                        {item.title}
                      </h4>
                      {getTrendIcon(item.trend)}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <span className="text-xl font-bold text-construction-800">
                        {item.metric}
                      </span>
                      <span className="text-xs font-medium text-construction-600">
                        {item.metricLabel}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-construction-700 leading-relaxed mb-3 break-words">
                    {item.description}
                  </p>
                  
                  {item.recommendation && (
                    <div className="bg-construction-50 p-3 rounded-md border border-construction-100">
                      <div className="flex items-start gap-2">
                        <Zap className="w-3 h-3 text-construction-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-construction-700 font-medium leading-relaxed">
                          <span className="font-semibold">Recomendação:</span> {item.recommendation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};