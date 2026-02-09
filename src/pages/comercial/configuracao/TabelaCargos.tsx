import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  HardHat,
  Wrench,
  LayoutGrid,
  Table,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CargoService } from '@/services/CargoService';
import { Cargo } from '@/interfaces/CargoInterface';
import { formatCurrency, formatPercentage } from '@/lib/currency';
import CargoFormDialog from './CargoFormDialog';
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

type ViewMode = 'card' | 'grid';

const TabelaCargos = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [cargoSelecionado, setCargoSelecionado] = useState<Cargo | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [cargoParaDeletar, setCargoParaDeletar] = useState<Cargo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Recuperar preferência do localStorage
    const saved = localStorage.getItem('tabela_cargos_view_mode');
    return (saved as ViewMode) || 'card';
  });

  useEffect(() => {
    carregarCargos();
  }, []);

  useEffect(() => {
    // Salvar preferência no localStorage
    localStorage.setItem('tabela_cargos_view_mode', viewMode);
  }, [viewMode]);

  const carregarCargos = async () => {
    try {
      setLoading(true);
      const data = await CargoService.listAtivos();
      setCargos(data);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os cargos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    setCargoSelecionado(null);
    setDialogAberto(true);
  };

  const handleEditar = (cargo: Cargo) => {
    setCargoSelecionado(cargo);
    setDialogAberto(true);
  };

  const handleDeletar = async () => {
    if (!cargoParaDeletar) return;

    try {
      await CargoService.delete(cargoParaDeletar.id);
      toast({
        title: 'Sucesso',
        description: 'Cargo deletado com sucesso',
      });
      carregarCargos();
    } catch (error) {
      console.error('Erro ao deletar cargo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o cargo',
        variant: 'destructive',
      });
    } finally {
      setCargoParaDeletar(null);
    }
  };

  const handleSalvarCargo = () => {
    setDialogAberto(false);
    carregarCargos();
  };

  const getCategoriaCor = (categoria: Cargo['categoria']) => {
    switch (categoria) {
      case 'fabricacao':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'montagem':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'ambos':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoriaNome = (categoria: Cargo['categoria']) => {
    switch (categoria) {
      case 'fabricacao':
        return 'Fabricação';
      case 'montagem':
        return 'Montagem';
      case 'ambos':
        return 'Ambos';
      default:
        return categoria;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tabela de Cargos</h1>
            <p className="text-muted-foreground">
              Composição de custos de mão de obra
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle de Visualização */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className={viewMode === 'card' ? 'bg-blue-600' : ''}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-blue-600' : ''}
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleNovo}
            className="bg-gradient-to-r from-blue-600 to-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Cargo
          </Button>
        </div>
      </div>

      {/* Alert de Ajuda */}
      {cargos.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum cargo cadastrado ainda. Clique em "Novo Cargo" para adicionar o primeiro cargo
            com a composição completa de custos.
          </AlertDescription>
        </Alert>
      )}

      {/* Visualização em Cards */}
      {viewMode === 'card' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cargos.map((cargo) => (
          <Card
            key={cargo.id}
            className="hover:shadow-lg transition-shadow border-l-4"
            style={{
              borderLeftColor:
                cargo.categoria === 'fabricacao'
                  ? '#3b82f6'
                  : cargo.categoria === 'montagem'
                  ? '#10b981'
                  : '#a855f7',
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {cargo.categoria === 'fabricacao' ? (
                      <Wrench className="h-4 w-4 text-blue-600" />
                    ) : (
                      <HardHat className="h-4 w-4 text-green-600" />
                    )}
                    {cargo.nome}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoriaCor(cargo.categoria)}>
                      {getCategoriaNome(cargo.categoria)}
                    </Badge>
                    {cargo.temPericulosidade && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Periculosidade
                      </Badge>
                    )}
                    {cargo.grauInsalubridade !== 'nenhum' && (
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        Insalubre
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditar(cargo)}
                    className="hover:bg-blue-100 dark:hover:bg-blue-900"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCargoParaDeletar(cargo)}
                    className="hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Custo HH em Destaque */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  CUSTO HOMEM HORA (HH)
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(cargo.custoHH)}/h
                </p>
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                <div>
                  <p className="text-muted-foreground text-xs">Salário Base</p>
                  <p className="font-semibold">{formatCurrency(cargo.salarioBase)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Salário</p>
                  <p className="font-semibold">{formatCurrency(cargo.totalSalario)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Encargos</p>
                  <p className="font-semibold">{formatCurrency(cargo.valorEncargos)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Custos Diversos</p>
                  <p className="font-semibold">{formatCurrency(cargo.totalCustosDiversos)}</p>
                </div>
                <div className="col-span-2 pt-2 border-t">
                  <p className="text-muted-foreground text-xs">Total Custos MO</p>
                  <p className="font-bold text-lg">{formatCurrency(cargo.totalCustosMO)}</p>
                  <p className="text-xs text-muted-foreground">
                    {cargo.horasMes}h/mês ({cargo.tipoContrato})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Visualização em Grid (Tabela) */}
      {viewMode === 'grid' && (
        <Card>
          <CardContent className="p-0">
            <TableComponent>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Cargo</TableHead>
                  <TableHead className="w-[120px]">Categoria</TableHead>
                  <TableHead className="w-[100px]">Adicionais</TableHead>
                  <TableHead className="text-right w-[120px]">Salário Base</TableHead>
                  <TableHead className="text-right w-[120px]">Total Salário</TableHead>
                  <TableHead className="text-right w-[120px]">Encargos</TableHead>
                  <TableHead className="text-right w-[120px]">Custos Div.</TableHead>
                  <TableHead className="text-right w-[140px]">Total MO</TableHead>
                  <TableHead className="text-right w-[140px] bg-blue-50 dark:bg-blue-950/40">
                    <div className="font-bold text-blue-600 dark:text-blue-400">Custo HH</div>
                  </TableHead>
                  <TableHead className="text-center w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargos.map((cargo) => (
                  <TableRow key={cargo.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {cargo.categoria === 'fabricacao' ? (
                          <Wrench className="h-4 w-4 text-blue-600" />
                        ) : (
                          <HardHat className="h-4 w-4 text-green-600" />
                        )}
                        <span>{cargo.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoriaCor(cargo.categoria)} variant="outline">
                        {getCategoriaNome(cargo.categoria)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {cargo.temPericulosidade && (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                            Peric.
                          </Badge>
                        )}
                        {cargo.grauInsalubridade !== 'nenhum' && (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                            Insalub.
                          </Badge>
                        )}
                        {!cargo.temPericulosidade && cargo.grauInsalubridade === 'nenhum' && (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(cargo.salarioBase)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(cargo.totalSalario)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(cargo.valorEncargos)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(cargo.totalCustosDiversos)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {formatCurrency(cargo.totalCustosMO)}
                      <div className="text-xs text-muted-foreground">
                        {cargo.horasMes}h/mês
                      </div>
                    </TableCell>
                    <TableCell className="text-right bg-blue-50 dark:bg-blue-950/40">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(cargo.custoHH)}/h
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditar(cargo)}
                          className="hover:bg-blue-100 dark:hover:bg-blue-900 h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCargoParaDeletar(cargo)}
                          className="hover:bg-red-100 dark:hover:bg-red-900 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableComponent>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Formulário */}
      <CargoFormDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        cargo={cargoSelecionado}
        onSalvar={handleSalvarCargo}
      />

      {/* Dialog de Confirmação de Deleção */}
      <AlertDialog
        open={!!cargoParaDeletar}
        onOpenChange={() => setCargoParaDeletar(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o cargo "{cargoParaDeletar?.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletar}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TabelaCargos;
