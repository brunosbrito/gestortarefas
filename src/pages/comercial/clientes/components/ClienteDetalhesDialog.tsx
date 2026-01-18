import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Cliente } from '@/interfaces/ClienteInterface';
import {
  Building2,
  UserCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Globe,
  Calendar,
} from 'lucide-react';

interface ClienteDetalhesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string, razaoSocial: string) => void;
}

const ClienteDetalhesDialog = ({
  open,
  onOpenChange,
  cliente,
  onEdit,
  onDelete,
}: ClienteDetalhesDialogProps) => {
  if (!cliente) return null;

  const isPJ = cliente.tipoPessoa === 'juridica';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPJ ? (
                <Building2 className="h-6 w-6 text-blue-600" />
              ) : (
                <UserCircle className="h-6 w-6 text-green-600" />
              )}
              <div>
                <DialogTitle className="text-xl">{cliente.razaoSocial}</DialogTitle>
                {cliente.nomeFantasia && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {cliente.nomeFantasia}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={cliente.ativo ? 'default' : 'secondary'}>
              {cliente.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Dados Principais */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dados Principais
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tipo de Pessoa:</span>
                <p className="font-medium">
                  {isPJ ? 'Pessoa Jurídica' : 'Pessoa Física'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">{isPJ ? 'CNPJ:' : 'CPF:'}</span>
                <p className="font-medium">{isPJ ? cliente.cnpj : cliente.cpf}</p>
              </div>
              {cliente.inscricaoEstadual && (
                <div>
                  <span className="text-muted-foreground">Inscrição Estadual:</span>
                  <p className="font-medium">{cliente.inscricaoEstadual}</p>
                </div>
              )}
              {cliente.inscricaoMunicipal && (
                <div>
                  <span className="text-muted-foreground">Inscrição Municipal:</span>
                  <p className="font-medium">{cliente.inscricaoMunicipal}</p>
                </div>
              )}
              {cliente.segmento && (
                <div>
                  <span className="text-muted-foreground">Segmento:</span>
                  <p className="font-medium">{cliente.segmento}</p>
                </div>
              )}
              {cliente.porte && (
                <div>
                  <span className="text-muted-foreground">Porte:</span>
                  <p className="font-medium">{cliente.porte}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contato
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone Principal</p>
                  <p className="font-medium">{cliente.telefone}</p>
                </div>
              </div>
              {cliente.telefoneSecundario && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone Secundário</p>
                    <p className="font-medium">{cliente.telefoneSecundario}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">E-mail Principal</p>
                  <p className="font-medium">{cliente.email}</p>
                </div>
              </div>
              {cliente.emailSecundario && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">E-mail Secundário</p>
                    <p className="font-medium">{cliente.emailSecundario}</p>
                  </div>
                </div>
              )}
              {cliente.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <a
                      href={cliente.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {cliente.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contato Principal */}
          {cliente.contatoPrincipal && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Contato Principal
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <p className="font-medium">{cliente.contatoPrincipal.nome}</p>
                  </div>
                  {cliente.contatoPrincipal.cargo && (
                    <div>
                      <span className="text-muted-foreground">Cargo:</span>
                      <p className="font-medium">{cliente.contatoPrincipal.cargo}</p>
                    </div>
                  )}
                  {cliente.contatoPrincipal.telefone && (
                    <div>
                      <span className="text-muted-foreground">Telefone:</span>
                      <p className="font-medium">{cliente.contatoPrincipal.telefone}</p>
                    </div>
                  )}
                  {cliente.contatoPrincipal.email && (
                    <div>
                      <span className="text-muted-foreground">E-mail:</span>
                      <p className="font-medium">{cliente.contatoPrincipal.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Endereço Principal */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço Principal
              <Badge variant="outline" className="ml-2">
                {cliente.enderecoPrincipal.tipo.toUpperCase()}
              </Badge>
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">
                {cliente.enderecoPrincipal.logradouro}, {cliente.enderecoPrincipal.numero}
                {cliente.enderecoPrincipal.complemento && (
                  <span> - {cliente.enderecoPrincipal.complemento}</span>
                )}
              </p>
              <p className="text-muted-foreground">
                {cliente.enderecoPrincipal.bairro}
              </p>
              <p className="text-muted-foreground">
                {cliente.enderecoPrincipal.cidade} - {cliente.enderecoPrincipal.uf}
              </p>
              <p className="text-muted-foreground">
                CEP: {cliente.enderecoPrincipal.cep}
              </p>
              <p className="text-muted-foreground">
                {cliente.enderecoPrincipal.pais}
              </p>
            </div>
          </div>

          {/* Endereços Secundários */}
          {cliente.enderecosSecundarios && cliente.enderecosSecundarios.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereços Secundários
                  <Badge variant="secondary" className="ml-2">
                    {cliente.enderecosSecundarios.length}
                  </Badge>
                </h3>
                <div className="space-y-4">
                  {cliente.enderecosSecundarios.map((endereco) => (
                    <div key={endereco.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {endereco.tipo.toUpperCase()}
                        </Badge>
                        {endereco.descricao && (
                          <span className="text-sm text-muted-foreground">
                            {endereco.descricao}
                          </span>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">
                          {endereco.logradouro}, {endereco.numero}
                          {endereco.complemento && (
                            <span> - {endereco.complemento}</span>
                          )}
                        </p>
                        <p className="text-muted-foreground">
                          {endereco.bairro} - {endereco.cidade}/{endereco.uf}
                        </p>
                        <p className="text-muted-foreground">
                          CEP: {endereco.cep}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Observações */}
          {cliente.observacoes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm mb-2">Observações</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {cliente.observacoes}
                </p>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <div>
                <p>Criado em:</p>
                <p className="font-medium">
                  {new Date(cliente.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <div>
                <p>Atualizado em:</p>
                <p className="font-medium">
                  {new Date(cliente.updatedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(cliente.id, cliente.razaoSocial);
              onOpenChange(false);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar
          </Button>
          <Button
            onClick={() => {
              onEdit(cliente);
              onOpenChange(false);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteDetalhesDialog;
