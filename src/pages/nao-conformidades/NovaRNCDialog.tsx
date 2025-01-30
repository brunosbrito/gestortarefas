import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NovaRNCForm } from "./NovaRNCForm";

interface NovaRNCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaRNCDialog({ open, onOpenChange }: NovaRNCDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Registro de Não Conformidade</DialogTitle>
        </DialogHeader>
        <NovaRNCForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}