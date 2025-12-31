import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
  /**
   * Estado de loading do botão
   */
  loading?: boolean;
  /**
   * Texto alternativo durante loading
   */
  loadingText?: string;
  /**
   * Ícone customizado para loading (padrão: Loader2)
   */
  loadingIcon?: React.ReactNode;
}

/**
 * Botão com estado de loading integrado
 *
 * @example
 * ```tsx
 * const [isLoading, setIsLoading] = useState(false);
 *
 * const handleSave = async () => {
 *   setIsLoading(true);
 *   try {
 *     await saveData();
 *   } finally {
 *     setIsLoading(false);
 *   }
 * };
 *
 * return (
 *   <LoadingButton
 *     onClick={handleSave}
 *     loading={isLoading}
 *     loadingText="Salvando..."
 *   >
 *     Salvar
 *   </LoadingButton>
 * );
 * ```
 */
export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, children, loading = false, loadingText, loadingIcon, disabled, ...props }, ref) => {
    const defaultLoadingIcon = <Loader2 className="mr-2 h-4 w-4 animate-spin" />;

    return (
      <Button
        ref={ref}
        className={cn(className)}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (loadingIcon || defaultLoadingIcon)}
        {loading && loadingText ? loadingText : children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

/**
 * Hook para gerenciar estado de loading com callback
 *
 * @example
 * ```tsx
 * const { isLoading, execute } = useAsyncAction();
 *
 * const handleSave = execute(async () => {
 *   await saveData();
 * });
 *
 * return (
 *   <LoadingButton onClick={handleSave} loading={isLoading}>
 *     Salvar
 *   </LoadingButton>
 * );
 * ```
 */
export const useAsyncAction = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const execute = React.useCallback(
    <T,>(asyncFn: () => Promise<T>) => {
      return async () => {
        setIsLoading(true);
        try {
          return await asyncFn();
        } finally {
          setIsLoading(false);
        }
      };
    },
    []
  );

  return { isLoading, execute, setIsLoading };
};
