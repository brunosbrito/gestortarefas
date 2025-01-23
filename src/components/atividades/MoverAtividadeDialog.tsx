import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MoverAtividadeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMove: (novoStatus: string) => void;
}

const statusOptions = ['Planejadas', 'Em execução', 'Paralizadas', 'Concluídas'];

export function MoverAtividadeDialog({
  open,
  onOpenChange,
  onMove,
}: MoverAtividadeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Mover Atividade</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {statusOptions.map((status) => (
            <Button
              key={status}
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => {
                onMove(status);
                onOpenChange(false);
              }}
            >
              {status}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}