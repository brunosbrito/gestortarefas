import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Save, X, Trash2, ExternalLink, Check, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComposicaoCustos, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { Cargo } from '@/interfaces/CargoInterface';
import { CargoService } from '@/services/CargoService';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import ExportarComposicaoButton from './ExportarComposicaoButton';

// 44h semanais ÷ 5 dias = 8,8 h/dia (CLT)
const HH_DIA_PADRAO = 8.8;

// Breakdown armazenado em item.descricao: "2p × 10d × 8.8h"
const BREAKDOWN_REGEX = /^(\d+(?:\.\d+)?)p × (\d+(?:\.\d+)?)d × (\d+(?:\.\d+)?)h/;

// Níveis disponíveis
const NIVEIS_PRODUCAO = ['I', 'II', 'III'];
const NIVEIS_ENGENHARIA = ['Junior', 'Pleno', 'Sênior'];

// Cor do badge por nível
const nivelBadgeClass = (nivel: string): string => {
  switch (nivel) {
    case 'I':      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    case 'II':     return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    case 'III':    return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    case 'Junior': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    case 'Pleno':  return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Sênior': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    default:       return 'bg-muted text-muted-foreground';
  }
};

// ---- tipos locais ----
interface RowMO {
  _localId: string;
  itemId?: string;       // undefined → nova linha ainda não salva
  cargo: string;         // nome do cargo (texto livre ou do catálogo)
  nivel: string;         // nível do profissional (opcional)
  qtdPessoas: number | '';
  diasUteis: number | '';
  hhDia: number;
  rsHH: number | '';
}

// ---- helpers ----
const calcHH = (r: RowMO): number => {
  const p = Number(r.qtdPessoas) || 0;
  const d = Number(r.diasUteis) || 0;
  return Math.round(p * d * r.hhDia * 10) / 10;
};

const calcSubtotal = (r: RowMO): number =>
  Math.round(calcHH(r) * (Number(r.rsHH) || 0) * 100) / 100;

const makeBreakdown = (r: RowMO): string =>
  `${r.qtdPessoas}p × ${r.diasUteis}d × ${r.hhDia}h`;

const parseItem = (item: ItemComposicao): RowMO => {
  const match = BREAKDOWN_REGEX.exec(item.descricao ?? '');
  return {
    _localId: item.id,
    itemId: item.id,
    cargo: item.cargo ?? '',
    nivel: item.especificacao ?? '',
    qtdPessoas: match ? Number(match[1]) : '',
    diasUteis: match ? Number(match[2]) : '',
    hhDia: match ? Number(match[3]) : HH_DIA_PADRAO,
    rsHH: item.valorUnitario !== undefined ? item.valorUnitario : '',
  };
};

const newRow = (): RowMO => ({
  _localId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  cargo: '',
  nivel: '',
  qtdPessoas: '',
  diasUteis: '',
  hhDia: HH_DIA_PADRAO,
  rsHH: '',
});

// ---- props ----
interface AbaMaoObraGridProps {
  composicao?: ComposicaoCustos;
  tipo: string;
  categoria: 'fabricacao' | 'montagem';
  onUpdate?: (composicao: ComposicaoCustos) => Promise<void>;
}

export default function AbaMaoObraGrid({
  composicao,
  tipo,
  categoria,
  onUpdate,
}: AbaMaoObraGridProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState<RowMO[]>([]);
  const [salvando, setSalvando] = useState(false);

  // BDI
  const [editandoBDI, setEditandoBDI] = useState(false);
  const [bdiInput, setBdiInput] = useState(composicao?.bdi?.percentual ?? 0);
  const [salvandoBDI, setSalvandoBDI] = useState(false);

  // Sync BDI
  useEffect(() => {
    if (!editandoBDI) setBdiInput(composicao?.bdi?.percentual ?? 0);
  }, [composicao?.bdi?.percentual, editandoBDI]);

  // Carrega todos os cargos ativos do catálogo
  useEffect(() => {
    CargoService.listAtivos().then(setCargos).catch(() => {});
  }, []);

  // Sincroniza linhas quando a composição muda (ex: após refetch)
  useEffect(() => {
    if (!composicao) {
      setRows([]);
      return;
    }
    const moItems = composicao.itens.filter((i) => i.tipoItem === 'mao_obra');
    setRows(moItems.map(parseItem));
  }, [composicao]);

  // Handlers
  const handleCargoChange = (localId: string, cargoNome: string) => {
    const found = cargos.find((c) => c.nome === cargoNome);
    setRows((prev) =>
      prev.map((r) =>
        r._localId === localId
          ? {
              ...r,
              cargo: cargoNome,
              rsHH: found ? found.custoHH : r.rsHH,
              nivel: found?.nivel ?? r.nivel,
            }
          : r
      )
    );
  };

  const handleField = <K extends keyof RowMO>(localId: string, field: K, value: RowMO[K]) =>
    setRows((prev) =>
      prev.map((r) => (r._localId === localId ? { ...r, [field]: value } : r))
    );

  const handleAddRow = () => setRows((prev) => [...prev, newRow()]);

  const handleRemoveRow = (localId: string) =>
    setRows((prev) => prev.filter((r) => r._localId !== localId));

  const handleCancel = () => {
    if (!composicao) {
      setRows([]);
    } else {
      const moItems = composicao.itens.filter((i) => i.tipoItem === 'mao_obra');
      setRows(moItems.map(parseItem));
    }
    setEditMode(false);
  };

  const handleSalvarBDI = async () => {
    if (!composicao || !onUpdate) return;
    try {
      setSalvandoBDI(true);
      await onUpdate({ ...composicao, bdi: { ...composicao.bdi, percentual: bdiInput } });
      setEditandoBDI(false);
      toast({ title: 'Sucesso', description: 'BDI atualizado com sucesso' });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao atualizar BDI', variant: 'destructive' });
    } finally {
      setSalvandoBDI(false);
    }
  };

  const handleSave = async () => {
    if (!composicao || !onUpdate) return;

    // Validação linha a linha
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const linha = `Linha ${i + 1}`;
      if (!r.cargo.trim()) {
        toast({ title: 'Atenção', description: `${linha}: informe o cargo`, variant: 'destructive' });
        return;
      }
      if (!r.qtdPessoas || Number(r.qtdPessoas) <= 0) {
        toast({ title: 'Atenção', description: `${linha}: informe a quantidade de pessoas`, variant: 'destructive' });
        return;
      }
      if (!r.diasUteis || Number(r.diasUteis) <= 0) {
        toast({ title: 'Atenção', description: `${linha}: informe os dias úteis`, variant: 'destructive' });
        return;
      }
      if (r.rsHH === '' || Number(r.rsHH) < 0) {
        toast({ title: 'Atenção', description: `${linha}: informe o R$/HH`, variant: 'destructive' });
        return;
      }
    }

    try {
      setSalvando(true);

      // Converte linhas em ItemComposicao
      const novasMO: ItemComposicao[] = rows.map((r, index) => ({
        id: r.itemId ?? `mo-${Date.now()}-${index}`,
        composicaoId: composicao.id,
        descricao: makeBreakdown(r),
        cargo: r.cargo,
        especificacao: r.nivel || undefined,   // armazena nível em especificacao
        quantidade: calcHH(r),
        unidade: 'hh',
        valorUnitario: Number(r.rsHH),
        subtotal: calcSubtotal(r),
        percentual: 0,
        tipoItem: 'mao_obra' as const,
        ordem: index + 1,
      }));

      // Mantém itens de outros tipos (material, ferramenta, etc.)
      const outrosItens = composicao.itens.filter((i) => i.tipoItem !== 'mao_obra');

      await onUpdate({
        ...composicao,
        itens: [...outrosItens, ...novasMO],
      });

      setEditMode(false);
      toast({ title: 'Sucesso', description: 'Mão de obra salva com sucesso' });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar mão de obra', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  // ---- totais ----
  const totalHH = rows.reduce((acc, r) => acc + calcHH(r), 0);
  const totalSubtotal = rows.reduce((acc, r) => acc + calcSubtotal(r), 0);
  const totalProfissionais = rows.reduce((acc, r) => acc + (Number(r.qtdPessoas) || 0), 0);
  const bdiPercentual = composicao?.bdi?.percentual ?? 0;
  const bdiValor = Math.round(totalSubtotal * (bdiPercentual / 100) * 100) / 100;
  const totalComBDI = Math.round((totalSubtotal + bdiValor) * 100) / 100;

  // ==========================================
  // VIEW MODE
  // ==========================================
  const renderView = () => {
    if (rows.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">Nenhum item de mão de obra</p>
          <p className="text-sm mt-2 mb-4">Clique em "Editar Grid" para adicionar</p>
          {onUpdate && (
            <Button onClick={() => setEditMode(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar Grid
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="border-r w-10 text-center">#</TableHead>
              <TableHead className="border-r">Cargo</TableHead>
              <TableHead className="border-r w-24 text-center">Nível</TableHead>
              <TableHead className="border-r text-center w-20">Pess.</TableHead>
              <TableHead className="border-r text-center w-24">Dias Úteis</TableHead>
              <TableHead className="border-r text-center w-24">HH/Dia</TableHead>
              <TableHead className="border-r text-center w-24">QTD/HH</TableHead>
              <TableHead className="border-r text-center w-32">R$/HH</TableHead>
              <TableHead className="text-center w-36">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={r._localId} className="hover:bg-muted/30">
                <TableCell className="border-r text-center font-medium">{idx + 1}</TableCell>
                <TableCell className="border-r">
                  <button
                    onClick={() => navigate('/comercial/configuracao/cargos')}
                    className="group flex items-center gap-1.5 font-medium text-left hover:text-blue-500 transition-colors"
                    title="Abrir tabela de cargos"
                  >
                    {r.cargo || '—'}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                  </button>
                </TableCell>
                <TableCell className="border-r text-center">
                  {r.nivel ? (
                    <Badge className={`text-xs font-medium ${nivelBadgeClass(r.nivel)}`}>
                      {r.nivel}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="border-r text-center">{r.qtdPessoas !== '' ? r.qtdPessoas : '—'}</TableCell>
                <TableCell className="border-r text-center">{r.diasUteis !== '' ? r.diasUteis : '—'}</TableCell>
                <TableCell className="border-r text-center">{r.hhDia}</TableCell>
                <TableCell className="border-r text-center font-bold text-blue-600">{calcHH(r)}</TableCell>
                <TableCell className="border-r text-center font-mono">{formatCurrency(Number(r.rsHH))}</TableCell>
                <TableCell className="text-center font-bold text-green-600">{formatCurrency(calcSubtotal(r))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // ==========================================
  // EDIT MODE
  // ==========================================
  const renderEdit = () => (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="border-r w-10 text-center">#</TableHead>
            <TableHead className="border-r min-w-[180px]">Cargo</TableHead>
            <TableHead className="border-r w-32 text-center">Nível</TableHead>
            <TableHead className="border-r w-24 text-center">Pess.</TableHead>
            <TableHead className="border-r w-24 text-center">Dias Úteis</TableHead>
            <TableHead className="border-r w-28 text-center">HH/Dia</TableHead>
            <TableHead className="border-r w-24 text-center">QTD/HH</TableHead>
            <TableHead className="border-r w-32 text-center">R$/HH</TableHead>
            <TableHead className="border-r w-36 text-center">Subtotal</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow key={r._localId}>
              <TableCell className="border-r text-center font-medium">{idx + 1}</TableCell>

              {/* Cargo */}
              <TableCell className="border-r p-1">
                {cargos.length > 0 ? (
                  <Select
                    value={r.cargo}
                    onValueChange={(v) => handleCargoChange(r._localId, v)}
                    disabled={salvando}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cargos.map((c) => (
                        <SelectItem key={c.id} value={c.nome}>
                          <span>{c.nome}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {formatCurrency(c.custoHH)}/hh
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    className="h-8 text-sm"
                    value={r.cargo}
                    onChange={(e) => handleField(r._localId, 'cargo', e.target.value)}
                    placeholder="Cargo..."
                    disabled={salvando}
                  />
                )}
              </TableCell>

              {/* Nível */}
              <TableCell className="border-r p-1">
                <Select
                  value={r.nivel}
                  onValueChange={(v) => handleField(r._localId, 'nivel', v === '_none' ? '' : v)}
                  disabled={salvando}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">
                      <span className="text-muted-foreground">—</span>
                    </SelectItem>
                    {/* Produção */}
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Produção
                    </div>
                    {NIVEIS_PRODUCAO.map((n) => (
                      <SelectItem key={n} value={n}>
                        <Badge className={`text-xs ${nivelBadgeClass(n)}`}>{n}</Badge>
                      </SelectItem>
                    ))}
                    {/* Engenharia */}
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t mt-1">
                      Engenharia
                    </div>
                    {NIVEIS_ENGENHARIA.map((n) => (
                      <SelectItem key={n} value={n}>
                        <Badge className={`text-xs ${nivelBadgeClass(n)}`}>{n}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>

              {/* Pessoas */}
              <TableCell className="border-r p-1">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  className="h-8 text-sm text-center"
                  value={r.qtdPessoas}
                  onChange={(e) =>
                    handleField(
                      r._localId,
                      'qtdPessoas',
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  placeholder="0"
                  disabled={salvando}
                />
              </TableCell>

              {/* Dias */}
              <TableCell className="border-r p-1">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  className="h-8 text-sm text-center"
                  value={r.diasUteis}
                  onChange={(e) =>
                    handleField(
                      r._localId,
                      'diasUteis',
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  placeholder="0"
                  disabled={salvando}
                />
              </TableCell>

              {/* HH/Dia */}
              <TableCell className="border-r p-1">
                <Input
                  type="number"
                  min={0.1}
                  step={0.1}
                  className="h-8 text-sm text-center"
                  value={r.hhDia}
                  onChange={(e) =>
                    handleField(
                      r._localId,
                      'hhDia',
                      Number(e.target.value) || HH_DIA_PADRAO
                    )
                  }
                  disabled={salvando}
                />
              </TableCell>

              {/* QTD/HH calculado (somente leitura) */}
              <TableCell className="border-r text-center font-bold text-blue-600 bg-muted/30">
                {calcHH(r)}
              </TableCell>

              {/* R$/HH */}
              <TableCell className="border-r p-1">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  className="h-8 text-sm text-center"
                  value={r.rsHH}
                  onChange={(e) =>
                    handleField(
                      r._localId,
                      'rsHH',
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  placeholder="0.00"
                  disabled={salvando}
                />
              </TableCell>

              {/* Subtotal calculado (somente leitura) */}
              <TableCell className="border-r text-center font-bold text-green-600 bg-muted/30">
                {formatCurrency(calcSubtotal(r))}
              </TableCell>

              {/* Remover linha */}
              <TableCell className="p-1 text-center">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveRow(r._localId)}
                  disabled={salvando}
                  title="Remover linha"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                Nenhuma linha. Clique em "+ Linha" para adicionar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {tipo} — {rows.length} cargo(s)
        </span>

        <div className="flex gap-2">
          {!editMode && onUpdate && rows.length > 0 && (
            <>
              <ExportarComposicaoButton
                titulo={`MO ${tipo}`}
                rows={rows.map((r) => ({
                  codigo: r.nivel || '',
                  descricao: `${r.cargo} — ${makeBreakdown(r)}`,
                  quantidade: calcHH(r),
                  unidade: 'hh',
                  valorUnitario: Number(r.rsHH) || 0,
                  subtotal: calcSubtotal(r),
                }))}
                bdi={{ percentual: composicao?.bdi?.percentual ?? 0, valor: composicao?.bdi?.valor ?? 0 }}
                labelQuantidade="QTD/HH"
                labelUnidade="Unid."
              />
              <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar Grid
              </Button>
            </>
          )}

          {editMode && (
            <>
              <Button size="sm" variant="outline" onClick={handleAddRow} disabled={salvando}>
                <Plus className="mr-2 h-4 w-4" />
                Linha
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={salvando}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={salvando}>
                <Save className="mr-2 h-4 w-4" />
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      {editMode ? renderEdit() : renderView()}

      {/* Totais */}
      {rows.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <Label className="text-muted-foreground">Cargos</Label>
              <p className="text-xl font-bold">{rows.length}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">QTD Profissionais</Label>
              <p className="text-xl font-bold">{totalProfissionais}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total HH</Label>
              <p className="text-xl font-bold">{Math.round(totalHH * 10) / 10} hh</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Custo Direto MO</Label>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalSubtotal)}</p>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Label className="text-muted-foreground">BDI</Label>
                {onUpdate && !editandoBDI && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setEditandoBDI(true)}
                    title="Editar BDI desta composição"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {onUpdate && editandoBDI ? (
                <div className="flex items-center gap-1 mt-1">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={bdiInput}
                    onChange={(e) => setBdiInput(parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-sm"
                    disabled={salvandoBDI}
                    autoFocus
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => { setEditandoBDI(false); setBdiInput(composicao?.bdi?.percentual ?? 0); }}
                    disabled={salvandoBDI}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button size="sm" className="h-8 w-8 p-0" onClick={handleSalvarBDI} disabled={salvandoBDI}>
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(bdiValor)}
                  </p>
                  <span className="text-sm text-muted-foreground">({bdiPercentual}%)</span>
                </div>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Total c/ BDI</Label>
              <p className="text-xl font-bold text-amber-600">
                {formatCurrency(totalComBDI)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
