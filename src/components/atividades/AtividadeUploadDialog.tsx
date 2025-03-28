
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AtividadeUploadDialogProps {
  imageDescription: string;
  onDescriptionChange: (description: string) => void;
  onCancel: () => void;
  onUpload: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AtividadeUploadDialog = ({
  imageDescription,
  onDescriptionChange,
  onCancel,
  onUpload,
  open,
  onOpenChange,
}: AtividadeUploadDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Descrição da Imagem</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="imageDescription">
              Adicione uma descrição para a imagem
            </Label>
            <Input
              id="imageDescription"
              value={imageDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Digite a descrição da imagem"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
            onClick={onUpload}
          >
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
