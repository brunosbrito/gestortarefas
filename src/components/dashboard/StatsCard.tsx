import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeInUp, hoverScale, tapScale } from "@/lib/animations";

export interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

export const StatsCard = ({ title, value, icon: Icon, color }: StatsCardProps) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={hoverScale}
      whileTap={tapScale}
    >
      <Card className={cn(
        "p-6 border border-border/50",
        "bg-gradient-to-br from-card to-card/50",
        "shadow-elevation-2",
        "cursor-pointer"
      )}>
        <div className="flex items-center gap-4">
          {/* Icon container com shadow e color */}
          <motion.div
            className={cn(
              "p-3 rounded-xl shadow-lg",
              color
            )}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <motion.h2
              className="text-3xl font-bold text-foreground tabular-nums"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {value}
            </motion.h2>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
