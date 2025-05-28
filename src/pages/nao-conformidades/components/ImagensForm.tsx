
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { uploadRncImage } from "@/services/rncImageService";

const formSchema = z.object({
  image: z.any(),
  description: z.string().min(1, "Descrição é obrigatória"),
});

interface ImagensFormProps {
  rncId: string;
  onClose: () => void;
}

export function ImagensForm({ rncId, onClose }: ImagensFormProps) {
  const [images, setImages] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
      description: "",
    },
  });

  const handleImageAdd = async (values: z.infer<typeof formSchema>) => {

    const file = values.image?.[0];
    if (file) {


      try {
        await uploadRncImage({
          file,
          nonConformityId: rncId,
        });
        setImages([...images, file]);
        form.reset();
      } catch (error) {
        // Handle error (optional: show a message to the user)
        console.error("Erro ao enviar imagem:", error);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleImageAdd)} className="space-y-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange } }) => (
            <FormItem>
              <FormLabel>Imagem</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Digite uma descrição para a imagem" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button type="submit" className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
            Adicionar Imagem
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
            disabled={images.length === 0}
          >
            Finalizar
          </Button>
        </div>

        {images.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Imagens adicionadas:</h3>
            <div className="grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
