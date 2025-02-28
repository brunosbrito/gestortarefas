
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

const formSchema = z.object({
  material: z.string().min(1, "Material é obrigatório"),
});

interface MateriaisFormProps {
  rncId: string;
  onClose: () => void;
}

export function MateriaisForm({ rncId, onClose }: MateriaisFormProps) {
  const [materials, setMaterials] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      material: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setMaterials([...materials, values.material]);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button type="submit" className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
            Adicionar
          </Button>
          <Button type="button" onClick={onClose} className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90">
            Finalizar
          </Button>
        </div>

        {materials.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Materiais adicionados:</h3>
            <ul className="space-y-2">
              {materials.map((material, index) => (
                <li key={index} className="p-2 bg-gray-100 rounded">
                  {material}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </Form>
  );
}
