import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

interface HighContrastState {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  setHighContrast: (enabled: boolean) => void;
}

/**
 * Store Zustand para gerenciar modo de alto contraste
 */
export const useHighContrastStore = create<HighContrastState>()(
  persist(
    (set) => ({
      isHighContrast: false,
      toggleHighContrast: () =>
        set((state) => {
          const newValue = !state.isHighContrast;
          // Aplicar classe no documento
          if (newValue) {
            document.documentElement.classList.add('high-contrast');
          } else {
            document.documentElement.classList.remove('high-contrast');
          }
          return { isHighContrast: newValue };
        }),
      setHighContrast: (enabled) =>
        set(() => {
          // Aplicar classe no documento
          if (enabled) {
            document.documentElement.classList.add('high-contrast');
          } else {
            document.documentElement.classList.remove('high-contrast');
          }
          return { isHighContrast: enabled };
        }),
    }),
    {
      name: 'high-contrast-storage',
    }
  )
);

/**
 * Hook para usar alto contraste com aplicação automática ao montar
 */
export const useHighContrast = () => {
  const { isHighContrast, toggleHighContrast, setHighContrast } =
    useHighContrastStore();

  // Aplicar classe ao montar se necessário
  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Cleanup ao desmontar
    return () => {
      // Não removemos a classe ao desmontar para manter a preferência
    };
  }, [isHighContrast]);

  return {
    isHighContrast,
    toggleHighContrast,
    setHighContrast,
  };
};

/**
 * Hook para detectar preferência do sistema por alto contraste
 */
export const useSystemHighContrast = () => {
  useEffect(() => {
    // Detectar preferência do sistema
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const { setHighContrast, isHighContrast } = useHighContrastStore.getState();

      // Só aplicar se usuário não tiver definido manualmente
      const hasUserPreference = localStorage.getItem('high-contrast-storage');
      if (!hasUserPreference && e.matches) {
        setHighContrast(true);
      }
    };

    // Verificar no mount
    handleChange(mediaQuery);

    // Ouvir mudanças
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
};
