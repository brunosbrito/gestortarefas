import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Copy,
  Trash2,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import OrcamentoService from '@/services/OrcamentoService';

// Importar componentes de abas
import AbaDadosGerais from '@/components/comercial/orcamentos/AbaDadosGerais';
import AbaMateriais from '@/components/comercial/orcamentos/AbaMateriais';
import AbaPintura from '@/components/comercial/orcamentos/AbaPintura';
import AbaMaoObra from '@/components/comercial/orcamentos/AbaMaoObra';
import AbaFerramentas from '@/components/comercial/orcamentos/AbaFerramentas';
import AbaConsumiveis from '@/components/comercial/orcamentos/AbaConsumiveis';
import AbaMobDesmob from '@/components/comercial/orcamentos/AbaMobDesmob';
import AbaQQP from '@/components/comercial/orcamentos/AbaQQP';
import AbaResumo from '@/components/comercial/orcamentos/AbaResumo';

const statusColors: Record<string, string> = {
  rascunho: 'bg-gray-500',
  em_analise: 'bg-yellow-500',
  aprovado: 'bg-green-500',
  rejeitado: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  rascunho: 'Rascunho',
  em_analise: 'Em Análise',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
};

export default function OrcamentoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [abaAtiva, setAbaAtiva] = useState('resumo');
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  // Buscar dados do orçamento
  const { data: orcamento, isLoading, refetch } = useQuery({
    queryKey: ['orcamento', id],
    queryFn: () => OrcamentoService.getById(id!),
    enabled: !!id,
  });

  const handleVoltar = () => {
    navigate('/comercial/orcamentos');
  };

  const handleSalvar = async () => {
    try {
      toast({
        title: 'Orçamento salvo',
        description: 'As alterações foram salvas com sucesso.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o orçamento.',
        variant: 'destructive',
      });
    }
  };

  const handleClonar = async () => {
    if (!id) return;
    try {
      const clonado = await OrcamentoService.clonar(id);
      toast({
        title: 'Orçamento clonado',
        description: `Orçamento "${clonado.nome}" criado com sucesso.`,
      });
      navigate(`/comercial/orcamentos/${clonado.id}`);
    } catch (error) {
      toast({
        title: 'Erro ao clonar',
        description: 'Não foi possível clonar o orçamento.',
        variant: 'destructive',
      });
    }
  };

  const handleExcluir = () => {
    if (!id) return;
    setConfirmarExclusao(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!id) return;
    try {
      await OrcamentoService.delete(id);
      toast({
        title: 'Orçamento excluído',
        description: 'O orçamento foi excluído com sucesso.',
      });
      navigate('/comercial/orcamentos');
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o orçamento.',
        variant: 'destructive',
      });
    } finally {
      setConfirmarExclusao(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Carregando orçamento...</p>
          </div>
        </div>
    );
  }

  if (!orcamento) {
    return (
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Orçamento não encontrado</h2>
            <Button onClick={handleVoltar}>Voltar para lista</Button>
          </div>
        </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleVoltar}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{orcamento.nome}</h1>
                <Badge className={statusColors[orcamento.status || 'rascunho']}>
                  {statusLabels[orcamento.status || 'rascunho']}
                </Badge>
                <Badge variant="outline">{orcamento.numero}</Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {orcamento.tipo === 'produto' ? 'Produto' : 'Serviço'} •{' '}
                {orcamento.clienteNome || 'Cliente não informado'}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/comercial/assistente-ia?orcamento=${orcamento.id}`)}>
              <Bot className="mr-2 h-4 w-4" />
              Analisar com IA
            </Button>

            <Button variant="outline" onClick={handleSalvar}>
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>

            <Button variant="outline" onClick={handleClonar}>
              <Copy className="mr-2 h-4 w-4" />
              Clonar
            </Button>

            <Button variant="destructive" onClick={handleExcluir}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="dados-gerais">Dados Gerais</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="pintura">Pintura</TabsTrigger>
            <TabsTrigger value="mao-obra">Mão de Obra</TabsTrigger>
            <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
            <TabsTrigger value="consumiveis">Consumíveis</TabsTrigger>
            <TabsTrigger value="mob-desmob">Mob/Desmob</TabsTrigger>
            <TabsTrigger value="qqp">QQP</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="mt-6">
            <AbaResumo orcamento={orcamento} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="dados-gerais" className="mt-6">
            <AbaDadosGerais orcamento={orcamento} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="materiais" className="mt-6">
            <AbaMateriais orcamento={orcamento} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="pintura" className="mt-6">
            <AbaPintura orcamento={orcamento} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="mao-obra" className="mt-6">
            <AbaMaoObra orcamento={orcamento} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="ferramentas" className="mt-6">
            <AbaFerramentas orcamento={orcamento} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="consumiveis" className="mt-6">
            <AbaConsumiveis orcamento={orcamento} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="mob-desmob" className="mt-6">
            <AbaMobDesmob orcamento={orcamento} onUpdate={refetch} />
          </TabsContent>

          <TabsContent value="qqp" className="mt-6">
            <AbaQQP orcamento={orcamento} onUpdate={refetch} onNavigateToAba={setAbaAtiva} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={confirmarExclusao} onOpenChange={setConfirmarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento <strong>"{orcamento.nome}"</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarExclusao} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
