import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface InlineFeedbackProps {
  /**
   * Tipo de feedback
   */
  type: FeedbackType;
  /**
   * Mensagem a ser exibida
   */
  message: string;
  /**
   * Se o feedback está visível
   */
  show: boolean;
  /**
   * Classe CSS adicional
   */
  className?: string;
  /**
   * Callback quando o feedback desaparecer
   */
  onDismiss?: () => void;
}

/**
 * Componente de feedback inline com animação
 *
 * Útil para mostrar feedback próximo ao elemento que disparou a ação
 *
 * @example
 * ```tsx
 * const [showFeedback, setShowFeedback] = useState(false);
 *
 * const handleSave = async () => {
 *   await saveData();
 *   setShowFeedback(true);
 *   setTimeout(() => setShowFeedback(false), 3000);
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleSave}>Salvar</Button>
 *     <InlineFeedback
 *       type="success"
 *       message="Salvo com sucesso!"
 *       show={showFeedback}
 *     />
 *   </>
 * );
 * ```
 */
export const InlineFeedback = ({ type, message, show, className, onDismiss }: InlineFeedbackProps) => {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-600 dark:text-green-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
    },
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <AnimatePresence onExitComplete={onDismiss}>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border',
            colorScheme.bg,
            colorScheme.border,
            colorScheme.text,
            'shadow-sm',
            className
          )}
        >
          <Icon className={cn('h-4 w-4 flex-shrink-0', colorScheme.icon)} />
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook para gerenciar feedback inline temporário
 *
 * @example
 * ```tsx
 * const { show, showFeedback, hideFeedback } = useInlineFeedback();
 *
 * const handleSave = async () => {
 *   await saveData();
 *   showFeedback(3000); // Mostra por 3 segundos
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleSave}>Salvar</Button>
 *     <InlineFeedback
 *       type="success"
 *       message="Salvo!"
 *       show={show}
 *     />
 *   </>
 * );
 * ```
 */
export const useInlineFeedback = () => {
  const [show, setShow] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showFeedback = React.useCallback((duration: number = 3000) => {
    setShow(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, duration);
  }, []);

  const hideFeedback = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { show, showFeedback, hideFeedback };
};
