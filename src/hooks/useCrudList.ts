import { useCallback } from 'react';
import { useToast } from './use-toast';
import { useDataFetching } from './useDataFetching';
import { useDialogState } from './useDialogState';

interface CrudService<T> {
  getAll: () => Promise<T[]>;
  create?: (item: Omit<T, 'id'>) => Promise<T>;
  update?: (id: string | number, item: Partial<T>) => Promise<T>;
  remove?: (id: string | number) => Promise<void>;
}

interface UseCrudListOptions<T> {
  /**
   * Serviço com métodos CRUD
   */
  service: CrudService<T>;

  /**
   * Nome do recurso (ex: "usuário", "colaborador")
   * Usado nas mensagens de toast
   */
  resourceName: string;

  /**
   * Nome do recurso no plural (ex: "usuários", "colaboradores")
   */
  resourceNamePlural: string;

  /**
   * Se true, busca dados automaticamente no mount
   * @default true
   */
  fetchOnMount?: boolean;

  /**
   * Callback executado após sucesso em operações
   */
  onSuccess?: (operation: 'create' | 'update' | 'delete', item?: T) => void;

  /**
   * Callback executado após erro em operações
   */
  onError?: (operation: 'create' | 'update' | 'delete', error: any) => void;
}

/**
 * Hook customizado que encapsula toda a lógica CRUD de listas
 * Reduz drasticamente código duplicado em componentes de lista
 *
 * @example
 * const users = useCrudList({
 *   service: UserService,
 *   resourceName: "usuário",
 *   resourceNamePlural: "usuários"
 * });
 *
 * // Usar no componente:
 * - users.data - Lista de dados
 * - users.isLoading - Estado de carregamento
 * - users.editDialog - Estado do diálogo de edição
 * - users.deleteDialog - Estado do diálogo de exclusão
 * - users.handleEdit(user) - Abrir edição
 * - users.handleDelete(user) - Abrir confirmação de exclusão
 * - users.confirmDelete() - Confirmar exclusão
 * - users.refetch() - Recarregar dados
 */
export function useCrudList<T extends { id: string | number }>({
  service,
  resourceName,
  resourceNamePlural,
  fetchOnMount = true,
  onSuccess,
  onError,
}: UseCrudListOptions<T>) {
  const { toast } = useToast();

  // Fetch de dados
  const {
    data,
    isLoading,
    error,
    refetch,
    setData,
  } = useDataFetching({
    fetchFn: service.getAll,
    fetchOnMount,
    errorMessage: `Erro ao carregar ${resourceNamePlural}`,
  });

  // Estados dos diálogos
  const editDialog = useDialogState<T>();
  const deleteDialog = useDialogState<T>();

  // Handler para abrir edição
  const handleEdit = useCallback((item: T) => {
    editDialog.open(item);
  }, [editDialog]);

  // Handler para abrir confirmação de exclusão
  const handleDelete = useCallback((item: T) => {
    deleteDialog.open(item);
  }, [deleteDialog]);

  // Confirmar exclusão
  const confirmDelete = useCallback(async () => {
    if (!deleteDialog.data || !service.remove) {
      return;
    }

    try {
      await service.remove(deleteDialog.data.id);

      toast({
        title: `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} excluído`,
        description: `O ${resourceName} foi excluído com sucesso.`,
      });

      // Atualizar lista removendo item
      if (data) {
        setData(data.filter(item => item.id !== deleteDialog.data!.id));
      }

      deleteDialog.close();

      if (onSuccess) {
        onSuccess('delete', deleteDialog.data);
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: `Não foi possível excluir o ${resourceName}.`,
      });

      if (onError) {
        onError('delete', err);
      }
    }
  }, [deleteDialog, service, toast, resourceName, data, setData, onSuccess, onError]);

  // Sucesso na edição
  const handleEditSuccess = useCallback(() => {
    editDialog.close();
    refetch();

    toast({
      title: `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} atualizado`,
      description: `As informações foram atualizadas com sucesso.`,
    });

    if (onSuccess && editDialog.data) {
      onSuccess('update', editDialog.data);
    }
  }, [editDialog, refetch, toast, resourceName, onSuccess]);

  // Sucesso na criação
  const handleCreateSuccess = useCallback(() => {
    refetch();

    toast({
      title: `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} criado`,
      description: `O ${resourceName} foi criado com sucesso.`,
    });

    if (onSuccess) {
      onSuccess('create');
    }
  }, [refetch, toast, resourceName, onSuccess]);

  return {
    // Dados
    data: data || [],
    isLoading,
    error,
    refetch,
    setData,

    // Diálogos
    editDialog,
    deleteDialog,

    // Handlers
    handleEdit,
    handleDelete,
    confirmDelete,
    handleEditSuccess,
    handleCreateSuccess,
  };
}
