import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Plus,
  ClipboardCheck,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Calendar,
  User,
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';
import { useToast } from '@/hooks/use-toast';
import { Inspecao } from '@/interfaces/QualidadeInterfaces';
import InspecaoService from '@/services/InspecaoService';
import { Badge } from '@/components/ui/badge';
import { NovaInspecaoDialog } from './NovaInspecaoDialog';
import { DetalhesInspecaoDialog } from './DetalhesInspecaoDialog';

const Inspecoes = () => {
  const { toast } = useToast();
  const [inspecoes, setInspecoes] = useState<Inspecao[]>([]);
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('todas');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todas');
  const [resultadoFiltro, setResultadoFiltro] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [showNovaInspecaoDialog, setShowNovaInspecaoDialog] = useState(false);
  const [showDetalhesDialog, setShowDetalhesDialog] = useState(false);
  const [inspecaoSelecionada, setInspecaoSelecionada] = useState<Inspecao | null>(null);

  const getAllInspecoes = async () => {
    try {
      setLoading(true);
      const data = await InspecaoService.getAll();
      setInspecoes(data);
    } catch (error) {
      console.error('Erro ao carregar inspeções:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as inspeções.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProjetos = async () => {
    try {
      const projetos = await ObrasService.getAllObras();
      setProjetos(projetos);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllInspecoes();
    getProjetos();
  }, []);

  const inspecoesFiltradas = inspecoes.filter((inspecao) => {
    const filtroProjeto = projetoSelecionado !== 'todas'
      ? inspecao.project?.id === projetoSelecionado
      : true;

    const filtroTipo =
      tipoFiltro === 'todas' ? true : inspecao.tipo === tipoFiltro;

    const filtroResultado =
      resultadoFiltro === 'todos'
        ? true
        : inspecao.resultado === resultadoFiltro;

    return filtroProjeto && filtroTipo && filtroResultado;
  });

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case 'aprovado':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'aprovado_com_ressalvas':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Aprovado c/ Ressalvas
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Reprovado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      recebimento: 'Recebimento',
      em_processo: 'Em Processo',
      final: 'Produto Final',
      auditoria: 'Auditoria',
    };
    return tipos[tipo] || tipo;
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ClipboardCheck className="w-8 h-8 text-primary" />
              Inspeções
            </h1>
            <p className="text-muted-foreground mt-1">
              Registros de inspeções de qualidade
            </p>
          </div>
          <Button onClick={() => setShowNovaInspecaoDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Inspeção
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-gray-400 bg-gray-50/30">
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{inspecoes.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Inspeções</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-green-50/30">
            <CardHeader className="pb-2">
              <CardDescription>Aprovadas</CardDescription>
              <CardTitle className="text-3xl text-green-700">
                {inspecoes.filter(i => i.resultado === 'aprovado').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Conformes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/30">
            <CardHeader className="pb-2">
              <CardDescription>Com Ressalvas</CardDescription>
              <CardTitle className="text-3xl text-yellow-700">
                {inspecoes.filter(i => i.resultado === 'aprovado_com_ressalvas').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Atenção</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 bg-red-50/30">
            <CardHeader className="pb-2">
              <CardDescription>Reprovadas</CardDescription>
              <CardTitle className="text-3xl text-red-700">
                {inspecoes.filter(i => i.resultado === 'reprovado').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">Não conforme</span>
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
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Obra</label>
              <Select value={projetoSelecionado} onValueChange={setProjetoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as obras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as obras</SelectItem>
                  {projetos.map((projeto) => (
                    <SelectItem key={projeto.id} value={projeto.id}>
                      {projeto.name}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="recebimento">Recebimento</SelectItem>
                  <SelectItem value="em_processo">Em Processo</SelectItem>
                  <SelectItem value="final">Produto Final</SelectItem>
                  <SelectItem value="auditoria">Auditoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Resultado</label>
              <Select value={resultadoFiltro} onValueChange={setResultadoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os resultados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="aprovado_com_ressalvas">
                    Aprovado c/ Ressalvas
                  </SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Inspeções */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : inspecoesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma inspeção encontrada</p>
                <p className="text-sm mt-2">
                  {tipoFiltro !== 'todas' || resultadoFiltro !== 'todos' || projetoSelecionado !== 'todas'
                    ? 'Tente ajustar os filtros'
                    : 'Crie uma nova inspeção para começar'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inspecoesFiltradas.map((inspecao) => {
              // Determinar cor da borda baseado no resultado
              const getBorderColor = () => {
                if (inspecao.resultado === 'aprovado') return 'border-l-green-500 bg-green-50/30';
                if (inspecao.resultado === 'aprovado_com_ressalvas') return 'border-l-yellow-500 bg-yellow-50/30';
                if (inspecao.resultado === 'reprovado') return 'border-l-red-500 bg-red-50/30';
                return 'border-l-gray-300 bg-gray-50/30';
              };

              return (
                <Card
                  key={inspecao.id}
                  className={`hover:shadow-lg transition-all cursor-pointer border-l-4 ${getBorderColor()}`}
                >

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          #{String(inspecao.codigo).padStart(4, '0')}
                        </Badge>
                        <Badge variant="secondary">
                          {getTipoLabel(inspecao.tipo)}
                        </Badge>
                      </div>
                      <CardTitle className="text-base line-clamp-2">
                        {inspecao.descricao}
                      </CardTitle>
                    </div>
                    {getResultadoBadge(inspecao.resultado)}
                  </div>
                  <CardDescription className="line-clamp-1">
                    {inspecao.project?.name}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(inspecao.dataInspecao), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      {inspecao.inspetor?.name}
                    </div>
                  </div>

                  {inspecao.material && (
                    <div className="bg-muted p-2 rounded text-sm">
                      <span className="font-medium">Material:</span> {inspecao.material}
                      {inspecao.lote && ` | Lote: ${inspecao.lote}`}
                    </div>
                  )}

                  {inspecao.ressalvas && (
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded text-sm">
                      <span className="font-medium text-yellow-700 dark:text-yellow-500">
                        Ressalvas:
                      </span>{' '}
                      <span className="text-yellow-600 dark:text-yellow-400 line-clamp-2">
                        {inspecao.ressalvas}
                      </span>
                    </div>
                  )}

                  {inspecao.rncGeradaId && (
                    <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded text-sm">
                      <span className="font-medium text-red-700 dark:text-red-500">
                        RNC Gerada
                      </span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <span className="text-xs text-muted-foreground">
                    {inspecao.campos?.length || 0} campos inspecionados
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setInspecaoSelecionada(inspecao);
                      setShowDetalhesDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalhes
                  </Button>
                </CardFooter>
              </Card>
              );
            })}
          </div>
        )}

        {/* Dialog de Nova Inspeção */}
        <NovaInspecaoDialog
          open={showNovaInspecaoDialog}
          onOpenChange={setShowNovaInspecaoDialog}
          onSuccess={getAllInspecoes}
        />

        {/* Dialog de Detalhes */}
        <DetalhesInspecaoDialog
          open={showDetalhesDialog}
          onOpenChange={setShowDetalhesDialog}
          inspecao={inspecaoSelecionada}
        />
      </div>
    </Layout>
  );
};

export default Inspecoes;
