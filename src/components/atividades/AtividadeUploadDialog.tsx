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
import { Loader2 } from 'lucide-react';

interface AtividadeUploadDialogProps {
  imageDescription: string;
  onDescriptionChange: (description: string) => void;
  onCancel: () => void;
  onUpload: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}

export const AtividadeUploadDialog = ({
  imageDescription,
  onDescriptionChange,
  onCancel,
  onUpload,
  open,
  onOpenChange,
  isLoading = false,
}: AtividadeUploadDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(value) => !isLoading && onOpenChange(value)}>
      <DialogContent onPointerDownOutside={(e) => isLoading && e.preventDefault()}>
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
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
            onClick={onUpload}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
