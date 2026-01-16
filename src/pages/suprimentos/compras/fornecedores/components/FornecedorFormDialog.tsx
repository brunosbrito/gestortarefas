import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useFornecedor,
  useCreateFornecedor,
  useUpdateFornecedor,
} from '@/hooks/suprimentos/useFornecedores';
import { FornecedorCreate } from '@/interfaces/suprimentos/FornecedorInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const fornecedorSchema = z.object({
  razao_social: z.string().min(3, 'Razão social deve ter pelo menos 3 caracteres'),
  nome_fantasia: z.string().optional(),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  inscricao_estadual: z.string().optional(),
  tipo: z.enum(['material', 'servico', 'ambos']),

  // Contato
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  contato_nome: z.string().optional(),

  // Endereço
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),

  // Dados bancários
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  pix: z.string().optional(),

  // Avaliação
  rating: z.number().min(0).max(5).optional(),
  observacoes: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'bloqueado']),
});

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

interface FornecedorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedorId?: number;
}

export const FornecedorFormDialog = ({
  open,
  onOpenChange,
  fornecedorId,
}: FornecedorFormDialogProps) => {
  const { toast } = useToast();
  const isEditing = !!fornecedorId;

  const { data: fornecedorData, isLoading: isLoadingFornecedor } = useFornecedor(fornecedorId!);
  const createMutation = useCreateFornecedor();
  const updateMutation = useUpdateFornecedor();

  const form = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      inscricao_estadual: '',
      tipo: 'material',
      email: '',
      telefone: '',
      whatsapp: '',
      contato_nome: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      banco: '',
      agencia: '',
      conta: '',
      pix: '',
      rating: undefined,
      observacoes: '',
      status: 'ativo',
    },
  });

  useEffect(() => {
    if (fornecedorData?.fornecedor && isEditing) {
      const f = fornecedorData.fornecedor;
      form.reset({
        razao_social: f.razao_social,
        nome_fantasia: f.nome_fantasia || '',
        cnpj: f.cnpj,
        inscricao_estadual: f.inscricao_estadual || '',
        tipo: f.tipo,
        email: f.email || '',
        telefone: f.telefone || '',
        whatsapp: f.whatsapp || '',
        contato_nome: f.contato_nome || '',
        cep: f.cep || '',
        endereco: f.endereco || '',
        numero: f.numero || '',
        complemento: f.complemento || '',
        bairro: f.bairro || '',
        cidade: f.cidade || '',
        estado: f.estado || '',
        banco: f.banco || '',
        agencia: f.agencia || '',
        conta: f.conta || '',
        pix: f.pix || '',
        rating: f.rating,
        observacoes: f.observacoes || '',
        status: f.status,
      });
    }
  }, [fornecedorData, isEditing, form]);

  const onSubmit = async (data: FornecedorFormData) => {
    try {
      const fornecedorData: FornecedorCreate = {
        ...data,
        // Limpar campos vazios
        nome_fantasia: data.nome_fantasia || undefined,
        email: data.email || undefined,
        telefone: data.telefone || undefined,
        whatsapp: data.whatsapp || undefined,
        contato_nome: data.contato_nome || undefined,
        cep: data.cep || undefined,
        endereco: data.endereco || undefined,
        numero: data.numero || undefined,
        complemento: data.complemento || undefined,
        bairro: data.bairro || undefined,
        cidade: data.cidade || undefined,
        estado: data.estado || undefined,
        banco: data.banco || undefined,
        agencia: data.agencia || undefined,
        conta: data.conta || undefined,
        pix: data.pix || undefined,
        inscricao_estadual: data.inscricao_estadual || undefined,
        observacoes: data.observacoes || undefined,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: fornecedorId,
          data: fornecedorData,
        });
        toast({
          title: 'Fornecedor atualizado',
          description: 'Os dados foram salvos com sucesso.',
        });
      } else {
        await createMutation.mutateAsync(fornecedorData);
        toast({
          title: 'Fornecedor criado',
          description: 'Novo fornecedor adicionado ao cadastro.',
        });
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao tentar salvar o fornecedor.',
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do fornecedor'
              : 'Preencha os dados do novo fornecedor'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingFornecedor ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="dados-principais">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dados-principais">Dados Principais</TabsTrigger>
                <TabsTrigger value="contato">Contato</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="bancarios">Dados Bancários</TabsTrigger>
              </TabsList>

              {/* Tab: Dados Principais */}
              <TabsContent value="dados-principais" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="razao_social">Razão Social *</Label>
                    <Input
                      id="razao_social"
                      {...form.register('razao_social')}
                      placeholder="Ex: EMPRESA XYZ LTDA"
                    />
                    {form.formState.errors.razao_social && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.razao_social.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                    <Input
                      id="nome_fantasia"
                      {...form.register('nome_fantasia')}
                      placeholder="Ex: Empresa XYZ"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      {...form.register('cnpj')}
                      placeholder="00.000.000/0000-00"
                    />
                    {form.formState.errors.cnpj && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.cnpj.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                    <Input
                      id="inscricao_estadual"
                      {...form.register('inscricao_estadual')}
                      placeholder="000.000.000.000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={form.watch('tipo')}
                      onValueChange={(value) => form.setValue('tipo', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="servico">Serviço</SelectItem>
                        <SelectItem value="ambos">Material + Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={form.watch('status')}
                      onValueChange={(value) => form.setValue('status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="bloqueado">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="rating">Avaliação (0-5)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="rating"
                        type="number"
                        step="0.5"
                        min="0"
                        max="5"
                        {...form.register('rating', { valueAsNumber: true })}
                        placeholder="Ex: 4.5"
                        className="w-32"
                      />
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      {...form.register('observacoes')}
                      placeholder="Informações adicionais sobre o fornecedor..."
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Contato */}
              <TabsContent value="contato" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="contato_nome">Nome do Contato</Label>
                    <Input
                      id="contato_nome"
                      {...form.register('contato_nome')}
                      placeholder="Ex: João Silva"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="contato@empresa.com.br"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      {...form.register('telefone')}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      {...form.register('whatsapp')}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Endereço */}
              <TabsContent value="endereco" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      {...form.register('cep')}
                      placeholder="00000-000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      {...form.register('estado')}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      {...form.register('cidade')}
                      placeholder="São Paulo"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      {...form.register('endereco')}
                      placeholder="Av. Paulista"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      {...form.register('numero')}
                      placeholder="1000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      {...form.register('bairro')}
                      placeholder="Bela Vista"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      {...form.register('complemento')}
                      placeholder="Sala 101"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Dados Bancários */}
              <TabsContent value="bancarios" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="banco">Banco</Label>
                    <Input
                      id="banco"
                      {...form.register('banco')}
                      placeholder="Ex: 001 - Banco do Brasil"
                    />
                  </div>

                  <div>
                    <Label htmlFor="agencia">Agência</Label>
                    <Input
                      id="agencia"
                      {...form.register('agencia')}
                      placeholder="1234-5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="conta">Conta</Label>
                    <Input
                      id="conta"
                      {...form.register('conta')}
                      placeholder="12345-6"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="pix">Chave PIX</Label>
                    <Input
                      id="pix"
                      {...form.register('pix')}
                      placeholder="CPF, CNPJ, e-mail ou telefone"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
