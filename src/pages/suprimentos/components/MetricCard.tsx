import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
  format?: "currency" | "percentage" | "number";
}

export const MetricCard = ({
  title,
  value,
  trend = "neutral",
  trendValue,
  icon,
  className,
  format = "number"
}: MetricCardProps) => {
  const formatValue = (val: string | number) => {
    if (format === "currency") {
      return typeof val === "number" ? `R$ ${val.toLocaleString('pt-BR')}` : val;
    }
    if (format === "percentage") {
      return `${val}%`;
    }
    return val;
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <Card className={cn(
      "bg-gradient-card hover:shadow-card-hover transition-all duration-300 border-0",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {formatValue(value)}
            </p>
            {trendValue && (
              <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
                <TrendIcon className="h-4 w-4" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-primary/10 rounded-lg">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
