import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ClipboardList,
  GitBranch,
  RotateCw,
  Eye,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { LayoutGestaoProcessos } from './LayoutGestaoProcessos';
import AprovacaoGPService, { DocumentoAprovacao } from '@/services/gestaoProcessos/AprovacaoGPService';
import { AprovacaoDialog } from './components/AprovacaoDialog';
import { RejeicaoDialog } from './components/RejeicaoDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function FilaAprovacao() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [documentos, setDocumentos] = useState<DocumentoAprovacao[]>([]);
  const [filteredDocumentos, setFilteredDocumentos] = useState<DocumentoAprovacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtros
  const [tipoFilter, setTipoFilter] = useState<string>('todos');

  // Dialogs
  const [aprovacaoDialogOpen, setAprovacaoDialogOpen] = useState(false);
  const [rejeicaoDialogOpen, setRejeicaoDialogOpen] = useState(false);
  const [currentDocumento, setCurrentDocumento] = useState<DocumentoAprovacao | null>(null);

  useEffect(() => {
    loadDocumentos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documentos, tipoFilter]);

  const loadDocumentos = async () => {
    try {
      setIsLoading(true);
      const data = await AprovacaoGPService.getDocumentosAguardandoAprovacao();
      setDocumentos(data);
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Erro ao carregar fila:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a fila de aprovação',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documentos];

    if (tipoFilter !== 'todos') {
      filtered = filtered.filter((d) => d.tipo === tipoFilter);
    }

    setFilteredDocumentos(filtered);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredDocumentos.map((d) => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleAprovarSelecionados = async () => {
    const selected = filteredDocumentos.filter((d) => selectedIds.has(d.id));
    if (selected.length === 0) return;

    try {
      const result = await AprovacaoGPService.aprovarLote(
        selected,
        '2', // TODO: Pegar do contexto de auth
        'Maria Santos' // TODO: Pegar do contexto de auth
      );

      toast({
        title: 'Aprovação Concluída',
        description: `${result.sucessos} documento(s) aprovado(s)${result.erros > 0 ? `, ${result.erros} erro(s)` : ''}`,
      });

      loadDocumentos();
    } catch (error) {
      console.error('Erro ao aprovar em lote:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar os documentos',
        variant: 'destructive',
      });
    }
  };

  const handleRejeitarSelecionados = async (motivo: string) => {
    const selected = filteredDocumentos.filter((d) => selectedIds.has(d.id));
    if (selected.length === 0) return;

    try {
      const result = await AprovacaoGPService.rejeitarLote(
        selected,
        '2', // TODO: Pegar do contexto de auth
        'Maria Santos', // TODO: Pegar do contexto de auth
        motivo
      );

      toast({
        title: 'Rejeição Concluída',
        description: `${result.sucessos} documento(s) rejeitado(s)${result.erros > 0 ? `, ${result.erros} erro(s)` : ''}`,
      });

      loadDocumentos();
    } catch (error) {
      console.error('Erro ao rejeitar em lote:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar os documentos',
        variant: 'destructive',
      });
    }
  };

  const handleAprovarUnico = (documento: DocumentoAprovacao) => {
    setCurrentDocumento(documento);
    setAprovacaoDialogOpen(true);
  };

  const handleRejeitarUnico = (documento: DocumentoAprovacao) => {
    setCurrentDocumento(documento);
    setRejeicaoDialogOpen(true);
  };

  const handleVisualizar = (documento: DocumentoAprovacao) => {
    const paths = {
      priorizacao: '/gestao-processos/priorizacao',
      'plano-acao': `/gestao-processos/planos-acao/${documento.id}`,
      desdobramento: '/gestao-processos/desdobramento',
      meta: `/gestao-processos/metas/${documento.id}`,
      pdca: `/gestao-processos/pdca/${documento.id}`,
    };
    navigate(paths[documento.tipo]);
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      priorizacao: Target,
      'plano-acao': ClipboardList,
      desdobramento: GitBranch,
      meta: Target,
      pdca: RotateCw,
    };
    return icons[tipo as keyof typeof icons] || FileText;
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      priorizacao: 'Priorização GUT',
      'plano-acao': 'Plano 5W2H',
      desdobramento: 'Desdobramento',
      meta: 'Meta SMART',
      pdca: 'PDCA',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      priorizacao: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
      'plano-acao': 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
      desdobramento: 'bg-pink-100 text-pink-700 dark:bg-pink-950/20 dark:text-pink-400',
      meta: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
      pdca: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const selectedCount = selectedIds.size;
  const allSelected = filteredDocumentos.length > 0 && selectedCount === filteredDocumentos.length;

  return (
    <LayoutGestaoProcessos>
      <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Fila de Aprovação</h1>
              <p className="text-muted-foreground mt-1">
                Documentos aguardando aprovação de todas as ferramentas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                <Clock className="w-4 h-4 mr-2" />
                {documentos.length} pendente{documentos.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Ações em Lote */}
          {selectedCount > 0 && (
            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="font-semibold">
                      {selectedCount} documento{selectedCount > 1 ? 's' : ''} selecionado{selectedCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAprovarSelecionados}
                      className="bg-green-600 text-white hover:bg-green-700 border-green-600"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Aprovar Selecionados
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Preparar para rejeição em lote
                        const selected = filteredDocumentos.filter((d) => selectedIds.has(d.id));
                        if (selected.length > 0) {
                          setCurrentDocumento(selected[0]); // Usar primeiro para template
                          setRejeicaoDialogOpen(true);
                        }
                      }}
                      className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar Selecionados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filtros */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Filtros</CardTitle>
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as ferramentas</SelectItem>
                    <SelectItem value="priorizacao">Priorização GUT</SelectItem>
                    <SelectItem value="plano-acao">Planos 5W2H</SelectItem>
                    <SelectItem value="desdobramento">Desdobramento</SelectItem>
                    <SelectItem value="meta">Metas SMART</SelectItem>
                    <SelectItem value="pdca">PDCA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          {/* Lista de Documentos */}
          <Card>
            <CardHeader>
              <CardTitle>
                Documentos ({filteredDocumentos.length})
              </CardTitle>
              <CardDescription>
                Revise e aprove/rejeite os documentos submetidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground mt-4">Carregando...</p>
                </div>
              ) : filteredDocumentos.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">
                    {documentos.length === 0
                      ? 'Nenhum documento aguardando aprovação'
                      : 'Nenhum documento encontrado com os filtros aplicados'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocumentos.map((doc) => {
                    const TipoIcon = getTipoIcon(doc.tipo);
                    const isSelected = selectedIds.has(doc.id);

                    return (
                      <div
                        key={doc.id}
                        className={cn(
                          'flex items-start gap-4 p-4 rounded-lg border transition-all',
                          isSelected
                            ? 'bg-primary/5 border-primary'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectOne(doc.id, checked as boolean)
                          }
                        />

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={getTipoColor(doc.tipo)}>
                                  <TipoIcon className="w-3 h-3 mr-1" />
                                  {getTipoLabel(doc.tipo)}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {doc.codigo}
                                </span>
                              </div>
                              <h3 className="font-semibold text-lg">{doc.titulo}</h3>
                              {doc.descricao && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {doc.descricao}
                                </p>
                              )}
                              {doc.resumo && (
                                <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                                  {doc.resumo}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Criado por:</span> {doc.criadoPorNome}
                              </div>
                              <div>
                                <span className="font-medium">Data:</span>{' '}
                                {format(new Date(doc.createdAt), 'dd/MM/yyyy HH:mm', {
                                  locale: ptBR,
                                })}
                              </div>
                              <div>
                                <span className="font-medium">Vinculação:</span>{' '}
                                {doc.tipoVinculacao === 'obra' && doc.obraNome}
                                {doc.tipoVinculacao === 'setor' && doc.setorNome}
                                {doc.tipoVinculacao === 'independente' && 'Independente'}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVisualizar(doc)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAprovarUnico(doc)}
                                className="bg-green-600 text-white hover:bg-green-700 border-green-600"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Aprovar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejeitarUnico(doc)}
                                className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rejeitar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      {currentDocumento && (
        <>
          <AprovacaoDialog
            open={aprovacaoDialogOpen}
            onOpenChange={setAprovacaoDialogOpen}
            documento={{
              id: currentDocumento.id,
              tipo: getTipoLabel(currentDocumento.tipo),
              codigo: currentDocumento.codigo,
              titulo: currentDocumento.titulo,
              criadoPor: currentDocumento.criadoPorNome,
              data: currentDocumento.createdAt,
            }}
            onAprovar={async () => {
              try {
                await AprovacaoGPService.aprovar(currentDocumento, {
                  documentoId: currentDocumento.id,
                  aprovadorId: '2', // TODO: Auth context
                  aprovadorNome: 'Maria Santos', // TODO: Auth context
                });
                toast({
                  title: 'Sucesso',
                  description: 'Documento aprovado com sucesso',
                });
                loadDocumentos();
                setAprovacaoDialogOpen(false);
              } catch (error) {
                toast({
                  title: 'Erro',
                  description: 'Não foi possível aprovar o documento',
                  variant: 'destructive',
                });
              }
            }}
          />

          <RejeicaoDialog
            open={rejeicaoDialogOpen}
            onOpenChange={setRejeicaoDialogOpen}
            documento={{
              id: currentDocumento.id,
              tipo: getTipoLabel(currentDocumento.tipo),
              codigo: currentDocumento.codigo,
              titulo: currentDocumento.titulo,
              criadoPor: currentDocumento.criadoPorNome,
              data: currentDocumento.createdAt,
            }}
            onRejeitar={async (motivo) => {
              try {
                if (selectedCount > 1) {
                  // Rejeição em lote
                  await handleRejeitarSelecionados(motivo);
                } else {
                  // Rejeição única
                  await AprovacaoGPService.rejeitar(currentDocumento, {
                    documentoId: currentDocumento.id,
                    aprovadorId: '2', // TODO: Auth context
                    aprovadorNome: 'Maria Santos', // TODO: Auth context
                    motivoRejeicao: motivo,
                  });
                  toast({
                    title: 'Sucesso',
                    description: 'Documento rejeitado com sucesso',
                  });
                  loadDocumentos();
                }
                setRejeicaoDialogOpen(false);
              } catch (error) {
                toast({
                  title: 'Erro',
                  description: 'Não foi possível rejeitar o documento',
                  variant: 'destructive',
                });
              }
            }}
          />
        </>
      )}
      </div>
    </LayoutGestaoProcessos>
  );
}
