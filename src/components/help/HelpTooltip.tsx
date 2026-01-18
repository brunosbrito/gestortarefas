import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface HelpTooltipProps {
  /** Conteúdo da dica/explicação */
  content: string;
  /** Título opcional do tooltip */
  title?: string;
  /** Posicionamento do tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alinhamento do tooltip */
  align?: 'start' | 'center' | 'end';
  /** Tamanho do ícone */
  iconSize?: 'sm' | 'md' | 'lg';
  /** Classes CSS adicionais para o ícone */
  className?: string;
  /** Se true, abre delay ao hover */
  delayDuration?: number;
}

const iconSizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/**
 * Componente de tooltip de ajuda reutilizável
 *
 * Exibe um ícone de interrogação que ao passar o mouse mostra
 * uma dica ou explicação sobre um campo ou funcionalidade.
 *
 * @example
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <label>Status da Inspeção</label>
 *   <HelpTooltip
 *     title="O que é status?"
 *     content="O status indica se a inspeção foi aprovada, reprovada ou está pendente de análise."
 *     side="right"
 *   />
 * </div>
 * ```
 */
export const HelpTooltip = ({
  content,
  title,
  side = 'top',
  align = 'center',
  iconSize = 'sm',
  className,
  delayDuration = 200,
}: HelpTooltipProps) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center',
              'text-muted-foreground hover:text-foreground',
              'transition-colors cursor-help',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'rounded-full',
              className
            )}
            aria-label="Ajuda"
          >
            <HelpCircle className={iconSizeMap[iconSize]} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="max-w-xs md:max-w-sm"
        >
          {title && (
            <div className="font-semibold mb-1 text-sm">{title}</div>
          )}
          <p className="text-xs leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Variante compacta do HelpTooltip para uso em labels de formulários
 *
 * @example
 * ```tsx
 * <FormLabel>
 *   CFOP <HelpTooltipInline content="Código Fiscal de Operações e Prestações" />
 * </FormLabel>
 * ```
 */
export const HelpTooltipInline = ({
  content,
  title,
  side = 'right',
}: Pick<HelpTooltipProps, 'content' | 'title' | 'side'>) => {
  return (
    <HelpTooltip
      content={content}
      title={title}
      side={side}
      iconSize="sm"
      className="ml-1 -mt-0.5"
      delayDuration={100}
    />
  );
};
