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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  uploadRncImage,
  listImagesByRnc,
  deleteRncImage,
} from '@/services/rncImageService';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  image: z.any(),
  description: z.string().min(1, 'Descrição é obrigatória'),
});

interface ImagensFormProps {
  rncId: string;
  onClose: () => void;
}

export function ImagensForm({ rncId, onClose }: ImagensFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista as imagens da RNC
  const { data: imagens = [] } = useQuery({
    queryKey: ['rnc-images', rncId],
    queryFn: () => listImagesByRnc(rncId),
    enabled: !!rncId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
      description: '',
    },
  });

  const getImageUrl = (url: string) => {
    return url.startsWith('http')
      ? url
      : `https://api.gmxindustrial.com.br${url}`;
  };

  const handleImageAdd = async (values: z.infer<typeof formSchema>) => {
    const file = values.image?.[0];
    if (!file) return;

    setIsSubmitting(true);
    try {
      await uploadRncImage({
        file,
        nonConformityId: rncId,
        description: values.description,
      });

      await queryClient.invalidateQueries({ queryKey: ['rnc-images', rncId] });
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleImageAdd)} className="space-y-6 md:space-y-8">
        {/* Upload da imagem */}
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Imagem <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                  className={cn(
                    form.formState.errors.image && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.image && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.image.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Descrição <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite uma descrição"
                  {...field}
                  className={cn(
                    form.formState.errors.description && "border-destructive bg-destructive/5"
                  )}
                />
              </FormControl>
              {form.formState.errors.description && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.description.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

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
                <span>Adicionar Imagem</span>
              </div>
            )}
          </Button>
        </div>

        {/* Lista de imagens cadastradas */}
        {imagens.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-lg text-[#003366] border-b border-[#E0E0E0] pb-2">
              Imagens cadastradas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagens.map((img: any) => (
                <div
                  key={img.id}
                  className="relative bg-gray-100 rounded overflow-hidden shadow-sm"
                >
                  <img
                    src={getImageUrl(img.url)} // ou URL completa se disponível
                    alt={img.description}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-2 text-sm text-gray-800">
                    {img.description}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await deleteRncImage(img.id);
                          await queryClient.invalidateQueries({
                            queryKey: ['rnc-images', rncId],
                          });
                        } catch (err) {
                          console.error('Erro ao excluir imagem', err);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
