import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import ColaboradorService from '@/services/ColaboradorService';
import EquipamentoService from '@/services/EquipamentoService';
import { Gauge, FileCheck, Upload } from 'lucide-react';
import { addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [incluirCertificado, setIncluirCertificado] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'paquimetro',
    numeroSerie: '',
    patrimonio: '',
    setor: '',
    responsavelId: '',
    frequenciaCalibracao: '12',
    laboratorioCalibrador: '',
    // Campos do certificado inicial (opcionais)
    numeroCertificado: '',
    dataCalibracao: new Date().toISOString().split('T')[0],
    resultado: 'aprovado',
    observacoes: '',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 10MB.',
          variant: 'destructive',
        });
        return;
      }

      // Validar tipo (apenas PDF para certificados de calibração)
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Tipo de arquivo inválido',
          description: 'Apenas arquivos PDF são permitidos.',
          variant: 'destructive',
        });
        return;
      }

      setArquivo(file);
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleClickUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fileInput = document.getElementById('file-upload-cert') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
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
      numeroCertificado: '',
      dataCalibracao: new Date().toISOString().split('T')[0],
      resultado: 'aprovado',
      observacoes: '',
    });
    setArquivo(null);
    setIncluirCertificado(false);
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

    // Validações se incluir certificado
    if (incluirCertificado) {
      if (!formData.numeroCertificado.trim()) {
        toast({
          title: 'Erro',
          description: 'O número do certificado é obrigatório.',
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
    }

    setLoading(true);

    try {
      const equipamentoData = {
        nome: formData.nome,
        tipo: formData.tipo,
        numeroSerie: formData.numeroSerie,
        patrimonio: formData.patrimonio,
        setor: formData.setor,
        responsavelId: formData.responsavelId,
        frequenciaCalibracao: parseInt(formData.frequenciaCalibracao),
        laboratorioCalibrador: formData.laboratorioCalibrador,
        ativo: true,
        status: incluirCertificado && formData.resultado === 'aprovado' ? 'em_dia' : 'vencido',
      };

      const equipamento = await EquipamentoService.create(equipamentoData);

      // Se incluir certificado, fazer upload após criar equipamento
      if (incluirCertificado && arquivo) {
        const dataCalibracao = new Date(formData.dataCalibracao);
        const proximaCalibracao = addMonths(dataCalibracao, parseInt(formData.frequenciaCalibracao));

        const formDataToSend = new FormData();
        formDataToSend.append('file', arquivo);
        formDataToSend.append('numeroCertificado', formData.numeroCertificado);
        formDataToSend.append('laboratorio', formData.laboratorioCalibrador || 'Não informado');
        formDataToSend.append('dataCalibracao', formData.dataCalibracao);
        formDataToSend.append('proximaCalibracao', proximaCalibracao.toISOString().split('T')[0]);
        formDataToSend.append('resultado', formData.resultado);
        if (formData.observacoes) {
          formDataToSend.append('observacoes', formData.observacoes);
        }

        await EquipamentoService.addCalibracao(equipamento.id, formDataToSend);
      }

      toast({
        title: 'Sucesso',
        description: incluirCertificado
          ? 'Equipamento cadastrado e certificado registrado com sucesso.'
          : 'Equipamento cadastrado com sucesso.',
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
          <DialogDescription>
            Cadastre um novo equipamento de medição e controle de calibração
          </DialogDescription>
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

          {/* Seção Opcional: Incluir Certificado Inicial */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">Incluir Certificado Inicial (Opcional)</h4>
                <p className="text-sm text-muted-foreground">
                  Adicione o certificado de calibração já no cadastro
                </p>
              </div>
              <Button
                type="button"
                variant={incluirCertificado ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncluirCertificado(!incluirCertificado)}
              >
                {incluirCertificado ? 'Remover Certificado' : 'Adicionar Certificado'}
              </Button>
            </div>

            {incluirCertificado && (
              <div className="space-y-4 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200">
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

                  <div className="space-y-2">
                    <Label>Próxima Calibração</Label>
                    <Input
                      value={
                        formData.dataCalibracao
                          ? format(
                              addMonths(
                                new Date(formData.dataCalibracao),
                                parseInt(formData.frequenciaCalibracao)
                              ),
                              'dd/MM/yyyy',
                              { locale: ptBR }
                            )
                          : ''
                      }
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Observações adicionais sobre a calibração..."
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData({ ...formData, observacoes: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certificado de Calibração (PDF) *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <Input
                      id="file-upload-cert"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-upload-cert" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
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
                      <div className="mt-3 p-2 bg-muted rounded flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{arquivo.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!incluirCertificado && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded border border-yellow-200">
              <p className="text-sm text-yellow-800 dark:text-yellow-500">
                <strong>Atenção:</strong> Após cadastrar o equipamento, faça o upload do certificado
                de calibração para definir a próxima data de calibração e o status do equipamento.
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
            {loading ? 'Cadastrando...' : 'Cadastrar Equipamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
