import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Gauge,
  Filter,
  Eye,
  Upload,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Equipamento } from '@/interfaces/QualidadeInterfaces';
import EquipamentoService from '@/services/EquipamentoService';
import { NovoEquipamentoDialog } from './NovoEquipamentoDialog';
import { DetalhesEquipamentoDialog } from './DetalhesEquipamentoDialog';
import { UploadCalibracaoDialog } from './UploadCalibracaoDialog';

const Calibracao = () => {
  const { toast } = useToast();
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [showNovoDialog, setShowNovoDialog] = useState(false);
  const [showDetalhesDialog, setShowDetalhesDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<Equipamento | null>(null);

  const getAllEquipamentos = async () => {
    try {
      setLoading(true);
      const data = await EquipamentoService.getAll();
      setEquipamentos(data);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os equipamentos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllEquipamentos();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em_dia':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Em Dia
          </Badge>
        );
      case 'proximo_vencimento':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <Clock className="w-3 h-3" />
            Próximo Vencimento
          </Badge>
        );
      case 'vencido':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
            <AlertCircle className="w-3 h-3" />
            Vencido
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 gap-1">
            <XCircle className="w-3 h-3" />
            Reprovado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      paquimetro: 'Paquímetro',
      micrometro: 'Micrômetro',
      torquimetro: 'Torquímetro',
      manometro: 'Manômetro',
      balanca: 'Balança',
      outro: 'Outro',
    };
    return tipos[tipo] || tipo;
  };

  const getDiasProximaCalibracao = (proximaCalibracao: string) => {
    const hoje = new Date();
    const proxima = new Date(proximaCalibracao);
    const diffTime = proxima.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const equipamentosFiltrados = equipamentos.filter((equipamento) => {
    const filtroStatus =
      statusFiltro === 'todos' ? true : equipamento.status === statusFiltro;
    const filtroTipo =
      tipoFiltro === 'todos' ? true : equipamento.tipo === tipoFiltro;
    return filtroStatus && filtroTipo;
  });

  const stats = {
    total: equipamentos.length,
    emDia: equipamentos.filter((e) => e.status === 'em_dia').length,
    proximo: equipamentos.filter((e) => e.status === 'proximo_vencimento').length,
    vencido: equipamentos.filter((e) => e.status === 'vencido').length,
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gauge className="w-8 h-8 text-primary" />
              Calibração de Equipamentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Controle de calibração de instrumentos de medição
            </p>
          </div>
          <Button onClick={() => setShowNovoDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Equipamento
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Equipamentos</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardDescription>Em Dia</CardDescription>
              <CardTitle className="text-3xl text-green-700">{stats.emDia}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Calibrados</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader className="pb-2">
              <CardDescription>Próximo Vencimento</CardDescription>
              <CardTitle className="text-3xl text-yellow-700">{stats.proximo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Atenção</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-2">
              <CardDescription>Vencidos</CardDescription>
              <CardTitle className="text-3xl text-red-700">{stats.vencido}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">Urgente</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="em_dia">Em Dia</SelectItem>
                  <SelectItem value="proximo_vencimento">Próximo Vencimento</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="paquimetro">Paquímetro</SelectItem>
                  <SelectItem value="micrometro">Micrômetro</SelectItem>
                  <SelectItem value="torquimetro">Torquímetro</SelectItem>
                  <SelectItem value="manometro">Manômetro</SelectItem>
                  <SelectItem value="balanca">Balança</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Equipamentos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : equipamentosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Gauge className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum equipamento encontrado</p>
                <p className="text-sm mt-2">
                  {statusFiltro !== 'todos' || tipoFiltro !== 'todos'
                    ? 'Tente ajustar os filtros'
                    : 'Cadastre um equipamento para começar'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipamentosFiltrados.map((equipamento) => {
              const ultimaCalibracao = equipamento.calibracoes?.[0];
              const diasProxima = ultimaCalibracao
                ? getDiasProximaCalibracao(ultimaCalibracao.proximaCalibracao)
                : null;

              // Determinar cor da borda baseado no status
              const getBorderColor = () => {
                if (equipamento.status === 'em_dia') return 'border-l-green-500 bg-green-50/30';
                if (equipamento.status === 'proximo_vencimento') return 'border-l-yellow-500 bg-yellow-50/30';
                if (equipamento.status === 'vencido') return 'border-l-red-500 bg-red-50/30';
                if (equipamento.status === 'reprovado') return 'border-l-gray-500 bg-gray-50/30';
                return 'border-l-gray-300 bg-gray-50/30';
              };

              return (
                <Card
                  key={equipamento.id}
                  className={`hover:shadow-lg transition-all border-l-4 ${getBorderColor()}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {getStatusBadge(equipamento.status)}
                      <Badge variant="outline" className="text-xs">
                        {getTipoLabel(equipamento.tipo)}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-1">
                      {equipamento.nome}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {equipamento.numeroSerie || equipamento.patrimonio || 'Sem identificação'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="bg-muted p-2 rounded text-sm space-y-1">
                      {equipamento.setor && (
                        <div>
                          <span className="font-medium">Setor:</span> {equipamento.setor}
                        </div>
                      )}
                      {equipamento.responsavel && (
                        <div>
                          <span className="font-medium">Responsável:</span>{' '}
                          {equipamento.responsavel.name}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Frequência:</span>{' '}
                        {equipamento.frequenciaCalibracao} meses
                      </div>
                      {ultimaCalibracao && (
                        <>
                          <div>
                            <span className="font-medium">Última Calibração:</span>{' '}
                            {format(new Date(ultimaCalibracao.dataCalibracao), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </div>
                          <div>
                            <span className="font-medium">Próxima:</span>{' '}
                            {format(new Date(ultimaCalibracao.proximaCalibracao), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                            {diasProxima !== null && (
                              <span
                                className={`ml-1 ${
                                  diasProxima < 0
                                    ? 'text-red-600'
                                    : diasProxima < 30
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                                }`}
                              >
                                ({diasProxima > 0 ? `em ${diasProxima} dias` : `${Math.abs(diasProxima)} dias atrasado`})
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {equipamento.calibracoes && equipamento.calibracoes.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-sm">
                        <span className="font-medium text-blue-700 dark:text-blue-500">
                          {equipamento.calibracoes.length} calibração{equipamento.calibracoes.length > 1 ? 'ões' : ''} registrada{equipamento.calibracoes.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 flex-1"
                      onClick={() => {
                        setEquipamentoSelecionado(equipamento);
                        setShowDetalhesDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        setEquipamentoSelecionado(equipamento);
                        setShowUploadDialog(true);
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      Nova Calibração
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialogs */}
        <NovoEquipamentoDialog
          open={showNovoDialog}
          onOpenChange={setShowNovoDialog}
          onSuccess={getAllEquipamentos}
        />

        <DetalhesEquipamentoDialog
          open={showDetalhesDialog}
          onOpenChange={setShowDetalhesDialog}
          equipamento={equipamentoSelecionado}
        />

        <UploadCalibracaoDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          equipamento={equipamentoSelecionado}
          onSuccess={() => {
            setShowUploadDialog(false);
            getAllEquipamentos();
          }}
        />
      </div>
    </Layout>
  );
};

export default Calibracao;
