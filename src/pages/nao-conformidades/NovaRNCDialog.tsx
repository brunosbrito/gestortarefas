
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

interface NovaRNCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaRNCDialog({ open, onOpenChange }: NovaRNCDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<string>('info');
  const [rncData, setRncData] = useState<any>(null);
  const [workforce, setWorkforce] = useState<CreateWorkforce[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const handleSuccess = () => {
    toast({
      title: 'RNC criada com sucesso',
      description: 'A RNC foi criada e está pronta para revisão.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova RNC</DialogTitle>
        </DialogHeader>

        <Tabs value={step} onValueChange={setStep}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="workforce">Mão de Obra</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="images">Imagens</TabsTrigger>
          </TabsList>

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
              workforce={workforce}
              onWorkforceChange={setWorkforce}
              onNext={() => setStep('materials')}
              onBack={() => setStep('info')}
            />
          </TabsContent>

          <TabsContent value="materials">
            <MateriaisForm
              materials={materials}
              onMaterialsChange={setMaterials}
              onNext={() => setStep('images')}
              onBack={() => setStep('workforce')}
            />
          </TabsContent>

          <TabsContent value="images">
            <ImagensForm
              images={images}
              onImagesChange={setImages}
              onBack={() => setStep('materials')}
              onSubmit={() => {
                // Aqui você combinaria todos os dados e enviaria para a API
                const finalData = {
                  ...rncData,
                  workforce,
                  materials,
                  images
                };
                console.log('Dados finais:', finalData);
                handleSuccess();
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
