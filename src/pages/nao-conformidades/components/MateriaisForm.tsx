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
import { Trash2 } from 'lucide-react';
import MaterialService from '@/services/MaterialService';
import { Material } from '@/interfaces/MaterialInterface';

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
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Material */}
        <FormField
          control={form.control}
          name="material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do material" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quantidade */}
        <FormField
          control={form.control}
          name="quantidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Unidade */}
        <FormField
          control={form.control}
          name="unidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preço */}
        <FormField
          control={form.control}
          name="preco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço unitário (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
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
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button type="submit" className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
            Adicionar
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
