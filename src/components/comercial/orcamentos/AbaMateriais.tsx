import { useState, useEffect, useRef } from 'react';
import {
  Package, Plus, Scissors, Edit2, Save, X, Trash2, Upload, Download,
  TrendingUp, Check, Edit, AlertCircle, ArrowUp, ArrowDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Orcamento, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import { formatCurrency } from '@/lib/currency';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import OrcamentoService from '@/services/OrcamentoService';

interface AbaMateriaisProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

// ---- tipos locais ----
interface RowMaterial {
  _localId: string;
  itemId?: string;
  codigo: string;
  descricao: string;
  material: string;
  quantidade: number | '';
  unidade: string;
  peso: number | '';
  valorUnitario: number | '';
}

// ---- helpers ----
const calcSubtotalMat = (r: RowMaterial): number =>
  Math.round((Number(r.quantidade) || 0) * (Number(r.valorUnitario) || 0) * 100) / 100;

const parseItemMaterial = (item: ItemComposicao): RowMaterial => ({
  _localId: item.id,
  itemId: item.id,
  codigo: item.codigo ?? '',
  descricao: item.descricao ?? '',
  material: item.material ?? '',
  quantidade: item.quantidade,
  unidade: item.unidade || 'kg',
  peso: item.peso ?? '',
  valorUnitario: item.valorUnitario,
});

const newRowMaterial = (): RowMaterial => ({
  _localId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  codigo: '',
  descricao: '',
  material: '',
  quantidade: '',
  unidade: 'kg',
  peso: '',
  valorUnitario: '',
});

export default function AbaMateriais({ orcamento, onUpdate }: AbaMateriaisProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const composicaoMateriais = orcamento.composicoes.find((c) => c.tipo === 'materiais');

  // Grid state
  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState<RowMaterial[]>([]);
  const [salvando, setSalvando] = useState(false);

  // BDI
  const [editandoBDI, setEditandoBDI] = useState(false);
  const [bdiInput, setBdiInput] = useState(composicaoMateriais?.bdi?.percentual ?? 0);
  const [salvandoBDI, setSalvandoBDI] = useState(false);

  // Import
  const [importDialogAberto, setImportDialogAberto] = useState(false);
  const [importModo, setImportModo] = useState<'acrescentar' | 'substituir'>('acrescentar');
  const [importLendo, setImportLendo] = useState(false);
  const [importImportando, setImportImportando] = useState(false);
  const [importDados, setImportDados] = useState<RowMaterial[]>([]);
  const [importErros, setImportErros] = useState<string[]>([]);

  // Reajuste
  const [reajusteDialogAberto, setReajusteDialogAberto] = useState(false);
  const [reajusteTipo, setReajusteTipo] = useState<'percentual' | 'fixo'>('percentual');
  const [reajusteValor, setReajusteValor] = useState(0);
  const [reajustando, setReajustando] = useState(false);

  // Sync BDI
  useEffect(() => {
    if (!editandoBDI) setBdiInput(composicaoMateriais?.bdi?.percentual ?? 0);
  }, [composicaoMateriais?.bdi?.percentual, editandoBDI]);

  // Sync rows
  useEffect(() => {
    if (!composicaoMateriais) { setRows([]); return; }
    setRows(composicaoMateriais.itens.map(parseItemMaterial));
  }, [composicaoMateriais]);

  // ---- field handlers ----
  const handleField = <K extends keyof RowMaterial>(localId: string, field: K, value: RowMaterial[K]) =>
    setRows((prev) => prev.map((r) => (r._localId === localId ? { ...r, [field]: value } : r)));

  const handleAddRow = () => setRows((prev) => [...prev, newRowMaterial()]);
  const handleRemoveRow = (localId: string) => setRows((prev) => prev.filter((r) => r._localId !== localId));

  const handleCancel = () => {
    if (!composicaoMateriais) { setRows([]); }
    else { setRows(composicaoMateriais.itens.map(parseItemMaterial)); }
    setEditMode(false);
  };

  // ---- save ----
  const handleSave = async () => {
    if (!composicaoMateriais) return;

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
        toast({ title: 'Atenção', description: `${linha}: informe o preço unitário`, variant: 'destructive' });
        return;
      }
    }

    try {
      setSalvando(true);
      const novosItens: ItemComposicao[] = rows.map((r, index) => ({
        id: r.itemId ?? `mat-${Date.now()}-${index}`,
        composicaoId: composicaoMateriais.id,
        descricao: r.descricao,
        codigo: r.codigo || undefined,
        material: r.material || undefined,
        quantidade: Number(r.quantidade),
        unidade: r.unidade,
        peso: r.peso !== '' ? Number(r.peso) : undefined,
        valorUnitario: Number(r.valorUnitario),
        subtotal: calcSubtotalMat(r),
        percentual: 0,
        tipoItem: 'material' as const,
        ordem: index + 1,
      }));

      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoMateriais.id ? { ...c, itens: novosItens } : c
        ),
      };

      await OrcamentoService.update(orcamento.id, updatedOrcamento);
      setEditMode(false);
      toast({ title: 'Sucesso', description: 'Materiais salvos com sucesso' });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar materiais', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  // ---- BDI ----
  const handleSalvarBDI = async () => {
    if (!composicaoMateriais) return;
    try {
      setSalvandoBDI(true);
      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoMateriais.id
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

  // ---- import ----
  const handleBaixarModelo = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      [{
        'Código': 'MAT-001',
        'Descrição': 'PERFIL "U" ABERTO',
        'Material': 'ASTM A 36',
        'Qtd': 100,
        'Unidade': 'kg',
        'Peso unitário (kg)': 1.5,
        'Preço Unitário (R$)': 8.50,
      }],
      { header: ['Código', 'Descrição', 'Material', 'Qtd', 'Unidade', 'Peso unitário (kg)', 'Preço Unitário (R$)'] }
    );
    ws['!cols'] = [{ wch: 14 }, { wch: 40 }, { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 20 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Materiais');
    XLSX.writeFile(wb, 'modelo_materiais.xlsx');
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
      const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const validos: RowMaterial[] = [];
      const erros: string[] = [];

      rawRows.forEach((row, i) => {
        const linhaN = i + 2;
        const codigo = String(row['Código'] || row['Codigo'] || row['codigo'] || '').trim();
        const descricao = String(row['Descrição'] || row['Descricao'] || row['descricao'] || '').trim();
        const material = String(row['Material'] || row['material'] || '').trim();
        const qtdRaw = row['Qtd'] ?? row['Quantidade'] ?? row['quantidade'] ?? '';
        const qtd = typeof qtdRaw === 'number' ? qtdRaw : parseFloat(String(qtdRaw).replace(',', '.')) || 0;
        const unidade = String(row['Unidade'] || row['unidade'] || 'kg').trim();
        const pesoRaw = row['Peso unitário (kg)'] ?? row['Peso'] ?? row['peso'] ?? '';
        const peso = pesoRaw !== '' ? (typeof pesoRaw === 'number' ? pesoRaw : parseFloat(String(pesoRaw).replace(',', '.'))) : undefined;
        const precoRaw = row['Preço Unitário (R$)'] ?? row['Preco'] ?? row['preco'] ?? row['valor'] ?? 0;
        const preco = typeof precoRaw === 'number' ? precoRaw : parseFloat(String(precoRaw).replace(',', '.')) || 0;

        if (!descricao) { erros.push(`Linha ${linhaN}: Descrição obrigatória`); return; }
        if (qtd <= 0) { erros.push(`Linha ${linhaN}: Quantidade deve ser > 0`); return; }
        if (preco < 0) { erros.push(`Linha ${linhaN}: Preço deve ser ≥ 0`); return; }

        validos.push({
          _localId: `import-${Date.now()}-${i}`,
          codigo,
          descricao,
          material,
          quantidade: qtd,
          unidade: unidade || 'kg',
          peso: peso ?? '',
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
    if (!composicaoMateriais || importDados.length === 0) return;
    setImportImportando(true);
    try {
      const baseItens = importModo === 'substituir' ? [] : composicaoMateriais.itens;
      const novosItens: ItemComposicao[] = importDados.map((r, index) => ({
        id: `import-${Date.now()}-${index}`,
        composicaoId: composicaoMateriais.id,
        descricao: r.descricao,
        codigo: r.codigo || undefined,
        material: r.material || undefined,
        quantidade: Number(r.quantidade),
        unidade: r.unidade,
        peso: r.peso !== '' ? Number(r.peso) : undefined,
        valorUnitario: Number(r.valorUnitario),
        subtotal: calcSubtotalMat(r),
        percentual: 0,
        tipoItem: 'material' as const,
        ordem: baseItens.length + index + 1,
      }));

      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoMateriais.id ? { ...c, itens: [...baseItens, ...novosItens] } : c
        ),
      };

      await OrcamentoService.update(orcamento.id, updatedOrcamento);
      toast({ title: 'Sucesso', description: `${importDados.length} material(is) importado(s)` });
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
  const reajustePreviewItens = (composicaoMateriais?.itens ?? []).map((item) => {
    const novo =
      reajusteTipo === 'percentual'
        ? Math.max(0, Math.round(item.valorUnitario * (1 + reajusteValor / 100) * 100) / 100)
        : Math.max(0, Math.round((item.valorUnitario + reajusteValor) * 100) / 100);
    return { ...item, novoValor: novo };
  });

  const handleConfirmarReajuste = async () => {
    if (!composicaoMateriais) return;
    setReajustando(true);
    try {
      const novosItens: ItemComposicao[] = composicaoMateriais.itens.map((item) => {
        const novo =
          reajusteTipo === 'percentual'
            ? Math.max(0, Math.round(item.valorUnitario * (1 + reajusteValor / 100) * 100) / 100)
            : Math.max(0, Math.round((item.valorUnitario + reajusteValor) * 100) / 100);
        return { ...item, valorUnitario: novo, subtotal: item.quantidade * novo };
      });

      const updatedOrcamento = {
        ...orcamento,
        composicoes: orcamento.composicoes.map((c) =>
          c.id === composicaoMateriais.id ? { ...c, itens: novosItens } : c
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
  const totalSubtotal = rows.reduce((acc, r) => acc + calcSubtotalMat(r), 0);
  const totalPeso = rows.reduce((acc, r) => acc + (Number(r.peso) || 0) * (Number(r.quantidade) || 0), 0);

  // ==========================================
  // VIEW MODE
  // ==========================================
  const renderView = () => {
    if (rows.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum material cadastrado</p>
          <p className="text-sm mt-2 mb-4">Clique em "Editar Grid" para adicionar perfis, chapas e outros materiais</p>
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
              <TableHead className="border-r w-28">Código</TableHead>
              <TableHead className="border-r">Descrição</TableHead>
              <TableHead className="border-r w-28">Material</TableHead>
              <TableHead className="border-r text-center w-20">Qtd</TableHead>
              <TableHead className="border-r w-16">Unid.</TableHead>
              <TableHead className="border-r text-right w-24">Peso (kg)</TableHead>
              <TableHead className="border-r text-right w-32">Preço Unit.</TableHead>
              <TableHead className="text-right w-36">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={r._localId} className="hover:bg-muted/30">
                <TableCell className="border-r text-center font-medium">{idx + 1}</TableCell>
                <TableCell className="border-r font-mono text-xs">{r.codigo || '—'}</TableCell>
                <TableCell className="border-r font-medium">{r.descricao}</TableCell>
                <TableCell className="border-r text-xs text-muted-foreground">{r.material || '—'}</TableCell>
                <TableCell className="border-r text-center">{r.quantidade !== '' ? r.quantidade : '—'}</TableCell>
                <TableCell className="border-r">{r.unidade}</TableCell>
                <TableCell className="border-r text-right font-mono">
                  {r.peso !== '' ? Number(r.peso).toFixed(2) : '—'}
                </TableCell>
                <TableCell className="border-r text-right font-mono">{formatCurrency(Number(r.valorUnitario))}</TableCell>
                <TableCell className="text-right font-bold text-green-600">{formatCurrency(calcSubtotalMat(r))}</TableCell>
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
            <TableHead className="border-r w-28">Código</TableHead>
            <TableHead className="border-r min-w-[180px]">Descrição</TableHead>
            <TableHead className="border-r w-28">Material</TableHead>
            <TableHead className="border-r w-20 text-center">Qtd</TableHead>
            <TableHead className="border-r w-20">Unid.</TableHead>
            <TableHead className="border-r w-24 text-center">Peso (kg)</TableHead>
            <TableHead className="border-r w-32 text-center">Preço Unit.</TableHead>
            <TableHead className="border-r w-32 text-center">Subtotal</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow key={r._localId}>
              <TableCell className="border-r text-center font-medium">{idx + 1}</TableCell>

              {/* Código */}
              <TableCell className="border-r p-1">
                <Input
                  className="h-8 text-sm font-mono"
                  value={r.codigo}
                  onChange={(e) => handleField(r._localId, 'codigo', e.target.value)}
                  placeholder="MAT-001"
                  disabled={salvando}
                />
              </TableCell>

              {/* Descrição */}
              <TableCell className="border-r p-1">
                <Input
                  className="h-8 text-sm"
                  value={r.descricao}
                  onChange={(e) => handleField(r._localId, 'descricao', e.target.value)}
                  placeholder="Descrição..."
                  disabled={salvando}
                />
              </TableCell>

              {/* Material */}
              <TableCell className="border-r p-1">
                <Input
                  className="h-8 text-sm"
                  value={r.material}
                  onChange={(e) => handleField(r._localId, 'material', e.target.value)}
                  placeholder="ASTM A 36"
                  disabled={salvando}
                />
              </TableCell>

              {/* Qtd */}
              <TableCell className="border-r p-1">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  className="h-8 text-sm text-center"
                  value={r.quantidade}
                  onChange={(e) =>
                    handleField(r._localId, 'quantidade', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0"
                  disabled={salvando}
                />
              </TableCell>

              {/* Unidade */}
              <TableCell className="border-r p-1">
                <Input
                  className="h-8 text-sm"
                  value={r.unidade}
                  onChange={(e) => handleField(r._localId, 'unidade', e.target.value)}
                  placeholder="kg"
                  disabled={salvando}
                />
              </TableCell>

              {/* Peso */}
              <TableCell className="border-r p-1">
                <Input
                  type="number"
                  min={0}
                  step={0.001}
                  className="h-8 text-sm text-center"
                  value={r.peso}
                  onChange={(e) =>
                    handleField(r._localId, 'peso', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0.000"
                  disabled={salvando}
                />
              </TableCell>

              {/* Preço Unit */}
              <TableCell className="border-r p-1">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  className="h-8 text-sm text-center"
                  value={r.valorUnitario}
                  onChange={(e) =>
                    handleField(r._localId, 'valorUnitario', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0.00"
                  disabled={salvando}
                />
              </TableCell>

              {/* Subtotal (readonly) */}
              <TableCell className="border-r text-center font-bold text-green-600 bg-muted/30">
                {formatCurrency(calcSubtotalMat(r))}
              </TableCell>

              {/* Remove */}
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Materiais do Orçamento
            </CardTitle>

            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => navigate('/comercial/orcamentos/lista-corte')}>
                <Scissors className="mr-2 h-4 w-4" />
                Lista de Corte
              </Button>

              {!editMode && (
                <>
                  <Button size="sm" variant="outline" onClick={handleBaixarModelo} title="Baixar planilha modelo">
                    <Download className="mr-2 h-4 w-4" />
                    Modelo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importLendo}
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
                      size="sm"
                      variant="outline"
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
          {/* Grid */}
          {editMode ? renderEdit() : renderView()}

          {/* Totais */}
          {rows.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label className="text-muted-foreground">Total de Itens</Label>
                  <p className="text-xl font-bold">{rows.length}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Peso Total (kg)</Label>
                  <p className="text-xl font-bold">{totalPeso.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Custo Direto</Label>
                  <p className="text-xl font-bold">{formatCurrency(composicaoMateriais?.custoDirecto ?? totalSubtotal)}</p>
                </div>

                {/* BDI */}
                <div>
                  <Label className="text-muted-foreground">BDI</Label>
                  {editandoBDI ? (
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
                        onClick={() => { setEditandoBDI(false); setBdiInput(composicaoMateriais?.bdi?.percentual ?? 0); }}
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
                        {formatCurrency(composicaoMateriais?.bdi?.valor ?? 0)}
                      </p>
                      <span className="text-sm text-muted-foreground">({composicaoMateriais?.bdi?.percentual ?? 0}%)</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditandoBDI(true)}
                        title="Editar BDI"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground">Subtotal</Label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(composicaoMateriais?.subtotal ?? totalSubtotal)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Importar */}
      <Dialog open={importDialogAberto} onOpenChange={setImportDialogAberto}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar Materiais</DialogTitle>
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
                  <p className="text-sm text-green-600 font-medium">{importDados.length} material(is) válido(s)</p>
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
                        <TableHead className="border-r">Material</TableHead>
                        <TableHead className="border-r text-right">Qtd</TableHead>
                        <TableHead className="border-r">Unid.</TableHead>
                        <TableHead className="border-r text-right">Peso</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importDados.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="border-r font-mono text-xs">{r.codigo || '—'}</TableCell>
                          <TableCell className="border-r text-sm">{r.descricao}</TableCell>
                          <TableCell className="border-r text-xs text-muted-foreground">{r.material || '—'}</TableCell>
                          <TableCell className="border-r text-right">{r.quantidade}</TableCell>
                          <TableCell className="border-r">{r.unidade}</TableCell>
                          <TableCell className="border-r text-right font-mono text-xs">
                            {r.peso !== '' ? Number(r.peso).toFixed(3) : '—'}
                          </TableCell>
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
              {importImportando ? 'Importando...' : `Importar ${importDados.length} material(is)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reajuste */}
      <Dialog open={reajusteDialogAberto} onOpenChange={setReajusteDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reajuste de Preços — Materiais</DialogTitle>
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
