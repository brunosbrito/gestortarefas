import { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { EpiService } from '@/services/EpiService';
import { EpiCatalogo, CreateEpiCatalogo } from '@/interfaces/EpiInterface';
import { formatCurrency } from '@/lib/currency';
import EpiFormDialog from './EpiFormDialog';

const TabelaEpis = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [epis, setEpis] = useState<EpiCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativos' | 'inativos'>('ativos');

  // Form dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [epiSelecionado, setEpiSelecionado] = useState<EpiCatalogo | null>(null);

  // Exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [epiParaDeletar, setEpiParaDeletar] = useState<EpiCatalogo | null>(null);

  // Importação
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importando, setImportando] = useState(false);
  const [importPreview, setImportPreview] = useState<CreateEpiCatalogo[]>([]);
  const [importErros, setImportErros] = useState<string[]>([]);
  const [modoImport, setModoImport] = useState<'acrescentar' | 'substituir'>('acrescentar');

  // Reajuste de preços
  const [reajusteDialogOpen, setReajusteDialogOpen] = useState(false);
  const [reajusteTipo, setReajusteTipo] = useState<'percentual' | 'fixo'>('percentual');
  const [reajusteValor, setReajusteValor] = useState('');
  const [reajusteEscopo, setReajusteEscopo] = useState<'ativos' | 'todos'>('ativos');
  const [reajustando, setReajustando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const todos = await EpiService.list();
      setEpis(todos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const episFiltrados = epis.filter((e) => {
    const matchBusca =
      !busca ||
      e.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      e.ca.includes(busca) ||
      (e.fabricante?.toLowerCase().includes(busca.toLowerCase()) ?? false);

    const matchAtivo =
      filtroAtivo === 'todos' ||
      (filtroAtivo === 'ativos' && e.ativo) ||
      (filtroAtivo === 'inativos' && !e.ativo);

    return matchBusca && matchAtivo;
  });

  const handleEditar = (epi: EpiCatalogo) => {
    setEpiSelecionado(epi);
    setDialogOpen(true);
  };

  const handleNovo = () => {
    setEpiSelecionado(null);
    setDialogOpen(true);
  };

  const handleToggleAtivo = async (epi: EpiCatalogo) => {
    try {
      await EpiService.toggleAtivo(epi.id);
      await carregar();
      toast({
        title: epi.ativo ? 'EPI desativado' : 'EPI reativado',
        description: epi.descricao,
      });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível alterar status', variant: 'destructive' });
    }
  };

  const handleConfirmarDelete = async () => {
    if (!epiParaDeletar) return;
    try {
      await EpiService.deletePermanente(epiParaDeletar.id);
      await carregar();
      toast({ title: 'EPI excluído', description: epiParaDeletar.descricao });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível excluir', variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setEpiParaDeletar(null);
    }
  };

  // ── IMPORTAÇÃO ──────────────────────────────────────────
  const handleArquivoSelecionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset input

    try {
      const { validos, erros } = await EpiService.lerArquivo(file);
      setImportPreview(validos);
      setImportErros(erros);
      setImportDialogOpen(true);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível ler o arquivo', variant: 'destructive' });
    }
  };

  const handleConfirmarImport = async () => {
    if (importPreview.length === 0) return;
    setImportando(true);
    try {
      const total = await EpiService.importar(importPreview, modoImport);
      await carregar();
      toast({
        title: 'Importação concluída',
        description: `${total} EPI(s) importado(s) com sucesso.`,
      });
      setImportDialogOpen(false);
      setImportPreview([]);
      setImportErros([]);
    } catch {
      toast({ title: 'Erro', description: 'Falha ao importar', variant: 'destructive' });
    } finally {
      setImportando(false);
    }
  };

  const handleBaixarModelo = async () => {
    const todos = await EpiService.list();
    EpiService.exportarModelo(todos);
  };

  // ── REAJUSTE DE PREÇOS ───────────────────────────────────
  const reajustePreviewItens = (() => {
    const v = parseFloat(reajusteValor) || 0;
    const base = reajusteEscopo === 'ativos' ? epis.filter((e) => e.ativo) : epis;
    return base.map((e) => ({
      ...e,
      novoValor: Math.max(
        0,
        Math.round(
          (reajusteTipo === 'percentual'
            ? e.valorReferencia * (1 + v / 100)
            : e.valorReferencia + v) * 100
        ) / 100
      ),
    }));
  })();

  const handleConfirmarReajuste = async () => {
    const v = parseFloat(reajusteValor);
    if (isNaN(v)) {
      toast({ title: 'Erro', description: 'Informe um valor válido', variant: 'destructive' });
      return;
    }
    setReajustando(true);
    try {
      const total = await EpiService.reajustarPrecos(reajusteTipo, v, reajusteEscopo);
      await carregar();
      toast({
        title: 'Preços reajustados',
        description: `${total} EPI(s) atualizados com sucesso.`,
      });
      setReajusteDialogOpen(false);
      setReajusteValor('');
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível reajustar os preços', variant: 'destructive' });
    } finally {
      setReajustando(false);
    }
  };

  // ── STATS ──────────────────────────────────────────────
  const totalAtivos = epis.filter((e) => e.ativo).length;
  const totalInativos = epis.filter((e) => !e.ativo).length;

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-orange-500" />
              Catálogo de EPIs / EPCs
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie equipamentos de proteção com CA e preço de referência
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleBaixarModelo}>
              <Download className="mr-2 h-4 w-4" />
              Baixar Modelo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importar Planilha
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleArquivoSelecionado}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setReajusteValor(''); setReajusteDialogOpen(true); }}
              className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Reajustar Preços
            </Button>
            <Button onClick={handleNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Novo EPI
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{epis.length}</p>
              <p className="text-xs text-muted-foreground">Total cadastrado</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-green-600">{totalAtivos}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-muted-foreground">{totalInativos}</p>
              <p className="text-xs text-muted-foreground">Inativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, CA ou fabricante..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtroAtivo} onValueChange={(v: any) => setFiltroAtivo(v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativos">Ativos</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="inativos">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={carregar} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {episFiltrados.length} EPI(s) encontrado(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : episFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Shield className="h-8 w-8 opacity-30" />
                <p className="text-sm">
                  {epis.length === 0
                    ? 'Nenhum EPI cadastrado. Clique em "Novo EPI" ou "Importar Planilha".'
                    : 'Nenhum EPI encontrado com os filtros aplicados.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-16 text-center">Unid.</TableHead>
                    <TableHead className="w-28 text-center">CA</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead className="w-32 text-right">Valor Ref.</TableHead>
                    <TableHead className="w-20 text-center">Status</TableHead>
                    <TableHead className="w-28 text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {episFiltrados.map((epi) => (
                    <TableRow key={epi.id} className={!epi.ativo ? 'opacity-50' : ''}>
                      <TableCell className="font-medium text-sm max-w-[260px]">
                        <span
                          className="block truncate"
                          title={epi.descricao}
                        >
                          {epi.nomeResumido || epi.descricao}
                        </span>
                        {epi.nomeResumido && (
                          <span className="block truncate text-xs text-muted-foreground font-normal" title={epi.descricao}>
                            {epi.descricao}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono text-xs">{epi.unidade}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {epi.ca || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {epi.fabricante || '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(epi.valorReferencia)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={epi.ativo ? 'default' : 'secondary'} className="text-xs">
                          {epi.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Editar"
                            onClick={() => handleEditar(epi)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title={epi.ativo ? 'Desativar' : 'Reativar'}
                            onClick={() => handleToggleAtivo(epi)}
                          >
                            {epi.ativo
                              ? <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                              : <Eye className="h-3.5 w-3.5 text-green-500" />
                            }
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            title="Excluir permanentemente"
                            onClick={() => { setEpiParaDeletar(epi); setDeleteDialogOpen(true); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <EpiFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        epi={epiSelecionado}
        onSalvar={carregar}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir EPI permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{epiParaDeletar?.descricao}</strong> será removido do catálogo.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reajuste de Preços Dialog */}
      <Dialog
        open={reajusteDialogOpen}
        onOpenChange={(v) => { setReajusteDialogOpen(v); if (!v) setReajusteValor(''); }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              Reajuste de Preços em Lote
            </DialogTitle>
            <DialogDescription>
              Aplique um reajuste percentual ou valor fixo a todos os EPIs de uma vez.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo + Valor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de reajuste</label>
                <Select
                  value={reajusteTipo}
                  onValueChange={(v: 'percentual' | 'fixo') => setReajusteTipo(v)}
                >
                  <SelectTrigger className="bg-amber-50 dark:bg-amber-950/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentual">Percentual (%)</SelectItem>
                    <SelectItem value="fixo">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {reajusteTipo === 'percentual' ? 'Percentual (use − para reduzir)' : 'Valor em R$ (use − para reduzir)'}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step={reajusteTipo === 'percentual' ? '0.1' : '0.01'}
                    value={reajusteValor}
                    onChange={(e) => setReajusteValor(e.target.value)}
                    placeholder={reajusteTipo === 'percentual' ? 'Ex: 10 ou -5' : 'Ex: 5.00 ou -2.50'}
                    className="bg-amber-50 dark:bg-amber-950/30 font-mono pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    {reajusteTipo === 'percentual' ? '%' : 'R$'}
                  </span>
                </div>
              </div>
            </div>

            {/* Escopo */}
            <div className="flex items-center gap-6 p-3 bg-muted/30 rounded-lg border">
              <span className="text-sm font-medium">Aplicar em:</span>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="escopo"
                  value="ativos"
                  checked={reajusteEscopo === 'ativos'}
                  onChange={() => setReajusteEscopo('ativos')}
                />
                <span>Somente ativos ({epis.filter((e) => e.ativo).length})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="escopo"
                  value="todos"
                  checked={reajusteEscopo === 'todos'}
                  onChange={() => setReajusteEscopo('todos')}
                />
                <span>Todos ({epis.length})</span>
              </label>
            </div>

            {/* Preview */}
            {reajustePreviewItens.length > 0 && parseFloat(reajusteValor) !== 0 && !isNaN(parseFloat(reajusteValor)) && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Prévia ({reajustePreviewItens.length} EPI{reajustePreviewItens.length !== 1 ? 's' : ''}):
                </p>
                <div className="border rounded overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-32 text-right">Atual</TableHead>
                        <TableHead className="w-8 text-center" />
                        <TableHead className="w-32 text-right">Novo valor</TableHead>
                        <TableHead className="w-24 text-right">Variação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reajustePreviewItens.slice(0, 8).map((e) => {
                        const diff = e.novoValor - e.valorReferencia;
                        const positivo = diff >= 0;
                        return (
                          <TableRow key={e.id}>
                            <TableCell className="text-sm">{e.descricao}</TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">
                              {formatCurrency(e.valorReferencia)}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground text-xs">→</TableCell>
                            <TableCell className="text-right font-mono font-semibold">
                              {formatCurrency(e.novoValor)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`flex items-center justify-end gap-0.5 text-xs font-medium ${positivo ? 'text-green-600' : 'text-red-500'}`}>
                                {positivo
                                  ? <ArrowUp className="h-3 w-3" />
                                  : <ArrowDown className="h-3 w-3" />
                                }
                                {formatCurrency(Math.abs(diff))}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {reajustePreviewItens.length > 8 && (
                    <p className="text-xs text-muted-foreground text-center py-2 border-t">
                      ...e mais {reajustePreviewItens.length - 8} EPI(s)
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => { setReajusteDialogOpen(false); setReajusteValor(''); }}
                disabled={reajustando}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmarReajuste}
                disabled={reajustando || !reajusteValor || isNaN(parseFloat(reajusteValor)) || reajustePreviewItens.length === 0}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {reajustando ? 'Aplicando...' : `Aplicar a ${reajustePreviewItens.length} EPI(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Importar EPIs da Planilha
            </DialogTitle>
            <DialogDescription>
              Revise os dados antes de confirmar a importação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Erros */}
            {importErros.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-1">{importErros.length} linha(s) com erro serão ignoradas:</p>
                  <ul className="text-xs space-y-0.5">
                    {importErros.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Modo de importação */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border">
              <span className="text-sm font-medium">Modo:</span>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="modo"
                  value="acrescentar"
                  checked={modoImport === 'acrescentar'}
                  onChange={() => setModoImport('acrescentar')}
                />
                <span>Acrescentar aos existentes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-destructive">
                <input
                  type="radio"
                  name="modo"
                  value="substituir"
                  checked={modoImport === 'substituir'}
                  onChange={() => setModoImport('substituir')}
                />
                <span>Substituir todos (apaga catálogo atual)</span>
              </label>
            </div>

            {/* Preview */}
            <div className="border rounded overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-16">Unid.</TableHead>
                    <TableHead className="w-24">CA</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead className="w-28 text-right">Valor Ref.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importPreview.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell className="text-sm font-medium">{item.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">{item.unidade}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.ca || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.fabricante || '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.valorReferencia)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span><strong>{importPreview.length}</strong> EPI(s) prontos para importar</span>
                {importErros.length > 0 && (
                  <>
                    <XCircle className="h-4 w-4 text-destructive ml-2" />
                    <span className="text-destructive"><strong>{importErros.length}</strong> com erro</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setImportDialogOpen(false); setImportPreview([]); setImportErros([]); }}
                  disabled={importando}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmarImport}
                  disabled={importando || importPreview.length === 0}
                >
                  {importando ? 'Importando...' : `Importar ${importPreview.length} EPI(s)`}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TabelaEpis;
