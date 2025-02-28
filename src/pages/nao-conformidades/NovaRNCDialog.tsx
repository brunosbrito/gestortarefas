
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { NovaRNCForm } from './NovaRNCForm';
import { MaoObraForm } from './components/MaoObraForm';
import { MateriaisForm } from './components/MateriaisForm';
import { ImagensForm } from './components/ImagensForm';
import { CreateWorkforce } from '@/interfaces/RncInterface';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface NovaRNCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const correctiveActionSchema = z.object({
  correctiveAction: z.string().min(1, "Ação corretiva é obrigatória"),
  responsibleAction: z.string().min(1, "Responsável pela ação é obrigatório"),
});

export function NovaRNCDialog({ open, onOpenChange }: NovaRNCDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<string>('info');
  const [rncData, setRncData] = useState<any>(null);
  const [workforce, setWorkforce] = useState<CreateWorkforce[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [tempRncId] = useState<string>('temp-id');

  const correctiveForm = useForm<z.infer<typeof correctiveActionSchema>>({
    resolver: zodResolver(correctiveActionSchema),
    defaultValues: {
      correctiveAction: "",
      responsibleAction: "",
    },
  });

  const handleSuccess = (correctiveData: z.infer<typeof correctiveActionSchema>) => {
    // Aqui você combinaria todos os dados e enviaria para a API
    const finalData = {
      ...rncData,
      workforce,
      materials,
      images,
      ...correctiveData
    };
    console.log('Dados finais:', finalData);

    toast({
      title: 'RNC criada com sucesso',
      description: 'A RNC foi criada e está pronta para revisão.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova RNC</DialogTitle>
        </DialogHeader>

        <Tabs value={step} onValueChange={setStep} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="workforce">Mão de Obra</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="images">Imagens</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <TabsContent value="info">
              <NovaRNCForm
                onNext={(data) => {
                  setRncData(data);
                  setStep('workforce');
                }}
              />
            </TabsContent>

            <TabsContent value="workforce">
              <MaoObraForm
                rncId={tempRncId}
                onClose={() => setStep('materials')}
              />
            </TabsContent>

            <TabsContent value="materials">
              <MateriaisForm
                rncId={tempRncId}
                onClose={() => setStep('images')}
              />
            </TabsContent>

            <TabsContent value="images" className="space-y-6">
              <ImagensForm
                rncId={tempRncId}
                onClose={() => {}}
              />

              <div className="border-t pt-4">
                <Form {...correctiveForm}>
                  <form 
                    onSubmit={correctiveForm.handleSubmit(handleSuccess)} 
                    className="space-y-4"
                  >
                    <FormField
                      control={correctiveForm.control}
                      name="correctiveAction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ação Corretiva</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva a ação corretiva a ser tomada"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={correctiveForm.control}
                      name="responsibleAction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável pela Ação</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nome do responsável pela ação"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep('materials')}
                      >
                        Voltar
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
                      >
                        Finalizar RNC
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
