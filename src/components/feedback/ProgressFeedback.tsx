import * as React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export type ProgressStatus = 'loading' | 'success' | 'error';

interface ProgressFeedbackProps {
  /**
   * Progresso atual (0-100)
   */
  progress: number;
  /**
   * Status da operação
   */
  status: ProgressStatus;
  /**
   * Mensagem descritiva
   */
  message?: string;
  /**
   * Mensagem de sucesso
   */
  successMessage?: string;
  /**
   * Mensagem de erro
   */
  errorMessage?: string;
  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Componente de feedback de progresso com barra e status
 *
 * @example
 * ```tsx
 * const [progress, setProgress] = useState(0);
 * const [status, setStatus] = useState<ProgressStatus>('loading');
 *
 * const handleUpload = async (file: File) => {
 *   setStatus('loading');
 *   try {
 *     await uploadFile(file, (p) => setProgress(p));
 *     setStatus('success');
 *   } catch {
 *     setStatus('error');
 *   }
 * };
 *
 * return (
 *   <ProgressFeedback
 *     progress={progress}
 *     status={status}
 *     message="Enviando arquivo..."
 *     successMessage="Arquivo enviado!"
 *     errorMessage="Erro ao enviar arquivo"
 *   />
 * );
 * ```
 */
export const ProgressFeedback = ({
  progress,
  status,
  message,
  successMessage,
  errorMessage,
  className,
}: ProgressFeedbackProps) => {
  const statusConfig = {
    loading: {
      icon: Loader2,
      iconClass: 'text-blue-600 dark:text-blue-400 animate-spin',
      progressClass: 'bg-blue-600',
      message: message || 'Processando...',
    },
    success: {
      icon: CheckCircle2,
      iconClass: 'text-green-600 dark:text-green-400',
      progressClass: 'bg-green-600',
      message: successMessage || 'Concluído!',
    },
    error: {
      icon: XCircle,
      iconClass: 'text-red-600 dark:text-red-400',
      progressClass: 'bg-red-600',
      message: errorMessage || 'Erro ao processar',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-card border border-border/50 rounded-lg p-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className={cn('h-5 w-5', config.iconClass)} />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{config.message}</p>
          {status === 'loading' && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {progress}% concluído
            </p>
          )}
        </div>
      </div>

      <Progress
        value={status === 'success' ? 100 : progress}
        className={cn('h-2', status === 'error' && 'opacity-50')}
        indicatorClassName={config.progressClass}
      />
    </motion.div>
  );
};

/**
 * Hook para gerenciar progresso de operação assíncrona
 *
 * @example
 * ```tsx
 * const { progress, status, startProgress, completeProgress, failProgress } = useProgress();
 *
 * const handleUpload = async () => {
 *   startProgress();
 *   try {
 *     // Simular progresso
 *     for (let i = 0; i <= 100; i += 10) {
 *       await delay(200);
 *       setProgress(i);
 *     }
 *     completeProgress();
 *   } catch {
 *     failProgress();
 *   }
 * };
 * ```
 */
export const useProgress = () => {
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState<ProgressStatus>('loading');

  const startProgress = React.useCallback(() => {
    setProgress(0);
    setStatus('loading');
  }, []);

  const completeProgress = React.useCallback(() => {
    setProgress(100);
    setStatus('success');
  }, []);

  const failProgress = React.useCallback(() => {
    setStatus('error');
  }, []);

  const resetProgress = React.useCallback(() => {
    setProgress(0);
    setStatus('loading');
  }, []);

  return {
    progress,
    status,
    setProgress,
    setStatus,
    startProgress,
    completeProgress,
    failProgress,
    resetProgress,
  };
};
