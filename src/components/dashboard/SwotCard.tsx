import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SwotItem } from '@/interfaces/SwotInterface';

interface SwotCardProps {
  title: string;
  items: SwotItem[];
  color: string;
  icon: string;
}

export const SwotCard = ({ title, items, color, icon }: SwotCardProps) => {
  return (
    <Card className="h-full flex flex-col min-h-[400px]">
      <CardHeader className={`${color} text-white rounded-t-lg flex-shrink-0`}>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <span className="text-xl sm:text-2xl">{icon}</span>
          <span className="truncate">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 sm:space-y-3 pr-2">
            {items.map((item, index) => (
              <div key={index} className="border-l-4 border-construction-200 pl-2 sm:pl-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1">
                  <h4 className="font-semibold text-xs sm:text-sm text-construction-900 break-words">
                    {item.title}
                  </h4>
                  <span className="text-base sm:text-lg font-bold text-construction-700 flex-shrink-0">
                    {item.metric}{item.metricLabel}
                  </span>
                </div>
                <p className="text-xs text-construction-600 leading-relaxed break-words">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};