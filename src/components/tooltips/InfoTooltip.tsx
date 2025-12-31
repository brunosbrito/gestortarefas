import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: string | React.ReactNode;
  children?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  variant?: 'info' | 'help';
  className?: string;
  iconClassName?: string;
}

/**
 * Componente de tooltip informativo
 * Usado para fornecer informações adicionais sobre campos e funcionalidades
 */
export const InfoTooltip = ({
  content,
  children,
  side = 'top',
  variant = 'info',
  className,
  iconClassName,
}: InfoTooltipProps) => {
  const Icon = variant === 'help' ? HelpCircle : Info;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <button
              type="button"
              className={cn(
                "inline-flex items-center justify-center",
                "text-muted-foreground hover:text-foreground",
                "transition-colors cursor-help",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "rounded-full",
                className
              )}
              aria-label={variant === 'help' ? 'Ajuda' : 'Informação'}
            >
              <Icon className={cn("w-4 h-4", iconClassName)} />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
