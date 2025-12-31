import { useEffect } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

interface UseTourOptions {
  steps: DriveStep[];
  onComplete?: () => void;
  onClose?: () => void;
  showProgress?: boolean;
  allowClose?: boolean;
}

/**
 * Hook para gerenciar tour guiado com driver.js
 *
 * @example
 * ```tsx
 * const { startTour, endTour } = useTour({
 *   steps: dashboardTourSteps,
 *   onComplete: () => console.log('Tour completed!')
 * });
 *
 * // Iniciar o tour
 * <Button onClick={startTour}>Iniciar Tour</Button>
 * ```
 */
export const useTour = (options: UseTourOptions) => {
  const {
    steps,
    onComplete,
    onClose,
    showProgress = true,
    allowClose = true
  } = options;

  // Criar instância do driver
  const driverInstance = driver({
    showProgress,
    allowClose,
    steps,
    nextBtnText: 'Próximo',
    prevBtnText: 'Anterior',
    doneBtnText: 'Concluir',
    progressText: '{{current}} de {{total}}',
    onDestroyed: () => {
      if (onClose) onClose();
    },
    onDestroyStarted: () => {
      // Verificar se completou todos os steps antes de destruir
      if (driverInstance.getActiveIndex() === steps.length - 1) {
        if (onComplete) onComplete();
      }
      driverInstance.destroy();
    }
  });

  // Limpar ao desmontar componente
  useEffect(() => {
    return () => {
      driverInstance.destroy();
    };
  }, []);

  const startTour = () => {
    driverInstance.drive();
  };

  const endTour = () => {
    driverInstance.destroy();
  };

  const highlightElement = (element: string) => {
    driverInstance.highlight({
      element,
      popover: {
        title: 'Destaque',
        description: 'Este é o elemento destacado'
      }
    });
  };

  return {
    startTour,
    endTour,
    highlightElement,
    driverInstance
  };
};

/**
 * Hook para verificar se é a primeira visita do usuário
 * e iniciar tour automaticamente
 */
export const useFirstVisitTour = (
  tourKey: string,
  steps: DriveStep[],
  autoStart = true
) => {
  const { startTour } = useTour({
    steps,
    onComplete: () => {
      // Marcar tour como completo
      localStorage.setItem(`tour_completed_${tourKey}`, 'true');
    }
  });

  useEffect(() => {
    if (autoStart) {
      const hasSeenTour = localStorage.getItem(`tour_completed_${tourKey}`);

      if (!hasSeenTour) {
        // Aguardar um pouco para garantir que a página carregou
        const timeout = setTimeout(() => {
          startTour();
        }, 1000);

        return () => clearTimeout(timeout);
      }
    }
  }, [tourKey, autoStart]);

  return { startTour };
};

/**
 * Hook para resetar todos os tours (útil para desenvolvimento/testes)
 */
export const useResetTours = () => {
  const resetAllTours = () => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('tour_completed_'));
    keys.forEach(key => localStorage.removeItem(key));
    console.log('✅ Todos os tours foram resetados');
  };

  return { resetAllTours };
};
