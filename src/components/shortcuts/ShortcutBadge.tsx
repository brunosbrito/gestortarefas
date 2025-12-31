import { Badge } from '@/components/ui/badge';
import { Command } from 'lucide-react';
import { formatShortcutKey } from '@/constants/shortcuts';
import { cn } from '@/lib/utils';

interface ShortcutBadgeProps {
  shortcut: string;
  className?: string;
}

/**
 * Componente para exibir atalhos de teclado visualmente
 * Pode ser usado em botões, tooltips, etc.
 */
export const ShortcutBadge = ({ shortcut, className }: ShortcutBadgeProps) => {
  const keys = formatShortcutKey(shortcut).split(' + ');

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {keys.map((key, i) => (
        <div key={i} className="flex items-center gap-0.5">
          <Badge
            variant="outline"
            className={cn(
              "px-1.5 py-0.5 font-mono text-[10px] font-semibold",
              "bg-muted/50 border-border/60"
            )}
          >
            {key === 'Cmd' ? (
              <Command className="w-2.5 h-2.5" />
            ) : (
              key
            )}
          </Badge>
          {i < keys.length - 1 && (
            <span className="text-muted-foreground text-[10px] mx-0.5">+</span>
          )}
        </div>
      ))}
    </div>
  );
};
