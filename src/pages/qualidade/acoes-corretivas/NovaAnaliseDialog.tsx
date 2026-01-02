import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { CincoPorquesForm } from './components/CincoPorquesForm';
import { IshikawaForm } from './components/IshikawaForm';
import { PlanoAcaoForm } from './components/PlanoAcaoForm';
import {
  AnaliseAcaoCorretiva,
  CincoPorques,
  DiagramaIshikawa,
  AcaoCorretiva,
} from '@/interfaces/QualidadeInterfaces';
import { NonConformity } from '@/interfaces/RncInterface';
import RncService from '@/services/NonConformityService';
import AnaliseAcaoCorretivaService from '@/services/AnaliseAcaoCorretivaService';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface NovaAnaliseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  rncId?: string;
}

const steps = [
  { id: 1, title: 'RNC e Método', description: 'Selecione a RNC e o método de análise' },
  { id: 2, title: 'Análise de Causa', description: 'Identifique a causa raiz' },
  { id: 3, title: 'Plano de Ação', description: 'Defina as ações corretivas' },
  { id: 4, title: 'Revisão', description: 'Revise e confirme' },
];

export const NovaAnaliseDialog = ({
  open,
  onOpenChange,
  onSuccess,
  rncId: rncIdProp,
}: NovaAnaliseDialogProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rncs, setRncs] = useState<NonConformity[]>([]);

  // Dados do formulário
  const [rncId, setRncId] = useState<string>(rncIdProp || '');
  const [metodoAnalise, setMetodoAnalise] = useState<'cinco_porques' | 'ishikawa' | 'ambos'>(
    'cinco_porques'
  );
  const [cincoPorques, setCincoPorques] = useState<CincoPorques | undefined>();
  const [ishikawa, setIshikawa] = useState<DiagramaIshikawa | undefined>();
  const [causaRaizIdentificada, setCausaRaizIdentificada] = useState<string>('');
  const [acoes, setAcoes] = useState<AcaoCorretiva[]>([]);

  useEffect(() => {
    if (open) {
      loadRncs();
      if (rncIdProp) {
        setRncId(rncIdProp);
      }
    }
  }, [open, rncIdProp]);

  const loadRncs = async () => {
    try {
      const data = await RncService.getAllRnc();
      // Filtrar apenas RNCs sem análise ainda
      setRncs(data);
    } catch (error) {
      console.error('Erro ao carregar RNCs:', error);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep === 2) {
        // Ao sair do passo 2, copiar a causa raiz para o campo principal
        if (metodoAnalise === 'cinco_porques' && cincoPorques?.causaRaiz) {
          setCausaRaizIdentificada(cincoPorques.causaRaiz);
        } else if (metodoAnalise === 'ishikawa' && ishikawa?.causaRaiz) {
          setCausaRaizIdentificada(ishikawa.causaRaiz);
        } else if (metodoAnalise === 'ambos') {
          // Combinar as causas raiz dos dois métodos
          const causas = [cincoPorques?.causaRaiz, ishikawa?.causaRaiz]
            .filter(Boolean)
            .join(' / ');
          setCausaRaizIdentificada(causas);
        }
      }
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!rncId) {
          toast({
            title: 'Atenção',
            description: 'Selecione uma RNC para análise',
            variant: 'destructive',
          });
          return false;
        }
        if (!metodoAnalise) {
          toast({
            title: 'Atenção',
            description: 'Selecione um método de análise',
            variant: 'destructive',
          });
          return false;
        }
        return true;

      case 2:
        if (metodoAnalise === 'cinco_porques' || metodoAnalise === 'ambos') {
          if (!cincoPorques?.problema || !cincoPorques?.porque1 || !cincoPorques?.causaRaiz) {
            toast({
              title: 'Atenção',
              description: 'Preencha pelo menos o problema, 1º Por quê e a causa raiz',
              variant: 'destructive',
            });
            return false;
          }
        }
        if (metodoAnalise === 'ishikawa' || metodoAnalise === 'ambos') {
          if (!ishikawa?.problema || !ishikawa?.causaRaiz) {
            toast({
              title: 'Atenção',
              description: 'Preencha o problema e a causa raiz no Diagrama de Ishikawa',
              variant: 'destructive',
            });
            return false;
          }
          const totalCausas = Object.values(ishikawa.categorias).reduce(
            (acc, arr) => acc + arr.length,
            0
          );
          if (totalCausas === 0) {
            toast({
              title: 'Atenção',
              description: 'Adicione pelo menos uma causa no Diagrama de Ishikawa',
              variant: 'destructive',
            });
            return false;
          }
        }
        return true;

      case 3:
        if (acoes.length === 0) {
          toast({
            title: 'Atenção',
            description: 'Adicione pelo menos uma ação corretiva',
            variant: 'destructive',
          });
          return false;
        }
        // Validar campos obrigatórios de cada ação
        for (const acao of acoes) {
          if (!acao.oQue || !acao.porque || !acao.quemId || !acao.quando || !acao.como) {
            toast({
              title: 'Atenção',
              description: 'Preencha todos os campos obrigatórios das ações (O quê, Por quê, Quem, Quando, Como)',
              variant: 'destructive',
            });
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const handleSave = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);

      const analise: Partial<AnaliseAcaoCorretiva> = {
        rncId,
        metodoAnalise,
        cincoPorques: metodoAnalise === 'cinco_porques' || metodoAnalise === 'ambos' ? cincoPorques : undefined,
        ishikawa: metodoAnalise === 'ishikawa' || metodoAnalise === 'ambos' ? ishikawa : undefined,
        causaRaizIdentificada,
        acoes,
      };

      await AnaliseAcaoCorretivaService.create(analise);

      toast({
        title: 'Sucesso!',
        description: 'Análise e ações corretivas criadas com sucesso',
      });

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a análise. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    if (!rncIdProp) setRncId('');
    setMetodoAnalise('cinco_porques');
    setCincoPorques(undefined);
    setIshikawa(undefined);
    setCausaRaizIdentificada('');
    setAcoes([]);
  };

  const rncSelecionada = rncs.find((r) => r.id === rncId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Análise e Ações Corretivas</DialogTitle>
          <DialogDescription>
            Analise a causa raiz e defina ações corretivas para resolver a não-conformidade
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep > step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentStep === step.id
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="text-center mt-2 hidden sm:block">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 transition-colors ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Conteúdo dos Steps */}
        <div className="min-h-[400px]">
          {/* Step 1: Seleção de RNC e Método */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Selecione a RNC para análise</Label>
                    <Select value={rncId} onValueChange={setRncId} disabled={!!rncIdProp}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma não-conformidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {rncs.map((rnc) => (
                          <SelectItem key={rnc.id} value={rnc.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">#{rnc.code}</Badge>
                              <span>{rnc.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {rncSelecionada && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="font-semibold">RNC Selecionada:</div>
                      <div className="text-sm">
                        <strong>Código:</strong> #{rncSelecionada.code}
                      </div>
                      <div className="text-sm">
                        <strong>Descrição:</strong> {rncSelecionada.description}
                      </div>
                      <div className="text-sm">
                        <strong>Obra:</strong> {rncSelecionada.project?.name}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Label className="text-base mb-4 block">Método de Análise de Causa Raiz</Label>
                  <RadioGroup value={metodoAnalise} onValueChange={(v: any) => setMetodoAnalise(v)}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="cinco_porques" id="cinco_porques" />
                        <div className="flex-1">
                          <Label htmlFor="cinco_porques" className="cursor-pointer font-semibold">
                            5 Porquês
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Pergunte "Por quê?" sucessivamente para identificar a causa raiz
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="ishikawa" id="ishikawa" />
                        <div className="flex-1">
                          <Label htmlFor="ishikawa" className="cursor-pointer font-semibold">
                            Diagrama de Ishikawa (6M's)
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Organize causas em 6 categorias: Método, Máquina, Mão de Obra, Material, Meio Ambiente, Medida
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                        <RadioGroupItem value="ambos" id="ambos" />
                        <div className="flex-1">
                          <Label htmlFor="ambos" className="cursor-pointer font-semibold">
                            Ambos os Métodos
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Combine os dois métodos para uma análise mais completa
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Análise de Causa Raiz */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {(metodoAnalise === 'cinco_porques' || metodoAnalise === 'ambos') && (
                <CincoPorquesForm value={cincoPorques} onChange={setCincoPorques} />
              )}

              {metodoAnalise === 'ambos' && <div className="h-px bg-border" />}

              {(metodoAnalise === 'ishikawa' || metodoAnalise === 'ambos') && (
                <IshikawaForm value={ishikawa} onChange={setIshikawa} />
              )}
            </div>
          )}

          {/* Step 3: Plano de Ação */}
          {currentStep === 3 && (
            <PlanoAcaoForm value={acoes} onChange={setAcoes} />
          )}

          {/* Step 4: Revisão */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <strong>Atenção:</strong> Revise todos os dados antes de salvar. Após salvar, a análise será vinculada à RNC e as ações corretivas serão criadas.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <strong>RNC:</strong> #{rncSelecionada?.code} - {rncSelecionada?.description}
                    </div>
                    <div>
                      <strong>Método:</strong>{' '}
                      {metodoAnalise === 'cinco_porques'
                        ? '5 Porquês'
                        : metodoAnalise === 'ishikawa'
                        ? 'Diagrama de Ishikawa'
                        : 'Ambos (5 Porquês + Ishikawa)'}
                    </div>
                    <div>
                      <strong>Causa Raiz:</strong> {causaRaizIdentificada}
                    </div>
                    <div>
                      <strong>Ações Corretivas:</strong> {acoes.length} ação(ões) definida(s)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Botões de Navegação */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="text-sm text-muted-foreground">
            Passo {currentStep} de {steps.length}
          </div>

          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={loading}>
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Análise'}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
