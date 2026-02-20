import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileStack,
  Plus,
  Copy,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import OrcamentoTemplateService from '@/services/OrcamentoTemplateService';
import {
  OrcamentoTemplateInterface,
  TemplateCategoriaLabels,
  TemplateCategoriaEnum,
} from '@/interfaces/OrcamentoTemplateInterface';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<OrcamentoTemplateInterface[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [templateParaDeletar, setTemplateParaDeletar] = useState<OrcamentoTemplateInterface | null>(null);

  useEffect(() => {
    carregarTemplates();
  }, [categoriaFiltro]);

  const carregarTemplates = async () => {
    try {
      setLoading(true);
      const categoria = categoriaFiltro !== 'todos' ? categoriaFiltro as TemplateCategoriaEnum : undefined;
      const data = await OrcamentoTemplateService.getAll(categoria, true);
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUsarTemplate = async (template: OrcamentoTemplateInterface) => {
    try {
      // TODO: Abrir dialog para coletar dados do novo orçamento
      const novoOrcamento = await OrcamentoTemplateService.usarTemplate({
        templateId: template.id,
        nomeOrcamento: `Novo Orçamento - ${template.nome}`,
        tipo: 'servico',
      });

      toast({
        title: 'Sucesso',
        description: 'Orçamento criado a partir do template',
      });

      navigate(`/comercial/orcamentos/${novoOrcamento.id}`);
    } catch (error) {
      console.error('Erro ao usar template:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar orçamento do template',
        variant: 'destructive',
      });
    }
  };

  const handleEditarTemplate = (template: OrcamentoTemplateInterface) => {
    // TODO: Abrir dialog para editar template
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de edição em breve',
    });
  };

  const handleDuplicarTemplate = async (template: OrcamentoTemplateInterface) => {
    try {
      await OrcamentoTemplateService.duplicar(template.id, `${template.nome} (Cópia)`);
      toast({
        title: 'Sucesso',
        description: 'Template duplicado com sucesso',
      });
      carregarTemplates();
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar o template',
        variant: 'destructive',
      });
    }
  };

  const handleDeletarTemplate = async () => {
    if (!templateParaDeletar?.id) return;

    try {
      await OrcamentoTemplateService.delete(templateParaDeletar.id);
      toast({
        title: 'Sucesso',
        description: 'Template deletado com sucesso',
      });
      carregarTemplates();
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o template',
        variant: 'destructive',
      });
    } finally {
      setTemplateParaDeletar(null);
    }
  };

  const getCategoriaColor = (categoria: TemplateCategoriaEnum): string => {
    switch (categoria) {
      case TemplateCategoriaEnum.GALPAO_INDUSTRIAL:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case TemplateCategoriaEnum.COBERTURA_METALICA:
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case TemplateCategoriaEnum.MEZANINO:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case TemplateCategoriaEnum.ESCADA_PLATAFORMA:
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case TemplateCategoriaEnum.ESTRUTURA_APOIO:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case TemplateCategoriaEnum.REFORMA:
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
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
      <div className="w-full px-4 py-4 space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileStack className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Templates de Orçamento</CardTitle>
                  <CardDescription className="mt-1">
                    Crie e gerencie templates reutilizáveis para acelerar a criação de orçamentos
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={carregarTemplates}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button onClick={() => toast({ title: 'Em desenvolvimento', description: 'Funcionalidade em breve' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {/* Filtro */}
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Label>Filtrar por Categoria</Label>
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Categorias</SelectItem>
                    {Object.entries(TemplateCategoriaEnum).map(([key, value]) => (
                      <SelectItem key={value} value={value}>
                        {TemplateCategoriaLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-muted-foreground">
                  {templates.length} {templates.length === 1 ? 'template encontrado' : 'templates encontrados'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <FileStack className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum template encontrado</p>
                <Button className="mt-4" onClick={() => toast({ title: 'Em desenvolvimento' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <Badge className={getCategoriaColor(template.categoria)}>
                      {TemplateCategoriaLabels[template.categoria]}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{template.nome}</CardTitle>
                  <CardDescription className="line-clamp-2">{template.descricao}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {template.composicoesTemplate.filter((c) => c.enabled).length} composições
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        BDI {(template.configuracoes.bdi * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => handleUsarTemplate(template)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Usar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditarTemplate(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDuplicarTemplate(template)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTemplateParaDeletar(template)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!templateParaDeletar} onOpenChange={() => setTemplateParaDeletar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o template <strong>{templateParaDeletar?.nome}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletarTemplate} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default TemplatesPage;
