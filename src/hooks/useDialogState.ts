import { useState, useCallback } from 'react';

/**
 * Hook customizado para gerenciar estado de diálogos
 * Elimina código duplicado de abertura/fechamento de diálogos
 *
 * @example
 * const editDialog = useDialogState<User>();
 *
 * // Abrir diálogo com item
 * editDialog.open(user);
 *
 * // Fechar diálogo
 * editDialog.close();
 *
 * // Usar no componente
 * <Dialog open={editDialog.isOpen} onOpenChange={editDialog.setIsOpen}>
 *   {editDialog.data && <EditForm item={editDialog.data} />}
 * </Dialog>
 */
export function useDialogState<T = any>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((item?: T) => {
    if (item) {
      setData(item);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay para limpar dados após animação de fechamento
    setTimeout(() => setData(null), 200);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    setIsOpen,
    data,
    setData,
    open,
    close,
    toggle,
  };
}
