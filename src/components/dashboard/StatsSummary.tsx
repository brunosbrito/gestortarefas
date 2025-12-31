import { StatsCard, StatsCardProps } from './StatsCard';
import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/animations';

interface StatsSummaryProps {
  stats: StatsCardProps[];
}

export const StatsSummary = ({ stats }: StatsSummaryProps) => {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </motion.div>
  );
};
