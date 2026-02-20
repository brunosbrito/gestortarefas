import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Save, FileText, Wrench, Package } from 'lucide-react';
import PageHeader from '@/components/comercial/PageHeader';
import OrcamentoService from '@/services/OrcamentoService';
import { CreateOrcamento } from '@/interfaces/OrcamentoInterface';
import { useToast } from '@/hooks/use-toast';

// Schema de validação com Zod
const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  tipo: z.enum(['servico', 'produto']),
  clienteNome: z.string().optional(),
  codigoProjeto: z.string().optional(),
  areaTotalM2: z.string().optional(),
  metrosLineares: z.string().optional(),
  pesoTotalProjeto: z.string().optional(),
  temISS: z.boolean().default(false),
  aliquotaISS: z.string().min(1, 'Alíquota ISS é obrigatória'),
  aliquotaSimples: z.string().min(1, 'Alíquota Simples é obrigatória'),
});

type FormData = z.infer<typeof formSchema>;

const NovoOrcamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      tipo: 'servico',
      clienteNome: '',
      codigoProjeto: '',
      areaTotalM2: '',
      metrosLineares: '',
      pesoTotalProjeto: '',
      temISS: false,
      aliquotaISS: '3',
      aliquotaSimples: '11.8',
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      const createData: CreateOrcamento = {
        nome: data.nome,
        tipo: data.tipo,
        clienteNome: data.clienteNome || undefined,
        codigoProjeto: data.codigoProjeto || undefined,
        areaTotalM2: data.areaTotalM2 ? parseFloat(data.areaTotalM2) : undefined,
        metrosLineares: data.metrosLineares ? parseFloat(data.metrosLineares) : undefined,
        pesoTotalProjeto: data.pesoTotalProjeto ? parseFloat(data.pesoTotalProjeto) : undefined,
        tributos: {
          temISS: data.temISS,
          aliquotaISS: parseFloat(data.aliquotaISS),
          aliquotaSimples: parseFloat(data.aliquotaSimples),
        },
      };

      const orcamento = await OrcamentoService.create(createData);

      toast({
        title: 'Sucesso',
        description: 'Orçamento criado com sucesso',
      });

      navigate(`/comercial/orcamentos/${orcamento.id}`);
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o orçamento',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          icon={FileText}
          title="Novo Orçamento"
          description="Crie um novo orçamento com composição de custos"
          showBackButton
          onBack={() => navigate('/comercial/orcamentos')}
        />

        {/* Formulário */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Informações Básicas */}
              <Card className="border-none shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent">
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>
                    Dados principais do orçamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nome do Orçamento <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Estrutura Metálica Galpão Industrial"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tipo de Orçamento <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2 flex-1">
                              <RadioGroupItem value="servico" id="servico" />
                              <FormLabel
                                htmlFor="servico"
                                className="flex items-center gap-2 cursor-pointer font-normal"
                              >
                                <Wrench className="h-4 w-4 text-blue-600" />
                                <span>Serviço</span>
                                <span className="text-xs text-muted-foreground">(S-001|2026)</span>
                              </FormLabel>
                            </div>
                            <div className="flex items-center space-x-2 flex-1">
                              <RadioGroupItem value="produto" id="produto" />
                              <FormLabel
                                htmlFor="produto"
                                className="flex items-center gap-2 cursor-pointer font-normal"
                              >
                                <Package className="h-4 w-4 text-green-600" />
                                <span>Produto</span>
                                <span className="text-xs text-muted-foreground">(P-001|2026)</span>
                              </FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          O tipo define a numeração sequencial do orçamento
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clienteNome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Mineração Esperança Ltda"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="codigoProjeto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código do Projeto</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: M-15706" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="pesoTotalProjeto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso Total (KG)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Para cálculo por KG</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="areaTotalM2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área Total (m²)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metrosLineares"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metros Lineares</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tributos */}
              <Card className="border-none shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-transparent">
                  <CardTitle>Configuração de Tributos</CardTitle>
                  <CardDescription>
                    Configure as alíquotas de tributos aplicáveis
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="temISS"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium cursor-pointer !mt-0">
                          Incluir ISS no orçamento
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aliquotaISS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota ISS (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="3.00"
                              disabled={!form.watch('temISS')}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Padrão: 3%</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aliquotaSimples"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota Simples Nacional (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="11.80"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Padrão: 11.8%</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Próximos passos</p>
                    <p className="text-xs text-muted-foreground">
                      Após criar o orçamento, você poderá adicionar composições de custos,
                      itens detalhados, calcular BDI, visualizar DRE e exportar relatórios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Ações */}
              <div className="flex justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/comercial/orcamentos')}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Orçamento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default NovoOrcamento;
