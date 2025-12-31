import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface UseDataFetchingOptions<T> {
  /**
   * Função assíncrona para buscar os dados
   */
  fetchFn: () => Promise<T>;

  /**
   * Se true, executa fetch automaticamente no mount
   * @default true
   */
  fetchOnMount?: boolean;

  /**
   * Mensagem de erro personalizada
   */
  errorMessage?: string;

  /**
   * Callback executado após sucesso no fetch
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback executado após erro no fetch
   */
  onError?: (error: any) => void;

  /**
   * Array de dependências para re-executar o fetch
   */
  dependencies?: any[];
}

interface UseDataFetchingReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Hook customizado para buscar dados com loading e error states
 * Elimina código duplicado de fetch em componentes
 *
 * @example
 * const { data: users, isLoading, error, refetch } = useDataFetching({
 *   fetchFn: () => UserService.getAllUsers(),
 *   errorMessage: "Erro ao carregar usuários",
 *   onSuccess: (data) => console.log("Loaded", data.length, "users")
 * });
 */
export function useDataFetching<T>({
  fetchFn,
  fetchOnMount = true,
  errorMessage = 'Erro ao carregar dados',
  onSuccess,
  onError,
  dependencies = [],
}: UseDataFetchingOptions<T>): UseDataFetchingReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(fetchOnMount);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setError(null);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      toast({
        variant: 'destructive',
        title: errorMessage,
        description: error.message || 'Não foi possível carregar os dados.',
      });

      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, errorMessage, onSuccess, onError, toast]);

  useEffect(() => {
    if (fetchOnMount) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    refetch,
    setData,
  };
}
