// Dialog para criação/edição de Item
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateItem, useUpdateItem } from '@/hooks/suprimentos/almoxarifado/useItems';
import {
  Item,
  ItemCreate,
  itemCategoriaLabels,
  itemUnidadeLabels,
} from '@/interfaces/suprimentos/almoxarifado/ItemInterface';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

// Schema de validação
const itemSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório').max(50, 'Código muito longo'),
  nome: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
  categoria: z.enum([
    'materia_prima',
    'produto_acabado',
    'componente',
    'ferramenta',
    'epi',
    'consumivel',
    'outros',
  ]),
  unidade: z.enum(['UN', 'KG', 'M', 'M2', 'M3', 'L', 'CX', 'PCT', 'PC', 'KIT', 'PAR', 'RL', 'SC', 'FD']),
  estoque_atual: z.coerce.number().min(0, 'Estoque não pode ser negativo'),
  estoque_minimo: z.coerce.number().min(0, 'Estoque mínimo não pode ser negativo').optional().or(z.literal('')),
  estoque_maximo: z.coerce.number().min(0, 'Estoque máximo não pode ser negativo').optional().or(z.literal('')),
  localizacao: z.string().max(200, 'Localização muito longa').optional(),
  valor_unitario: z.coerce.number().min(0, 'Valor não pode ser negativo').optional().or(z.literal('')),
  ativo: z.boolean().default(true),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  mode: 'create' | 'edit';
}

export default function ItemFormDialog({
  open,
  onOpenChange,
  item,
  mode,
}: ItemFormDialogProps) {
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      descricao: '',
      categoria: 'componente',
      unidade: 'UN',
      estoque_atual: 0,
      estoque_minimo: '',
      estoque_maximo: '',
      localizacao: '',
      valor_unitario: '',
      ativo: true,
    },
  });

  // Reset form quando abrir dialog ou mudar item
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && item) {
        form.reset({
          codigo: item.codigo,
          nome: item.nome,
          descricao: item.descricao || '',
          categoria: item.categoria,
          unidade: item.unidade,
          estoque_atual: item.estoque_atual,
          estoque_minimo: item.estoque_minimo || '',
          estoque_maximo: item.estoque_maximo || '',
          localizacao: item.localizacao || '',
          valor_unitario: item.valor_unitario || '',
          ativo: item.ativo,
        });
      } else {
        form.reset({
          codigo: '',
          nome: '',
          descricao: '',
          categoria: 'componente',
          unidade: 'UN',
          estoque_atual: 0,
          estoque_minimo: '',
          estoque_maximo: '',
          localizacao: '',
          valor_unitario: '',
          ativo: true,
        });
      }
    }
  }, [open, mode, item, form]);

  const onSubmit = (data: ItemFormValues) => {
    // Converter valores vazios para undefined
    const processedData: ItemCreate = {
      ...data,
      descricao: data.descricao || undefined,
      estoque_minimo: data.estoque_minimo === '' ? undefined : Number(data.estoque_minimo),
      estoque_maximo: data.estoque_maximo === '' ? undefined : Number(data.estoque_maximo),
      localizacao: data.localizacao || undefined,
      valor_unitario: data.valor_unitario === '' ? undefined : Number(data.valor_unitario),
    };

    if (mode === 'create') {
      createMutation.mutate(processedData, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    } else if (item) {
      updateMutation.mutate(
        { id: item.id, data: processedData },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Novo Item' : 'Editar Item'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Preencha os dados para criar um novo item no almoxarifado.'
              : 'Atualize os dados do item.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Código e Nome */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="EX: MP-001" {...field} />
                    </FormControl>
                    <FormDescription>Código único do item</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição detalhada do item"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria e Unidade */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(itemCategoriaLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(itemUnidadeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Estoque Atual, Mínimo e Máximo */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="estoque_atual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Atual *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estoque_minimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estoque_maximo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Máximo</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Localização e Valor Unitário */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="localizacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Prateleira A3" {...field} />
                    </FormControl>
                    <FormDescription>Localização física no almoxarifado</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_unitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
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

            {/* Ativo */}
            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Item Ativo</FormLabel>
                    <FormDescription>
                      Marque se o item está disponível para uso
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Criar Item' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
