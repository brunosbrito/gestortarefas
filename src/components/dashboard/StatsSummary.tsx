
import { StatsCard, StatsCardProps } from './StatsCard';

interface StatsSummaryProps {
  stats: StatsCardProps[];
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};
