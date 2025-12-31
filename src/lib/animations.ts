/**
 * Variantes de animação reutilizáveis para framer-motion
 * Centralizadas para consistência em toda a aplicação
 */

import { Variants } from 'framer-motion';

/**
 * Fade in - Aparecimento suave
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Fade in com movimento de baixo para cima
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] // easeOutExpo
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Scale - Crescimento suave
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Slide in da direita (para modals, sidebars)
 */
export const slideInRight: Variants = {
  hidden: {
    x: '100%',
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1]
    }
  }
};

/**
 * Slide in da esquerda
 */
export const slideInLeft: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1]
    }
  }
};

/**
 * Container para stagger children
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

/**
 * Item filho para stagger (usado com staggerContainer)
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 10
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: 0.2
    }
  }
};

/**
 * Hover scale - Para botões e cards interativos
 */
export const hoverScale = {
  scale: 1.02,
  transition: {
    duration: 0.2,
    ease: 'easeOut'
  }
};

/**
 * Tap scale - Feedback ao clicar
 */
export const tapScale = {
  scale: 0.98,
  transition: {
    duration: 0.1,
    ease: 'easeInOut'
  }
};

/**
 * Skeleton loading - Para placeholders
 */
export const skeletonPulse: Variants = {
  loading: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Modal backdrop
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Modal content
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1]
    }
  }
};

/**
 * Configuração para respeitar preferências de acessibilidade
 */
export const getReducedMotionConfig = () => {
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return {
        initial: false,
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.01 }
      };
    }
  }
  return {};
};
