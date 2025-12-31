import { StatsCard, StatsCardProps } from './StatsCard';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/animations';
import { Card } from '@/components/ui/card';
import { LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsSummaryProps {
  stats: StatsCardProps[];
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
  return (
    <Card className="border border-border/50 shadow-elevation-2 overflow-hidden">
      {/* Header com gradient */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-600/10 border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <LayoutDashboard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Visão Geral
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Totais gerais do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {stats.map((stat, index) => {
            // Add border-r to all except last in row for visual separation
            const isLastInRow = {
              'sm': index % 2 === 1,        // 2 cols on sm
              'lg': index === stats.length - 1  // 3 cols on lg (last item)
            };

            return (
              <div
                key={stat.title}
                className={cn(
                  "relative",
                  // Vertical separator for desktop
                  !isLastInRow.lg && "lg:border-r lg:border-border/30",
                  !isLastInRow.sm && "sm:border-r sm:border-border/30 lg:border-r-0"
                )}
              >
                <StatsCard {...stat} />
              </div>
            );
          })}
        </motion.div>
      </div>
    </Card>
  );
};
