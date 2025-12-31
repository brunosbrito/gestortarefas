import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TourButtonProps {
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

/**
 * Botão para iniciar tour guiado
 */
export const TourButton = ({
  onClick,
  variant = 'outline',
  size = 'default',
  showLabel = true
}: TourButtonProps) => {
  if (size === 'icon' || !showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size="icon"
              onClick={onClick}
              aria-label="Iniciar tour guiado"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Iniciar tour guiado (Ctrl+?)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className="gap-2"
    >
      <HelpCircle className="h-4 w-4" />
      Iniciar Tour
    </Button>
  );
};
