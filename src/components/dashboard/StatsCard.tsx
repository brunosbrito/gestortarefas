import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

export const StatsCard = ({ title, value, icon: Icon, color }: StatsCardProps) => {
  return (
    <Card className={cn(
      "p-6 border border-border/50",
      "bg-gradient-to-br from-card to-card/50",
      "hover:shadow-elevation-hover transition-all duration-300",
      "hover:scale-[1.02]"
    )}>
      <div className="flex items-center gap-4">
        {/* Icon container com shadow e color */}
        <div className={cn(
          "p-3 rounded-xl shadow-lg",
          "transition-transform duration-200 group-hover:scale-110",
          color
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <h2 className="text-3xl font-bold text-foreground tabular-nums">
            {value}
          </h2>
        </div>
      </div>
    </Card>
  );
};
