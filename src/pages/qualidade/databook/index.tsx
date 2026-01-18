import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Plus,
  Filter,
  Edit,
  Download,
  Mail,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  History,
} from 'lucide-react';
import { Databook } from '@/interfaces/QualidadeInterfaces';
import { Obra } from '@/interfaces/ObrasInterface';
import DatabookService from '@/services/DatabookService';
import ObrasService from '@/services/ObrasService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { GerarDatabookDialog } from './GerarDatabookDialog';
import { EditorDatabookDialog } from './EditorDatabookDialog';

const DataBook = () => {
  const { toast } = useToast();
  const [databooks, setDatabooks] = useState<Databook[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<string>('all');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [showGerarDialog, setShowGerarDialog] = useState(false);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [databookSelecionado, setDatabookSelecionado] = useState<Databook | null>(null);

  useEffect(() => {
    loadDatabooks();
    loadObras();
  }, []);

  const loadDatabooks = async () => {
    try {
      setLoading(true);
      const data = await DatabookService.getAll();
      setDatabooks(data);
    } catch (error) {
      console.error('Erro ao carregar databooks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os databooks.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadObras = async () => {
    try {
      const data = await ObrasService.getAllObras();
      setObras(data);
    } catch (error) {
      console.error('Erro ao carregar obras:', error);
    }
  };

  const databooksFiltrados = databooks.filter((db) => {
    const filtroObra = obraSelecionada === 'all' || db.projectId === obraSelecionada;
    const filtroStatus = statusFiltro === 'todos' || db.status === statusFiltro;
    return filtroObra && filtroStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      rascunho: <Badge variant="outline" className="bg-gray-50 text-gray-700">
        <FileText className="w-3 h-3 mr-1" />
        Rascunho
      </Badge>,
      em_revisao: <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
        <Clock className="w-3 h-3 mr-1" />
        Em Revisão
      </Badge>,
      aprovado: <Badge variant="outline" className="bg-green-50 text-green-700">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Aprovado
      </Badge>,
      enviado: <Badge variant="outline" className="bg-blue-50 text-blue-700">
        <Send className="w-3 h-3 mr-1" />
        Enviado
      </Badge>,
    };
    return badges[status as keyof typeof badges] || null;
  };

  const handleDownloadPDF = async (databook: Databook) => {
    try {
      const blob = await DatabookService.downloadPDF(databook.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Databook_${databook.project?.name}_Rev${databook.revisao}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Sucesso',
        description: 'Download do PDF iniciado.',
      });
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o PDF.',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (databook: Databook) => {
    setDatabookSelecionado(databook);
    setShowEditorDialog(true);
  };

  const getBorderColor = (status: string) => {
    const colors = {
      rascunho: 'border-l-gray-400 dark:border-l-gray-600 bg-gray-50/30 dark:bg-gray-950/30',
      em_revisao: 'border-l-yellow-500 bg-yellow-50/30 dark:bg-yellow-950/30',
      aprovado: 'border-l-green-500 bg-green-50/30 dark:bg-green-950/30',
      enviado: 'border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/30',
    };
    return colors[status as keyof typeof colors] || 'border-l-gray-300 dark:border-l-gray-600 bg-gray-50/30 dark:bg-gray-950/30';
  };

  // Calcular estatísticas
  const stats = {
    total: databooks.length,
    rascunhos: databooks.filter(d => d.status === 'rascunho').length,
    aprovados: databooks.filter(d => d.status === 'aprovado').length,
    enviados: databooks.filter(d => d.status === 'enviado').length,
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Databook</h1>
                <p className="text-muted-foreground">
                  Dossiês técnicos completos por obra
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowGerarDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Gerar Databook
          </Button>
        </div>

        {/* Indicadores de Performance */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Indicadores de Performance</h2>
              <p className="text-sm text-muted-foreground">Métricas agregadas dos databooks</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-gray-400 dark:border-l-gray-600 bg-gray-50/30 dark:bg-gray-950/30">
              <CardHeader className="pb-2">
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Databooks</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/30 dark:bg-yellow-950/30">
              <CardHeader className="pb-2">
                <CardDescription>Rascunhos</CardDescription>
                <CardTitle className="text-3xl text-yellow-700 dark:text-yellow-400">{stats.rascunhos}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-400">Em elaboração</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-green-50/30 dark:bg-green-950/30">
              <CardHeader className="pb-2">
                <CardDescription>Aprovados</CardDescription>
                <CardTitle className="text-3xl text-green-700 dark:text-green-400">{stats.aprovados}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
                  <span className="text-sm text-green-700 dark:text-green-400">Finalizados</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/30">
              <CardHeader className="pb-2">
                <CardDescription>Enviados</CardDescription>
                <CardTitle className="text-3xl text-blue-700 dark:text-blue-400">{stats.enviados}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                  <span className="text-sm text-blue-700 dark:text-blue-400">Aos clientes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Obra</label>
                <Select value={obraSelecionada} onValueChange={setObraSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma obra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as obras</SelectItem>
                    {obras.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id || ''}>
                        {obra.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="em_revisao">Em Revisão</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Databooks */}
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Carregando databooks...</p>
              </div>
            </CardContent>
          </Card>
        ) : databooksFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <BookOpen className="w-16 h-16 text-muted-foreground opacity-50" />
                <div className="text-center">
                  <p className="font-medium text-foreground">Nenhum databook encontrado</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {databooksFiltrados.length < databooks.length
                      ? 'Tente ajustar os filtros'
                      : 'Gere um novo databook para começar'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {databooksFiltrados.map((databook) => (
              <Card
                key={databook.id}
                className={`hover:shadow-lg transition-all border-l-4 ${getBorderColor(databook.status)}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(databook.status)}
                        <Badge variant="outline" className="text-xs">
                          Rev. {databook.revisao}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{databook.titulo}</CardTitle>
                      <CardDescription>
                        {databook.project?.name || 'Obra não especificada'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cliente:</span>
                      <span className="font-medium">{databook.cliente}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Período:</span>
                      <span className="font-medium">
                        {format(new Date(databook.periodo.inicio), 'MM/yyyy', { locale: ptBR })} -{' '}
                        {format(new Date(databook.periodo.fim), 'MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Seções:</span>
                      <span className="font-medium">{databook.secoes?.length || 0}</span>
                    </div>
                    {databook.dataGeracao && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Gerado em:</span>
                        <span className="font-medium">
                          {format(new Date(databook.dataGeracao), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(databook)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>

                  {databook.pdfUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(databook)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDatabookSelecionado(databook);
                      // TODO: Abrir dialog de histórico
                    }}
                  >
                    <History className="w-4 h-4 mr-1" />
                    Histórico
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de Gerar Databook */}
        <GerarDatabookDialog
          open={showGerarDialog}
          onOpenChange={setShowGerarDialog}
          onSuccess={loadDatabooks}
        />

        {/* Dialog de Editor */}
        {databookSelecionado && (
          <EditorDatabookDialog
            open={showEditorDialog}
            onOpenChange={setShowEditorDialog}
            databook={databookSelecionado}
            onSuccess={loadDatabooks}
          />
        )}
      </div>
    </Layout>
  );
};

export default DataBook;
