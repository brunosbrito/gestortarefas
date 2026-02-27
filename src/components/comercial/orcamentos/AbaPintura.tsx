import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Paintbrush, Info, Edit2, Save, X, Trash2, Upload, Download, TrendingUp, Check, Edit,
  AlertCircle, ArrowUp, ArrowDown, Plus, Droplets,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Orcamento, ItemComposicao, ComposicaoCustos } from '@/interfaces/OrcamentoInterface';
import { normalizarDescricao } from '@/lib/textUtils';
import { useTableSort, SortableTableHeader } from '@/components/tables/SortableTableHeader';
import ExportarComposicaoButton from './ExportarComposicaoButton';
import ExportarAbaCompletaButton from './ExportarAbaCompletaButton';
import { TintaInterface, TipoTinta, TipoTintaLabels } from '@/interfaces/TintaInterface';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import OrcamentoService from '@/services/OrcamentoService';
import { getTodosOsMateriais } from '@/data/catalogoMateriais';
import { calcAreaM2PorUnidade } from '@/lib/calcAreaPintura';
import { mockTintas } from '@/data/mockTintas';

// ---- tipos locais ----
interface RowPintura {
  _localId: string;
  itemId?: string;
  codigo: string;
  descricao: string;
  quantidade: number | '';
  unidade: string;
  valorUnitario: number | '';
}

interface RowTinta {
  _localId: string;
  itemId?: string;
  tintaCodigo: string;
  descricao: string;
  tipo: TipoTinta | '';
  solidosVolume: number;
  areaM2: number | '';
  maos: number | '';
  espessuraSeca: number | '';
  precoLitro: number | '';
  pctDiluicao: number | '';
}

// ---- helpers pintura (jateamento) ----
const calcSubtotalRow = (r: RowPintura): number =>
  Math.round((Number(r.quantidade) || 0) * (Number(r.valorUnitario) || 0) * 100) / 100;

const parseItemPintura = (item: ItemComposicao): RowPintura => ({
  _localId: item.id,
  itemId: item.id,
  codigo: item.codigo ?? '',
  descricao: item.descricao ?? '',
  quantidade: item.quantidade,
  unidade: item.unidade || 'un',
  valorUnitario: item.valorUnitario,
});

const newRowPintura = (): RowPintura => ({
  _localId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  codigo: '',
  descricao: '',
  quantidade: '',
  unidade: 'un',
  valorUnitario: '',
});

// ---- helpers tintas ----
const calcTintaRendimento = (sv: number, esp: number): number => {
  if (sv <= 0 || esp <= 0) return 0;
  return Math.round((sv / 100) * (1000 / esp) * 100) / 100;
};

const calcTintaLitros = (areaM2: number, maos: number, rendimento: number): number => {
  if (rendimento <= 0) return 0;
  return Math.round((areaM2 * maos) / rendimento * 100) / 100;
};

const calcTintaSubtotal = (litros: number, preco: number): number =>
  Math.round(litros * preco * 100) / 100;

const calcTintaRow = (r: RowTinta, litrosTintaBase = 0) => {
  const preco = Number(r.precoLitro) || 0;
  if (r.tipo === TipoTinta.SOLVENTE) {
    const pct = Number(r.pctDiluicao) || 0;
    const litros = Math.round(litrosTintaBase * pct / 100 * 100) / 100;
    return { rendimento: 0, litros, subtotal: calcTintaSubtotal(litros, preco) };
  }
  const sv = r.solidosVolume;
  const esp = Number(r.espessuraSeca) || 0;
  const area = Number(r.areaM2) || 0;
  const maos = Number(r.maos) || 0;
  const rendimento = calcTintaRendimento(sv, esp);
  const litros = calcTintaLitros(area, maos, rendimento);
  return { rendimento, litros, subtotal: calcTintaSubtotal(litros, preco) };
};

const parseTintaItem = (item: ItemComposicao): RowTinta => {
  let meta: { maos?: number; espessuraSeca?: number; areaM2?: number; solidosVolume?: number; tipo?: string; pctDiluicao?: number } = {};
  try { meta = JSON.parse(item.especificacao || '{}'); } catch { /* ignore */ }
  return {
    _localId: item.id,
    itemId: item.id,
    tintaCodigo: item.codigo ?? '',
    descricao: item.descricao,
    tipo: (meta.tipo as TipoTinta) || '',
    solidosVolume: meta.solidosVolume ?? 0,
    areaM2: meta.areaM2 ?? '',
    maos: meta.maos ?? 1,
    espessuraSeca: meta.espessuraSeca ?? 75,
    precoLitro: item.valorUnitario,
    pctDiluicao: meta.pctDiluicao ?? 50,
  };
};

const getTintaBadgeVariant = (tipo: TipoTinta | ''): 'secondary' | 'default' | 'outline' => {
  if (tipo === TipoTinta.PRIMER) return 'secondary';
  if (tipo === TipoTinta.SOLVENTE) return 'outline';
  return 'default';
};

const newRowTinta = (areaDefault: number): RowTinta => ({
  _localId: `tinta-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  tintaCodigo: '',
  descricao: '',
  tipo: '',
  solidosVolume: 0,
  areaM2: areaDefault > 0 ? areaDefault : '',
  maos: 1,
  espessuraSeca: 75,
  precoLitro: '',
  pctDiluicao: 50,
});

// ---- props ----
interface AbaPinturaProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaPintura({ orcamento, onUpdate }: AbaPinturaProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const composicaoPintura = orcamento.composicoes.find((c) => c.tipo === 'jato_pintura');
  const composicaoMateriais = orcamento.composicoes.find((c) => c.tipo === 'materiais');
  const composicaoTintas = orcamento.composicoes.find((c) => c.tipo === 'tintas');
  const composicaoTintasOuPadrao: ComposicaoCustos = composicaoTintas ?? {
    id: `comp-${orcamento.id}-tintas`,
    orcamentoId: orcamento.id,
    nome: 'Tintas e Solventes',
    tipo: 'tintas' as any,
    itens: [],
    bdi: { percentual: 12, valor: 0 },
    custoDirecto: 0,
    subtotal: 0,
    percentualDoTotal: 0,
    ordem: orcamento.composicoes.length + 1,
  };

  // Grid state - jateamento/pintura
  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState<RowPintura[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Grid state - tintas
  const [tintaRows, setTintaRows] = useState<RowTinta[]>([]);
  const [tintaEditMode, setTintaEditMode] = useState(false);
  const [tintaSalvando, setTintaSalvando] = useState(false);

  // BDI Pintura (jato_pintura)
  const [editandoBDI, setEditandoBDI] = useState(false);
  const [bdiInput, setBdiInput] = useState(composicaoPintura?.bdi?.percentual ?? 0);
  const [salvandoBDI, setSalvandoBDI] = useState(false);

  // BDI Tintas (composicaoTintas)
  const [editandoBDITintas, setEditandoBDITintas] = useState(false);
  const [bdiInputTintas, setBdiInputTintas] = useState(composicaoTintasOuPadrao.bdi?.percentual ?? 12);
  const [salvandoBDITintas, setSalvandoBDITintas] = useState(false);

  // Import
  const [importDialogAberto, setImportDialogAberto] = useState(false);
  const [importModo, setImportModo] = useState<'acrescentar' | 'substituir'>('acrescentar');
  const [importLendo, setImportLendo] = useState(false);
  const [importImportando, setImportImportando] = useState(false);
  const [importDados, setImportDados] = useState<RowPintura[]>([]);
  const [importErros, setImportErros] = useState<string[]>([]);

  // Reajuste
  const [reajusteDialogAberto, setReajusteDialogAberto] = useState(false);
  const [reajusteTipo, setReajusteTipo] = useState<'percentual' | 'fixo'>('percentual');
  const [reajusteValor, setReajusteValor] = useState(0);
  const [reajustando, setReajustando] = useState(false);

  // Catálogo estático de materiais (sem API)
  const catalogoLocal = useMemo(() => getTodosOsMateriais(), []);

  // Catálogo de tintas: mock + localStorage
  const catalogoTintas = useMemo((): TintaInterface[] => {
    try {
      const locais = JSON.parse(localStorage.getItem('tintas_locais') || '[]') as TintaInterface[];
      const ativas = locais.filter((t) => t.ativo !== false);
      return [...mockTintas, ...ativas];
    } catch {
      return [...mockTintas];
    }
  }, []);

  const tintasPrimer = catalogoTintas.filter((t) => t.tipo === TipoTinta.PRIMER);
  const tintasAcabamento = catalogoTintas.filter((t) => t.tipo === TipoTinta.ACABAMENTO);
  const tintasSolvente = catalogoTintas.filter((t) => t.tipo === TipoTinta.SOLVENTE);

  // Sync BDI
  useEffect(() => {
    if (!editandoBDI) setBdiInput(composicaoPintura?.bdi?.percentual ?? 0);
  }, [composicaoPintura?.bdi?.percentual, editandoBDI]);

  // Sync BDI Tintas
  useEffect(() => {
    if (!editandoBDITintas) setBdiInputTintas(composicaoTintasOuPadrao.bdi?.percentual ?? 12);
  }, [composicaoTintasOuPadrao.bdi?.percentual, editandoBDITintas]);

  // Sync jateamento rows (tipoItem !== 'material')
  useEffect(() => {
    if (!composicaoPintura) { setRows([]); return; }
    setRows(composicaoPintura.itens.filter((i) => i.tipoItem !== 'material').map(parseItemPintura));
  }, [composicaoPintura]);

  // Sync tinta rows — lê de composicaoTintas (se existir) ou fallback em jato_pintura (retrocompat)
  useEffect(() => {
    if (composicaoTintas) {
      setTintaRows(composicaoTintas.itens.map(parseTintaItem));
    } else if (composicaoPintura) {
      setTintaRows(composicaoPintura.itens.filter((i) => i.tipoItem === 'material').map(parseTintaItem));
    } else {
      setTintaRows([]);
    }
  }, [composicaoTintas, composicaoPintura]);

  // Área de pintura estimada a partir dos materiais (m²)
  const areaTotal = useMemo(() => {
    if (!composicaoMateriais) return 0;
    return composicaoMateriais.itens.reduce((total, item) => {
      const qty = item.quantidade || 0;
      if (item.codigo) {
        const catalogItem = catalogoLocal.find((m) => m.codigo === item.codigo);
        if (catalogItem) {
          const areaPorUnidade = calcAreaM2PorUnidade(catalogItem);
          if (areaPorUnidade > 0) return total + qty * areaPorUnidade;
        }
      }
      const unidade = item.unidade || 'kg';
      const pesoNominal = item.peso ?? 0;
      if (unidade === 'm²') return total + qty * 2;
      if ((unidade === 'm' || unidade === 'ml') && pesoNominal > 0)
        return total + qty * pesoNominal * 40 / 1000;
      if (unidade === 'kg') return total + qty * 40 / 1000;
      return total;
    }, 0);
  }, [composicaoMateriais, catalogoLocal]);

  // ---- field handlers (jateamento) ----
  const handleField = <K extends keyof RowPintura>(localId: string, field: K, value: RowPintura[K]) =>
    setRows((prev) => prev.map((r) => (r._localId === localId ? { ...r, [field]: value } : r)));

  const handleAddRow = () => setRows((prev) => [...prev, newRowPintura()]);
  const handleRemoveRow = (localId: string) => setRows((prev) => prev.filter((r) => r._localId !== localId));

  const handleCancel = () => {
    if (!composicaoPintura) { setRows([]); }
    else { setRows(composicaoPintura.itens.filter((i) => i.tipoItem !== 'material').map(parseItemPintura)); }
    setEditMode(false);
  };

  // ---- field handlers (tintas) ----
  const handleTintaField = <K extends keyof RowTinta>(localId: string, field: K, value: RowTinta[K]) =>
    setTintaRows((prev) => prev.map((r) => (r._localId === localId ? { ...r, [field]: value } : r)));

  const handleTintaSelect = (localId: string, codigoTinta: string) => {
    if (!codigoTinta) {
      setTintaRows((prev) => prev.map((r) =>
        r._localId === localId
          ? { ...r, tintaCodigo: '', descricao: '', tipo: '', solidosVolume: 0, precoLitro: '' }
          : r
      ));
      return;
    }
    const tinta = catalogoTintas.find((t) => t.codigo === codigoTinta);
    if (!tinta) return;
    setTintaRows((prev) => prev.map((r) =>
      r._localId === localId
        ? {
            ...r,
            tintaCodigo: tinta.codigo,
            descricao: tinta.descricao,
            tipo: tinta.tipo,
            solidosVolume: tinta.solidosVolume,
            precoLitro: tinta.precoLitro,
          }
        : r
    ));
  };

  const handleAddTintaRow = () =>
    setTintaRows((prev) => [...prev, newRowTinta(Math.round(areaTotal * 100) / 100)]);
  const handleRemoveTintaRow = (localId: string) =>
    setTintaRows((prev) => prev.filter((r) => r._localId !== localId));

  const handleCancelTintas = () => {
    if (composicaoTintas) {
      setTintaRows(composicaoTintas.itens.map(parseTintaItem));
    } else if (composicaoPintura) {
      setTintaRows(composicaoPintura.itens.filter((i) => i.tipoItem === 'material').map(parseTintaItem));
    } else {
      setTintaRows([]);
    }
    setTintaEditMode(false);
  };

  // ---- save (jateamento) ----
  const handleSave = async () => {
    if (!composicaoPintura) return;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const linha = `Linha ${i + 1}`;
      if (!r.descricao.trim()) {
        toast({ title: 'Atenção', description: `${linha}: informe a descrição`, variant: 'destructive' });
        return;
      }
      if (r.quantidade === '' || Number(r.quantidade) <= 0) {
        toast({ title: 'Atenção', description: `${linha}: informe a quantidade`, variant: 'destructive' });
        return;
      }
      if (r.valorUnitario === '' || Number(r.valorUnitario) < 0) {
        toast({ title: 'Atenção', description: `${linha}: informe o valor unitário`, variant: 'destructive' });
        return;
      }
    }

    try {
      setSalvando(true);
      const novosItens: ItemComposicao[] = rows.map((r, index) => ({
        id: r.itemId ?? `item-${Date.now()}-${index}`,
        composicaoId: composicaoPintura.id,
        descricao: normalizarDescricao(r.descricao),
        codigo: r.codigo || undefined,
        quantidade: Number(r.quantidade),
        unidade: r.unidade,
        valorUnitario: Number(r.valorUnitario),
        subtotal: calcSubtotalRow(r),
        percentual: 0,
        tipoItem: 'outros' as const,
        ordem: index + 1,
      }));

      // Preserva itens de tinta apenas se ainda não foram migrados para composicaoTintas
      const tintaItens = composicaoTintas
        ? []
        : composicaoPintura.itens.filter((i) => i.tipoItem === 'material');

      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoPintura.id ? { ...c, itens: [...novosItens, ...tintaItens] } : c
        ),
      };

      await OrcamentoService.update(orcamento.id, updatedOrcamento);
      setEditMode(false);
      toast({ title: 'Sucesso', description: 'Pintura salva com sucesso' });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar pintura', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  // ---- save (tintas) ----
  const handleSaveTintas = async () => {
    if (!composicaoPintura) return;

    for (let i = 0; i < tintaRows.length; i++) {
      const r = tintaRows[i];
      const linha = `Linha ${i + 1}`;
      if (!r.tintaCodigo && !r.descricao.trim()) {
        toast({ title: 'Atenção', description: `${linha}: selecione uma tinta`, variant: 'destructive' });
        return;
      }
      if (r.tipo === TipoTinta.SOLVENTE) {
        if (r.pctDiluicao === '' || Number(r.pctDiluicao) <= 0) {
          toast({ title: 'Atenção', description: `${linha}: informe o % de diluição`, variant: 'destructive' });
          return;
        }
      } else {
        if (r.areaM2 === '' || Number(r.areaM2) <= 0) {
          toast({ title: 'Atenção', description: `${linha}: informe a área em m²`, variant: 'destructive' });
          return;
        }
        if (r.maos === '' || Number(r.maos) <= 0) {
          toast({ title: 'Atenção', description: `${linha}: informe o número de mãos`, variant: 'destructive' });
          return;
        }
        if (r.espessuraSeca === '' || Number(r.espessuraSeca) <= 0) {
          toast({ title: 'Atenção', description: `${linha}: informe a espessura seca`, variant: 'destructive' });
          return;
        }
      }
    }

    try {
      setTintaSalvando(true);

      // Preserva itens de jateamento
      const jatamentoItens = composicaoPintura.itens.filter((i) => i.tipoItem !== 'material');

      // Base de litros (primer + acabamento) para calcular solventes
      const litrosTintaBaseLocal = tintaRows
        .filter((r) => r.tipo !== TipoTinta.SOLVENTE)
        .reduce((acc, r) => {
          const sv = r.solidosVolume;
          const esp = Number(r.espessuraSeca) || 75;
          const area = Number(r.areaM2) || 0;
          const maos = Number(r.maos) || 1;
          return acc + calcTintaLitros(area, maos, calcTintaRendimento(sv, esp));
        }, 0);

      const novasTintasItens: ItemComposicao[] = tintaRows.map((r, index) => {
        const preco = Number(r.precoLitro) || 0;
        let litros: number;
        let especificacaoData: Record<string, unknown>;

        if (r.tipo === TipoTinta.SOLVENTE) {
          const pct = Number(r.pctDiluicao) || 0;
          litros = Math.round(litrosTintaBaseLocal * pct / 100 * 100) / 100;
          especificacaoData = { tipo: r.tipo, pctDiluicao: pct };
        } else {
          const sv = r.solidosVolume;
          const esp = Number(r.espessuraSeca) || 75;
          const area = Number(r.areaM2) || 0;
          const maos = Number(r.maos) || 1;
          litros = calcTintaLitros(area, maos, calcTintaRendimento(sv, esp));
          especificacaoData = { maos, espessuraSeca: esp, areaM2: area, solidosVolume: sv, tipo: r.tipo };
        }

        const subtotal = calcTintaSubtotal(litros, preco);
        return {
          id: r.itemId ?? `tinta-${Date.now()}-${index}`,
          composicaoId: composicaoTintasOuPadrao.id,
          codigo: r.tintaCodigo || undefined,
          descricao: normalizarDescricao(r.descricao),
          quantidade: litros,
          unidade: 'L',
          valorUnitario: preco,
          subtotal,
          percentual: 0,
          tipoItem: 'material' as const,
          especificacao: JSON.stringify(especificacaoData),
          ordem: index + 1,
        };
      });

      // Salva tintas em composicaoTintas (cria ou atualiza)
      // e remove tipoItem==='material' de jato_pintura (migração)
      const novasComposicoes = composicaoTintas
        ? orcamento.composicoes.map((c) =>
            c.id === composicaoTintasOuPadrao.id
              ? { ...c, itens: novasTintasItens }
              : c.id === composicaoPintura.id
              ? { ...c, itens: jatamentoItens }
              : c
          )
        : [
            ...orcamento.composicoes.map((c) =>
              c.id === composicaoPintura.id ? { ...c, itens: jatamentoItens } : c
            ),
            { ...composicaoTintasOuPadrao, itens: novasTintasItens },
          ];

      await OrcamentoService.update(orcamento.id, { ...orcamento, composicoes: novasComposicoes });
      setTintaEditMode(false);
      toast({ title: 'Sucesso', description: 'Tintas salvas com sucesso' });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar tintas', variant: 'destructive' });
    } finally {
      setTintaSalvando(false);
    }
  };

  // ---- BDI ----
  const handleSalvarBDI = async () => {
    if (!composicaoPintura) return;
    try {
      setSalvandoBDI(true);
      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoPintura.id
            ? { ...c, bdi: { ...c.bdi, percentual: bdiInput } }
            : c
        ),
      };
      await OrcamentoService.update(orcamento.id, updatedOrcamento);
      setEditandoBDI(false);
      toast({ title: 'Sucesso', description: 'BDI atualizado com sucesso' });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao atualizar BDI', variant: 'destructive' });
    } finally {
      setSalvandoBDI(false);
    }
  };

  // ---- BDI Tintas ----
  const handleSalvarBDITintas = async () => {
    try {
      setSalvandoBDITintas(true);
      const novasComposicoes = composicaoTintas
        ? orcamento.composicoes.map((c) =>
            c.id === composicaoTintasOuPadrao.id
              ? { ...c, bdi: { ...c.bdi, percentual: bdiInputTintas } }
              : c
          )
        : [...orcamento.composicoes, { ...composicaoTintasOuPadrao, bdi: { percentual: bdiInputTintas, valor: 0 } }];
      await OrcamentoService.update(orcamento.id, { ...orcamento, composicoes: novasComposicoes });
      setEditandoBDITintas(false);
      toast({ title: 'Sucesso', description: 'BDI Tintas atualizado com sucesso' });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao atualizar BDI', variant: 'destructive' });
    } finally {
      setSalvandoBDITintas(false);
    }
  };

  // ---- import ----
  const handleBaixarModelo = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      [{ 'Código': 'ITEM-001', 'Descrição': 'Tinta epóxi base', 'Qtd': 10, 'Unidade': 'L', 'Valor Unitário (R$)': 45.00 }],
      { header: ['Código', 'Descrição', 'Qtd', 'Unidade', 'Valor Unitário (R$)'] }
    );
    ws['!cols'] = [{ wch: 16 }, { wch: 50 }, { wch: 8 }, { wch: 8 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Pintura');
    XLSX.writeFile(wb, 'modelo_pintura.xlsx');
  };

  const handleArquivoSelecionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImportLendo(true);
    setImportDados([]);
    setImportErros([]);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const validos: RowPintura[] = [];
      const erros: string[] = [];

      rawRows.forEach((row, i) => {
        const linhaN = i + 2;
        const codigo = String(row['Código'] || row['Codigo'] || row['codigo'] || '').trim();
        const descricao = String(row['Descrição'] || row['Descricao'] || row['descricao'] || '').trim();
        const qtdRaw = row['Qtd'] ?? row['Quantidade'] ?? row['quantidade'] ?? '';
        const qtd = typeof qtdRaw === 'number' ? qtdRaw : parseFloat(String(qtdRaw).replace(',', '.')) || 0;
        const unidade = String(row['Unidade'] || row['unidade'] || 'un').trim();
        const precoRaw = row['Valor Unitário (R$)'] ?? row['Valor'] ?? row['valor'] ?? row['preco'] ?? 0;
        const preco = typeof precoRaw === 'number' ? precoRaw : parseFloat(String(precoRaw).replace(',', '.')) || 0;

        if (!descricao) { erros.push(`Linha ${linhaN}: Descrição obrigatória`); return; }
        if (qtd <= 0) { erros.push(`Linha ${linhaN}: Quantidade deve ser > 0`); return; }
        if (preco < 0) { erros.push(`Linha ${linhaN}: Valor deve ser ≥ 0`); return; }

        validos.push({
          _localId: `import-${Date.now()}-${i}`,
          codigo,
          descricao,
          quantidade: qtd,
          unidade: unidade || 'un',
          valorUnitario: preco,
        });
      });

      setImportDados(validos);
      setImportErros(erros);
      setImportDialogAberto(true);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível ler o arquivo', variant: 'destructive' });
    } finally {
      setImportLendo(false);
    }
  };

  const handleConfirmarImport = async () => {
    if (!composicaoPintura || importDados.length === 0) return;
    setImportImportando(true);
    try {
      const baseItens = importModo === 'substituir'
        ? []
        : composicaoPintura.itens.filter((i) => i.tipoItem !== 'material');
      const novosItens: ItemComposicao[] = importDados.map((r, index) => ({
        id: `import-${Date.now()}-${index}`,
        composicaoId: composicaoPintura.id,
        descricao: r.descricao,
        codigo: r.codigo || undefined,
        quantidade: Number(r.quantidade),
        unidade: r.unidade,
        valorUnitario: Number(r.valorUnitario),
        subtotal: calcSubtotalRow(r),
        percentual: 0,
        tipoItem: 'outros' as const,
        ordem: baseItens.length + index + 1,
      }));

      // Preserva itens de tinta apenas se ainda não foram migrados
      const tintaItens = composicaoTintas
        ? []
        : composicaoPintura.itens.filter((i) => i.tipoItem === 'material');

      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoPintura.id
            ? { ...c, itens: [...baseItens, ...novosItens, ...tintaItens] }
            : c
        ),
      };

      await OrcamentoService.update(orcamento.id, updatedOrcamento);
      toast({ title: 'Sucesso', description: `${importDados.length} item(s) importado(s)` });
      setImportDialogAberto(false);
      setImportDados([]);
      setImportErros([]);
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível importar os dados', variant: 'destructive' });
    } finally {
      setImportImportando(false);
    }
  };

  // ---- reajuste ----
  const reajustePreviewItens = (composicaoPintura?.itens.filter((i) => i.tipoItem !== 'material') ?? []).map((item) => {
    const novo =
      reajusteTipo === 'percentual'
        ? Math.max(0, Math.round(item.valorUnitario * (1 + reajusteValor / 100) * 100) / 100)
        : Math.max(0, Math.round((item.valorUnitario + reajusteValor) * 100) / 100);
    return { ...item, novoValor: novo };
  });

  const handleConfirmarReajuste = async () => {
    if (!composicaoPintura) return;
    setReajustando(true);
    try {
      const novosItens: ItemComposicao[] = composicaoPintura.itens
        .filter((i) => i.tipoItem !== 'material')
        .map((item) => {
          const novo =
            reajusteTipo === 'percentual'
              ? Math.max(0, Math.round(item.valorUnitario * (1 + reajusteValor / 100) * 100) / 100)
              : Math.max(0, Math.round((item.valorUnitario + reajusteValor) * 100) / 100);
          return { ...item, valorUnitario: novo, subtotal: item.quantidade * novo };
        });

      // Preserva itens de tinta apenas se ainda não foram migrados
      const tintaItens = composicaoTintas
        ? []
        : composicaoPintura.itens.filter((i) => i.tipoItem === 'material');

      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoPintura.id ? { ...c, itens: [...novosItens, ...tintaItens] } : c
        ),
      };

      await OrcamentoService.update(orcamento.id, updatedOrcamento);
      toast({ title: 'Sucesso', description: 'Preços reajustados com sucesso' });
      setReajusteDialogAberto(false);
      setReajusteValor(0);
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao reajustar preços', variant: 'destructive' });
    } finally {
      setReajustando(false);
    }
  };

  // ---- totais ----
  const totalSubtotal = rows.reduce((acc, r) => acc + calcSubtotalRow(r), 0);

  // Base de litros de tinta (primer + acabamento) para cálculo de solventes
  const litrosTintaBase = useMemo(() =>
    tintaRows
      .filter((r) => r.tipo !== TipoTinta.SOLVENTE)
      .reduce((acc, r) => acc + calcTintaRow(r).litros, 0),
    [tintaRows]
  );

  const totalTintaLitros = tintaRows.reduce((acc, r) => {
    const { litros } = calcTintaRow(r, litrosTintaBase);
    return acc + litros;
  }, 0);

  const totalTintaSubtotal = tintaRows.reduce((acc, r) => {
    const { subtotal } = calcTintaRow(r, litrosTintaBase);
    return acc + subtotal;
  }, 0);

  // ---- sort (view mode) ----
  const rowsComSubtotal = useMemo(
    () => rows.map((r) => ({ ...r, _subtotal: calcSubtotalRow(r) })),
    [rows]
  );
  const { sortedData: sortedRows, sortKey, sortDirection, handleSort } = useTableSort(rowsComSubtotal);

  const tintaRowsComSubtotal = useMemo(
    () => tintaRows.map((r) => {
      const { litros, subtotal } = calcTintaRow(r, litrosTintaBase);
      return { ...r, _litros: litros, _subtotal: subtotal };
    }),
    [tintaRows, litrosTintaBase]
  );
  const { sortedData: sortedTintaRows, sortKey: tintaSortKey, sortDirection: tintaSortDirection, handleSort: handleTintaSort } = useTableSort(tintaRowsComSubtotal);

  // ==========================================
  // VIEW MODE (jateamento)
  // ==========================================
  const renderView = () => {
    if (rows.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Paintbrush className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum item de pintura cadastrado</p>
          <p className="text-sm mt-2 mb-4">Clique em "Editar Grid" para adicionar</p>
          <Button onClick={() => setEditMode(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Editar Grid
          </Button>
        </div>
      );
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="border-r w-10 text-center">#</TableHead>
              <SortableTableHeader label="Código" sortKey="codigo" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} className="border-r w-32" />
              <SortableTableHeader label="Descrição" sortKey="descricao" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} className="border-r" />
              <SortableTableHeader label="Qtd" sortKey="quantidade" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} className="border-r w-20" align="center" />
              <TableHead className="border-r w-20">Unid.</TableHead>
              <SortableTableHeader label="Valor Unit." sortKey="valorUnitario" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} className="border-r w-32" align="right" />
              <SortableTableHeader label="Subtotal" sortKey="_subtotal" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} className="w-36" align="right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((r, idx) => (
              <TableRow key={r._localId} className="hover:bg-muted/30">
                <TableCell className="border-r text-center font-medium">{idx + 1}</TableCell>
                <TableCell className="border-r font-mono text-xs">{r.codigo || '—'}</TableCell>
                <TableCell className="border-r font-medium">{r.descricao}</TableCell>
                <TableCell className="border-r text-center">{r.quantidade !== '' ? r.quantidade : '—'}</TableCell>
                <TableCell className="border-r">{r.unidade}</TableCell>
                <TableCell className="border-r text-right font-mono">{formatCurrency(Number(r.valorUnitario))}</TableCell>
                <TableCell className="text-right font-bold text-green-600">{formatCurrency(r._subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // ==========================================
  // EDIT MODE (jateamento)
  // ==========================================
  const renderEdit = () => (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="border-r w-10 text-center">#</TableHead>
            <TableHead className="border-r w-32">Código</TableHead>
            <TableHead className="border-r min-w-[200px]">Descrição</TableHead>
            <TableHead className="border-r w-24 text-center">Qtd</TableHead>
            <TableHead className="border-r w-24">Unid.</TableHead>
            <TableHead className="border-r w-36 text-center">Valor Unit.</TableHead>
            <TableHead className="border-r w-36 text-center">Subtotal</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow key={r._localId}>
              <TableCell className="border-r text-center font-medium">{idx + 1}</TableCell>

              <TableCell className="border-r p-1">
                <Input
                  className="h-8 text-sm font-mono"
                  value={r.codigo}
                  onChange={(e) => handleField(r._localId, 'codigo', e.target.value)}
                  placeholder="Código..."
                  disabled={salvando}
                />
              </TableCell>

              <TableCell className="border-r p-1">
                <Input
                  className="h-8 text-sm"
                  value={r.descricao}
                  onChange={(e) => handleField(r._localId, 'descricao', e.target.value)}
                  placeholder="Descrição..."
                  disabled={salvando}
                />
              </TableCell>

              <TableCell className="border-r p-1">
                <Input
                  type="number" min={0} step={0.01}
                  className="h-8 text-sm text-center"
                  value={r.quantidade}
                  onChange={(e) =>
                    handleField(r._localId, 'quantidade', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0"
                  disabled={salvando}
                />
              </TableCell>

              <TableCell className="border-r p-1">
                <Input
                  className="h-8 text-sm"
                  value={r.unidade}
                  onChange={(e) => handleField(r._localId, 'unidade', e.target.value)}
                  placeholder="un"
                  disabled={salvando}
                />
              </TableCell>

              <TableCell className="border-r p-1">
                <Input
                  type="number" min={0} step={0.01}
                  className="h-8 text-sm text-center"
                  value={r.valorUnitario}
                  onChange={(e) =>
                    handleField(r._localId, 'valorUnitario', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0.00"
                  disabled={salvando}
                />
              </TableCell>

              <TableCell className="border-r text-center font-bold text-green-600 bg-muted/30">
                {formatCurrency(calcSubtotalRow(r))}
              </TableCell>

              <TableCell className="p-1 text-center">
                <Button
                  size="sm" variant="ghost"
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
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                Nenhuma linha. Clique em "+ Linha" para adicionar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  // ==========================================
  // TINTA VIEW MODE
  // ==========================================
  const renderTintaView = () => {
    if (tintaRows.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <Droplets className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium">Nenhuma tinta cadastrada</p>
          <p className="text-sm mt-1 mb-3">Clique em "Editar Tintas" para adicionar</p>
          <Button size="sm" onClick={() => setTintaEditMode(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Editar Tintas
          </Button>
        </div>
      );
    }

    return (
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="border-r w-10 text-center">#</TableHead>
              <SortableTableHeader label="Descrição" sortKey="descricao" currentSortKey={tintaSortKey} currentSortDirection={tintaSortDirection} onSort={handleTintaSort} className="border-r" />
              <SortableTableHeader label="Tipo" sortKey="tipo" currentSortKey={tintaSortKey} currentSortDirection={tintaSortDirection} onSort={handleTintaSort} className="border-r w-28" align="center" />
              <TableHead className="border-r w-28 text-center">Área m² / % Dil.</TableHead>
              <TableHead className="border-r w-24 text-center">Demão / Base</TableHead>
              <TableHead className="border-r w-24 text-center">Esp. (µm)</TableHead>
              <TableHead className="border-r w-28 text-center">Rend. (m²/L)</TableHead>
              <SortableTableHeader label="Litros" sortKey="_litros" currentSortKey={tintaSortKey} currentSortDirection={tintaSortDirection} onSort={handleTintaSort} className="border-r w-24" align="center" />
              <SortableTableHeader label="R$/L" sortKey="precoLitro" currentSortKey={tintaSortKey} currentSortDirection={tintaSortDirection} onSort={handleTintaSort} className="border-r w-28" align="center" />
              <SortableTableHeader label="Subtotal" sortKey="_subtotal" currentSortKey={tintaSortKey} currentSortDirection={tintaSortDirection} onSort={handleTintaSort} className="w-28" align="center" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTintaRows.map((r, idx) => {
              const { rendimento, litros, subtotal } = calcTintaRow(r, litrosTintaBase);
              const isSolvente = r.tipo === TipoTinta.SOLVENTE;
              return (
                <TableRow key={r._localId} className="hover:bg-muted/30">
                  <TableCell className="border-r text-center font-medium">{idx + 1}</TableCell>
                  <TableCell className="border-r">
                    <p className="font-medium text-sm">{r.descricao || '—'}</p>
                    {r.tintaCodigo && (
                      <p className="text-xs text-muted-foreground font-mono">{r.tintaCodigo}</p>
                    )}
                  </TableCell>
                  <TableCell className="border-r text-center">
                    {r.tipo ? (
                      <Badge
                        variant={getTintaBadgeVariant(r.tipo)}
                        className="text-xs"
                      >
                        {TipoTintaLabels[r.tipo as TipoTinta]}
                      </Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="border-r text-center font-mono">
                    {isSolvente
                      ? <span className="text-purple-600 font-medium">{Number(r.pctDiluicao).toFixed(0)}% dil.</span>
                      : Number(r.areaM2).toFixed(2)}
                  </TableCell>
                  <TableCell className="border-r text-center">
                    {isSolvente
                      ? <span className="text-xs text-muted-foreground">Base: {litrosTintaBase.toFixed(2)} L</span>
                      : r.maos}
                  </TableCell>
                  <TableCell className="border-r text-center">
                    {isSolvente ? '—' : r.espessuraSeca}
                  </TableCell>
                  <TableCell className="border-r text-center font-mono text-blue-600">
                    {isSolvente ? '—' : (rendimento > 0 ? rendimento.toFixed(2) : '—')}
                  </TableCell>
                  <TableCell className="border-r text-center font-mono font-bold">
                    {litros > 0 ? litros.toFixed(2) : '—'}
                  </TableCell>
                  <TableCell className="border-r text-center font-mono">
                    {formatCurrency(Number(r.precoLitro))}
                  </TableCell>
                  <TableCell className="text-center font-bold text-green-600">
                    {formatCurrency(subtotal)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  // ==========================================
  // TINTA EDIT MODE
  // ==========================================
  const renderTintaEdit = () => (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="border-r w-10 text-center">#</TableHead>
            <TableHead className="border-r min-w-[220px] text-center">Descrição</TableHead>
            <TableHead className="border-r w-28 text-center">Tipo</TableHead>
            <TableHead className="border-r w-28 text-center">Área m² / % Dil.</TableHead>
            <TableHead className="border-r w-16 text-center">Demão</TableHead>
            <TableHead className="border-r w-24 text-center">Esp. (µm)</TableHead>
            <TableHead className="border-r w-28 text-center bg-blue-50 dark:bg-blue-950/30">Rend. (m²/L)</TableHead>
            <TableHead className="border-r w-24 text-center bg-blue-50 dark:bg-blue-950/30">Litros</TableHead>
            <TableHead className="border-r w-28 text-center">R$/L</TableHead>
            <TableHead className="border-r w-28 text-center bg-green-50 dark:bg-green-950/30">Subtotal</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tintaRows.map((r, idx) => {
            const { rendimento, litros, subtotal } = calcTintaRow(r, litrosTintaBase);
            const isSolvente = r.tipo === TipoTinta.SOLVENTE;
            return (
              <TableRow key={r._localId}>
                <TableCell className="border-r text-center font-medium">{idx + 1}</TableCell>

                {/* Seleção da tinta */}
                <TableCell className="border-r p-1 min-w-[220px]">
                  <Select
                    value={r.tintaCodigo || 'none'}
                    onValueChange={(val) => handleTintaSelect(r._localId, val === 'none' ? '' : val)}
                    disabled={tintaSalvando}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Selecione —</SelectItem>
                      {tintasPrimer.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-xs font-bold text-amber-700 py-1">
                            Primers / Fundo
                          </SelectLabel>
                          {tintasPrimer.map((t) => (
                            <SelectItem key={t.codigo} value={t.codigo} className="text-xs">
                              [{t.codigo}] {t.descricao}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {tintasAcabamento.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-xs font-bold text-blue-700 py-1">
                            Acabamentos
                          </SelectLabel>
                          {tintasAcabamento.map((t) => (
                            <SelectItem key={t.codigo} value={t.codigo} className="text-xs">
                              [{t.codigo}] {t.descricao}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {tintasSolvente.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="text-xs font-bold text-purple-700 py-1">
                            Solventes / Diluentes
                          </SelectLabel>
                          {tintasSolvente.map((t) => (
                            <SelectItem key={t.codigo} value={t.codigo} className="text-xs">
                              [{t.codigo}] {t.descricao}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Tipo (auto) */}
                <TableCell className="border-r text-center">
                  {r.tipo ? (
                    <Badge
                      variant={getTintaBadgeVariant(r.tipo)}
                      className="text-xs"
                    >
                      {TipoTintaLabels[r.tipo as TipoTinta]}
                    </Badge>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </TableCell>

                {/* Área m² — ou % Diluição para solventes */}
                <TableCell className="border-r p-1">
                  {isSolvente ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number" min={1} max={200} step={1}
                        className="h-8 text-sm text-center"
                        value={r.pctDiluicao}
                        onChange={(e) =>
                          handleTintaField(r._localId, 'pctDiluicao', e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="50"
                        disabled={tintaSalvando}
                      />
                      <span className="text-xs text-muted-foreground shrink-0">%</span>
                    </div>
                  ) : (
                    <Input
                      type="number" min={0} step={0.01}
                      className="h-8 text-sm text-center"
                      value={r.areaM2}
                      onChange={(e) =>
                        handleTintaField(r._localId, 'areaM2', e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder={areaTotal > 0 ? areaTotal.toFixed(2) : '0.00'}
                      disabled={tintaSalvando}
                    />
                  )}
                </TableCell>

                {/* Nº de mãos — ou Base litros (read-only) para solventes */}
                <TableCell className="border-r p-1">
                  {isSolvente ? (
                    <div className="text-center leading-tight">
                      <p className="text-xs font-mono font-bold">{litrosTintaBase.toFixed(2)}</p>
                      <p className="text-xs text-purple-600">base (L)</p>
                    </div>
                  ) : (
                    <Input
                      type="number" min={1} step={1}
                      className="h-8 text-sm text-center"
                      value={r.maos}
                      onChange={(e) =>
                        handleTintaField(r._localId, 'maos', e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="1"
                      disabled={tintaSalvando}
                    />
                  )}
                </TableCell>

                {/* Espessura seca µm — oculta para solventes */}
                <TableCell className="border-r p-1">
                  {isSolvente ? (
                    <span className="flex justify-center text-muted-foreground text-sm">—</span>
                  ) : (
                    <Input
                      type="number" min={1} step={1}
                      className="h-8 text-sm text-center"
                      value={r.espessuraSeca}
                      onChange={(e) =>
                        handleTintaField(r._localId, 'espessuraSeca', e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="75"
                      disabled={tintaSalvando}
                    />
                  )}
                </TableCell>

                {/* Rendimento (calculado) — N/A para solventes */}
                <TableCell className="border-r text-center bg-blue-50/50 dark:bg-blue-950/20 font-mono text-sm text-blue-700">
                  {isSolvente
                    ? <span className="text-muted-foreground">—</span>
                    : rendimento > 0
                      ? rendimento.toFixed(2)
                      : <span className="text-muted-foreground">—</span>}
                </TableCell>

                {/* Litros (calculado) */}
                <TableCell className="border-r text-center bg-blue-50/50 dark:bg-blue-950/20 font-mono text-sm font-bold text-blue-800">
                  {litros > 0
                    ? litros.toFixed(2)
                    : <span className="text-muted-foreground">—</span>}
                </TableCell>

                {/* R$/L */}
                <TableCell className="border-r p-1">
                  <Input
                    type="number" min={0} step={0.01}
                    className="h-8 text-sm text-center"
                    value={r.precoLitro}
                    onChange={(e) =>
                      handleTintaField(r._localId, 'precoLitro', e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="0.00"
                    disabled={tintaSalvando}
                  />
                </TableCell>

                {/* Subtotal (calculado) */}
                <TableCell className="border-r text-center bg-green-50/50 dark:bg-green-950/20 font-bold text-green-700">
                  {formatCurrency(subtotal)}
                </TableCell>

                {/* Delete */}
                <TableCell className="p-1 text-center">
                  <Button
                    size="sm" variant="ghost"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveTintaRow(r._localId)}
                    disabled={tintaSalvando}
                    title="Remover linha"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}

          {tintaRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                Nenhuma tinta. Clique em "+ Tinta" para adicionar.
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
    <div className="space-y-6">
      {/* Alert Explicativo */}
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950/50">
        <Info className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <strong>Área calculada automaticamente:</strong> Para cada material da aba Materiais,
          o sistema calcula o perímetro da seção transversal × quantidade (perfis/barras/tubos)
          ou 2 × área (chapas, ambas as faces).
        </AlertDescription>
      </Alert>

      {/* Card de Cálculo Automático */}
      <Card className="border-green-500 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-green-600" />
            Base para Cálculo de Pintura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-muted-foreground">Área de Pintura Estimada</Label>
              <p className="text-4xl font-bold text-green-600 mt-2">{areaTotal.toFixed(2)} m²</p>
              <p className="text-xs text-muted-foreground mt-1">
                Calculado dos {composicaoMateriais?.itens.length ?? 0} materiais do orçamento
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Método de Cálculo</Label>
              <p className="text-sm font-medium text-blue-600 mt-2">
                Perímetro × comprimento por material
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado nas dimensões do catálogo (ABNT / ASTM)
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status da Composição</Label>
              <p className="text-lg font-semibold mt-2">
                {composicaoPintura ? (
                  <span className="text-green-600">✓ {composicaoPintura.itens.length} itens cadastrados</span>
                ) : (
                  <span className="text-amber-600">⚠ Nenhum item cadastrado</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Itens de Jateamento e Pintura */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Itens de Jateamento e Pintura</CardTitle>
            <div className="flex gap-2 flex-wrap">
              {!editMode && (
                <>
                  <ExportarAbaCompletaButton
                    tituloAba="Pintura"
                    secoes={[
                      {
                        titulo: 'Jateamento e Pintura',
                        rows: rowsComSubtotal.map((r) => ({
                          codigo: r.codigo,
                          descricao: r.descricao,
                          quantidade: r.quantidade,
                          unidade: r.unidade,
                          valorUnitario: r.valorUnitario,
                          subtotal: r._subtotal,
                        })),
                      },
                      {
                        titulo: 'Tintas e Solventes',
                        rows: tintaRowsComSubtotal.map((r) => ({
                          codigo: r.tintaCodigo,
                          descricao: r.tipo
                            ? `${r.descricao} (${TipoTintaLabels[r.tipo as TipoTinta] ?? r.tipo})`
                            : r.descricao,
                          quantidade: r._litros,
                          unidade: 'L',
                          valorUnitario: Number(r.precoLitro) || 0,
                          subtotal: r._subtotal,
                        })),
                        labelQuantidade: 'Litros',
                        labelUnidade: 'Unid.',
                      },
                    ]}
                  />
                  {rows.length > 0 && (
                    <ExportarComposicaoButton
                      titulo="Jateamento e Pintura"
                      rows={rowsComSubtotal.map((r) => ({
                        codigo: r.codigo,
                        descricao: r.descricao,
                        quantidade: r.quantidade,
                        unidade: r.unidade,
                        valorUnitario: r.valorUnitario,
                        subtotal: r._subtotal,
                      }))}
                    />
                  )}
                  <Button size="sm" variant="outline" onClick={handleBaixarModelo} title="Baixar planilha modelo">
                    <Download className="mr-2 h-4 w-4" />
                    Modelo
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importLendo}
                    title="Importar planilha .xlsx / .csv"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {importLendo ? 'Lendo...' : 'Importar'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.csv"
                    className="hidden"
                    onChange={handleArquivoSelecionado}
                  />
                  {rows.length > 0 && (
                    <Button
                      size="sm" variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => setReajusteDialogAberto(true)}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Reajustar
                    </Button>
                  )}
                  {rows.length > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar Grid
                    </Button>
                  )}
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
        </CardHeader>
        <CardContent>
          {editMode ? renderEdit() : renderView()}

          {/* Totais */}
          {rows.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-muted-foreground">Itens</Label>
                  <p className="text-xl font-bold">{rows.length}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Custo Direto</Label>
                  <p className="text-xl font-bold">
                    {formatCurrency(composicaoPintura?.custoDirecto ?? totalSubtotal)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Label className="text-muted-foreground">BDI</Label>
                    {!editandoBDI && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditandoBDI(true)}
                        title="Editar BDI"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {editandoBDI ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number" min={0} max={100} step={0.5}
                        value={bdiInput}
                        onChange={(e) => setBdiInput(parseFloat(e.target.value) || 0)}
                        className="w-20 h-8 text-sm"
                        disabled={salvandoBDI}
                        autoFocus
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                      <Button
                        size="sm" variant="ghost" className="h-8 w-8 p-0"
                        onClick={() => { setEditandoBDI(false); setBdiInput(composicaoPintura?.bdi?.percentual ?? 0); }}
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
                        {formatCurrency(composicaoPintura?.bdi?.valor ?? 0)}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        ({composicaoPintura?.bdi?.percentual ?? 0}%)
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Subtotal</Label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(composicaoPintura?.subtotal ?? totalSubtotal)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================== Card Tintas e Solventes ==================== */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              Tintas e Solventes
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              {!tintaEditMode && tintaRows.length > 0 && (
                <>
                  <ExportarComposicaoButton
                    titulo="Tintas e Solventes"
                    rows={tintaRowsComSubtotal.map((r) => ({
                      codigo: r.tintaCodigo,
                      descricao: r.tipo
                        ? `${r.descricao} (${TipoTintaLabels[r.tipo as TipoTinta] ?? r.tipo})`
                        : r.descricao,
                      quantidade: r._litros,
                      unidade: 'L',
                      valorUnitario: Number(r.precoLitro) || 0,
                      subtotal: r._subtotal,
                    }))}
                    labelQuantidade="Litros"
                    labelUnidade="Unid."
                  />
                  <Button size="sm" variant="outline" onClick={() => setTintaEditMode(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar Tintas
                  </Button>
                </>
              )}
              {tintaEditMode && (
                <>
                  <Button size="sm" variant="outline" onClick={handleAddTintaRow} disabled={tintaSalvando}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tinta
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelTintas} disabled={tintaSalvando}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveTintas} disabled={tintaSalvando}>
                    <Save className="mr-2 h-4 w-4" />
                    {tintaSalvando ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tintaEditMode ? renderTintaEdit() : renderTintaView()}

          {/* Informações de cálculo (somente quando vazio) */}
          {!tintaEditMode && tintaRows.length === 0 && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Cálculo de Consumo de Tinta:</p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
                <li>• <strong>Rendimento (m²/L)</strong> = (SV% / 100) × (1000 / Espessura Seca µm)</li>
                <li>• <strong>Litragem tinta</strong> = (Área m² × Nº de Demãos) / Rendimento</li>
                <li>• <strong>Litragem solvente</strong> = Litros base (Primer + Acabamento) × % Diluição</li>
                <li>• <strong>Subtotal</strong> = Litragem × Preço R$/L</li>
                <li>• Os dados das tintas vêm do catálogo em <em>Cadastros → Tintas</em></li>
              </ul>
            </div>
          )}

          {/* Totais tintas */}
          {tintaRows.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tintas cadastradas</Label>
                  <p className="text-xl font-bold">{tintaRows.length}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total de Litros</Label>
                  <p className="text-xl font-bold text-blue-600">{totalTintaLitros.toFixed(2)} L</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Custo Direto Tintas</Label>
                  <p className="text-xl font-bold">{formatCurrency(totalTintaSubtotal)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Label className="text-muted-foreground">BDI</Label>
                    {!editandoBDITintas && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditandoBDITintas(true)}
                        title="Editar BDI de Tintas"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {editandoBDITintas ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        type="number" min={0} max={100} step={0.5}
                        value={bdiInputTintas}
                        onChange={(e) => setBdiInputTintas(parseFloat(e.target.value) || 0)}
                        className="w-20 h-8 text-sm"
                        disabled={salvandoBDITintas}
                        autoFocus
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                      <Button
                        size="sm" variant="ghost" className="h-8 w-8 p-0"
                        onClick={() => { setEditandoBDITintas(false); setBdiInputTintas(composicaoTintasOuPadrao.bdi?.percentual ?? 12); }}
                        disabled={salvandoBDITintas}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Button size="sm" className="h-8 w-8 p-0" onClick={handleSalvarBDITintas} disabled={salvandoBDITintas}>
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(totalTintaSubtotal * (composicaoTintasOuPadrao.bdi?.percentual ?? 12) / 100)}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        ({composicaoTintasOuPadrao.bdi?.percentual ?? 12}%)
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Subtotal (c/ BDI)</Label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(
                      totalTintaSubtotal * (1 + (composicaoTintasOuPadrao.bdi?.percentual ?? 12) / 100)
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Importar */}
      <Dialog open={importDialogAberto} onOpenChange={setImportDialogAberto}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Itens de Pintura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {importErros.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3 space-y-1">
                <p className="text-sm font-medium text-red-700 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> {importErros.length} erro(s) encontrado(s):
                </p>
                {importErros.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 ml-5">{e}</p>
                ))}
              </div>
            )}

            {importDados.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-600 font-medium">{importDados.length} item(s) válido(s)</p>
                  <div className="flex items-center gap-3">
                    <Label className="text-sm">Modo:</Label>
                    <Select value={importModo} onValueChange={(v) => setImportModo(v as 'acrescentar' | 'substituir')}>
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acrescentar">Acrescentar</SelectItem>
                        <SelectItem value="substituir">Substituir tudo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="border-r">Código</TableHead>
                        <TableHead className="border-r">Descrição</TableHead>
                        <TableHead className="border-r text-right">Qtd</TableHead>
                        <TableHead className="border-r">Unid.</TableHead>
                        <TableHead className="text-right">Valor Unit.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importDados.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="border-r font-mono text-xs">{r.codigo || '—'}</TableCell>
                          <TableCell className="border-r">{r.descricao}</TableCell>
                          <TableCell className="border-r text-right">{r.quantidade}</TableCell>
                          <TableCell className="border-r">{r.unidade}</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(Number(r.valorUnitario))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            {importDados.length === 0 && importErros.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhum dado válido encontrado no arquivo.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogAberto(false)}>Cancelar</Button>
            <Button
              onClick={handleConfirmarImport}
              disabled={importDados.length === 0 || importImportando}
            >
              {importImportando ? 'Importando...' : `Importar ${importDados.length} item(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reajuste */}
      <Dialog open={reajusteDialogAberto} onOpenChange={setReajusteDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reajuste de Preços — Pintura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex items-center gap-2">
                <Label>Tipo:</Label>
                <Select value={reajusteTipo} onValueChange={(v) => setReajusteTipo(v as 'percentual' | 'fixo')}>
                  <SelectTrigger className="w-36 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentual">Percentual (%)</SelectItem>
                    <SelectItem value="fixo">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label>Valor:</Label>
                <Input
                  type="number"
                  step={reajusteTipo === 'percentual' ? 0.1 : 0.01}
                  className="w-28 h-8 text-sm"
                  value={reajusteValor}
                  onChange={(e) => setReajusteValor(parseFloat(e.target.value) || 0)}
                />
                <span className="text-sm text-muted-foreground">
                  {reajusteTipo === 'percentual' ? '%' : 'R$'}
                </span>
              </div>
            </div>

            {reajustePreviewItens.length > 0 && (
              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="border-r">Descrição</TableHead>
                      <TableHead className="border-r text-right">Antes</TableHead>
                      <TableHead className="border-r text-right">Depois</TableHead>
                      <TableHead className="text-right">Variação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reajustePreviewItens.map((item) => {
                      const variacao = item.novoValor - item.valorUnitario;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="border-r text-sm">{item.descricao}</TableCell>
                          <TableCell className="border-r text-right font-mono text-sm">
                            {formatCurrency(item.valorUnitario)}
                          </TableCell>
                          <TableCell className="border-r text-right font-mono font-bold text-sm">
                            {formatCurrency(item.novoValor)}
                          </TableCell>
                          <TableCell
                            className={`text-right text-sm font-medium ${variacao > 0 ? 'text-green-600' : variacao < 0 ? 'text-red-600' : 'text-muted-foreground'}`}
                          >
                            <span className="flex items-center justify-end gap-1">
                              {variacao > 0 ? <ArrowUp className="h-3 w-3" /> : variacao < 0 ? <ArrowDown className="h-3 w-3" /> : null}
                              {variacao !== 0 ? formatCurrency(Math.abs(variacao)) : '—'}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReajusteDialogAberto(false)}>Cancelar</Button>
            <Button
              onClick={handleConfirmarReajuste}
              disabled={reajustando || reajustePreviewItens.length === 0}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {reajustando ? 'Aplicando...' : 'Aplicar Reajuste'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
