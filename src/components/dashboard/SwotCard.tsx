import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SwotItem } from '@/interfaces/SwotInterface';

interface SwotCardProps {
  title: string;
  items: SwotItem[];
  color: string;
  icon: string;
}

export const SwotCard = ({ title, items, color, icon }: SwotCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader className={`${color} text-white rounded-t-lg`}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="border-l-4 border-construction-200 pl-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm text-construction-900">{item.title}</h4>
              <span className="text-lg font-bold text-construction-700">
                {item.metric}{item.metricLabel}
              </span>
            </div>
            <p className="text-xs text-construction-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};