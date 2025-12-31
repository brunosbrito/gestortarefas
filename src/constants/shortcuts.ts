/**
 * Definições centralizadas de atalhos de teclado
 * Atalhos globais do sistema
 */

export interface KeyboardShortcut {
  key: string;
  description: string;
  category: 'navigation' | 'actions' | 'views' | 'general';
  action?: () => void;
}

export const KEYBOARD_SHORTCUTS = {
  // Navegação
  DASHBOARD: {
    key: 'ctrl+d, cmd+d',
    description: 'Ir para Dashboard',
    category: 'navigation' as const,
  },
  ACTIVITIES: {
    key: 'ctrl+a, cmd+a',
    description: 'Ir para Atividades',
    category: 'navigation' as const,
  },
  PROJECTS: {
    key: 'ctrl+p, cmd+p',
    description: 'Ir para Obras',
    category: 'navigation' as const,
  },

  // Ações
  NEW_ACTIVITY: {
    key: 'ctrl+n, cmd+n',
    description: 'Nova Atividade',
    category: 'actions' as const,
  },
  SEARCH: {
    key: 'ctrl+k, cmd+k',
    description: 'Buscar',
    category: 'actions' as const,
  },
  SAVE: {
    key: 'ctrl+s, cmd+s',
    description: 'Salvar',
    category: 'actions' as const,
  },

  // Visualizações
  TOGGLE_THEME: {
    key: 'ctrl+shift+t, cmd+shift+t',
    description: 'Alternar Tema (Claro/Escuro)',
    category: 'views' as const,
  },
  TOGGLE_SIDEBAR: {
    key: 'ctrl+b, cmd+b',
    description: 'Mostrar/Ocultar Sidebar',
    category: 'views' as const,
  },

  // Geral
  HELP: {
    key: 'ctrl+/, cmd+/',
    description: 'Mostrar Atalhos',
    category: 'general' as const,
  },
  ESCAPE: {
    key: 'esc',
    description: 'Fechar Modal/Dialog',
    category: 'general' as const,
  },
} as const;

export const SHORTCUT_CATEGORIES = {
  navigation: 'Navegação',
  actions: 'Ações',
  views: 'Visualizações',
  general: 'Geral',
} as const;

/**
 * Formata a tecla de atalho para exibição visual
 * Ex: "ctrl+k" -> "Ctrl + K"
 */
export const formatShortcutKey = (key: string): string => {
  const firstKey = key.split(',')[0].trim(); // Pega apenas a primeira variante

  return firstKey
    .split('+')
    .map(k => {
      const trimmed = k.trim();
      // Capitalizar primeira letra
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    })
    .join(' + ');
};

/**
 * Detecta se está no Mac
 */
export const isMac = (): boolean => {
  return typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

/**
 * Retorna a tecla modificadora apropriada para o sistema
 */
export const getModifierKey = (): string => {
  return isMac() ? '⌘' : 'Ctrl';
};
