import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { CreatePriorizacaoDTO, TipoVinculacaoGP, CriteriosGUT } from '@/interfaces/GestaoProcessosInterfaces';
import { VinculacaoSelector } from '../../components/VinculacaoSelector';
import { GUTMatrixTable } from './GUTMatrixTable';
import ColaboradorService from '@/services/ColaboradorService';
import { Colaborador } from '@/interfaces/ColaboradorInterface';

interface PriorizacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreatePriorizacaoDTO) => Promise<void>;
  initialData?: Partial<CreatePriorizacaoDTO>;
}

const steps = [
  { id: 1, title: 'Informações Básicas', description: 'Dados gerais do problema' },
  { id: 2, title: 'Matriz GUT', description: 'Avaliação de Gravidade, Urgência e Tendência' },
  { id: 3, title: 'Revisão', description: 'Revisar e confirmar' },
];

export const PriorizacaoDialog = ({
  open,
  onOpenChange,
  onSave,
  initialData,
}: PriorizacaoDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  // Form data
  const [formData, setFormData] = useState<Partial<CreatePriorizacaoDTO>>({
    titulo: '',
    descricao: '',
    tipoVinculacao: 'independente',
    problema: '',
    area: '',
    responsavelId: '',
    responsavelNome: '',
    criterios: {
      gravidade: 3,
      urgencia: 3,
      tendencia: 3,
    },
    justificativaGravidade: '',
    justificativaUrgencia: '',
    justificativaTendencia: '',
    acaoImediata: false,
    observacoes: '',
    status: 'rascunho',
    criadoPorId: '1', // TODO: Pegar do contexto de autenticação
    criadoPorNome: 'Usuário Mock',
  });

  useEffect(() => {
    if (open) {
      loadColaboradores();
      if (initialData) {
        setFormData({ ...formData, ...initialData });
      }
    } else {
      // Reset ao fechar
      setCurrentStep(1);
      setFormData({
        titulo: '',
        descricao: '',
        tipoVinculacao: 'independente',
        problema: '',
        area: '',
        responsavelId: '',
        responsavelNome: '',
        criterios: {
          gravidade: 3,
          urgencia: 3,
          tendencia: 3,
        },
        justificativaGravidade: '',
        justificativaUrgencia: '',
        justificativaTendencia: '',
        acaoImediata: false,
        observacoes: '',
        status: 'rascunho',
        criadoPorId: '1',
        criadoPorNome: 'Usuário Mock',
      });
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

  const handleVinculacaoChange = (data: {
    tipoVinculacao: TipoVinculacaoGP;
    obraId?: string;
    obraNome?: string;
    setorId?: string;
    setorNome?: string;
  }) => {
    setFormData({
      ...formData,
      ...data,
    });
  };

  const handleCriteriosChange = (criterios: CriteriosGUT) => {
    setFormData({ ...formData, criterios });
  };

  const handleJustificativaChange = (campo: 'gravidade' | 'urgencia' | 'tendencia', valor: string) => {
    if (campo === 'gravidade') {
      setFormData({ ...formData, justificativaGravidade: valor });
    } else if (campo === 'urgencia') {
      setFormData({ ...formData, justificativaUrgencia: valor });
    } else {
      setFormData({ ...formData, justificativaTendencia: valor });
    }
  };

  const handleResponsavelChange = (responsavelId: string) => {
    const colaborador = colaboradores.find((c) => c.id === responsavelId);
    setFormData({
      ...formData,
      responsavelId,
      responsavelNome: colaborador?.name || '',
    });
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      return !!(
        formData.titulo &&
        formData.problema &&
        formData.area &&
        formData.responsavelId
      );
    }
    if (currentStep === 2) {
      return !!(
        formData.justificativaGravidade &&
        formData.justificativaUrgencia &&
        formData.justificativaTendencia
      );
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async (submeterParaAprovacao = false) => {
    setIsLoading(true);
    try {
      const dataToSave: CreatePriorizacaoDTO = {
        ...formData,
        status: submeterParaAprovacao ? 'aguardando_aprovacao' : 'rascunho',
      } as CreatePriorizacaoDTO;

      await onSave(dataToSave);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Priorização de Problema</DialogTitle>
          <DialogDescription>
            Use a Matriz GUT para priorizar problemas e definir ações
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.id
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground hidden md:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Informações Básicas */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>
                    Título <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Título resumido do problema"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descrição detalhada (opcional)"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <VinculacaoSelector
                tipoVinculacao={formData.tipoVinculacao}
                obraId={formData.obraId}
                setorId={formData.setorId}
                onChange={handleVinculacaoChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>
                    Problema <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Descreva o problema identificado"
                    value={formData.problema}
                    onChange={(e) => setFormData({ ...formData, problema: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Área/Setor Afetado <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Ex: Produção - Soldagem"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Responsável <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.responsavelId} onValueChange={handleResponsavelChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {colaboradores.map((colab) => (
                        <SelectItem key={colab.id} value={colab.id}>
                          {colab.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Matriz GUT */}
          {currentStep === 2 && (
            <div>
              <GUTMatrixTable
                criterios={formData.criterios!}
                justificativas={{
                  gravidade: formData.justificativaGravidade || '',
                  urgencia: formData.justificativaUrgencia || '',
                  tendencia: formData.justificativaTendencia || '',
                }}
                onChange={handleCriteriosChange}
                onJustificativaChange={handleJustificativaChange}
              />
            </div>
          )}

          {/* Step 3: Revisão */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Título</div>
                  <div className="font-medium">{formData.titulo}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Problema</div>
                  <div>{formData.problema}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Área</div>
                    <div>{formData.area}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Responsável</div>
                    <div>{formData.responsavelNome}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Gravidade</div>
                    <div className="text-2xl font-bold">{formData.criterios?.gravidade}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Urgência</div>
                    <div className="text-2xl font-bold">{formData.criterios?.urgencia}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Tendência</div>
                    <div className="text-2xl font-bold">{formData.criterios?.tendencia}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações Adicionais</Label>
                <Textarea
                  placeholder="Informações complementares..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <Checkbox
                  id="acaoImediata"
                  checked={formData.acaoImediata}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, acaoImediata: checked as boolean })
                  }
                />
                <label
                  htmlFor="acaoImediata"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Marcar como AÇÃO IMEDIATA (problema crítico)
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious} disabled={isLoading}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button onClick={handleNext} disabled={!canGoNext() || isLoading}>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleSave(false)} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Rascunho
                </Button>
                <Button onClick={() => handleSave(true)} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Submeter para Aprovação
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
