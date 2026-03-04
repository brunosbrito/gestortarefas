import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Key,
  Plus,
  Copy,
  MoreVertical,
  Trash2,
  RefreshCw,
  Ban,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  Activity,
} from 'lucide-react';
import {
  useApiKeys,
  useCreateApiKey,
  useDeleteApiKey,
  useRevokeApiKey,
  useRegenerateApiKey,
} from '@/hooks/useApiKeys';
import { ApiKey, CreateApiKeyDto } from '@/services/ApiKeyService';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GerenciarApiKeys = () => {
  const { toast } = useToast();
  const { data: apiKeys = [], isLoading, error, refetch } = useApiKeys();

  // Estados dos dialogs
  const [dialogCreateOpen, setDialogCreateOpen] = useState(false);
  const [dialogKeyCreatedOpen, setDialogKeyCreatedOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [keyToRegenerate, setKeyToRegenerate] = useState<ApiKey | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formNeverExpires, setFormNeverExpires] = useState(true);
  const [formExpiresAt, setFormExpiresAt] = useState('');

  // Mutations
  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey({
    onSuccess: (data) => {
      setCreatedKey(data.key);
      setDialogCreateOpen(false);
      setDialogKeyCreatedOpen(true);
      resetForm();
    },
  });

  const { mutate: deleteApiKey, isPending: isDeleting } = useDeleteApiKey({
    onSuccess: () => setKeyToDelete(null),
  });

  const { mutate: revokeApiKey, isPending: isRevoking } = useRevokeApiKey({
    onSuccess: () => setKeyToRevoke(null),
  });

  const { mutate: regenerateApiKey, isPending: isRegenerating } = useRegenerateApiKey({
    onSuccess: (data) => {
      setKeyToRegenerate(null);
      setCreatedKey(data.key);
      setDialogKeyCreatedOpen(true);
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormNeverExpires(true);
    setFormExpiresAt('');
  };

  const handleCreate = () => {
    if (!formName.trim()) return;

    const data: CreateApiKeyDto = {
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      expiresAt: formNeverExpires ? null : formExpiresAt || null,
    };

    createApiKey(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'A chave foi copiada para a área de transferência.',
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (key: ApiKey) => {
    if (!key.isActive) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Revogada</Badge>;
    }
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return <Badge variant="destructive" className="gap-1"><Clock className="h-3 w-3" /> Expirada</Badge>;
    }
    return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" /> Ativa</Badge>;
  };

  return (
    <PageContainer
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie chaves de API para integração com outros sistemas
          </p>
        </div>
        <Button onClick={() => setDialogCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova API Key
        </Button>
      </div>

      {/* Aviso de segurança */}
      <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Importante sobre segurança
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                As API Keys permitem acesso completo à API. Nunca compartilhe suas chaves publicamente.
                Use variáveis de ambiente em seus sistemas e revogue chaves que não estão mais em uso.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suas API Keys</CardTitle>
          <CardDescription>
            {apiKeys.length === 0
              ? 'Você ainda não possui nenhuma API Key'
              : `${apiKeys.length} chave${apiKeys.length > 1 ? 's' : ''} cadastrada${apiKeys.length > 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Crie sua primeira API Key para integrar com outros sistemas
              </p>
              <Button onClick={() => setDialogCreateOpen(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Criar API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Chave</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Uso</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{key.name}</p>
                        {key.description && (
                          <p className="text-xs text-muted-foreground">{key.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {key.prefix}...
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(key.prefix + '...')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(key)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.lastUsedAt
                        ? formatDistanceToNow(new Date(key.lastUsedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })
                        : 'Nunca usado'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                        {key.usageCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setKeyToRegenerate(key)}
                            className="gap-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Regenerar Chave
                          </DropdownMenuItem>
                          {key.isActive && (
                            <DropdownMenuItem
                              onClick={() => setKeyToRevoke(key)}
                              className="gap-2"
                            >
                              <Ban className="h-4 w-4" />
                              Revogar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setKeyToDelete(key)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Criar API Key */}
      <Dialog open={dialogCreateOpen} onOpenChange={setDialogCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova API Key</DialogTitle>
            <DialogDescription>
              Crie uma chave para integração com sistemas externos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Integração ERP"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o uso desta chave..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="never-expires">Nunca expira</Label>
                <Switch
                  id="never-expires"
                  checked={formNeverExpires}
                  onCheckedChange={setFormNeverExpires}
                />
              </div>
              {!formNeverExpires && (
                <div className="space-y-2">
                  <Label htmlFor="expires-at">Data de expiração</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!formName.trim() || isCreating}>
              {isCreating ? 'Criando...' : 'Criar API Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Chave Criada */}
      <Dialog open={dialogKeyCreatedOpen} onOpenChange={setDialogKeyCreatedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              API Key Criada
            </DialogTitle>
            <DialogDescription>
              Copie sua chave agora. Por segurança, ela não será exibida novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono break-all">
                  {showKey ? createdKey : '•'.repeat(40)}
                </code>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => createdKey && copyToClipboard(createdKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Use esta chave no header das requisições:
              <code className="block mt-1 bg-muted px-2 py-1 rounded">
                Authorization: ApiKey {'{'}sua_chave{'}'}
              </code>
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setDialogKeyCreatedOpen(false);
                setCreatedKey(null);
                setShowKey(false);
              }}
            >
              Entendi, copiei a chave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Excluir */}
      <AlertDialog open={!!keyToDelete} onOpenChange={(v) => !v && setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A chave "{keyToDelete?.name}" será removida
              permanentemente e qualquer sistema que a utilize deixará de funcionar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => keyToDelete && deleteApiKey(keyToDelete.id)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Revogar */}
      <AlertDialog open={!!keyToRevoke} onOpenChange={(v) => !v && setKeyToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              A chave "{keyToRevoke?.name}" será desativada imediatamente. Sistemas que a
              utilizam não conseguirão mais autenticar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => keyToRevoke && revokeApiKey(keyToRevoke.id)}
              disabled={isRevoking}
            >
              {isRevoking ? 'Revogando...' : 'Revogar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog: Regenerar */}
      <AlertDialog open={!!keyToRegenerate} onOpenChange={(v) => !v && setKeyToRegenerate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerar API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Uma nova chave será gerada para "{keyToRegenerate?.name}". A chave atual será
              invalidada imediatamente. Você precisará atualizar todos os sistemas que a utilizam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => keyToRegenerate && regenerateApiKey(keyToRegenerate.id)}
              disabled={isRegenerating}
            >
              {isRegenerating ? 'Regenerando...' : 'Regenerar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default GerenciarApiKeys;
