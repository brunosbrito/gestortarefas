
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceOrder } from "@/interfaces/ServiceOrderInterface";
import { EditarOSForm } from "./EditarOSForm";

interface EditarOSDialogProps {
  os: ServiceOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditarOSDialog = ({ os, open, onOpenChange, onSuccess }: EditarOSDialogProps) => {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Editar Ordem de Serviço</DialogTitle>
        </DialogHeader>
        {os && <EditarOSForm os={os} onSuccess={handleSuccess} />}
      </DialogContent>
    </Dialog>
  );
};
