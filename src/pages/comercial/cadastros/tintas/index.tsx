import { useState, useEffect } from 'react';
import { Paintbrush, Plus, Edit, Trash2, RefreshCw, Eye, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import TintaService from '@/services/TintaService';
import {
  TintaInterface,
  TipoTinta,
  TipoTintaLabels,
} from '@/interfaces/TintaInterface';
import { formatCurrency } from '@/lib/currency';
import Layout from '@/components/Layout';
import { mockTintas } from '@/data/mockTintas';
import FormularioTinta from '@/components/gerenciamento/tintas/FormularioTinta';
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

const TabelaTintas = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tintas, setTintas] = useState<TintaInterface[]>([]);
  const [tintasFiltradas, setTintasFiltradas] = useState<TintaInterface[]>([]);
  const [tintaSelecionada, setTintaSelecionada] = useState<TintaInterface | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [tintaParaDeletar, setTintaParaDeletar] = useState<TintaInterface | null>(null);
  const [tintaParaVisualizar, setTintaParaVisualizar] = useState<TintaInterface | null>(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');

  useEffect(() => {
    carregarTintas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [busca, tipoFiltro, tintas]);

  const carregarTintas = async () => {
    try {
      setLoading(true);

      // USANDO DADOS MOCKADOS (remover quando backend estiver pronto)
      // Carregar tintas mockadas + tintas cadastradas localmente
      const tintasLocais = JSON.parse(localStorage.getItem('tintas_locais') || '[]');
      setTintas([...mockTintas, ...tintasLocais]);

      // VERSÃO COM API (descomentar quando backend estiver pronto)
      // const data = await TintaService.listar({ ativo: true });
      // setTintas(data);
    } catch (error) {
      console.error('Erro ao carregar tintas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tintas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarTinta = (novaTinta?: TintaInterface) => {
    if (!novaTinta) return;

    // MOCK: Salvar no localStorage
    const tintasLocais = JSON.parse(localStorage.getItem('tintas_locais') || '[]');

    const index = tintasLocais.findIndex((t: TintaInterface) => t.id === novaTinta.id);
    if (index >= 0) {
      // Atualizar tinta existente
      tintasLocais[index] = novaTinta;
    } else {
      // Adicionar nova tinta
      tintasLocais.push(novaTinta);
    }

    localStorage.setItem('tintas_locais', JSON.stringify(tintasLocais));
    carregarTintas();
  };

  const aplicarFiltros = () => {
    let resultado = [...tintas];

    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (t) =>
          t.codigo.toLowerCase().includes(buscaLower) ||
          t.descricao.toLowerCase().includes(buscaLower)
      );
    }

    if (tipoFiltro !== 'todos') {
      resultado = resultado.filter((t) => t.tipo === tipoFiltro);
    }

    setTintasFiltradas(resultado);
  };

  const handleDeletar = async () => {
    if (!tintaParaDeletar?.id) return;

    // Verificar se é uma tinta mockada (ID numérico pequeno, 1-10)
    const isMockada = tintaParaDeletar.id && tintaParaDeletar.id <= 10;

    if (isMockada) {
      toast({
        title: 'Aviso',
        description: 'Tintas de demonstração não podem ser deletadas',
        variant: 'destructive',
      });
      setTintaParaDeletar(null);
      return;
    }

    try {
      // MOCK: Remover do localStorage
      const tintasLocais = JSON.parse(localStorage.getItem('tintas_locais') || '[]');
      const novasTintas = tintasLocais.filter((t: TintaInterface) => t.id !== tintaParaDeletar.id);
      localStorage.setItem('tintas_locais', JSON.stringify(novasTintas));

      // Quando backend estiver pronto, descomentar:
      // await TintaService.excluir(tintaParaDeletar.id);

      toast({
        title: 'Sucesso',
        description: 'Tinta deletada com sucesso',
      });
      carregarTintas();
    } catch (error) {
      console.error('Erro ao deletar tinta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar a tinta',
        variant: 'destructive',
      });
    } finally {
      setTintaParaDeletar(null);
    }
  };

  const getTipoColor = (tipo: TipoTinta): string => {
    switch (tipo) {
      case TipoTinta.PRIMER:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case TipoTinta.ACABAMENTO:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paintbrush className="h-6 w-6 text-blue-600" />
                <CardTitle>Catálogo de Tintas</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setTintaSelecionada(null); setDialogAberto(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tinta
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Código ou descrição..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value={TipoTinta.PRIMER}>{TipoTintaLabels[TipoTinta.PRIMER]}</SelectItem>
                    <SelectItem value={TipoTinta.ACABAMENTO}>{TipoTintaLabels[TipoTinta.ACABAMENTO]}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBusca('');
                    setTipoFiltro('todos');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Tabela */}
            <div className="border rounded-lg">
              <TableComponent>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>SV (%)</TableHead>
                    <TableHead className="text-right">Preço/Litro</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tintasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhuma tinta encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    tintasFiltradas.map((tinta) => {
                      const isMockada = tinta.id && tinta.id <= 10;
                      return (
                        <TableRow key={tinta.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {tinta.codigo}
                              {isMockada && (
                                <Badge variant="outline" className="text-xs">DEMO</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{tinta.descricao}</TableCell>
                          <TableCell>
                            <Badge className={getTipoColor(tinta.tipo)}>
                              {TipoTintaLabels[tinta.tipo]}
                            </Badge>
                          </TableCell>
                        <TableCell>{tinta.solidosVolume}%</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(tinta.precoLitro)}/lt
                        </TableCell>
                        <TableCell>{tinta.fornecedor}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTintaParaVisualizar(tinta)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!isMockada && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setTintaSelecionada(tinta); setDialogAberto(true); }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTintaParaDeletar(tinta)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </TableComponent>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {tintasFiltradas.length} de {tintas.length} tintas
            </div>
          </CardContent>
        </Card>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!tintaParaDeletar} onOpenChange={() => setTintaParaDeletar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a tinta <strong>{tintaParaDeletar?.codigo}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletar} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de Visualização */}
        <Dialog open={!!tintaParaVisualizar} onOpenChange={() => setTintaParaVisualizar(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Tinta</DialogTitle>
              <DialogDescription>Informações completas da tinta</DialogDescription>
            </DialogHeader>
            {tintaParaVisualizar && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Código</Label>
                    <p className="font-medium">{tintaParaVisualizar.codigo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <p className="font-medium">{TipoTintaLabels[tintaParaVisualizar.tipo]}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Sólidos por Volume</Label>
                    <p className="font-medium">{tintaParaVisualizar.solidosVolume}%</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Preço por Litro</Label>
                    <p className="font-medium">{formatCurrency(tintaParaVisualizar.precoLitro)}/lt</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fornecedor</Label>
                    <p className="font-medium">{tintaParaVisualizar.fornecedor}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Descrição</Label>
                  <p className="font-medium">{tintaParaVisualizar.descricao}</p>
                </div>
                {tintaParaVisualizar.observacoes && (
                  <div>
                    <Label className="text-muted-foreground">Observações</Label>
                    <p className="text-sm">{tintaParaVisualizar.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Formulário de Cadastro/Edição */}
        <FormularioTinta
          open={dialogAberto}
          onOpenChange={setDialogAberto}
          tinta={tintaSelecionada}
          onSuccess={handleSalvarTinta}
        />
      </div>
    </Layout>
  );
};

export default TabelaTintas;
