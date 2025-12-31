/**
 * Sistema unificado de feedback visual
 *
 * Exporta todas as funções e componentes relacionados a feedback do usuário
 */

// Funções de feedback com toast
export {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  showSavePromise,
  showDeleteSuccess,
  showCreateSuccess,
  showUpdateSuccess,
  showActionSuccess,
  showNetworkError,
  showValidationError,
} from '../feedback';

// Componente de feedback inline
export { InlineFeedback, useInlineFeedback } from '../../components/feedback/InlineFeedback';
export type { FeedbackType } from '../../components/feedback/InlineFeedback';

// Componente de progresso
export { ProgressFeedback, useProgress } from '../../components/feedback/ProgressFeedback';
export type { ProgressStatus } from '../../components/feedback/ProgressFeedback';

// Loading Button
export { LoadingButton, useAsyncAction } from '../../components/ui/loading-button';
export type { LoadingButtonProps } from '../../components/ui/loading-button';
