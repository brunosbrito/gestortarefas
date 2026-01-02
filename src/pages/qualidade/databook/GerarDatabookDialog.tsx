import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';
import DatabookService from '@/services/DatabookService';
import { BookOpen, Sparkles } from 'lucide-react';
import { subMonths, format } from 'date-fns';

interface GerarDatabookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const GerarDatabookDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: GerarDatabookDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [obras, setObras] = useState<Obra[]>([]);
  const [formData, setFormData] = useState({
    projectId: '',
    titulo: '',
    cliente: '',
    periodoInicio: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    periodoFim: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (open) {
      loadObras();
    }
  }, [open]);

  const loadObras = async () => {
    try {
      const data = await ObrasService.getAllObras();
      setObras(data);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    }
  };

  const handleObraChange = (obraId: string) => {
    const obra = obras.find((o) => o.id === obraId);
    if (obra) {
      setFormData({
        ...formData,
        projectId: obraId,
        titulo: `Databook - ${obra.name}`,
        cliente: obra.customer || '',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: '',
      titulo: '',
      cliente: '',
      periodoInicio: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
      periodoFim: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleSubmit = async () => {
    if (!formData.projectId) {
      toast({
        title: 'Erro',
        description: 'Selecione uma obra.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.titulo.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.cliente.trim()) {
      toast({
        title: 'Erro',
        description: 'O cliente é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await DatabookService.gerarAutomatico(formData.projectId, {
        inicio: formData.periodoInicio,
        fim: formData.periodoFim,
      });

      toast({
        title: 'Sucesso',
        description: 'Databook gerado automaticamente com sucesso!',
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao gerar databook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o databook.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>Gerar Databook Automaticamente</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Coleta automática de todos os documentos de qualidade da obra
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Obra */}
          <div className="space-y-2">
            <Label>Obra *</Label>
            <Select value={formData.projectId} onValueChange={handleObraChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma obra" />
              </SelectTrigger>
              <SelectContent>
                {obras.map((obra) => (
                  <SelectItem key={obra.id} value={obra.id || ''}>
                    {obra.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              placeholder="Ex: Databook - Obra ABC"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Input
              placeholder="Nome do cliente"
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
            />
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Período Início</Label>
              <Input
                type="date"
                value={formData.periodoInicio}
                onChange={(e) =>
                  setFormData({ ...formData, periodoInicio: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Período Fim</Label>
              <Input
                type="date"
                value={formData.periodoFim}
                onChange={(e) => setFormData({ ...formData, periodoFim: e.target.value })}
              />
            </div>
          </div>

          {/* Informações sobre geração automática */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Geração Automática
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  O sistema coletará automaticamente:
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-4 list-disc">
                  <li>Todos os certificados vinculados à obra</li>
                  <li>Todas as inspeções realizadas no período</li>
                  <li>RNCs e ações corretivas</li>
                  <li>Certificados de calibração dos equipamentos</li>
                  <li>Fotos e evidências</li>
                </ul>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  Você poderá revisar e editar antes de finalizar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Databook
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
