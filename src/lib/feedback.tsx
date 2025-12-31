import { toast } from '@/components/ui/use-toast';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from './utils';

/**
 * Sistema unificado de feedback visual para ações do usuário
 *
 * Fornece notificações consistentes com ícones e animações
 */

interface FeedbackOptions {
  title?: string;
  description: string;
  duration?: number;
}

/**
 * Feedback de sucesso (verde)
 */
export const showSuccess = ({ title = 'Sucesso!', description, duration = 3000 }: FeedbackOptions) => {
  toast({
    title: (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span>{title}</span>
      </div>
    ),
    description,
    duration,
    className: cn(
      'border-l-4 border-l-green-600 dark:border-l-green-400',
      'bg-green-50 dark:bg-green-950/20',
      'text-green-900 dark:text-green-100'
    ),
  });
};

/**
 * Feedback de erro (vermelho)
 */
export const showError = ({ title = 'Erro', description, duration = 4000 }: FeedbackOptions) => {
  toast({
    title: (
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <span>{title}</span>
      </div>
    ),
    description,
    duration,
    className: cn(
      'border-l-4 border-l-red-600 dark:border-l-red-400',
      'bg-red-50 dark:bg-red-950/20',
      'text-red-900 dark:text-red-100'
    ),
  });
};

/**
 * Feedback de aviso (amarelo/laranja)
 */
export const showWarning = ({ title = 'Atenção', description, duration = 4000 }: FeedbackOptions) => {
  toast({
    title: (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <span>{title}</span>
      </div>
    ),
    description,
    duration,
    className: cn(
      'border-l-4 border-l-yellow-600 dark:border-l-yellow-400',
      'bg-yellow-50 dark:bg-yellow-950/20',
      'text-yellow-900 dark:text-yellow-100'
    ),
  });
};

/**
 * Feedback informativo (azul)
 */
export const showInfo = ({ title = 'Informação', description, duration = 3000 }: FeedbackOptions) => {
  toast({
    title: (
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span>{title}</span>
      </div>
    ),
    description,
    duration,
    className: cn(
      'border-l-4 border-l-blue-600 dark:border-l-blue-400',
      'bg-blue-50 dark:bg-blue-950/20',
      'text-blue-900 dark:text-blue-100'
    ),
  });
};

/**
 * Feedback de loading (spinner animado)
 */
export const showLoading = ({ title = 'Carregando...', description }: Omit<FeedbackOptions, 'duration'>) => {
  return toast({
    title: (
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
        <span>{title}</span>
      </div>
    ),
    description,
    duration: Infinity, // Não desaparece automaticamente
    className: cn(
      'border-l-4 border-l-blue-600 dark:border-l-blue-400',
      'bg-blue-50 dark:bg-blue-950/20',
      'text-blue-900 dark:text-blue-100'
    ),
  });
};

/**
 * Feedback de salvamento com promise
 * Mostra loading durante a operação e depois success/error
 */
export const showSavePromise = async <T,>(
  promise: Promise<T>,
  messages: {
    loading?: string;
    success?: string;
    error?: string;
  } = {}
): Promise<T> => {
  const { dismiss } = showLoading({
    description: messages.loading || 'Salvando...',
  });

  try {
    const result = await promise;
    dismiss();
    showSuccess({
      description: messages.success || 'Salvo com sucesso!',
    });
    return result;
  } catch (error) {
    dismiss();
    showError({
      description: messages.error || 'Erro ao salvar. Tente novamente.',
    });
    throw error;
  }
};

/**
 * Feedback de exclusão com confirmação visual
 */
export const showDeleteSuccess = (itemName?: string) => {
  showSuccess({
    title: 'Excluído!',
    description: itemName ? `${itemName} foi excluído com sucesso.` : 'Item excluído com sucesso.',
  });
};

/**
 * Feedback de criação
 */
export const showCreateSuccess = (itemName?: string) => {
  showSuccess({
    title: 'Criado!',
    description: itemName ? `${itemName} foi criado com sucesso.` : 'Item criado com sucesso.',
  });
};

/**
 * Feedback de atualização
 */
export const showUpdateSuccess = (itemName?: string) => {
  showSuccess({
    title: 'Atualizado!',
    description: itemName ? `${itemName} foi atualizado com sucesso.` : 'Item atualizado com sucesso.',
  });
};

/**
 * Feedback de ação genérica
 */
export const showActionSuccess = (action: string) => {
  showSuccess({
    description: action,
  });
};

/**
 * Feedback de erro de rede
 */
export const showNetworkError = () => {
  showError({
    title: 'Erro de Conexão',
    description: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
  });
};

/**
 * Feedback de erro de validação
 */
export const showValidationError = (message?: string) => {
  showError({
    title: 'Erro de Validação',
    description: message || 'Por favor, verifique os campos e tente novamente.',
  });
};
