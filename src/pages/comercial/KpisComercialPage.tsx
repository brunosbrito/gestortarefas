import { useState, useMemo, useCallback } from 'react';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Target,
  DollarSign,
  FileText,
  ArrowRight,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Trash2,
  AlertCircle,
  TrendingDown,
  HelpCircle,
  ClipboardList,
  Pencil,
} from 'lucide-react';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { formatCurrency } from '@/lib/currency';
import { Orcamento } from '@/interfaces/OrcamentoInterface';
import { cn } from '@/lib/utils';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Metas {
  qtdOrcamentos: number;
  valorOrcamentos: number;
  taxaConversao: number;
  margemBruta: { min: number; max: number };
  margemLiquida: { min: number; max: number };
  acoes5S: number;
}

interface Acao5S {
  id: string;
  data: string;
  descricao: string;
  mes: string; // "YYYY-MM"
}

interface PlanoAcao {
  id: string;
  kpi: string;
  kpiLabel: string;
  mes: string;
  metodologia: '5W2H' | 'PDCA';
  criadoEm: string;
  // 5W2H
  oQue?: string;
  porQue?: string;
  quem?: string;
  quando?: string;
  onde?: string;
  como?: string;
  quantoCusta?: string;
  // PDCA
  plan?: string;
  do?: string;
  check?: string;
  act?: string;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const METAS_KEY = 'kpi_comercial_metas_v1';
const ACOES_5S_KEY = 'kpi_comercial_5s_v1';
const PLANOS_KEY = 'kpi_comercial_planos_v1';

const METAS_PADRAO: Metas = {
  qtdOrcamentos: 10,
  valorOrcamentos: 6_000_000,
  taxaConversao: 10,
  margemBruta: { min: 20, max: 25 },
  margemLiquida: { min: 10, max: 15 },
  acoes5S: 3,
};

const NOMES_MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

// Textos dos tooltips de cada KPI
const KPI_TOOLTIPS: Record<string, string> = {
  qtdOrcamentos:
    'Conta os orçamentos criados neste mês (filtro: data de criação). Semáforo: Verde ≥ meta · Amarelo ≥ 80% da meta · Vermelho < 80%',
  valorOrcamentos:
    'Soma do valor de venda (totalVenda) dos orçamentos criados neste mês. Semáforo: Verde ≥ meta · Amarelo ≥ 80% · Vermelho < 80%',
  taxaConversao:
    'Aprovados ÷ (Aprovados + Rejeitados) × 100. Filtro: data da decisão (updatedAt). Exclui rascunhos e em análise — considera apenas orçamentos com decisão final no mês. Semáforo: Verde ≥ meta · Amarelo ≥ 80% · Vermelho < 80%',
  margemBruta:
    'Σ BDI ÷ Σ Receita Líquida × 100. Somente orçamentos aprovados neste mês. A receita líquida já inclui o BDI; esta margem representa o percentual comercial antes dos impostos. Semáforo: Verde = dentro do intervalo meta · Amarelo = 80–99% do mínimo · Vermelho < 80%',
  margemLiquida:
    'Σ (Custo Direto × % Lucro) ÷ Σ Total Venda × 100. Somente aprovados com o componente Lucro habilitado em Dados Gerais → BDI Detalhado. Semáforo: Verde = dentro do intervalo meta · Amarelo = 80–99% · Vermelho < 80%',
  acoes5S:
    'Ações 5S registradas manualmente neste mês. Armazenadas localmente neste dispositivo. Semáforo: Verde ≥ meta · Amarelo ≥ 80% da meta · Vermelho < 80%',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMesAno(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function isMesmoMes(isoDate: string | undefined, mesAno: string): boolean {
  if (!isoDate) return false;
  return isoDate.startsWith(mesAno);
}

function mesAnterior(mesAno: string): string {
  const [ano, mes] = mesAno.split('-').map(Number);
  const d = new Date(ano, mes - 2, 1);
  return formatMesAno(d);
}

function proximoMes(mesAno: string): string {
  const [ano, mes] = mesAno.split('-').map(Number);
  const d = new Date(ano, mes, 1);
  return formatMesAno(d);
}

function labelMesAno(mesAno: string): string {
  const [ano, mes] = mesAno.split('-').map(Number);
  return `${NOMES_MESES[mes - 1]}/${String(ano).slice(2)}`;
}

function loadMetas(): Metas {
  try {
    const stored = localStorage.getItem(METAS_KEY);
    if (stored) return { ...METAS_PADRAO, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return METAS_PADRAO;
}

function saveMetas(metas: Metas): void {
  localStorage.setItem(METAS_KEY, JSON.stringify(metas));
}

function loadAcoes5S(): Acao5S[] {
  try {
    const stored = localStorage.getItem(ACOES_5S_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveAcoes5S(acoes: Acao5S[]): void {
  localStorage.setItem(ACOES_5S_KEY, JSON.stringify(acoes));
}

function loadPlanos(): PlanoAcao[] {
  try {
    const stored = localStorage.getItem(PLANOS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function savePlanos(planos: PlanoAcao[]): void {
  localStorage.setItem(PLANOS_KEY, JSON.stringify(planos));
}

function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Cálculos de KPIs ────────────────────────────────────────────────────────

interface KpiValores {
  qtdOrcamentos: number;
  valorOrcamentos: number;
  taxaConversao: number | null;
  margemBruta: number | null;
  margemLiquida: number | null;
  acoes5S: number;
}

function calcularKpis(
  orcamentos: Orcamento[],
  acoes5S: Acao5S[],
  mesAno: string
): KpiValores {
  const orcMes = orcamentos.filter((o) => isMesmoMes(o.createdAt, mesAno));
  const qtdOrcamentos = orcMes.length;
  const valorOrcamentos = orcMes.reduce((s, o) => s + (o.totalVenda || 0), 0);

  const decididos = orcamentos.filter(
    (o) =>
      isMesmoMes(o.updatedAt, mesAno) &&
      (o.status === 'aprovado' || o.status === 'rejeitado')
  );
  const aprovadosMes = decididos.filter((o) => o.status === 'aprovado');
  const taxaConversao =
    decididos.length > 0 ? (aprovadosMes.length / decididos.length) * 100 : null;

  const somaReceitaLiquida = aprovadosMes.reduce((s, o) => s + (o.dre?.receitaLiquida || 0), 0);
  const somaBdiTotal = aprovadosMes.reduce((s, o) => s + (o.bdiTotal || 0), 0);
  const margemBruta = somaReceitaLiquida > 0 ? (somaBdiTotal / somaReceitaLiquida) * 100 : null;

  const aprovadosComLucro = aprovadosMes.filter(
    (o) =>
      o.configuracoesDetalhadas?.bdi?.lucro?.habilitado === true &&
      (o.configuracoesDetalhadas?.bdi?.lucro?.percentual ?? 0) > 0
  );
  let margemLiquida: number | null = null;
  if (aprovadosComLucro.length > 0) {
    const somaLucro = aprovadosComLucro.reduce((s, o) => {
      const pct = o.configuracoesDetalhadas!.bdi!.lucro!.percentual;
      return s + (o.custoDirectoTotal || 0) * (pct / 100);
    }, 0);
    const somaTotalVenda = aprovadosComLucro.reduce((s, o) => s + (o.totalVenda || 0), 0);
    margemLiquida = somaTotalVenda > 0 ? (somaLucro / somaTotalVenda) * 100 : null;
  }

  const acoes5SMes = acoes5S.filter((a) => a.mes === mesAno).length;

  return { qtdOrcamentos, valorOrcamentos, taxaConversao, margemBruta, margemLiquida, acoes5S: acoes5SMes };
}

// ─── Semáforo ─────────────────────────────────────────────────────────────────

type StatusKpi = 'verde' | 'amarelo' | 'vermelho' | 'sem_dados';

function statusSimples(valor: number | null, meta: number): StatusKpi {
  if (valor === null) return 'sem_dados';
  if (valor >= meta) return 'verde';
  if (valor >= meta * 0.8) return 'amarelo';
  return 'vermelho';
}

function statusIntervalo(valor: number | null, min: number, max: number): StatusKpi {
  if (valor === null) return 'sem_dados';
  if (valor >= min && valor <= max) return 'verde';
  if (valor > max * 1.2) return 'amarelo';
  if (valor >= min * 0.8) return 'amarelo';
  return 'vermelho';
}

function corStatus(status: StatusKpi) {
  switch (status) {
    case 'verde':
      return {
        border: 'border-l-green-500',
        bg: 'bg-green-50 dark:bg-green-950/20',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: 'Meta atingida',
      };
    case 'amarelo':
      return {
        border: 'border-l-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-950/20',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: 'Atenção',
      };
    case 'vermelho':
      return {
        border: 'border-l-red-500',
        bg: 'bg-red-50 dark:bg-red-950/20',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: 'Abaixo da meta',
      };
    default:
      return {
        border: 'border-l-gray-300',
        bg: 'bg-gray-50 dark:bg-gray-900/40',
        badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        label: 'Sem dados',
      };
  }
}

// ─── Componente KPI Card ──────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>;
  titulo: string;
  tooltip: string;
  valor: string;
  meta: string;
  status: StatusKpi;
  progresso: number;
  delta?: { valor: string; positivo: boolean } | null;
  semDados?: boolean;
  avisoSemDados?: string;
  temPlano?: boolean;
  onCriarPlano?: () => void;
}

const KpiCard = ({
  icon: Icon,
  titulo,
  tooltip,
  valor,
  meta,
  status,
  progresso,
  delta,
  semDados,
  avisoSemDados,
  temPlano,
  onCriarPlano,
}: KpiCardProps) => {
  const cor = corStatus(status);
  const mostrarPlano = (status === 'amarelo' || status === 'vermelho') && !semDados;

  return (
    <Card className={cn('border-l-4 transition-all', cor.border, cor.bg)}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{titulo}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs leading-relaxed">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', cor.badge)}>
            {cor.label}
          </span>
        </div>

        {semDados ? (
          <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{avisoSemDados}</p>
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold tracking-tight">{valor}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Meta: {meta}</p>

            {delta && (
              <div className={cn('flex items-center gap-1 text-xs mt-1', delta.positivo ? 'text-green-600' : 'text-red-500')}>
                {delta.positivo ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{delta.valor} vs mês anterior</span>
              </div>
            )}

            <Progress value={Math.min(progresso, 100)} className="mt-2 h-1.5" />
          </>
        )}

        {mostrarPlano && (
          <div className="mt-3 pt-2 border-t border-dashed border-current/20 flex items-center justify-between">
            {temPlano ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ClipboardList className="w-3 h-3" /> Plano registrado
              </span>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Meta não atingida
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 gap-1"
              onClick={onCriarPlano}
            >
              <Plus className="w-3 h-3" />
              {temPlano ? 'Novo Plano' : 'Criar Plano de Ação'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Dialog Editar Metas ──────────────────────────────────────────────────────

interface DialogMetasProps {
  open: boolean;
  metas: Metas;
  onSave: (m: Metas) => void;
  onClose: () => void;
}

const DialogMetas = ({ open, metas, onSave, onClose }: DialogMetasProps) => {
  const [form, setForm] = useState<Metas>(metas);

  const handleOpen = (val: boolean) => {
    if (val) setForm(metas);
    else onClose();
  };

  const n = (v: string) => {
    const parsed = parseFloat(v.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Metas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Qtd Orçamentos / mês</Label>
            <Input type="number" value={form.qtdOrcamentos}
              onChange={(e) => setForm({ ...form, qtdOrcamentos: n(e.target.value) })} />
          </div>
          <div className="space-y-1">
            <Label>Valor Orçamentos (R$)</Label>
            <Input type="number" value={form.valorOrcamentos}
              onChange={(e) => setForm({ ...form, valorOrcamentos: n(e.target.value) })} />
          </div>
          <div className="space-y-1">
            <Label>Taxa de Conversão (%)</Label>
            <Input type="number" value={form.taxaConversao}
              onChange={(e) => setForm({ ...form, taxaConversao: n(e.target.value) })} />
          </div>
          <div className="space-y-1">
            <Label>Margem Bruta — Mín / Máx (%)</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="Mín" value={form.margemBruta.min}
                onChange={(e) => setForm({ ...form, margemBruta: { ...form.margemBruta, min: n(e.target.value) } })} />
              <Input type="number" placeholder="Máx" value={form.margemBruta.max}
                onChange={(e) => setForm({ ...form, margemBruta: { ...form.margemBruta, max: n(e.target.value) } })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Margem Líquida — Mín / Máx (%)</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="Mín" value={form.margemLiquida.min}
                onChange={(e) => setForm({ ...form, margemLiquida: { ...form.margemLiquida, min: n(e.target.value) } })} />
              <Input type="number" placeholder="Máx" value={form.margemLiquida.max}
                onChange={(e) => setForm({ ...form, margemLiquida: { ...form.margemLiquida, max: n(e.target.value) } })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Ações 5S / mês</Label>
            <Input type="number" value={form.acoes5S}
              onChange={(e) => setForm({ ...form, acoes5S: n(e.target.value) })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onSave(form); onClose(); }}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Dialog Plano de Ação ─────────────────────────────────────────────────────

interface DialogPlanoProps {
  open: boolean;
  kpiLabel: string;
  editando: PlanoAcao | null;
  onSave: (plano: Omit<PlanoAcao, 'id' | 'criadoEm'>) => void;
  onClose: () => void;
}

const CAMPOS_5W2H: { key: keyof PlanoAcao; label: string; placeholder: string }[] = [
  { key: 'oQue', label: 'O quê? (What)', placeholder: 'O que precisa ser feito?' },
  { key: 'porQue', label: 'Por quê? (Why)', placeholder: 'Por que esta ação é necessária?' },
  { key: 'quem', label: 'Quem? (Who)', placeholder: 'Quem é o responsável?' },
  { key: 'quando', label: 'Quando? (When)', placeholder: 'Qual o prazo para execução?' },
  { key: 'onde', label: 'Onde? (Where)', placeholder: 'Onde será executado?' },
  { key: 'como', label: 'Como? (How)', placeholder: 'Como será executado?' },
  { key: 'quantoCusta', label: 'Quanto custa? (How much)', placeholder: 'Qual o custo estimado?' },
];

const CAMPOS_PDCA: { key: keyof PlanoAcao; label: string; placeholder: string }[] = [
  { key: 'plan', label: 'Planejar (Plan)', placeholder: 'O que precisa ser feito? Qual o objetivo?' },
  { key: 'do', label: 'Executar (Do)', placeholder: 'Quais ações concretas serão realizadas?' },
  { key: 'check', label: 'Verificar (Check)', placeholder: 'Como medir o resultado?' },
  { key: 'act', label: 'Agir (Act)', placeholder: 'O que ajustar com base nos resultados?' },
];

const DialogPlano = ({ open, kpiLabel, editando, onSave, onClose }: DialogPlanoProps) => {
  const [metodologia, setMetodologia] = useState<'5W2H' | 'PDCA'>(editando?.metodologia ?? '5W2H');
  const [form, setForm] = useState<Partial<PlanoAcao>>(editando ?? {});

  // Sincronizar quando dialog abre com dados de edição
  const handleOpen = (val: boolean) => {
    if (val) {
      setMetodologia(editando?.metodologia ?? '5W2H');
      setForm(editando ?? {});
    } else {
      onClose();
    }
  };

  const f = (key: keyof PlanoAcao) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSalvar = () => {
    onSave({ ...form, metodologia } as Omit<PlanoAcao, 'id' | 'criadoEm'>);
    onClose();
  };

  const campos = metodologia === '5W2H' ? CAMPOS_5W2H : CAMPOS_PDCA;
  const temConteudo = campos.some((c) => !!(form[c.key] as string | undefined)?.trim());

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editando ? 'Editar Plano' : 'Criar Plano de Ação'} — {kpiLabel}
          </DialogTitle>
        </DialogHeader>

        {/* Seleção de metodologia */}
        <div className="py-2">
          <Label className="mb-2 block text-sm">Metodologia</Label>
          <RadioGroup
            value={metodologia}
            onValueChange={(v) => setMetodologia(v as '5W2H' | 'PDCA')}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="5W2H" id="met-5w2h" />
              <Label htmlFor="met-5w2h" className="cursor-pointer font-medium">5W2H</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="PDCA" id="met-pdca" />
              <Label htmlFor="met-pdca" className="cursor-pointer font-medium">PDCA</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Campos da metodologia */}
        <ScrollArea className="max-h-[55vh] pr-3">
          <div className="space-y-3 pb-1">
            {campos.map((campo) => (
              <div key={String(campo.key)} className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {campo.label}
                </Label>
                <Textarea
                  placeholder={campo.placeholder}
                  rows={2}
                  value={(form[campo.key] as string | undefined) ?? ''}
                  onChange={f(campo.key)}
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={!temConteudo}>Salvar Plano</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────

const KpisComercialPage = () => {
  const hoje = new Date();
  const [mesAno, setMesAno] = useState(() => formatMesAno(hoje));
  const [metas, setMetas] = useState<Metas>(loadMetas);
  const [acoes5S, setAcoes5S] = useState<Acao5S[]>(loadAcoes5S);
  const [planos, setPlanos] = useState<PlanoAcao[]>(loadPlanos);

  // Dialogs
  const [dialogMetasOpen, setDialogMetasOpen] = useState(false);
  const [dialogAcaoOpen, setDialogAcaoOpen] = useState(false);
  const [novaAcaoData, setNovaAcaoData] = useState(hoje.toISOString().split('T')[0]);
  const [novaAcaoDescricao, setNovaAcaoDescricao] = useState('');
  const [acaoParaExcluir, setAcaoParaExcluir] = useState<string | null>(null);

  // Plano de Ação
  const [dialogPlanoOpen, setDialogPlanoOpen] = useState(false);
  const [planoKpi, setPlanoKpi] = useState<{ kpi: string; label: string }>({ kpi: '', label: '' });
  const [planoEditando, setPlanoEditando] = useState<PlanoAcao | null>(null);
  const [planoParaExcluir, setPlanoParaExcluir] = useState<string | null>(null);

  const { data: orcamentos = [], isLoading, error, refetch } = useOrcamentos();

  // ── KPIs ──
  const kpis = useMemo(() => calcularKpis(orcamentos, acoes5S, mesAno), [orcamentos, acoes5S, mesAno]);
  const mesAnt = mesAnterior(mesAno);
  const kpisAnt = useMemo(() => calcularKpis(orcamentos, acoes5S, mesAnt), [orcamentos, acoes5S, mesAnt]);

  // ── Gráfico ──
  const dadosGrafico = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const offset = 5 - i;
      const [ano, mes] = mesAno.split('-').map(Number);
      const d = new Date(ano, mes - 1 - offset, 1);
      const m = formatMesAno(d);
      const orcMes = orcamentos.filter((o) => isMesmoMes(o.createdAt, m));
      return {
        mes: labelMesAno(m),
        qtd: orcMes.length,
        valor: orcMes.reduce((s, o) => s + (o.totalVenda || 0), 0) / 1_000_000,
      };
    });
  }, [orcamentos, mesAno]);

  // ── Listas filtradas pelo mês ──
  const acoes5SMes = useMemo(() => acoes5S.filter((a) => a.mes === mesAno), [acoes5S, mesAno]);
  const planosMes = useMemo(() => planos.filter((p) => p.mes === mesAno), [planos, mesAno]);

  // Verificar se há plano para cada KPI no mês
  const temPlanoKpi = useCallback(
    (kpi: string) => planosMes.some((p) => p.kpi === kpi),
    [planosMes]
  );

  // ── Handlers 5S ──
  const handleSalvarMetas = useCallback((novasMetas: Metas) => {
    setMetas(novasMetas);
    saveMetas(novasMetas);
  }, []);

  const handleRegistrarAcao = useCallback(() => {
    if (!novaAcaoDescricao.trim()) return;
    const nova: Acao5S = {
      id: gerarId(),
      data: novaAcaoData,
      descricao: novaAcaoDescricao.trim(),
      mes: novaAcaoData.slice(0, 7),
    };
    const novas = [...acoes5S, nova];
    setAcoes5S(novas);
    saveAcoes5S(novas);
    setNovaAcaoDescricao('');
    setNovaAcaoData(hoje.toISOString().split('T')[0]);
    setDialogAcaoOpen(false);
  }, [acoes5S, novaAcaoData, novaAcaoDescricao, hoje]);

  const handleExcluirAcao = useCallback((id: string) => {
    const novas = acoes5S.filter((a) => a.id !== id);
    setAcoes5S(novas);
    saveAcoes5S(novas);
    setAcaoParaExcluir(null);
  }, [acoes5S]);

  // ── Handlers Plano de Ação ──
  const handleAbrirPlano = useCallback((kpi: string, label: string, editando?: PlanoAcao) => {
    setPlanoKpi({ kpi, label });
    setPlanoEditando(editando ?? null);
    setDialogPlanoOpen(true);
  }, []);

  const handleSalvarPlano = useCallback((dados: Omit<PlanoAcao, 'id' | 'criadoEm'>) => {
    if (planoEditando) {
      const atualizados = planos.map((p) =>
        p.id === planoEditando.id ? { ...planoEditando, ...dados } : p
      );
      setPlanos(atualizados);
      savePlanos(atualizados);
    } else {
      const novo: PlanoAcao = {
        ...dados,
        id: gerarId(),
        kpi: planoKpi.kpi,
        kpiLabel: planoKpi.label,
        mes: mesAno,
        criadoEm: new Date().toISOString(),
      };
      const novos = [...planos, novo];
      setPlanos(novos);
      savePlanos(novos);
    }
  }, [planoEditando, planos, planoKpi, mesAno]);

  const handleExcluirPlano = useCallback((id: string) => {
    const novos = planos.filter((p) => p.id !== id);
    setPlanos(novos);
    savePlanos(novos);
    setPlanoParaExcluir(null);
  }, [planos]);

  // ── Deltas ──
  function deltaNum(atual: number | null, anterior: number | null, unidade = '') {
    if (atual === null || anterior === null) return null;
    const diff = atual - anterior;
    if (diff === 0) return null;
    const positivo = diff > 0;
    const abs = Math.abs(diff);
    const str = unidade === 'R$'
      ? `${positivo ? '+' : '-'}${formatCurrency(abs)}`
      : unidade === '%'
      ? `${positivo ? '+' : ''}${diff.toFixed(1)} p.p.`
      : `${positivo ? '+' : ''}${diff}`;
    return { valor: str, positivo };
  }

  // ── Status ──
  const statusQtd = statusSimples(kpis.qtdOrcamentos, metas.qtdOrcamentos);
  const statusValor = statusSimples(kpis.valorOrcamentos, metas.valorOrcamentos);
  const statusTaxa = kpis.taxaConversao === null ? 'sem_dados' : statusSimples(kpis.taxaConversao, metas.taxaConversao);
  const statusMB = kpis.margemBruta === null ? 'sem_dados' : statusIntervalo(kpis.margemBruta, metas.margemBruta.min, metas.margemBruta.max);
  const statusML = kpis.margemLiquida === null ? 'sem_dados' : statusIntervalo(kpis.margemLiquida, metas.margemLiquida.min, metas.margemLiquida.max);
  const status5S = statusSimples(kpis.acoes5S, metas.acoes5S);

  const prog = (v: number | null, meta: number) => v === null ? 0 : Math.min((v / meta) * 100, 120);

  return (
    <Layout>
      <PageContainer loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch}>
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">KPIs Comercial</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Indicadores de desempenho mensais</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setMesAno(mesAnterior(mesAno))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[100px] text-center">
              {NOMES_MESES[parseInt(mesAno.split('-')[1]) - 1]} {mesAno.split('-')[0]}
            </span>
            <Button variant="outline" size="icon" onClick={() => setMesAno(proximoMes(mesAno))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="ml-2 gap-1.5" onClick={() => setDialogMetasOpen(true)}>
              <Settings className="w-4 h-4" />
              Editar Metas
            </Button>
          </div>
        </div>

        {/* ── Grid de KPIs ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <KpiCard
            icon={FileText}
            titulo="Qtd Orçamentos"
            tooltip={KPI_TOOLTIPS.qtdOrcamentos}
            valor={String(kpis.qtdOrcamentos)}
            meta={`${metas.qtdOrcamentos} / mês`}
            status={statusQtd}
            progresso={prog(kpis.qtdOrcamentos, metas.qtdOrcamentos)}
            delta={deltaNum(kpis.qtdOrcamentos, kpisAnt.qtdOrcamentos)}
            temPlano={temPlanoKpi('qtdOrcamentos')}
            onCriarPlano={() => handleAbrirPlano('qtdOrcamentos', 'Qtd Orçamentos')}
          />
          <KpiCard
            icon={DollarSign}
            titulo="Valor Orçado"
            tooltip={KPI_TOOLTIPS.valorOrcamentos}
            valor={formatCurrency(kpis.valorOrcamentos)}
            meta={formatCurrency(metas.valorOrcamentos)}
            status={statusValor}
            progresso={prog(kpis.valorOrcamentos, metas.valorOrcamentos)}
            delta={deltaNum(kpis.valorOrcamentos, kpisAnt.valorOrcamentos, 'R$')}
            temPlano={temPlanoKpi('valorOrcamentos')}
            onCriarPlano={() => handleAbrirPlano('valorOrcamentos', 'Valor Orçado')}
          />
          <KpiCard
            icon={ArrowRight}
            titulo="Taxa de Conversão"
            tooltip={KPI_TOOLTIPS.taxaConversao}
            valor={kpis.taxaConversao !== null ? `${kpis.taxaConversao.toFixed(1)}%` : '—'}
            meta={`${metas.taxaConversao}%`}
            status={statusTaxa as StatusKpi}
            progresso={prog(kpis.taxaConversao, metas.taxaConversao)}
            delta={kpis.taxaConversao !== null && kpisAnt.taxaConversao !== null
              ? deltaNum(kpis.taxaConversao, kpisAnt.taxaConversao, '%') : null}
            semDados={kpis.taxaConversao === null}
            avisoSemDados="Sem orçamentos aprovados ou rejeitados neste mês."
            temPlano={temPlanoKpi('taxaConversao')}
            onCriarPlano={() => handleAbrirPlano('taxaConversao', 'Taxa de Conversão')}
          />
          <KpiCard
            icon={TrendingUp}
            titulo="Margem Bruta"
            tooltip={KPI_TOOLTIPS.margemBruta}
            valor={kpis.margemBruta !== null ? `${kpis.margemBruta.toFixed(1)}%` : '—'}
            meta={`${metas.margemBruta.min}% – ${metas.margemBruta.max}%`}
            status={statusMB as StatusKpi}
            progresso={kpis.margemBruta !== null ? Math.min((kpis.margemBruta / metas.margemBruta.max) * 100, 120) : 0}
            delta={kpis.margemBruta !== null && kpisAnt.margemBruta !== null
              ? deltaNum(kpis.margemBruta, kpisAnt.margemBruta, '%') : null}
            semDados={kpis.margemBruta === null}
            avisoSemDados="Sem orçamentos aprovados neste mês."
            temPlano={temPlanoKpi('margemBruta')}
            onCriarPlano={() => handleAbrirPlano('margemBruta', 'Margem Bruta')}
          />
          <KpiCard
            icon={Target}
            titulo="Margem Líquida"
            tooltip={KPI_TOOLTIPS.margemLiquida}
            valor={kpis.margemLiquida !== null ? `${kpis.margemLiquida.toFixed(1)}%` : '—'}
            meta={`${metas.margemLiquida.min}% – ${metas.margemLiquida.max}%`}
            status={statusML as StatusKpi}
            progresso={kpis.margemLiquida !== null ? Math.min((kpis.margemLiquida / metas.margemLiquida.max) * 100, 120) : 0}
            delta={kpis.margemLiquida !== null && kpisAnt.margemLiquida !== null
              ? deltaNum(kpis.margemLiquida, kpisAnt.margemLiquida, '%') : null}
            semDados={kpis.margemLiquida === null}
            avisoSemDados="Configure o componente Lucro no BDI Detalhado (aba Dados Gerais) para calcular esta margem."
            temPlano={temPlanoKpi('margemLiquida')}
            onCriarPlano={() => handleAbrirPlano('margemLiquida', 'Margem Líquida')}
          />
          <KpiCard
            icon={CheckSquare}
            titulo="Ações 5S"
            tooltip={KPI_TOOLTIPS.acoes5S}
            valor={String(kpis.acoes5S)}
            meta={`${metas.acoes5S} / mês`}
            status={status5S}
            progresso={prog(kpis.acoes5S, metas.acoes5S)}
            delta={deltaNum(kpis.acoes5S, kpisAnt.acoes5S)}
            temPlano={temPlanoKpi('acoes5S')}
            onCriarPlano={() => handleAbrirPlano('acoes5S', 'Ações 5S')}
          />
        </div>

        {/* ── Gráfico de Tendência ── */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tendência — Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={dadosGrafico} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="qtd" orientation="left" tick={{ fontSize: 12 }}
                  label={{ value: 'Qtd', angle: -90, position: 'insideLeft', offset: 12, style: { fontSize: 11 } }} />
                <YAxis yAxisId="valor" orientation="right" tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `R$${(v as number).toFixed(1)}M`} />
                <RechartsTooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Qtd') return [value, 'Orçamentos'];
                    return [`R$ ${(value as number).toFixed(2)}M`, 'Valor Total'];
                  }}
                />
                <Legend />
                <ReferenceLine yAxisId="qtd" y={metas.qtdOrcamentos} stroke="#f59e0b" strokeDasharray="4 4"
                  label={{ value: `Meta ${metas.qtdOrcamentos}`, position: 'right', fontSize: 11 }} />
                <Bar yAxisId="qtd" dataKey="qtd" name="Qtd" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={48} />
                <Line yAxisId="valor" type="monotone" dataKey="valor" name="Valor (M)"
                  stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Card unificado: 5S + Planos de Ação ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {NOMES_MESES[parseInt(mesAno.split('-')[1]) - 1]}/{mesAno.split('-')[0]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="5s">
              <TabsList className="mb-4">
                <TabsTrigger value="5s" className="gap-2">
                  Ações 5S
                  <Badge variant="outline" className="text-xs">
                    {acoes5SMes.length}/{metas.acoes5S}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="planos" className="gap-2">
                  Planos de Ação
                  {planosMes.length > 0 && (
                    <Badge variant="outline" className="text-xs">{planosMes.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── Tab 5S ── */}
              <TabsContent value="5s">
                <div className="flex justify-end mb-3">
                  <Button size="sm" className="gap-1.5"
                    onClick={() => {
                      setNovaAcaoData(hoje.toISOString().split('T')[0]);
                      setNovaAcaoDescricao('');
                      setDialogAcaoOpen(true);
                    }}>
                    <Plus className="w-4 h-4" />
                    Registrar Ação
                  </Button>
                </div>
                {acoes5SMes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nenhuma ação registrada neste mês.
                  </p>
                ) : (
                  <div className="divide-y">
                    {acoes5SMes
                      .sort((a, b) => a.data.localeCompare(b.data))
                      .map((acao) => (
                        <div key={acao.id} className="flex items-center justify-between py-2.5 gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                              {new Date(acao.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </span>
                            <p className="text-sm leading-snug truncate">{acao.descricao}</p>
                          </div>
                          <Button variant="ghost" size="icon"
                            className="text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => setAcaoParaExcluir(acao.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>

              {/* ── Tab Planos de Ação ── */}
              <TabsContent value="planos">
                {planosMes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nenhum plano de ação registrado neste mês. Crie um a partir dos cards com meta não atingida.
                  </p>
                ) : (
                  <div className="divide-y">
                    {planosMes
                      .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))
                      .map((plano) => (
                        <div key={plano.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Badge variant="outline" className="text-xs shrink-0">
                              {plano.metodologia}
                            </Badge>
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{plano.kpiLabel}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(plano.criadoEm).toLocaleDateString('pt-BR')}
                                {' · '}
                                {plano.metodologia === '5W2H'
                                  ? [plano.oQue, plano.porQue].filter(Boolean).join(' — ').slice(0, 60)
                                  : [plano.plan].filter(Boolean).join('').slice(0, 60)}
                                {((plano.oQue?.length ?? 0) + (plano.plan?.length ?? 0)) > 60 ? '…' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="w-8 h-8"
                              onClick={() => handleAbrirPlano(plano.kpi, plano.kpiLabel, plano)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon"
                              className="w-8 h-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setPlanoParaExcluir(plano.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ── Dialogs ── */}
        <DialogMetas
          open={dialogMetasOpen}
          metas={metas}
          onSave={handleSalvarMetas}
          onClose={() => setDialogMetasOpen(false)}
        />

        {/* Dialog — Registrar Ação 5S */}
        <Dialog open={dialogAcaoOpen} onOpenChange={(v) => { if (!v) setDialogAcaoOpen(false); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Registrar Ação 5S</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>Data</Label>
                <Input type="date" value={novaAcaoData}
                  onChange={(e) => setNovaAcaoData(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Descrição</Label>
                <Textarea placeholder="Descreva a ação realizada..." value={novaAcaoDescricao}
                  onChange={(e) => setNovaAcaoDescricao(e.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAcaoOpen(false)}>Cancelar</Button>
              <Button onClick={handleRegistrarAcao} disabled={!novaAcaoDescricao.trim()}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog — Plano de Ação */}
        <DialogPlano
          open={dialogPlanoOpen}
          kpiLabel={planoKpi.label}
          editando={planoEditando}
          onSave={handleSalvarPlano}
          onClose={() => setDialogPlanoOpen(false)}
        />

        {/* AlertDialog — Excluir ação 5S */}
        <AlertDialog open={!!acaoParaExcluir} onOpenChange={(v) => { if (!v) setAcaoParaExcluir(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir ação 5S?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação será removida permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => acaoParaExcluir && handleExcluirAcao(acaoParaExcluir)}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AlertDialog — Excluir plano de ação */}
        <AlertDialog open={!!planoParaExcluir} onOpenChange={(v) => { if (!v) setPlanoParaExcluir(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir plano de ação?</AlertDialogTitle>
              <AlertDialogDescription>
                Este plano será removido permanentemente. Esta operação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => planoParaExcluir && handleExcluirPlano(planoParaExcluir)}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageContainer>
    </Layout>
  );
};

export default KpisComercialPage;
