import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Plus,
  FileText,
  Filter,
  Eye,
  Copy,
  Edit,
  Power,
  PowerOff,
  History,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlanoInspecao } from '@/interfaces/QualidadeInterfaces';
import PlanoInspecaoService from '@/services/PlanoInspecaoService';
import { Badge } from '@/components/ui/badge';
import { NovoPlanoDialog } from './NovoPlanoDialog';
import { DetalhesPlanoDialog } from './DetalhesPlanoDialog';

const PlanosInspecao = () => {
  const { toast } = useToast();
  const [planos, setPlanos] = useState<PlanoInspecao[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [showNovoPlanoDialog, setShowNovoPlanoDialog] = useState(false);
  const [showDetalhesDialog, setShowDetalhesDialog] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoInspecao | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const getAllPlanos = async () => {
    try {
      setLoading(true);
      const data = await PlanoInspecaoService.getAll();
      setPlanos(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os planos de inspeção.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPlanos();
  }, []);

  const planosFiltrados = planos.filter((plano) => {
    const filtroTipo =
      tipoFiltro === 'todos' ? true : plano.tipo === tipoFiltro;

    const filtroStatus =
      statusFiltro === 'todos'
        ? true
        : statusFiltro === 'ativo'
        ? plano.ativo
        : !plano.ativo;

    return filtroTipo && filtroStatus;
  });

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      recebimento: 'Recebimento',
      em_processo: 'Em Processo',
      final: 'Produto Final',
      auditoria: 'Auditoria',
    };
    return tipos[tipo] || tipo;
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'recebimento':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'em_processo':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
      case 'final':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'auditoria':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
      default:
        return '';
    }
  };

  const handleToggleAtivo = async (plano: PlanoInspecao) => {
    try {
      await PlanoInspecaoService.toggleAtivo(plano.id, !plano.ativo);
      toast({
        title: 'Sucesso',
        description: `Plano ${plano.ativo ? 'desativado' : 'ativado'} com sucesso.`,
      });
      getAllPlanos();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do plano.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicar = async (plano: PlanoInspecao) => {
    try {
      const novoNome = `${plano.nome} (Cópia)`;
      await PlanoInspecaoService.duplicar(plano.id, novoNome);
      toast({
        title: 'Sucesso',
        description: 'Plano duplicado com sucesso.',
      });
      getAllPlanos();
    } catch (error) {
      console.error('Erro ao duplicar plano:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar o plano.',
        variant: 'destructive',
      });
    }
  };

  const handleEditar = (plano: PlanoInspecao) => {
    setPlanoSelecionado(plano);
    setModoEdicao(true);
    setShowNovoPlanoDialog(true);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8 text-primary" />
              Planos de Inspeção
            </h1>
            <p className="text-muted-foreground mt-1">
              Templates reutilizáveis para inspeções
            </p>
          </div>
          <Button onClick={() => {
            setModoEdicao(false);
            setPlanoSelecionado(null);
            setShowNovoPlanoDialog(true);
          }} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Plano
          </Button>
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
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="recebimento">Recebimento</SelectItem>
                  <SelectItem value="em_processo">Em Processo</SelectItem>
                  <SelectItem value="final">Produto Final</SelectItem>
                  <SelectItem value="auditoria">Auditoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Planos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : planosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum plano de inspeção encontrado</p>
                <p className="text-sm mt-2">
                  {tipoFiltro !== 'todos' || statusFiltro !== 'todos'
                    ? 'Tente ajustar os filtros'
                    : 'Crie um novo plano para começar'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planosFiltrados.map((plano) => (
              <Card
                key={plano.id}
                className={`hover:shadow-lg transition-shadow ${
                  !plano.ativo ? 'opacity-60' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTipoBadgeColor(plano.tipo)}>
                          {getTipoLabel(plano.tipo)}
                        </Badge>
                        <Badge variant="outline">
                          v{plano.versao}
                        </Badge>
                        {plano.ativo ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <Power className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <PowerOff className="w-3 h-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base line-clamp-2">
                        {plano.nome}
                      </CardTitle>
                    </div>
                  </div>
                  {plano.descricao && (
                    <CardDescription className="line-clamp-2">
                      {plano.descricao}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="bg-muted p-2 rounded text-sm space-y-1">
                    {plano.produto && (
                      <div>
                        <span className="font-medium">Produto:</span> {plano.produto}
                      </div>
                    )}
                    {plano.processo && (
                      <div>
                        <span className="font-medium">Processo:</span> {plano.processo}
                      </div>
                    )}
                    {plano.frequencia && (
                      <div>
                        <span className="font-medium">Frequência:</span> {plano.frequencia}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{plano.campos?.length || 0} campos configurados</span>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 flex-1"
                    onClick={() => {
                      setPlanoSelecionado(plano);
                      setShowDetalhesDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 flex-1"
                    onClick={() => handleEditar(plano)}
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 flex-1"
                    onClick={() => handleDuplicar(plano)}
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 flex-1"
                    onClick={() => handleToggleAtivo(plano)}
                  >
                    {plano.ativo ? (
                      <>
                        <PowerOff className="w-4 h-4" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        Ativar
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de Novo Plano */}
        <NovoPlanoDialog
          open={showNovoPlanoDialog}
          onOpenChange={setShowNovoPlanoDialog}
          onSuccess={getAllPlanos}
          plano={modoEdicao ? planoSelecionado : null}
        />

        {/* Dialog de Detalhes */}
        <DetalhesPlanoDialog
          open={showDetalhesDialog}
          onOpenChange={setShowDetalhesDialog}
          plano={planoSelecionado}
        />
      </div>
    </Layout>
  );
};

export default PlanosInspecao;
