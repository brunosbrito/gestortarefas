import { useState, useEffect } from 'react';
import { Factory, Plus, Edit, Trash2, RefreshCw, Eye, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import FornecedorServicoService from '@/services/FornecedorServicoService';
import { FornecedorServicoInterface } from '@/interfaces/FornecedorServicoInterface';
import { formatCurrency } from '@/lib/currency';
import Layout from '@/components/Layout';
import { mockFornecedores } from '@/data/mockTintas';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FormularioFornecedor from '@/components/gerenciamento/fornecedores/FormularioFornecedor';

const TabelaFornecedoresServico = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fornecedores, setFornecedores] = useState<FornecedorServicoInterface[]>([]);
  const [fornecedoresFiltrados, setFornecedoresFiltrados] = useState<FornecedorServicoInterface[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<FornecedorServicoInterface | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [fornecedorParaDeletar, setFornecedorParaDeletar] = useState<FornecedorServicoInterface | null>(null);
  const [fornecedorParaVisualizar, setFornecedorParaVisualizar] = useState<FornecedorServicoInterface | null>(null);

  // Filtros
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarFornecedores();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [busca, fornecedores]);

  const carregarFornecedores = async () => {
    try {
      setLoading(true);

      // USANDO DADOS MOCKADOS (remover quando backend estiver pronto)
      // Carregar fornecedores mockados + fornecedores cadastrados localmente
      const fornecedoresLocais = JSON.parse(localStorage.getItem('fornecedores_locais') || '[]');
      setFornecedores([...mockFornecedores, ...fornecedoresLocais]);

      // VERSÃO COM API (descomentar quando backend estiver pronto)
      // const data = await FornecedorServicoService.listar({ ativo: true });
      // setFornecedores(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os fornecedores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarFornecedor = (novoFornecedor?: FornecedorServicoInterface) => {
    if (!novoFornecedor) return;

    // MOCK: Salvar no localStorage
    const fornecedoresLocais = JSON.parse(localStorage.getItem('fornecedores_locais') || '[]');

    const index = fornecedoresLocais.findIndex((f: FornecedorServicoInterface) => f.id === novoFornecedor.id);
    if (index >= 0) {
      // Atualizar fornecedor existente
      fornecedoresLocais[index] = novoFornecedor;
    } else {
      // Adicionar novo fornecedor
      fornecedoresLocais.push(novoFornecedor);
    }

    localStorage.setItem('fornecedores_locais', JSON.stringify(fornecedoresLocais));
    carregarFornecedores();
  };

  const aplicarFiltros = () => {
    let resultado = [...fornecedores];

    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (f) =>
          f.nome.toLowerCase().includes(buscaLower) ||
          (f.contato && f.contato.toLowerCase().includes(buscaLower)) ||
          (f.email && f.email.toLowerCase().includes(buscaLower))
      );
    }

    setFornecedoresFiltrados(resultado);
  };

  const handleDeletar = async () => {
    if (!fornecedorParaDeletar?.id) return;

    // Verificar se é um fornecedor mockado (ID numérico pequeno, 1-10)
    const isMockado = fornecedorParaDeletar.id && fornecedorParaDeletar.id <= 10;

    if (isMockado) {
      toast({
        title: 'Aviso',
        description: 'Fornecedores de demonstração não podem ser deletados',
        variant: 'destructive',
      });
      setFornecedorParaDeletar(null);
      return;
    }

    try {
      // MOCK: Remover do localStorage
      const fornecedoresLocais = JSON.parse(localStorage.getItem('fornecedores_locais') || '[]');
      const novosFornecedores = fornecedoresLocais.filter((f: FornecedorServicoInterface) => f.id !== fornecedorParaDeletar.id);
      localStorage.setItem('fornecedores_locais', JSON.stringify(novosFornecedores));

      // Quando backend estiver pronto:
      // await FornecedorServicoService.excluir(fornecedorParaDeletar.id);

      toast({
        title: 'Sucesso',
        description: 'Fornecedor deletado com sucesso',
      });
      carregarFornecedores();
    } catch (error) {
      console.error('Erro ao deletar fornecedor:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o fornecedor',
        variant: 'destructive',
      });
    } finally {
      setFornecedorParaDeletar(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="h-6 w-6 text-blue-600" />
                <CardTitle>Fornecedores de Serviço</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setFornecedorSelecionado(null); setDialogAberto(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome, contato ou email..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setBusca('')}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Tabela */}
            <div className="border rounded-lg">
              <TableComponent>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead className="text-right">Jateamento (R$/m²)</TableHead>
                    <TableHead className="text-right">Pintura (R$/m²)</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fornecedoresFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum fornecedor encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    fornecedoresFiltrados.map((fornecedor) => {
                      const isMockado = fornecedor.id && fornecedor.id <= 10;
                      return (
                        <TableRow key={fornecedor.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {fornecedor.nome}
                              {isMockado && (
                                <Badge variant="outline" className="text-xs">DEMO</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{fornecedor.contato || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(fornecedor.valorJateamentoM2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(fornecedor.valorPinturaM2)}
                          </TableCell>
                          <TableCell>{fornecedor.telefone || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFornecedorParaVisualizar(fornecedor)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!isMockado && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setFornecedorSelecionado(fornecedor); setDialogAberto(true); }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFornecedorParaDeletar(fornecedor)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </TableComponent>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {fornecedoresFiltrados.length} de {fornecedores.length} fornecedores
            </div>
          </CardContent>
        </Card>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!fornecedorParaDeletar} onOpenChange={() => setFornecedorParaDeletar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o fornecedor <strong>{fornecedorParaDeletar?.nome}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletar} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog de Visualização */}
        <Dialog open={!!fornecedorParaVisualizar} onOpenChange={() => setFornecedorParaVisualizar(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Fornecedor</DialogTitle>
              <DialogDescription>Informações completas do fornecedor de serviço</DialogDescription>
            </DialogHeader>
            {fornecedorParaVisualizar && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.nome}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Contato</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.contato || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.telefone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{fornecedorParaVisualizar.email || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Valor Jateamento</Label>
                    <p className="font-medium text-lg text-blue-600">
                      {formatCurrency(fornecedorParaVisualizar.valorJateamentoM2)}/m²
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Valor Pintura</Label>
                    <p className="font-medium text-lg text-green-600">
                      {formatCurrency(fornecedorParaVisualizar.valorPinturaM2)}/m²
                    </p>
                  </div>
                </div>
                {fornecedorParaVisualizar.observacoes && (
                  <div>
                    <Label className="text-muted-foreground">Observações</Label>
                    <p className="text-sm">{fornecedorParaVisualizar.observacoes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Formulário de Cadastro/Edição */}
        <FormularioFornecedor
          open={dialogAberto}
          onOpenChange={setDialogAberto}
          fornecedor={fornecedorSelecionado}
          onSuccess={handleSalvarFornecedor}
        />
      </div>
    </Layout>
  );
};

export default TabelaFornecedoresServico;
