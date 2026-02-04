import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Target,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CreateMetaSMARTDTO,
  VinculacaoGP,
  CriterioSMARTDetalhado,
  MilestoneMeta,
} from '@/interfaces/GestaoProcessosInterfaces';
import { VinculacaoSelector } from '../../components/VinculacaoSelector';
import MetaSMARTService from '@/services/gestaoProcessos/MetaSMARTService';
import { useToast } from '@/hooks/use-toast';

interface MetaSMARTDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const steps = [
  {
    id: 1,
    title: 'Informações Básicas',
    description: 'Defina o título, descrição e vinculação da meta',
  },
  {
    id: 2,
    title: 'Critérios SMART',
    description: 'Preencha os 5 critérios: Specific, Measurable, Attainable, Relevant, Time-bound',
  },
  {
    id: 3,
    title: 'Marcos Temporais',
    description: 'Defina os milestones e prazos',
  },
  {
    id: 4,
    title: 'Revisão',
    description: 'Revise todas as informações antes de salvar',
  },
];

export default function MetaSMARTDialog({ open, onOpenChange, onSuccess }: MetaSMARTDialogProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Informações Básicas
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [meta, setMeta] = useState('');
  const [contexto, setContexto] = useState('');
  const [vinculacao, setVinculacao] = useState<VinculacaoGP>({
    tipoVinculacao: 'independente',
  });

  // Step 2: Critérios SMART
  const [criterios, setCriterios] = useState<CriterioSMARTDetalhado[]>([
    {
      criterio: 'specific',
      atendido: true,
      descricao: '',
      evidencia: '',
    },
    {
      criterio: 'measurable',
      atendido: true,
      descricao: '',
      evidencia: '',
    },
    {
      criterio: 'attainable',
      atendido: true,
      descricao: '',
      evidencia: '',
    },
    {
      criterio: 'relevant',
      atendido: true,
      descricao: '',
      evidencia: '',
    },
    {
      criterio: 'timeBound',
      atendido: true,
      descricao: '',
      evidencia: '',
    },
  ]);

  // Specific
  const [oQue, setOQue] = useState('');
  const [quem, setQuem] = useState('');
  const [onde, setOnde] = useState('');

  // Measurable
  const [indicador, setIndicador] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('');
  const [valorAtual, setValorAtual] = useState<number>(0);
  const [valorMeta, setValorMeta] = useState<number>(0);
  const [formaAcompanhamento, setFormaAcompanhamento] = useState('');

  // Attainable
  const [recursos, setRecursos] = useState<string[]>(['']);
  const [viabilidade, setViabilidade] = useState('');
  const [limitacoes, setLimitacoes] = useState('');

  // Relevant
  const [alinhamentoEstrategico, setAlinhamentoEstrategico] = useState('');
  const [beneficios, setBeneficios] = useState<string[]>(['']);
  const [impacto, setImpacto] = useState('');

  // Time-bound
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [milestones, setMilestones] = useState<Omit<MilestoneMeta, 'id'>[]>([
    {
      descricao: '',
      dataPrevisao: '',
      status: 'pendente',
      responsavelId: '',
      responsavelNome: '',
    },
  ]);

  const handleReset = () => {
    setCurrentStep(1);
    setTitulo('');
    setDescricao('');
    setMeta('');
    setContexto('');
    setVinculacao({ tipoVinculacao: 'independente' });
    setCriterios([
      { criterio: 'specific', atendido: true, descricao: '', evidencia: '' },
      { criterio: 'measurable', atendido: true, descricao: '', evidencia: '' },
      { criterio: 'attainable', atendido: true, descricao: '', evidencia: '' },
      { criterio: 'relevant', atendido: true, descricao: '', evidencia: '' },
      { criterio: 'timeBound', atendido: true, descricao: '', evidencia: '' },
    ]);
    setOQue('');
    setQuem('');
    setOnde('');
    setIndicador('');
    setUnidadeMedida('');
    setValorAtual(0);
    setValorMeta(0);
    setFormaAcompanhamento('');
    setRecursos(['']);
    setViabilidade('');
    setLimitacoes('');
    setAlinhamentoEstrategico('');
    setBeneficios(['']);
    setImpacto('');
    setDataInicio('');
    setDataFim('');
    setMilestones([
      { descricao: '', dataPrevisao: '', status: 'pendente', responsavelId: '', responsavelNome: '' },
    ]);
  };

  const handleSave = async (submeterAprovacao: boolean) => {
    try {
      setIsSaving(true);

      const data: CreateMetaSMARTDTO = {
        titulo,
        descricao,
        meta,
        contexto,
        ...vinculacao,
        criterios,
        especifico: {
          oQue,
          quem,
          onde: onde || undefined,
        },
        mensuravel: {
          indicador,
          unidadeMedida,
          valorAtual,
          valorMeta,
          formaAcompanhamento,
        },
        atingivel: {
          recursos: recursos.filter((r) => r.trim() !== ''),
          viabilidade,
          limitacoes: limitacoes || undefined,
        },
        relevante: {
          alinhamentoEstrategico,
          beneficios: beneficios.filter((b) => b.trim() !== ''),
          impacto,
        },
        temporal: {
          dataInicio,
          dataFim,
          milestones: milestones.filter((m) => m.descricao.trim() !== ''),
        },
        status: submeterAprovacao ? 'aguardando_aprovacao' : 'rascunho',
        criadoPorId: '1', // TODO: Pegar do contexto de autenticação
        criadoPorNome: 'João Silva', // TODO: Pegar do contexto de autenticação
      };

      await MetaSMARTService.create(data);

      toast({
        title: 'Sucesso',
        description: submeterAprovacao
          ? 'Meta criada e submetida para aprovação'
          : 'Meta salva como rascunho',
      });

      handleReset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a meta',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateCriterio = (
    index: number,
    field: keyof CriterioSMARTDetalhado,
    value: string | boolean
  ) => {
    const newCriterios = [...criterios];
    newCriterios[index] = { ...newCriterios[index], [field]: value };
    setCriterios(newCriterios);
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return titulo.trim() !== '' && meta.trim() !== '';
    }
    if (currentStep === 2) {
      return (
        oQue.trim() !== '' &&
        quem.trim() !== '' &&
        indicador.trim() !== '' &&
        valorMeta > valorAtual &&
        viabilidade.trim() !== '' &&
        alinhamentoEstrategico.trim() !== '' &&
        impacto.trim() !== ''
      );
    }
    if (currentStep === 3) {
      return (
        dataInicio !== '' &&
        dataFim !== '' &&
        milestones.some((m) => m.descricao.trim() !== '')
      );
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Nova Meta SMART
          </DialogTitle>
          <DialogDescription>
            Specific, Measurable, Attainable, Relevant, Time-bound
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    currentStep === step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <span className="text-xs mt-1 text-center max-w-[80px]">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-1 mx-2 transition-all',
                    currentStep > step.id ? 'bg-green-600' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Informações Básicas */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Ex: Reduzir índice de retrabalho em soldagem"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Breve descrição da meta..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Meta (Declaração SMART) <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Ex: Reduzir o índice de retrabalho em soldas de 15% para 5% em 3 meses"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Contexto</Label>
              <Textarea
                placeholder="Contexto ou justificativa para estabelecer esta meta..."
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                rows={3}
              />
            </div>

            <VinculacaoSelector
              tipoVinculacao={vinculacao.tipoVinculacao}
              obraId={vinculacao.obraId}
              setorId={vinculacao.setorId}
              onChange={setVinculacao}
            />
          </div>
        )}

        {/* Step 2: Critérios SMART */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Specific */}
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Específico (Specific)
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>
                    O Quê? <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="O que será alcançado?"
                    value={oQue}
                    onChange={(e) => setOQue(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Quem? <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Quem está envolvido?"
                    value={quem}
                    onChange={(e) => setQuem(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Onde?</Label>
                  <Input
                    placeholder="Onde será executado?"
                    value={onde}
                    onChange={(e) => setOnde(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Descrição do Critério</Label>
                  <Textarea
                    placeholder="Como este critério é atendido..."
                    value={criterios[0].descricao}
                    onChange={(e) => updateCriterio(0, 'descricao', e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Evidência</Label>
                  <Input
                    placeholder="Evidências que comprovam..."
                    value={criterios[0].evidencia}
                    onChange={(e) => updateCriterio(0, 'evidencia', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Measurable */}
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Mensurável (Measurable)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>
                    Indicador <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Nome do indicador"
                    value={indicador}
                    onChange={(e) => setIndicador(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Unidade de Medida <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="%, un, R$, etc"
                    value={unidadeMedida}
                    onChange={(e) => setUnidadeMedida(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Valor Atual</Label>
                  <Input
                    type="number"
                    value={valorAtual}
                    onChange={(e) => setValorAtual(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>
                    Valor Meta <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={valorMeta}
                    onChange={(e) => setValorMeta(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Forma de Acompanhamento</Label>
                  <Input
                    placeholder="Como será medido/acompanhado?"
                    value={formaAcompanhamento}
                    onChange={(e) => setFormaAcompanhamento(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Descrição do Critério</Label>
                  <Textarea
                    placeholder="Como este critério é atendido..."
                    value={criterios[1].descricao}
                    onChange={(e) => updateCriterio(1, 'descricao', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Attainable */}
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Atingível (Attainable)
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>Recursos Disponíveis</Label>
                  {recursos.map((recurso, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        placeholder="Descreva um recurso disponível"
                        value={recurso}
                        onChange={(e) => {
                          const newRecursos = [...recursos];
                          newRecursos[index] = e.target.value;
                          setRecursos(newRecursos);
                        }}
                      />
                      {recursos.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRecursos(recursos.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecursos([...recursos, ''])}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Recurso
                  </Button>
                </div>
                <div>
                  <Label>
                    Viabilidade <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Por que esta meta é viável/atingível?"
                    value={viabilidade}
                    onChange={(e) => setViabilidade(e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Limitações</Label>
                  <Textarea
                    placeholder="Limitações ou desafios identificados..."
                    value={limitacoes}
                    onChange={(e) => setLimitacoes(e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Descrição do Critério</Label>
                  <Textarea
                    placeholder="Como este critério é atendido..."
                    value={criterios[2].descricao}
                    onChange={(e) => updateCriterio(2, 'descricao', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Relevant */}
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Relevante (Relevant)
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>
                    Alinhamento Estratégico <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Como esta meta se alinha aos objetivos estratégicos?"
                    value={alinhamentoEstrategico}
                    onChange={(e) => setAlinhamentoEstrategico(e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Benefícios Esperados</Label>
                  {beneficios.map((beneficio, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        placeholder="Descreva um benefício esperado"
                        value={beneficio}
                        onChange={(e) => {
                          const newBeneficios = [...beneficios];
                          newBeneficios[index] = e.target.value;
                          setBeneficios(newBeneficios);
                        }}
                      />
                      {beneficios.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBeneficios(beneficios.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBeneficios([...beneficios, ''])}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Benefício
                  </Button>
                </div>
                <div>
                  <Label>
                    Impacto <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Qual o impacto esperado ao atingir esta meta?"
                    value={impacto}
                    onChange={(e) => setImpacto(e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Descrição do Critério</Label>
                  <Textarea
                    placeholder="Como este critério é atendido..."
                    value={criterios[3].descricao}
                    onChange={(e) => updateCriterio(3, 'descricao', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Time-bound - Milestones */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Temporal (Time-bound)
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>
                    Data Início <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Data Fim <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Descrição do Critério</Label>
                <Textarea
                  placeholder="Como este critério é atendido..."
                  value={criterios[4].descricao}
                  onChange={(e) => updateCriterio(4, 'descricao', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div>
              <Label>Marcos Temporais (Milestones)</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Defina os principais marcos intermediários para acompanhamento da meta
              </p>

              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">Milestone {index + 1}</Badge>
                      {milestones.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMilestones(milestones.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label>Descrição</Label>
                        <Input
                          placeholder="Ex: Contratar instrutor e preparar material"
                          value={milestone.descricao}
                          onChange={(e) => {
                            const newMilestones = [...milestones];
                            newMilestones[index].descricao = e.target.value;
                            setMilestones(newMilestones);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Data Previsão</Label>
                        <Input
                          type="date"
                          value={milestone.dataPrevisao}
                          onChange={(e) => {
                            const newMilestones = [...milestones];
                            newMilestones[index].dataPrevisao = e.target.value;
                            setMilestones(newMilestones);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Responsável</Label>
                        <Input
                          placeholder="Nome do responsável"
                          value={milestone.responsavelNome}
                          onChange={(e) => {
                            const newMilestones = [...milestones];
                            newMilestones[index].responsavelNome = e.target.value;
                            newMilestones[index].responsavelId = '1'; // TODO: Select real user
                            setMilestones(newMilestones);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setMilestones([
                    ...milestones,
                    {
                      descricao: '',
                      dataPrevisao: '',
                      status: 'pendente',
                      responsavelId: '',
                      responsavelNome: '',
                    },
                  ])
                }
                className="mt-3 w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Milestone
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Revisão */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Informações Básicas</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground">Título:</dt>
                  <dd>{titulo}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Meta:</dt>
                  <dd>{meta}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Vinculação:</dt>
                  <dd>
                    {vinculacao.tipoVinculacao === 'obra' && `Obra: ${vinculacao.obraNome}`}
                    {vinculacao.tipoVinculacao === 'setor' && `Setor: ${vinculacao.setorNome}`}
                    {vinculacao.tipoVinculacao === 'independente' && 'Independente'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Período</h3>
              <p className="text-sm">
                {dataInicio && dataFim
                  ? `${new Date(dataInicio).toLocaleDateString('pt-BR')} até ${new Date(
                      dataFim
                    ).toLocaleDateString('pt-BR')}`
                  : 'Não definido'}
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Milestones</h3>
              <p className="text-sm text-muted-foreground">
                {milestones.filter((m) => m.descricao.trim() !== '').length} marcos cadastrados
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Indicador</h3>
              <p className="text-sm">
                {indicador}: {valorAtual} → {valorMeta} {unidadeMedida}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={isSaving || !canProceed()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={isSaving || !canProceed()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submeter para Aprovação
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
