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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

const TabelaCargos = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [cargoSelecionado, setCargoSelecionado] = useState<Cargo | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [cargoParaDeletar, setCargoParaDeletar] = useState<Cargo | null>(null);

  useEffect(() => {
    carregarCargos();
  }, []);

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
        <Button
          onClick={handleNovo}
          className="bg-gradient-to-r from-blue-600 to-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Cargo
        </Button>
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

      {/* Grid de Cargos */}
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
