import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceOrder } from "@/interfaces/ServiceOrderInterface";
import { NovaOSForm } from "./NovaOSForm";
import { useToast } from "@/hooks/use-toast";

interface EditarOSDialogProps {
  os: ServiceOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditarOSDialog = ({ os, open, onOpenChange, onSuccess }: EditarOSDialogProps) => {
  const { toast } = useToast();

  if (!os) return null;

  const handleSubmit = async (data: any) => {
    try {
      // Aqui você implementaria a lógica de atualização da OS
      onSuccess();
      onOpenChange(false);
      
      toast({
        title: "Ordem de Serviço atualizada",
        description: "A OS foi atualizada com sucesso!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar Ordem de Serviço",
        description: "Não foi possível atualizar a ordem de serviço.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <NovaOSForm onSubmit={handleSubmit} initialData={os} />
      </DialogContent>
    </Dialog>
  );
};