import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Command } from 'lucide-react';
import { KEYBOARD_SHORTCUTS, SHORTCUT_CATEGORIES, formatShortcutKey, getModifierKey } from '@/constants/shortcuts';
import { cn } from '@/lib/utils';

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShortcutsModal = ({ open, onOpenChange }: ShortcutsModalProps) => {
  // Agrupar atalhos por categoria
  const shortcutsByCategory = Object.entries(KEYBOARD_SHORTCUTS).reduce((acc, [_, shortcut]) => {
    const category = shortcut.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof KEYBOARD_SHORTCUTS[keyof typeof KEYBOARD_SHORTCUTS][]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Atalhos de Teclado</DialogTitle>
              <DialogDescription>
                Use esses atalhos para navegar mais rápido pelo sistema
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <div className="h-px flex-1 bg-border"></div>
                <span>{SHORTCUT_CATEGORIES[category as keyof typeof SHORTCUT_CATEGORIES]}</span>
                <div className="h-px flex-1 bg-border"></div>
              </h3>

              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={`${category}-${index}`}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      "hover:bg-accent/50 transition-colors",
                      "border border-border/50"
                    )}
                  >
                    <span className="text-sm text-foreground">{shortcut.description}</span>

                    <div className="flex items-center gap-1">
                      {formatShortcutKey(shortcut.key).split(' + ').map((key, i, arr) => (
                        <div key={i} className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "px-2 py-1 font-mono text-xs font-semibold",
                              "bg-muted/50 border-border/60",
                              "shadow-sm"
                            )}
                          >
                            {key === 'Cmd' ? (
                              <Command className="w-3 h-3" />
                            ) : (
                              key
                            )}
                          </Badge>
                          {i < arr.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-primary/10 mt-0.5">
              <Keyboard className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Dica</p>
              <p className="text-xs text-muted-foreground">
                No {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Mac' : 'Windows'}, use{' '}
                <Badge variant="outline" className="px-1.5 py-0.5 text-xs font-mono">
                  {getModifierKey()}
                </Badge>{' '}
                como tecla modificadora principal. Pressione{' '}
                <Badge variant="outline" className="px-1.5 py-0.5 text-xs font-mono">
                  {getModifierKey()} + /
                </Badge>{' '}
                para abrir esta janela a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
