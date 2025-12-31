import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import MaterialService from '@/services/MaterialService';
import { Material } from '@/interfaces/MaterialInterface';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  material: z.string().min(1, 'Material é obrigatório'),
  quantidade: z.coerce.number().positive('Informe uma quantidade válida'),
  unidade: z.enum(['un', 'm', 'kg', 'cm'], {
    required_error: 'Selecione a unidade',
  }),
  preco: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0'),
});

interface MateriaisFormProps {
  rnc: string;
  onClose: () => void;
}

export function MateriaisForm({ rnc, onClose }: MateriaisFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: materiaisRaw } = useQuery<Material[]>({
    queryKey: ['materiais-rnc', rnc],
    queryFn: () => {
      return MaterialService.listByRnc(rnc);
    },
    enabled: !!rnc, // garante que o query só roda se rnc for definido
  });

  const materiais = Array.isArray(materiaisRaw) ? materiaisRaw : [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      material: '',
      quantidade: 1,
      unidade: 'un',
      preco: 0,
    },
  });

  const watch = form.watch();
  const total = watch.quantidade * watch.preco;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const novoMaterial = {
      ...values,
      total,
      rncId: rnc,
    };

    setIsSubmitting(true);
    try {
      await MaterialService.create(novoMaterial);
      await queryClient.invalidateQueries({ queryKey: ['materiais-rnc', rnc] });
      form.reset();
      toast({
        title: 'Material adicionado',
        description: 'Registro salvo com sucesso.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Verifique a conexão e tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        {/* Material */}
        <FormField
          control={form.control}
          name="material"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Material <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome do material"
                  {...field}
                  className={cn(
                    form.formState.errors.material && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.material && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.material.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Quantidade */}
        <FormField
          control={form.control}
          name="quantidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Quantidade <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  className={cn(
                    form.formState.errors.quantidade && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.quantidade && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.quantidade.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Unidade */}
        <FormField
          control={form.control}
          name="unidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Unidade <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={cn(
                    form.formState.errors.unidade && "border-destructive bg-destructive/5"
                  )}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="un">un</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="cm">cm</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.unidade && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.unidade.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Preço */}
        <FormField
          control={form.control}
          name="preco"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Preço unitário (R$) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  className={cn(
                    form.formState.errors.preco && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.preco && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.preco.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Total dinâmico */}
        {watch.quantidade > 0 && watch.preco > 0 && (
          <div className="text-sm text-gray-600">
            Total calculado: <strong>R$ {total.toFixed(2)}</strong>
          </div>
        )}

        {/* Botões */}
        <div className="space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11"
          >
            Voltar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "h-11 font-semibold shadow-lg transition-all bg-primary hover:bg-primary/90",
              isSubmitting && "opacity-70"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adicionando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Adicionar</span>
              </div>
            )}
          </Button>
        </div>

        {/* Lista de materiais */}
        {materiais.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Materiais cadastrados:</h3>
            <ul className="space-y-2">
              {materiais.map((m) => (
                <li
                  key={m.id}
                  className="p-2 bg-gray-100 rounded flex justify-between items-center"
                >
                  <span>
                    {m.material} – {Number(m.quantidade)} {m.unidade} × R${' '}
                    {Number(m.preco).toFixed(2)} ={' '}
                    <strong>R$ {Number(m.total).toFixed(2)}</strong>
                  </span>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await MaterialService.remove(m.id);
                        await queryClient.invalidateQueries({
                          queryKey: ['materiais-rnc', rnc],
                        });
                        toast({
                          title: 'Material removido',
                          description: `${m.material} excluído com sucesso.`,
                        });
                      } catch (err) {
                        toast({
                          variant: 'destructive',
                          title: 'Erro ao excluir',
                          description: 'Tente novamente.',
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>

            {/* Total geral */}
            <div className="text-right font-semibold mt-4">
              Total geral:&nbsp;
              <span className="text-construction-800">
                R${' '}
                {materiais
                  .reduce((acc, mat) => acc + Number(mat.total), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
