import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Equipamento } from '@/interfaces/QualidadeInterfaces';
import EquipamentoService from '@/services/EquipamentoService';
import { Upload, FileCheck, Calendar } from 'lucide-react';
import { addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UploadCalibracaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipamento: Equipamento | null;
  onSuccess: () => void;
}

export const UploadCalibracaoDialog = ({
  open,
  onOpenChange,
  equipamento,
  onSuccess,
}: UploadCalibracaoDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    numeroCertificado: '',
    laboratorio: '',
    dataCalibracao: new Date().toISOString().split('T')[0],
    resultado: 'aprovado',
    observacoes: '',
  });

  const resetForm = () => {
    setFormData({
      numeroCertificado: '',
      laboratorio: '',
      dataCalibracao: new Date().toISOString().split('T')[0],
      resultado: 'aprovado',
      observacoes: '',
    });
    setArquivo(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArquivo(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!equipamento) return;

    if (!formData.numeroCertificado.trim()) {
      toast({
        title: 'Erro',
        description: 'O número do certificado é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.laboratorio.trim()) {
      toast({
        title: 'Erro',
        description: 'O laboratório é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!arquivo) {
      toast({
        title: 'Erro',
        description: 'Selecione o arquivo do certificado.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Calcular próxima calibração
      const dataCalibracao = new Date(formData.dataCalibracao);
      const proximaCalibracao = addMonths(dataCalibracao, equipamento.frequenciaCalibracao);

      // Criar FormData com arquivo e dados
      const formDataToSend = new FormData();
      formDataToSend.append('file', arquivo);
      formDataToSend.append('numeroCertificado', formData.numeroCertificado);
      formDataToSend.append('laboratorio', formData.laboratorio);
      formDataToSend.append('dataCalibracao', formData.dataCalibracao);
      formDataToSend.append('proximaCalibracao', proximaCalibracao.toISOString().split('T')[0]);
      formDataToSend.append('resultado', formData.resultado);
      if (formData.observacoes) {
        formDataToSend.append('observacoes', formData.observacoes);
      }

      await EquipamentoService.addCalibracao(equipamento.id, formDataToSend);

      toast({
        title: 'Sucesso',
        description: 'Calibração registrada com sucesso.',
      });

      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Erro ao registrar calibração:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a calibração.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!equipamento) return null;

  const dataCalibracao = formData.dataCalibracao
    ? new Date(formData.dataCalibracao)
    : new Date();
  const proximaCalibracao = addMonths(dataCalibracao, equipamento.frequenciaCalibracao);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Nova Calibração - {equipamento.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Informações de Calibração
              </span>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div>
                <strong>Frequência:</strong> {equipamento.frequenciaCalibracao} meses
              </div>
              <div>
                <strong>Próxima calibração será em:</strong>{' '}
                {format(proximaCalibracao, 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número do Certificado *</Label>
              <Input
                placeholder="Ex: CERT-2024-001"
                value={formData.numeroCertificado}
                onChange={(e) =>
                  setFormData({ ...formData, numeroCertificado: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Laboratório *</Label>
              <Input
                placeholder="Nome do laboratório"
                value={formData.laboratorio}
                onChange={(e) =>
                  setFormData({ ...formData, laboratorio: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Data da Calibração *</Label>
              <Input
                type="date"
                value={formData.dataCalibracao}
                onChange={(e) =>
                  setFormData({ ...formData, dataCalibracao: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Resultado *</Label>
              <Select
                value={formData.resultado}
                onValueChange={(value) => setFormData({ ...formData, resultado: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações adicionais sobre a calibração..."
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Certificado de Calibração (PDF) *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <FileCheck className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <span className="text-primary font-medium">
                      Clique para selecionar
                    </span>
                    <span className="text-muted-foreground"> ou arraste o arquivo</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Apenas PDF (máx. 10MB)
                  </p>
                </div>
              </label>
              {arquivo && (
                <div className="mt-4 p-3 bg-muted rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{arquivo.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          </div>

          {formData.resultado === 'reprovado' && (
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded border border-red-200">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Atenção:</strong> Equipamento reprovado na calibração não poderá ser
                utilizado em inspeções até nova calibração com resultado aprovado.
              </p>
            </div>
          )}
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
            {loading ? 'Registrando...' : 'Registrar Calibração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
