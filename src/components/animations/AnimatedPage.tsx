import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeIn, getReducedMotionConfig } from '@/lib/animations';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper para páginas com animação de entrada/saída
 * Respeita preferências de movimento reduzido (prefers-reduced-motion)
 */
export const AnimatedPage = ({ children, className }: AnimatedPageProps) => {
  const reducedMotionConfig = getReducedMotionConfig();
  const hasReducedMotion = Object.keys(reducedMotionConfig).length > 0;

  if (hasReducedMotion) {
    // Se usuário preferir movimento reduzido, apenas retorna os children
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Wrapper para lista de items com animação stagger
 */
interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

export const AnimatedList = ({ children, className }: AnimatedListProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
