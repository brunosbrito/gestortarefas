import { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DraggableDialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ColaboradorService from '@/services/ColaboradorService';
import { updateActivityCollaborators } from '@/services/ActivityService';
import { Colaborador } from '@/interfaces/ColaboradorInterface';

interface TrocarEquipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividadeId: number;
  currentCollaborators: Colaborador[];
  onSuccess: () => void;
}

export function TrocarEquipeDialog({
  open,
  onOpenChange,
  atividadeId,
  currentCollaborators,
  onSuccess,
}: TrocarEquipeDialogProps) {
  const { toast } = useToast();
  const [allCollaborators, setAllCollaborators] = useState<Colaborador[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCollaborators();
      setSelectedIds(currentCollaborators.map((c) => c.id));
    }
  }, [open, currentCollaborators]);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const data = await ColaboradorService.getAllColaboradores();
      // Filtrar apenas colaboradores ativos
      const activeCollaborators = data.filter((c) => c.status !== false);
      setAllCollaborators(activeCollaborators);
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar os colaboradores.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Atenção',
        description: 'Selecione pelo menos um colaborador.',
      });
      return;
    }

    try {
      setSaving(true);
      const userId = Number(localStorage.getItem('userId') || 0);
      await updateActivityCollaborators(atividadeId, selectedIds, userId);

      toast({
        title: 'Equipe atualizada',
        description: 'A equipe da atividade foi atualizada com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar a equipe.',
      });
    } finally {
      setSaving(false);
    }
  };

  const isCurrentMember = (id: number) =>
    currentCollaborators.some((c) => c.id === id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DraggableDialogContent className="max-w-[90%] sm:max-w-[500px] pt-10">
        <DialogHeader>
          <DialogTitle>Trocar Equipe</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Selecione os colaboradores</span>
            <Badge variant="outline">{selectedIds.length} selecionados</Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[300px] border rounded-md p-2">
              <div className="space-y-2">
                {allCollaborators.map((colaborador) => (
                  <div
                    key={colaborador.id}
                    className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedIds.includes(colaborador.id) ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleToggle(colaborador.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(colaborador.id)}
                      onCheckedChange={() => handleToggle(colaborador.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {colaborador.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {colaborador.funcao || colaborador.role || '-'}
                      </p>
                    </div>
                    {isCurrentMember(colaborador.id) && (
                      <Badge
                        variant="secondary"
                        className="text-xs flex-shrink-0"
                      >
                        Atual
                      </Badge>
                    )}
                  </div>
                ))}

                {allCollaborators.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum colaborador disponível
                  </p>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </DraggableDialogContent>
    </Dialog>
  );
}
