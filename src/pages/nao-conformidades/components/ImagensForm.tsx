
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
import { Dispatch, SetStateAction } from "react";

const formSchema = z.object({
  image: z.any(),
  description: z.string().min(1, "Descrição é obrigatória"),
});

interface ImagensFormProps {
  images: File[];
  onImagesChange: Dispatch<SetStateAction<File[]>>;
  onBack: () => void;
  onSubmit: () => void;
}

export function ImagensForm({ images, onImagesChange, onBack, onSubmit }: ImagensFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
      description: "",
    },
  });

  const handleImageAdd = (values: z.infer<typeof formSchema>) => {
    if (values.image?.[0]) {
      onImagesChange([...images, values.image[0]]);
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleImageAdd)} className="space-y-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Imagem</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
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
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button type="submit" className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
            Adicionar Imagem
          </Button>
          <Button 
            type="button" 
            onClick={onSubmit}
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
