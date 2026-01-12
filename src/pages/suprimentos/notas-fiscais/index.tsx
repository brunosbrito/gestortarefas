import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Upload,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Truck,
  Calendar,
  Package,
  ChevronDown,
  ChevronRight,
  Hash,
} from "lucide-react";
import { useNFs, useNFStats, useValidateNF, useRejectNF } from "@/hooks/suprimentos/useNF";

const NotasFiscais = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNFs, setExpandedNFs] = useState<Set<number>>(new Set());
  const [expandedSubpastas, setExpandedSubpastas] = useState<Set<string>>(new Set());
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [nfToReject, setNfToReject] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Pegar contractId do state se vier da navegação de contratos
  const contractIdFromState = location.state?.contractId;

  const { data: nfsData, isLoading: nfsLoading } = useNFs(contractIdFromState);
  const { data: statsData, isLoading: statsLoading } = useNFStats();
  const validateNF = useValidateNF();
  const rejectNF = useRejectNF();

  const nfs = nfsData?.data || [];
  const stats = statsData?.data || {
    total_nfs: 0,
    validated: 0,
    pending_validation: 0,
    rejected: 0,
    total_value: 0
  };

  const toggleNFExpansion = (nfId: number) => {
    const newExpanded = new Set(expandedNFs);
    if (newExpanded.has(nfId)) {
      newExpanded.delete(nfId);
    } else {
      newExpanded.add(nfId);
    }
    setExpandedNFs(newExpanded);
  };

  const toggleSubpastaExpansion = (subpasta: string) => {
    const newExpanded = new Set(expandedSubpastas);
    if (newExpanded.has(subpasta)) {
      newExpanded.delete(subpasta);
    } else {
      newExpanded.add(subpasta);
    }
    setExpandedSubpastas(newExpanded);
  };

  const handleRejectClick = (nfId: number) => {
    setNfToReject(nfId);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = async () => {
    if (!nfToReject || !rejectionReason.trim()) {
      return;
    }

    await rejectNF.mutateAsync({ id: nfToReject, reason: rejectionReason });
    setShowRejectDialog(false);
    setNfToReject(null);
    setRejectionReason("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validado':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Validado</Badge>;
      case 'processado':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPeso = (peso?: number) => {
    if (!peso) return 'Sem peso';
    return `${peso.toFixed(2)} kg`;
  };

  const filteredNFs = nfs.filter((nf: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      nf.numero?.toLowerCase().includes(search) ||
      nf.nome_fornecedor?.toLowerCase().includes(search) ||
      nf.fornecedor?.toLowerCase().includes(search)
    );
  });

  // Group NFs by subpasta
  const groupedBySubpasta = filteredNFs.reduce((groups: Record<string, any[]>, nf: any) => {
    const key = nf.subpasta || 'Sem Subpasta';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(nf);
    return groups;
  }, {});

  const subpastaKeys = Object.keys(groupedBySubpasta).sort((a, b) => {
    // "Sem Subpasta" always comes last
    if (a === 'Sem Subpasta') return 1;
    if (b === 'Sem Subpasta') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notas Fiscais</h1>
          <p className="text-muted-foreground">
            {contractIdFromState
              ? `Notas fiscais do contrato #${contractIdFromState}`
              : "Gestão e validação de notas fiscais importadas"
            }
          </p>
        </div>
        <Button onClick={() => navigate('/suprimentos/notas-fiscais/importar')}>
          <Upload className="h-4 w-4 mr-2" />
          Importar NFs
        </Button>
      </div>

      {/* Estatísticas */}
      {!statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de NFs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total_nfs}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Validadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.validated}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending_validation}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats.total_value)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número da NF ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de NFs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notas Fiscais ({filteredNFs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nfsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-2 w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredNFs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchTerm
                  ? "Nenhuma nota fiscal encontrada com os filtros aplicados"
                  : "Nenhuma nota fiscal importada ainda"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {subpastaKeys.map((subpasta) => {
                const nfsInSubpasta = groupedBySubpasta[subpasta];
                const totalValue = nfsInSubpasta.reduce((sum: number, nf: any) => sum + (nf.valor_total || 0), 0);

                return (
                  <div key={subpasta} className="border rounded-lg bg-card">
                    {/* Subpasta Header */}
                    <Collapsible
                      open={expandedSubpastas.has(subpasta)}
                      onOpenChange={() => toggleSubpastaExpansion(subpasta)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="p-4 bg-muted/40 hover:bg-muted/60 cursor-pointer transition-colors rounded-t-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {expandedSubpastas.has(subpasta) ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                              <div>
                                <h3 className="font-semibold text-lg">{subpasta}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {nfsInSubpasta.length} {nfsInSubpasta.length === 1 ? 'nota fiscal' : 'notas fiscais'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Valor Total</p>
                              <p className="font-semibold text-lg">{formatCurrency(totalValue)}</p>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="p-4 space-y-3">
                          {nfsInSubpasta.map((nf: any) => (
                <Collapsible
                  key={nf.id}
                  open={expandedNFs.has(nf.id)}
                  onOpenChange={() => toggleNFExpansion(nf.id)}
                >
                  <div className="border rounded-lg hover:bg-muted/30 transition-colors">
                    {/* NF Header */}
                    <CollapsibleTrigger asChild>
                      <div className="p-4 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {expandedNFs.has(nf.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <h4 className="font-semibold text-lg">
                                NF {nf.numero}/{nf.serie}
                              </h4>
                              {getStatusBadge(nf.status_processamento)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground ml-7">
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span>{nf.nome_fornecedor || nf.fornecedor}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(nf.data_emissao)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-medium">{formatCurrency(nf.valor_total)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span>{nf.items?.length || 0} itens</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {nf.status_processamento === 'processado' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    validateNF.mutate(nf.id);
                                  }}
                                  disabled={validateNF.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Validar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectClick(nf.id);
                                  }}
                                  disabled={rejectNF.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* NF Details */}
                    <CollapsibleContent>
                      <Separator />
                      <div className="p-4">
                        {/* Informações da NF */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h5 className="font-medium mb-3">Informações da NF</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">CNPJ Fornecedor:</span>
                                <span className="font-medium">{nf.cnpj_fornecedor}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Fornecedor:</span>
                                <span className="font-medium">{nf.nome_fornecedor || nf.fornecedor}</span>
                              </div>
                              {nf.chave_acesso && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Chave Acesso:</span>
                                  <span className="font-mono text-xs">{nf.chave_acesso}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Pasta:</span>
                                <span className="font-medium">{nf.pasta_origem}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Criada em:</span>
                                <span>{formatDate(nf.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-3">Valores</h5>
                            <div className="space-y-2 text-sm">
                              {nf.valor_produtos && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Produtos:</span>
                                  <span>{formatCurrency(nf.valor_produtos)}</span>
                                </div>
                              )}
                              {nf.valor_impostos && nf.valor_impostos > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Impostos:</span>
                                  <span>{formatCurrency(nf.valor_impostos)}</span>
                                </div>
                              )}
                              {nf.peso_total && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Peso Total:</span>
                                  <span>{formatPeso(nf.peso_total)}</span>
                                </div>
                              )}
                              <Separator />
                              <div className="flex justify-between font-medium text-base">
                                <span>Total:</span>
                                <span>{formatCurrency(nf.valor_total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Itens/Produtos */}
                        {nf.items && nf.items.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-3 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Itens/Produtos ({nf.items.length})
                            </h5>
                            <div className="space-y-3">
                              {nf.items.map((item: any) => (
                                <div key={item.id} className="border rounded-lg p-3 bg-muted/20">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h6 className="font-medium">{item.descricao}</h6>
                                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                        {item.numero_item && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs">#{item.numero_item.toString().padStart(3, '0')}</span>
                                          </div>
                                        )}
                                        {item.codigo_produto && (
                                          <div className="flex items-center gap-1">
                                            <Hash className="h-3 w-3" />
                                            <span>{item.codigo_produto}</span>
                                          </div>
                                        )}
                                        {item.ncm && (
                                          <div className="flex items-center gap-1">
                                            <span>NCM: {item.ncm}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Badge variant={item.status_integracao === 'integrado' ? 'default' : 'secondary'}>
                                      {item.status_integracao === 'integrado' ? 'Integrado' : item.status_integracao}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Qtd:</span>
                                      <p className="font-medium">{item.quantidade} {item.unidade}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Valor Unit.:</span>
                                      <p className="font-medium">{formatCurrency(item.valor_unitario)}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Total:</span>
                                      <p className="font-medium">{formatCurrency(item.valor_total)}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Centro Custo:</span>
                                      <p className="font-medium">{item.centro_custo || 'Material'}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Observações */}
                        {nf.observacoes && (
                          <div className="mt-6 pt-4 border-t">
                            <h5 className="font-medium mb-2">Observações</h5>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{nf.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Rejeição */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Nota Fiscal</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da rejeição desta nota fiscal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Motivo da Rejeição *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Valores incorretos, produto não corresponde, falta de documentação..."
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                Este motivo ficará registrado no histórico da nota fiscal.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={rejectNF.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim() || rejectNF.isPending}
            >
              {rejectNF.isPending ? (
                <>Rejeitando...</>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar NF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotasFiscais;
