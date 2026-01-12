import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Plus
} from "lucide-react";
import { useNFs, useNFStats, useValidateNF } from "@/hooks/suprimentos/useNF";

const NotasFiscais = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Pegar contractId do state se vier da navegação de contratos
  const contractIdFromState = location.state?.contractId;

  const { data: nfsData, isLoading: nfsLoading } = useNFs(contractIdFromState);
  const { data: statsData, isLoading: statsLoading } = useNFStats();
  const validateNF = useValidateNF();

  const nfs = nfsData?.data?.nfs || [];
  const stats = statsData?.data || {
    total_nfs: 0,
    validated: 0,
    pending_validation: 0,
    rejected: 0,
    total_value: 0
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

  const filteredNFs = nfs.filter((nf: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      nf.numero?.toLowerCase().includes(search) ||
      nf.nome_fornecedor?.toLowerCase().includes(search) ||
      nf.fornecedor?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notas Fiscais</h1>
          <p className="text-muted-foreground">
            Gestão e validação de notas fiscais importadas
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
              {!searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/suprimentos/notas-fiscais/importar')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Importar Primeira NF
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNFs.map((nf: any) => (
                <div key={nf.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">
                          NF {nf.numero}/{nf.serie}
                        </h4>
                        {getStatusBadge(nf.status_processamento)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
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

                      {nf.contrato_id && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Contrato: {nf.contrato_id}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {nf.status_processamento === 'processado' && (
                        <Button
                          size="sm"
                          onClick={() => validateNF.mutate(nf.id)}
                          disabled={validateNF.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Validar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // TODO: Abrir modal de detalhes
                          console.log('Ver detalhes NF:', nf.id);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotasFiscais;
