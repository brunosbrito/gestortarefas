import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Plus,
  FileCheck,
  Filter,
  Eye,
  Mail,
  Download,
  Check,
  X,
  Clock,
  AlertTriangle,
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
import { Certificado } from '@/interfaces/QualidadeInterfaces';
import CertificadoService from '@/services/CertificadoService';
import { Badge } from '@/components/ui/badge';
import { UploadCertificadoDialog } from './UploadCertificadoDialog';
import { DetalhesCertificadoDialog } from './DetalhesCertificadoDialog';
import { EnviarEmailDialog } from './EnviarEmailDialog';
import { Checkbox } from '@/components/ui/checkbox';

const Certificados = () => {
  const { toast } = useToast();
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('todas');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDetalhesDialog, setShowDetalhesDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [certificadoSelecionado, setCertificadoSelecionado] = useState<Certificado | null>(null);
  const [certificadosSelecionados, setCertificadosSelecionados] = useState<string[]>([]);

  const getAllCertificados = async () => {
    try {
      setLoading(true);
      const filtros = {
        projectId: projetoSelecionado !== 'todas' ? projetoSelecionado : undefined,
        status: statusFiltro !== 'todos' ? statusFiltro : undefined,
      };
      const data = await CertificadoService.getAll(filtros);
      setCertificados(data);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os certificados.',
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
    getAllCertificados();
    getProjetos();
  }, []);

  useEffect(() => {
    getAllCertificados();
  }, [projetoSelecionado, statusFiltro]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'recebido':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Download className="w-3 h-3 mr-1" />
            Recebido
          </Badge>
        );
      case 'em_analise':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Em Análise
          </Badge>
        );
      case 'aprovado':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <Check className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <X className="w-3 h-3 mr-1" />
            Reprovado
          </Badge>
        );
      case 'enviado':
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
            <Mail className="w-3 h-3 mr-1" />
            Enviado
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleToggleSelecao = (certificadoId: string) => {
    if (certificadosSelecionados.includes(certificadoId)) {
      setCertificadosSelecionados(
        certificadosSelecionados.filter((id) => id !== certificadoId)
      );
    } else {
      setCertificadosSelecionados([...certificadosSelecionados, certificadoId]);
    }
  };

  const handleEnviarSelecionados = () => {
    if (certificadosSelecionados.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Selecione ao menos um certificado para enviar.',
        variant: 'destructive',
      });
      return;
    }

    // Verificar se todos os selecionados estão aprovados
    const todosAprovados = certificados
      .filter((c) => certificadosSelecionados.includes(c.id))
      .every((c) => c.status === 'aprovado');

    if (!todosAprovados) {
      toast({
        title: 'Atenção',
        description: 'Apenas certificados aprovados podem ser enviados.',
        variant: 'destructive',
      });
      return;
    }

    setShowEmailDialog(true);
  };

  const handleUpdateStatus = async (certificadoId: string, novoStatus: string) => {
    try {
      await CertificadoService.updateStatus(certificadoId, novoStatus);
      toast({
        title: 'Sucesso',
        description: 'Status do certificado atualizado.',
      });
      getAllCertificados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do certificado.',
        variant: 'destructive',
      });
    }
  };

  const certificadosSelecionadosData = certificados.filter((c) =>
    certificadosSelecionados.includes(c.id)
  );

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileCheck className="w-8 h-8 text-primary" />
              Certificados de Qualidade
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestão de certificados de terceiros
            </p>
          </div>
          <div className="flex gap-2">
            {certificadosSelecionados.length > 0 && (
              <Button
                onClick={handleEnviarSelecionados}
                variant="outline"
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Enviar {certificadosSelecionados.length} Selecionado
                {certificadosSelecionados.length > 1 ? 's' : ''}
              </Button>
            )}
            <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Upload Certificado
            </Button>
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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="recebido">Recebido</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Certificados */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : certificados.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum certificado encontrado</p>
                <p className="text-sm mt-2">
                  {statusFiltro !== 'todos' || projetoSelecionado !== 'todas'
                    ? 'Tente ajustar os filtros'
                    : 'Faça upload de um certificado para começar'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificados.map((certificado) => (
              <Card
                key={certificado.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={certificadosSelecionados.includes(certificado.id)}
                      onCheckedChange={() => handleToggleSelecao(certificado.id)}
                      disabled={certificado.status !== 'aprovado'}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {getStatusBadge(certificado.status)}
                      </div>
                      <CardTitle className="text-base line-clamp-2">
                        {certificado.tipoCertificado}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {certificado.project?.name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="bg-muted p-2 rounded text-sm space-y-1">
                    <div>
                      <span className="font-medium">Nº:</span> {certificado.numeroCertificado}
                    </div>
                    <div>
                      <span className="font-medium">Fornecedor:</span> {certificado.fornecedor}
                    </div>
                    {certificado.material && (
                      <div>
                        <span className="font-medium">Material:</span> {certificado.material}
                        {certificado.lote && ` | Lote: ${certificado.lote}`}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Emissão:</span>{' '}
                      {format(new Date(certificado.dataEmissao), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </div>
                    {certificado.dataValidade && (
                      <div>
                        <span className="font-medium">Validade:</span>{' '}
                        {format(new Date(certificado.dataValidade), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </div>
                    )}
                  </div>

                  {certificado.envios && certificado.envios.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded text-sm">
                      <span className="font-medium text-purple-700 dark:text-purple-500">
                        Enviado {certificado.envios.length}x
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
                      setCertificadoSelecionado(certificado);
                      setShowDetalhesDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                  {certificado.status === 'recebido' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleUpdateStatus(certificado.id, 'aprovado')}
                      >
                        <Check className="w-4 h-4" />
                        Aprovar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleUpdateStatus(certificado.id, 'reprovado')}
                      >
                        <X className="w-4 h-4" />
                        Reprovar
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de Upload */}
        <UploadCertificadoDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          onSuccess={getAllCertificados}
        />

        {/* Dialog de Detalhes */}
        <DetalhesCertificadoDialog
          open={showDetalhesDialog}
          onOpenChange={setShowDetalhesDialog}
          certificado={certificadoSelecionado}
        />

        {/* Dialog de Envio de Email */}
        <EnviarEmailDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          certificados={certificadosSelecionadosData}
          onSuccess={() => {
            setCertificadosSelecionados([]);
            getAllCertificados();
          }}
        />
      </div>
    </Layout>
  );
};

export default Certificados;
