import { useState, useEffect, useMemo } from 'react';
import { Users, Wrench, Plus, Save, X, Trash2, Edit2, UserPlus, Check, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectSeparator,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Orcamento, ComposicaoCustos, ItemComposicao } from '@/interfaces/OrcamentoInterface';
import {
  FornecedorServicoInterface,
  CategoriaFornecedorLabels,
  CategoriaFornecedorColors,
} from '@/interfaces/FornecedorServicoInterface';
import OrcamentoService from '@/services/OrcamentoService';
import AbaMaoObraGrid from './AbaMaoObraGrid';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import ExportarComposicaoButton from './ExportarComposicaoButton';
import ExportarAbaCompletaButton from './ExportarAbaCompletaButton';
import { mockFornecedores } from '@/data/mockTintas';
import FormularioFornecedor from '@/components/gerenciamento/fornecedores/FormularioFornecedor';

// ---- tipos locais ----
interface RowTerceirizado {
  _localId: string;
  itemId?: string;
  fornecedorId: string;   // '' = sem catálogo
  fornecedorNome: string;
  descricao: string;
  quantidade: number | '';
  unidade: string;
  valorUnitario: number | '';
}

const calcSubtotalTerceirizado = (r: RowTerceirizado): number =>
  Math.round((Number(r.quantidade) || 0) * (Number(r.valorUnitario) || 0) * 100) / 100;

const parseTerceirizadoItem = (item: ItemComposicao): RowTerceirizado => {
  let meta: { fornecedorId?: string; fornecedorNome?: string } = {};
  try { meta = JSON.parse(item.especificacao || '{}'); } catch { /* ignore */ }
  return {
    _localId: item.id,
    itemId: item.id,
    fornecedorId: meta.fornecedorId || '',
    fornecedorNome: meta.fornecedorNome || item.codigo || '',
    descricao: item.descricao,
    quantidade: item.quantidade,
    unidade: item.unidade || 'serv',
    valorUnitario: item.valorUnitario,
  };
};

const newRowTerceirizado = (): RowTerceirizado => ({
  _localId: `terc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  fornecedorId: '',
  fornecedorNome: '',
  descricao: '',
  quantidade: 1,
  unidade: 'serv',
  valorUnitario: '',
});

// ---- props ----
interface AbaMaoObraProps {
  orcamento: Orcamento;
  onUpdate: () => void;
}

export default function AbaMaoObra({ orcamento, onUpdate }: AbaMaoObraProps) {
  const { toast } = useToast();

  const moFabricacao = orcamento.composicoes.find((c) => c.tipo === 'mo_fabricacao');
  const moMontagem = orcamento.composicoes.find((c) => c.tipo === 'mo_montagem');
  const moTerceirizados = orcamento.composicoes.find((c) => c.tipo === 'mo_terceirizados');

  // Grid state — terceirizados
  const [rows, setRows] = useState<RowTerceirizado[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // BDI Terceirizada
  const [editandoBDI, setEditandoBDI] = useState(false);
  const [bdiInput, setBdiInput] = useState(moTerceirizados?.bdi?.percentual ?? 20);
  const [salvandoBDI, setSalvandoBDI] = useState(false);

  useEffect(() => {
    if (!editandoBDI) setBdiInput(moTerceirizados?.bdi?.percentual ?? 20);
  }, [moTerceirizados?.bdi?.percentual, editandoBDI]);

  // Cadastrar novo fornecedor inline
  const [formFornecedorAberto, setFormFornecedorAberto] = useState(false);
  const [catalogoKey, setCatalogoKey] = useState(0); // força re-render do catálogo

  // Sync rows quando composição muda
  useEffect(() => {
    if (!moTerceirizados) { setRows([]); return; }
    setRows(moTerceirizados.itens.map(parseTerceirizadoItem));
  }, [moTerceirizados]);

  // Catálogo de fornecedores
  const catalogoFornecedores = useMemo((): FornecedorServicoInterface[] => {
    try {
      const locais = JSON.parse(localStorage.getItem('fornecedores_locais') || '[]') as FornecedorServicoInterface[];
      return [...mockFornecedores, ...locais.filter((f) => f.ativo !== false)];
    } catch { return [...mockFornecedores]; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogoKey]);

  const handleAtualizarComposicao = async (composicaoAtualizada: ComposicaoCustos) => {
    const updatedOrcamento = {
      ...orcamento,
      composicoes: orcamento.composicoes.map((c) =>
        c.id === composicaoAtualizada.id ? composicaoAtualizada : c
      ),
    };
    await OrcamentoService.update(orcamento.id, updatedOrcamento);
    onUpdate();
  };

  // ---- field handlers ----
  const handleField = <K extends keyof RowTerceirizado>(localId: string, field: K, value: RowTerceirizado[K]) =>
    setRows((prev) => prev.map((r) => (r._localId === localId ? { ...r, [field]: value } : r)));

  const handleFornecedorSelect = (localId: string, fornecedorId: string) => {
    if (fornecedorId === '__novo__') {
      setFormFornecedorAberto(true);
      return;
    }
    if (!fornecedorId) {
      setRows((prev) => prev.map((r) =>
        r._localId === localId ? { ...r, fornecedorId: '', fornecedorNome: '' } : r
      ));
      return;
    }
    const forn = catalogoFornecedores.find((f) => String(f.id) === fornecedorId);
    setRows((prev) => prev.map((r) =>
      r._localId === localId
        ? { ...r, fornecedorId, fornecedorNome: forn?.nome || '' }
        : r
    ));
  };

  const handleNovoFornecedorSalvo = (novo?: FornecedorServicoInterface) => {
    setCatalogoKey((k) => k + 1); // força recarga do catálogo
    if (novo) {
      // Se há linha em edição sem fornecedor, auto-seleciona o novo
      setRows((prev) => {
        const semFornecedor = prev.find((r) => !r.fornecedorId);
        if (!semFornecedor) return prev;
        return prev.map((r) =>
          r._localId === semFornecedor._localId
            ? { ...r, fornecedorId: String(novo.id), fornecedorNome: novo.nome }
            : r
        );
      });
    }
  };

  const handleCancel = () => {
    if (!moTerceirizados) { setRows([]); }
    else { setRows(moTerceirizados.itens.map(parseTerceirizadoItem)); }
    setEditMode(false);
  };

  // ---- BDI save ----
  const handleSalvarBDI = async () => {
    try {
      setSalvandoBDI(true);
      const composicaoBase: ComposicaoCustos = moTerceirizados ?? {
        id: `comp-${orcamento.id}-terceirizados`,
        orcamentoId: orcamento.id,
        nome: 'MO Terceirizada',
        tipo: 'mo_terceirizados' as const,
        itens: [],
        bdi: { percentual: bdiInput, valor: 0 },
        custoDirecto: 0, subtotal: 0, percentualDoTotal: 0,
        ordem: orcamento.composicoes.length + 1,
      };
      const composicaoAtualizada = { ...composicaoBase, bdi: { ...composicaoBase.bdi, percentual: bdiInput } };
      const novasComposicoes = moTerceirizados
        ? orcamento.composicoes.map((c) => c.id === composicaoBase.id ? composicaoAtualizada : c)
        : [...orcamento.composicoes, composicaoAtualizada];
      await OrcamentoService.update(orcamento.id, { ...orcamento, composicoes: novasComposicoes });
      setEditandoBDI(false);
      onUpdate();
      toast({ title: 'Sucesso', description: 'BDI atualizado com sucesso' });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao atualizar BDI', variant: 'destructive' });
    } finally {
      setSalvandoBDI(false);
    }
  };

  // ---- save ----
  const handleSave = async () => {
    // Retrocompatibilidade: cria a composição se não existir no orçamento
    const composicaoBase: ComposicaoCustos = moTerceirizados ?? {
      id: `comp-${orcamento.id}-terceirizados`,
      orcamentoId: orcamento.id,
      nome: 'MO Terceirizada',
      tipo: 'mo_terceirizados' as const,
      itens: [],
      bdi: { percentual: 20, valor: 0 },
      custoDirecto: 0,
      subtotal: 0,
      percentualDoTotal: 0,
      ordem: orcamento.composicoes.length + 1,
    };

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const linha = `Linha ${i + 1}`;
      if (!r.descricao.trim()) {
        toast({ title: 'Atenção', description: `${linha}: informe a descrição do serviço`, variant: 'destructive' });
        return;
      }
      if (r.quantidade === '' || Number(r.quantidade) <= 0) {
        toast({ title: 'Atenção', description: `${linha}: informe a quantidade`, variant: 'destructive' });
        return;
      }
      if (r.valorUnitario === '' || Number(r.valorUnitario) < 0) {
        toast({ title: 'Atenção', description: `${linha}: informe o valor`, variant: 'destructive' });
        return;
      }
    }

    try {
      setSalvando(true);
      const novosItens: ItemComposicao[] = rows.map((r, index) => ({
        id: r.itemId ?? `terc-${Date.now()}-${index}`,
        composicaoId: composicaoBase.id,
        codigo: r.fornecedorId || undefined,
        descricao: r.descricao,
        quantidade: Number(r.quantidade),
        unidade: r.unidade || 'serv',
        valorUnitario: Number(r.valorUnitario),
        subtotal: calcSubtotalTerceirizado(r),
        percentual: 0,
        tipoItem: 'mao_obra' as const,
        especificacao: JSON.stringify({ fornecedorId: r.fornecedorId, fornecedorNome: r.fornecedorNome }),
        ordem: index + 1,
      }));

      const composicaoAtualizada = { ...composicaoBase, itens: novosItens };

      // Se a composição já existia: atualiza no lugar. Se não: append ao final.
      const novasComposicoes = moTerceirizados
        ? orcamento.composicoes.map((c) => c.id === composicaoBase.id ? composicaoAtualizada : c)
        : [...orcamento.composicoes, composicaoAtualizada];

      const updatedOrcamento = { ...orcamento, composicoes: novasComposicoes };

      await OrcamentoService.update(orcamento.id, updatedOrcamento);
      setEditMode(false);
      toast({ title: 'Sucesso', description: 'MO Terceirizada salva com sucesso' });
      onUpdate();
    } catch {
      toast({ title: 'Erro', description: 'Erro ao salvar MO Terceirizada', variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  // ---- totais ----
  const totalSubtotal = rows.reduce((acc, r) => acc + calcSubtotalTerceirizado(r), 0);

  // ---- render terceirizados view ----
  const renderView = () => {
    if (rows.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <Wrench className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium">Nenhum serviço terceirizado cadastrado</p>
          <p className="text-sm mt-1 mb-3">Clique em "Editar" para adicionar</p>
          <Button size="sm" onClick={() => setEditMode(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Editar
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
              <TableHead className="border-r">Fornecedor</TableHead>
              <TableHead className="border-r">Descrição do Serviço</TableHead>
              <TableHead className="border-r w-20 text-center">Qtd</TableHead>
              <TableHead className="border-r w-20">Unid.</TableHead>
              <TableHead className="border-r w-32 text-right">Valor Unit.</TableHead>
              <TableHead className="text-right w-36">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={r._localId} className="hover:bg-muted/30">
                <TableCell className="border-r text-center font-medium">{idx + 1}</TableCell>
                <TableCell className="border-r">
                  {r.fornecedorNome ? (
                    <span className="text-sm font-medium">{r.fornecedorNome}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="border-r font-medium">{r.descricao}</TableCell>
                <TableCell className="border-r text-center">{r.quantidade}</TableCell>
                <TableCell className="border-r">{r.unidade}</TableCell>
                <TableCell className="border-r text-right font-mono">{formatCurrency(Number(r.valorUnitario))}</TableCell>
                <TableCell className="text-right font-bold text-green-600">{formatCurrency(calcSubtotalTerceirizado(r))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // ---- render terceirizados edit ----
  const renderEdit = () => (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="border-r w-10 text-center">#</TableHead>
            <TableHead className="border-r min-w-[200px]">Fornecedor</TableHead>
            <TableHead className="border-r min-w-[200px]">Descrição do Serviço</TableHead>
            <TableHead className="border-r w-24 text-center">Qtd</TableHead>
            <TableHead className="border-r w-24">Unid.</TableHead>
            <TableHead className="border-r w-36 text-center">Valor Unit.</TableHead>
            <TableHead className="border-r w-32 text-center bg-green-50 dark:bg-green-950/30">Subtotal</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, idx) => (
            <TableRow key={r._localId}>
              <TableCell className="border-r text-center font-medium">{idx + 1}</TableCell>

              {/* Fornecedor */}
              <TableCell className="border-r p-1 min-w-[200px]">
                <Select
                  value={r.fornecedorId || 'none'}
                  onValueChange={(val) => handleFornecedorSelect(r._localId, val === 'none' ? '' : val)}
                  disabled={salvando}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="— Selecione —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Sem fornecedor —</SelectItem>
                    {catalogoFornecedores.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)} className="text-xs">
                        <div className="flex items-center gap-1">
                          <span>{f.nome}</span>
                          <div className="flex gap-1">
                            {(f.categorias || []).slice(0, 2).map((cat) => (
                              <span key={cat} className={`text-xs px-1 rounded ${CategoriaFornecedorColors[cat]}`}>
                                {CategoriaFornecedorLabels[cat]}
                              </span>
                            ))}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem value="__novo__" className="text-blue-600 font-medium text-xs">
                      <UserPlus className="h-3 w-3 inline mr-1" />
                      + Cadastrar Novo Fornecedor
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>

              {/* Descrição */}
              <TableCell className="border-r p-1">
                <Input
                  className="h-8 text-sm"
                  value={r.descricao}
                  onChange={(e) => handleField(r._localId, 'descricao', e.target.value)}
                  placeholder="Ex: Usinagem de flange, Inspeção de solda..."
                  disabled={salvando}
                />
              </TableCell>

              {/* Quantidade */}
              <TableCell className="border-r p-1">
                <Input
                  type="number" min={0} step={0.01}
                  className="h-8 text-sm text-center"
                  value={r.quantidade}
                  onChange={(e) =>
                    handleField(r._localId, 'quantidade', e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="1"
                  disabled={salvando}
                />
              </TableCell>

              {/* Unidade */}
              <TableCell className="border-r p-1">
                <Input
                  className="h-8 text-sm"
                  value={r.unidade}
                  onChange={(e) => handleField(r._localId, 'unidade', e.target.value)}
                  placeholder="serv"
                  disabled={salvando}
                />
              </TableCell>

              {/* Valor Unit. */}
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

              {/* Subtotal */}
              <TableCell className="border-r text-center font-bold text-green-600 bg-green-50/50 dark:bg-green-950/20">
                {formatCurrency(calcSubtotalTerceirizado(r))}
              </TableCell>

              {/* Delete */}
              <TableCell className="p-1 text-center">
                <Button
                  size="sm" variant="ghost"
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setRows((prev) => prev.filter((row) => row._localId !== r._localId))}
                  disabled={salvando}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                Nenhum serviço. Clique em "+ Serviço" para adicionar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* MO Fabricação */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mão de Obra - Fabricação
            </CardTitle>
            <ExportarAbaCompletaButton
              tituloAba="Mão de Obra"
              secoes={[
                {
                  titulo: 'MO Fabricação',
                  rows: (moFabricacao?.itens ?? [])
                    .filter((i) => i.tipoItem === 'mao_obra')
                    .map((item) => ({
                      codigo: item.especificacao || '',
                      descricao: `${item.cargo ?? ''} — ${item.descricao}`,
                      quantidade: item.quantidade,
                      unidade: item.unidade || 'hh',
                      valorUnitario: item.valorUnitario,
                      subtotal: item.subtotal,
                    })),
                  labelQuantidade: 'QTD/HH',
                  labelUnidade: 'Unid.',
                },
                {
                  titulo: 'MO Montagem',
                  rows: (moMontagem?.itens ?? [])
                    .filter((i) => i.tipoItem === 'mao_obra')
                    .map((item) => ({
                      codigo: item.especificacao || '',
                      descricao: `${item.cargo ?? ''} — ${item.descricao}`,
                      quantidade: item.quantidade,
                      unidade: item.unidade || 'hh',
                      valorUnitario: item.valorUnitario,
                      subtotal: item.subtotal,
                    })),
                  labelQuantidade: 'QTD/HH',
                  labelUnidade: 'Unid.',
                },
                {
                  titulo: 'MO Terceirizada',
                  rows: rows.map((r) => ({
                    codigo: r.fornecedorNome || '',
                    descricao: r.descricao,
                    quantidade: r.quantidade,
                    unidade: r.unidade,
                    valorUnitario: r.valorUnitario,
                    subtotal: calcSubtotalTerceirizado(r),
                  })),
                },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          <AbaMaoObraGrid
            composicao={moFabricacao}
            tipo="Fabricação"
            categoria="fabricacao"
            onUpdate={handleAtualizarComposicao}
          />
        </CardContent>
      </Card>

      {/* MO Montagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mão de Obra - Montagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AbaMaoObraGrid
            composicao={moMontagem}
            tipo="Montagem"
            categoria="montagem"
            onUpdate={handleAtualizarComposicao}
          />
        </CardContent>
      </Card>

      {/* MO Terceirizada */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-600" />
              Mão de Obra Terceirizada
              <Badge variant="outline" className="text-xs font-normal">
                Usinagem, Transporte, Inspeção, etc.
              </Badge>
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              {!editMode && rows.length > 0 && (
                <>
                  <ExportarComposicaoButton
                    titulo="MO Terceirizada"
                    rows={rows.map((r) => ({
                      codigo: r.fornecedorNome || '',
                      descricao: r.descricao,
                      quantidade: r.quantidade,
                      unidade: r.unidade,
                      valorUnitario: r.valorUnitario,
                      subtotal: calcSubtotalTerceirizado(r),
                    }))}
                  />
                  <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </>
              )}
              {editMode && (
                <>
                  <Button size="sm" variant="outline" onClick={() => setRows((prev) => [...prev, newRowTerceirizado()])} disabled={salvando}>
                    <Plus className="mr-2 h-4 w-4" />
                    Serviço
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
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-muted-foreground">Serviços</Label>
                  <p className="text-xl font-bold">{rows.length}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Custo Direto MO</Label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(moTerceirizados?.custoDirecto ?? totalSubtotal)}
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
                        title="Editar BDI desta composição"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
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
                        onClick={() => { setEditandoBDI(false); setBdiInput(moTerceirizados?.bdi?.percentual ?? 20); }}
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
                        {formatCurrency(moTerceirizados?.bdi?.valor ?? 0)}
                      </p>
                      <span className="text-sm text-muted-foreground">({moTerceirizados?.bdi?.percentual ?? 20}%)</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Total c/ BDI</Label>
                  <p className="text-xl font-bold text-amber-600">
                    {formatCurrency(moTerceirizados?.subtotal ?? totalSubtotal)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Cadastrar Novo Fornecedor inline */}
      <FormularioFornecedor
        open={formFornecedorAberto}
        onOpenChange={setFormFornecedorAberto}
        fornecedor={null}
        onSuccess={handleNovoFornecedorSalvo}
      />
    </div>
  );
}
