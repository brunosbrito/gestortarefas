import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Proposta, CreateProposta } from '@/interfaces/PropostaInterface';

const formSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),

  // Cliente
  clienteRazaoSocial: z.string().min(3, 'Razão social é obrigatória'),
  clienteCNPJ: z.string().min(14, 'CNPJ é obrigatório'),
  clienteEmail: z.string().email('Email inválido'),
  clienteTelefone: z.string().min(10, 'Telefone é obrigatório'),
  clienteEndereco: z.string().min(5, 'Endereço é obrigatório'),
  clienteBairro: z.string().optional(),
  clienteCEP: z.string().min(8, 'CEP é obrigatório'),
  clienteCidade: z.string().min(2, 'Cidade é obrigatória'),
  clienteUF: z.string().length(2, 'UF deve ter 2 caracteres'),
  clienteContatoAtencao: z.string().optional(),

  // Vendedor
  vendedorNome: z.string().min(3, 'Nome do vendedor é obrigatório'),
  vendedorTelefone: z.string().optional(),
  vendedorEmail: z.string().email('Email inválido').optional().or(z.literal('')),

  // Datas e valores
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  dataValidade: z.string().min(1, 'Data de validade é obrigatória'),
  previsaoEntrega: z.string().min(1, 'Previsão de entrega é obrigatória'),
  valorTotal: z.string().min(1, 'Valor total é obrigatório'),
  moeda: z.enum(['BRL', 'USD']),

  // Pagamento
  pagamentoFormaPagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  pagamentoObservacao: z.string().optional(),

  // Observações
  observacoesImpostosInclusos: z.boolean().default(true),
  observacoesFaturamentoMateriais: z.string().optional(),
  observacoesFaturamentoServicos: z.string().optional(),
  observacoesCondicoesPagamentoMateriais: z.string().optional(),
  observacoesCondicoesPagamentoServicos: z.string().optional(),
  observacoesPrazoEntregaDetalhado: z.string().optional(),
  observacoesTransporteEquipamento: z.enum(['cliente', 'gmx']).default('cliente'),
  observacoesHospedagemAlimentacao: z.enum(['cliente', 'gmx']).default('cliente'),
}).refine(
  (data) => new Date(data.dataValidade) > new Date(data.dataEmissao),
  {
    message: 'Data de validade deve ser posterior à data de emissão',
    path: ['dataValidade'],
  }
);

type FormData = z.infer<typeof formSchema>;

interface NovaPropostaFormProps {
  onSubmit: (data: CreateProposta) => void;
  onCancel: () => void;
  initialData?: Proposta;
}

const NovaPropostaForm = ({ onSubmit, onCancel, initialData }: NovaPropostaFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          titulo: initialData.titulo,
          clienteRazaoSocial: initialData.cliente.razaoSocial,
          clienteCNPJ: initialData.cliente.cnpj,
          clienteEmail: initialData.cliente.email,
          clienteTelefone: initialData.cliente.telefone,
          clienteEndereco: initialData.cliente.endereco,
          clienteBairro: initialData.cliente.bairro,
          clienteCEP: initialData.cliente.cep,
          clienteCidade: initialData.cliente.cidade,
          clienteUF: initialData.cliente.uf,
          clienteContatoAtencao: initialData.cliente.contatoAtencao,
          vendedorNome: initialData.vendedor.nome,
          vendedorTelefone: initialData.vendedor.telefone,
          vendedorEmail: initialData.vendedor.email,
          dataEmissao: initialData.dataEmissao.split('T')[0],
          dataValidade: initialData.dataValidade.split('T')[0],
          previsaoEntrega: initialData.previsaoEntrega,
          valorTotal: initialData.valorTotal.toString(),
          moeda: initialData.moeda,
          pagamentoFormaPagamento: initialData.pagamento.formaPagamento,
          pagamentoObservacao: initialData.pagamento.observacao,
          observacoesImpostosInclusos: initialData.observacoes.impostosInclusos,
          observacoesFaturamentoMateriais: initialData.observacoes.faturamentoMateriais,
          observacoesFaturamentoServicos: initialData.observacoes.faturamentoServicos,
          observacoesCondicoesPagamentoMateriais:
            initialData.observacoes.condicoesPagamentoMateriais,
          observacoesCondicoesPagamentoServicos:
            initialData.observacoes.condicoesPagamentoServicos,
          observacoesPrazoEntregaDetalhado: initialData.observacoes.prazoEntregaDetalhado,
          observacoesTransporteEquipamento: initialData.observacoes.transporteEquipamento,
          observacoesHospedagemAlimentacao: initialData.observacoes.hospedagemAlimentacao,
        }
      : {
          titulo: '',
          clienteRazaoSocial: '',
          clienteCNPJ: '',
          clienteEmail: '',
          clienteTelefone: '',
          clienteEndereco: '',
          clienteBairro: '',
          clienteCEP: '',
          clienteCidade: '',
          clienteUF: '',
          clienteContatoAtencao: '',
          vendedorNome: '',
          vendedorTelefone: '',
          vendedorEmail: '',
          dataEmissao: new Date().toISOString().split('T')[0],
          dataValidade: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          previsaoEntrega: '',
          valorTotal: '0',
          moeda: 'BRL',
          pagamentoFormaPagamento: 'A Combinar',
          pagamentoObservacao: '',
          observacoesImpostosInclusos: true,
          observacoesFaturamentoMateriais: '',
          observacoesFaturamentoServicos: '',
          observacoesCondicoesPagamentoMateriais: '',
          observacoesCondicoesPagamentoServicos: '',
          observacoesPrazoEntregaDetalhado: '',
          observacoesTransporteEquipamento: 'cliente',
          observacoesHospedagemAlimentacao: 'cliente',
        },
  });

  const handleSubmit = (data: FormData) => {
    const createData: CreateProposta = {
      titulo: data.titulo,
      cliente: {
        razaoSocial: data.clienteRazaoSocial,
        cnpj: data.clienteCNPJ,
        email: data.clienteEmail,
        telefone: data.clienteTelefone,
        endereco: data.clienteEndereco,
        bairro: data.clienteBairro,
        cep: data.clienteCEP,
        cidade: data.clienteCidade,
        uf: data.clienteUF,
        contatoAtencao: data.clienteContatoAtencao,
      },
      vendedor: {
        nome: data.vendedorNome,
        telefone: data.vendedorTelefone,
        email: data.vendedorEmail,
      },
      dataEmissao: data.dataEmissao,
      dataValidade: data.dataValidade,
      previsaoEntrega: data.previsaoEntrega,
      valorTotal: parseFloat(data.valorTotal),
      moeda: data.moeda,
      pagamento: {
        formaPagamento: data.pagamentoFormaPagamento,
        valor: parseFloat(data.valorTotal),
        observacao: data.pagamentoObservacao,
      },
      observacoes: {
        impostosInclusos: data.observacoesImpostosInclusos,
        faturamentoMateriais: data.observacoesFaturamentoMateriais,
        faturamentoServicos: data.observacoesFaturamentoServicos,
        condicoesPagamentoMateriais: data.observacoesCondicoesPagamentoMateriais,
        condicoesPagamentoServicos: data.observacoesCondicoesPagamentoServicos,
        prazoEntregaDetalhado: data.observacoesPrazoEntregaDetalhado,
        transporteEquipamento: data.observacoesTransporteEquipamento,
        hospedagemAlimentacao: data.observacoesHospedagemAlimentacao,
        condicoesGerais: [],
        itensForaEscopo: [],
      },
    };

    onSubmit(createData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Informações Básicas</h3>

          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Proposta *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Fornecimento de Estruturas Metálicas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="dataEmissao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Emissão *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataValidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Validade *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previsaoEntrega"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previsão de Entrega *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 30 dias úteis" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="valorTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moeda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a moeda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BRL">Real (R$)</SelectItem>
                      <SelectItem value="USD">Dólar (US$)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Dados do Cliente</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clienteRazaoSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input placeholder="Empresa Ltda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clienteCNPJ"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ *</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clienteEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contato@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clienteTelefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="clienteEndereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço *</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, número" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="clienteBairro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input placeholder="Centro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clienteCEP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP *</FormLabel>
                  <FormControl>
                    <Input placeholder="00000-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clienteCidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="São Paulo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clienteUF"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UF *</FormLabel>
                  <FormControl>
                    <Input placeholder="SP" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="clienteContatoAtencao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contato (AC:)</FormLabel>
                <FormControl>
                  <Input placeholder="Srº João Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dados do Vendedor */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Dados do Vendedor</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="vendedorNome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Vendedor GMX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendedorTelefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendedorEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="vendedor@gmx.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Pagamento */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Condições de Pagamento</h3>

          <FormField
            control={form.control}
            name="pagamentoFormaPagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de Pagamento *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: A Combinar, Boleto, PIX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pagamentoObservacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações de Pagamento</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detalhes adicionais sobre pagamento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Observações */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Observações Padrão</h3>

          <FormField
            control={form.control}
            name="observacoesImpostosInclusos"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4"
                  />
                </FormControl>
                <FormLabel className="!mt-0">Impostos inclusos no valor</FormLabel>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="observacoesTransporteEquipamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transporte de Equipamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cliente">Por conta do cliente</SelectItem>
                      <SelectItem value="gmx">Por conta da GMX</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoesHospedagemAlimentacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospedagem e Alimentação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cliente">Por conta do cliente</SelectItem>
                      <SelectItem value="gmx">Por conta da GMX</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="observacoesFaturamentoMateriais"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faturamento de Materiais</FormLabel>
                <FormControl>
                  <Textarea placeholder="Condições de faturamento de materiais" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observacoesFaturamentoServicos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faturamento de Serviços</FormLabel>
                <FormControl>
                  <Textarea placeholder="Condições de faturamento de serviços" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {initialData ? 'Atualizar Proposta' : 'Criar Proposta'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NovaPropostaForm;
