import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { KEYBOARD_SHORTCUTS } from '@/constants/shortcuts';

interface UseKeyboardShortcutsOptions {
  onOpenShortcutsModal?: () => void;
  onToggleSidebar?: () => void;
  onNewActivity?: () => void;
  enableNavigation?: boolean;
  enableActions?: boolean;
}

/**
 * Hook para gerenciar atalhos de teclado globais
 */
export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}) => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const {
    onOpenShortcutsModal,
    onToggleSidebar,
    onNewActivity,
    enableNavigation = true,
    enableActions = true,
  } = options;

  // Navegação
  useHotkeys(
    KEYBOARD_SHORTCUTS.DASHBOARD.key,
    (e) => {
      e.preventDefault();
      if (enableNavigation) {
        navigate('/dashboard');
      }
    },
    { enabled: enableNavigation }
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.ACTIVITIES.key,
    (e) => {
      e.preventDefault();
      if (enableNavigation) {
        navigate('/atividade');
      }
    },
    { enabled: enableNavigation }
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.PROJECTS.key,
    (e) => {
      e.preventDefault();
      if (enableNavigation) {
        navigate('/obras');
      }
    },
    { enabled: enableNavigation }
  );

  // Ações
  useHotkeys(
    KEYBOARD_SHORTCUTS.NEW_ACTIVITY.key,
    (e) => {
      e.preventDefault();
      if (enableActions && onNewActivity) {
        onNewActivity();
      }
    },
    { enabled: enableActions && !!onNewActivity }
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.SEARCH.key,
    (e) => {
      e.preventDefault();
      // TODO: Implementar busca global
      console.log('Search triggered');
    },
    { enabled: enableActions }
  );

  // Visualizações
  useHotkeys(
    KEYBOARD_SHORTCUTS.TOGGLE_THEME.key,
    (e) => {
      e.preventDefault();
      toggleTheme();
    }
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.TOGGLE_SIDEBAR.key,
    (e) => {
      e.preventDefault();
      if (onToggleSidebar) {
        onToggleSidebar();
      }
    },
    { enabled: !!onToggleSidebar }
  );

  // Geral
  useHotkeys(
    KEYBOARD_SHORTCUTS.HELP.key,
    (e) => {
      e.preventDefault();
      if (onOpenShortcutsModal) {
        onOpenShortcutsModal();
      }
    },
    { enabled: !!onOpenShortcutsModal }
  );

  return {
    shortcuts: KEYBOARD_SHORTCUTS,
  };
};
