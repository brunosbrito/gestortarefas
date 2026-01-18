import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Proposta } from '@/interfaces/PropostaInterface';
import { formatCurrency } from '@/lib/currency';
import StatusBadge from './components/StatusBadge';
import AprovarPropostaDialog from './components/AprovarPropostaDialog';
import RejeitarPropostaDialog from './components/RejeitarPropostaDialog';
import VincularObraDialog from './components/VincularObraDialog';
import VincularOrcamentoDialog from './components/VincularOrcamentoDialog';
import NovaPropostaDialog from './NovaPropostaDialog';
import {
  FileText,
  Calendar,
  User,
  Building2,
  DollarSign,
  Download,
  Edit,
  CheckCircle2,
  XCircle,
  Link,
  Calculator,
  Trash2,
} from 'lucide-react';

interface DetalhesPropostaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposta: Proposta;
  onUpdate?: () => void;
  onDelete?: (id: string) => void;
  onExportPDF?: (id: string, numero: string) => void;
}

const DetalhesPropostaDialog = ({
  open,
  onOpenChange,
  proposta,
  onUpdate,
  onDelete,
  onExportPDF,
}: DetalhesPropostaDialogProps) => {
  const [dialogAprovar, setDialogAprovar] = useState(false);
  const [dialogRejeitar, setDialogRejeitar] = useState(false);
  const [dialogVincularObra, setDialogVincularObra] = useState(false);
  const [dialogVincularOrcamento, setDialogVincularOrcamento] = useState(false);
  const [dialogEditar, setDialogEditar] = useState(false);

  const handleSuccessAction = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja deletar a proposta "${proposta.titulo}"?`)) {
      if (onDelete) {
        onDelete(proposta.id);
      }
      onOpenChange(false);
    }
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF(proposta.id, proposta.numero);
    }
  };

  const canEdit = proposta.status === 'rascunho' || proposta.status === 'em_analise';
  const canDelete = proposta.status === 'rascunho';
  const canApprove = proposta.status === 'em_analise';
  const canReject = proposta.status === 'em_analise';
  const canVincularObra = proposta.status === 'aprovada' && !proposta.obraId;
  const canVincularOrcamento = !proposta.orcamentoId;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Proposta Nº {proposta.numero}
                </DialogTitle>
                <DialogDescription className="text-base">{proposta.titulo}</DialogDescription>
              </div>
              <StatusBadge status={proposta.status} />
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <section className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Emissão</p>
                    <p className="font-medium">
                      {new Date(proposta.dataEmissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Validade</p>
                    <p className="font-medium">
                      {new Date(proposta.dataValidade).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Previsão de Entrega</p>
                    <p className="font-medium">{proposta.previsaoEntrega}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(proposta.valorTotal, proposta.moeda)}
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Dados do Cliente */}
            <section className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Razão Social</p>
                  <p className="font-medium">{proposta.cliente.razaoSocial}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-medium">{proposta.cliente.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{proposta.cliente.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{proposta.cliente.telefone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">
                    {proposta.cliente.endereco}, {proposta.cliente.cidade} - {proposta.cliente.uf},{' '}
                    CEP {proposta.cliente.cep}
                  </p>
                </div>
                {proposta.cliente.contatoAtencao && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contato (AC:)</p>
                    <p className="font-medium">{proposta.cliente.contatoAtencao}</p>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Vendedor */}
            <section className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                <User className="h-5 w-5" />
                Vendedor Responsável
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{proposta.vendedor.nome}</p>
                </div>
                {proposta.vendedor.telefone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{proposta.vendedor.telefone}</p>
                  </div>
                )}
                {proposta.vendedor.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{proposta.vendedor.email}</p>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Pagamento */}
            <section className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">Condições de Pagamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
                  <p className="font-medium">{proposta.pagamento.formaPagamento}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium">{formatCurrency(proposta.pagamento.valor)}</p>
                </div>
                {proposta.pagamento.observacao && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="font-medium">{proposta.pagamento.observacao}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Vinculações */}
            {(proposta.obraId || proposta.orcamentoId) && (
              <>
                <Separator />
                <section className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Vinculações</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {proposta.obraId && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-semibold text-blue-900">Obra Vinculada</p>
                        </div>
                        {proposta.obra && (
                          <p className="text-sm text-blue-700">
                            {proposta.obra.codigo} - {proposta.obra.titulo}
                          </p>
                        )}
                      </div>
                    )}
                    {proposta.orcamentoId && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Calculator className="h-4 w-4 text-purple-600" />
                          <p className="text-sm font-semibold text-purple-900">
                            Orçamento Vinculado
                          </p>
                        </div>
                        {proposta.orcamento && (
                          <p className="text-sm text-purple-700">
                            {proposta.orcamento.numero} - {proposta.orcamento.nome}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* Motivo de Rejeição (se rejeitada) */}
            {proposta.status === 'rejeitada' && proposta.motivoRejeicao && (
              <>
                <Separator />
                <section className="space-y-2">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Motivo da Rejeição
                    </h3>
                    <p className="text-sm text-red-700">{proposta.motivoRejeicao}</p>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
            {/* Ações principais */}
            <div className="flex gap-2 flex-1">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>

              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => setDialogEditar(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}

              {canVincularOrcamento && (
                <Button variant="outline" size="sm" onClick={() => setDialogVincularOrcamento(true)}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Vincular Orçamento
                </Button>
              )}

              {canVincularObra && (
                <Button variant="outline" size="sm" onClick={() => setDialogVincularObra(true)}>
                  <Link className="h-4 w-4 mr-2" />
                  Vincular à Obra
                </Button>
              )}
            </div>

            {/* Ações de workflow */}
            <div className="flex gap-2">
              {canApprove && (
                <Button
                  size="sm"
                  onClick={() => setDialogAprovar(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
              )}

              {canReject && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDialogRejeitar(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              )}

              {canDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <AprovarPropostaDialog
        open={dialogAprovar}
        onOpenChange={setDialogAprovar}
        propostaId={proposta.id}
        propostaTitulo={proposta.titulo}
        onSuccess={handleSuccessAction}
      />

      <RejeitarPropostaDialog
        open={dialogRejeitar}
        onOpenChange={setDialogRejeitar}
        propostaId={proposta.id}
        propostaTitulo={proposta.titulo}
        onSuccess={handleSuccessAction}
      />

      <VincularObraDialog
        open={dialogVincularObra}
        onOpenChange={setDialogVincularObra}
        propostaId={proposta.id}
        propostaTitulo={proposta.titulo}
        onSuccess={handleSuccessAction}
      />

      <VincularOrcamentoDialog
        open={dialogVincularOrcamento}
        onOpenChange={setDialogVincularOrcamento}
        propostaId={proposta.id}
        propostaTitulo={proposta.titulo}
        onSuccess={handleSuccessAction}
      />

      <NovaPropostaDialog
        open={dialogEditar}
        onOpenChange={setDialogEditar}
        propostaParaEditar={proposta}
        onSaveSuccess={handleSuccessAction}
      />
    </>
  );
};

export default DetalhesPropostaDialog;
