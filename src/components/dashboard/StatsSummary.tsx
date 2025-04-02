
import { StatsCard } from './StatsCard';

interface StatItem {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface StatsSummaryProps {
  stats: StatItem[];
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
