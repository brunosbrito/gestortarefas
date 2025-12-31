
import { StatsCard, StatsCardProps } from './StatsCard';

interface StatsSummaryProps {
  stats: StatsCardProps[];
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};
