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
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import ColaboradorService from '@/services/ColaboradorService';
import EquipamentoService from '@/services/EquipamentoService';
import { Gauge } from 'lucide-react';

interface NovoEquipamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const NovoEquipamentoDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: NovoEquipamentoDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'paquimetro',
    numeroSerie: '',
    patrimonio: '',
    setor: '',
    responsavelId: '',
    frequenciaCalibracao: '12',
    laboratorioCalibrador: '',
  });

  useEffect(() => {
    if (open) {
      loadColaboradores();
    }
  }, [open]);

  const loadColaboradores = async () => {
    try {
      const data = await ColaboradorService.getAllColaboradores();
      setColaboradores(data);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'paquimetro',
      numeroSerie: '',
      patrimonio: '',
      setor: '',
      responsavelId: '',
      frequenciaCalibracao: '12',
      laboratorioCalibrador: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do equipamento é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.frequenciaCalibracao || parseInt(formData.frequenciaCalibracao) < 1) {
      toast({
        title: 'Erro',
        description: 'A frequência de calibração deve ser maior que 0.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const data = {
        ...formData,
        frequenciaCalibracao: parseInt(formData.frequenciaCalibracao),
        ativo: true,
        status: 'vencido', // Novo equipamento sem calibração inicial
      };

      await EquipamentoService.create(data);

      toast({
        title: 'Sucesso',
        description: 'Equipamento cadastrado com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao cadastrar equipamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar o equipamento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Novo Equipamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome do Equipamento *</Label>
              <Input
                placeholder="Ex: Paquímetro Digital 150mm"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paquimetro">Paquímetro</SelectItem>
                  <SelectItem value="micrometro">Micrômetro</SelectItem>
                  <SelectItem value="torquimetro">Torquímetro</SelectItem>
                  <SelectItem value="manometro">Manômetro</SelectItem>
                  <SelectItem value="balanca">Balança</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número de Série</Label>
              <Input
                placeholder="Ex: SN123456"
                value={formData.numeroSerie}
                onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Patrimônio</Label>
              <Input
                placeholder="Ex: PAT-001"
                value={formData.patrimonio}
                onChange={(e) => setFormData({ ...formData, patrimonio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Setor/Localização</Label>
              <Input
                placeholder="Ex: Laboratório de Metrologia"
                value={formData.setor}
                onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select
                value={formData.responsavelId}
                onValueChange={(value) => setFormData({ ...formData, responsavelId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((colaborador) => (
                    <SelectItem key={colaborador.id} value={colaborador.id}>
                      {colaborador.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequência de Calibração (meses) *</Label>
              <Input
                type="number"
                min="1"
                placeholder="12"
                value={formData.frequenciaCalibracao}
                onChange={(e) =>
                  setFormData({ ...formData, frequenciaCalibracao: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Período entre calibrações em meses
              </p>
            </div>

            <div className="space-y-2">
              <Label>Laboratório Calibrador</Label>
              <Input
                placeholder="Ex: Laboratório ABC Metrologia"
                value={formData.laboratorioCalibrador}
                onChange={(e) =>
                  setFormData({ ...formData, laboratorioCalibrador: e.target.value })
                }
              />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800 dark:text-yellow-500">
              <strong>Atenção:</strong> Após cadastrar o equipamento, faça o upload do certificado
              de calibração para definir a próxima data de calibração e o status do equipamento.
            </p>
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar Equipamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
