
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { getServiceOrderByProjectId } from '@/services/ServiceOrderService';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import ColaboradorService from '@/services/ColaboradorService';
import RncService from '@/services/NonConformityService';
import { FileUploadField } from '@/components/atividades/FileUploadField';

const formSchema = z.object({
  projectId: z.string().min(1, 'Projeto é obrigatório'),
  responsibleRncId: z.string().min(1, 'Responsável pela rnc é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  serviceOrderId: z.string().min(1, 'Obra/Fabrica é obrigatória'),
  responsibleIdentification: z
    .string()
    .min(1, 'Responsável pela identificacao é obrigatório'),
  dateOccurrence: z.string().min(1, 'Data da ocorrência é obrigatória'),
  workforce: z.array(z.object({
    name: z.string().min(1, 'Nome é obrigatório')
  })),
  materials: z.array(z.object({
    name: z.string().min(1, 'Nome é obrigatório')
  })),
  images: z.array(z.object({
    file: z.any(),
    description: z.string().optional()
  }))
});

interface NovaRNCFormProps {
  onSuccess?: () => void;
}

export function NovaRNCForm({ onSuccess }: NovaRNCFormProps) {
  const { toast } = useToast();
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [os, setOs] = useState<ServiceOrder[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: '',
      responsibleRncId: '',
      description: '',
      serviceOrderId: '',
      responsibleIdentification: '',
      dateOccurrence: new Date().toISOString().split('T')[0],
      workforce: [],
      materials: [],
      images: []
    },
  });

  const { fields: workforceFields, append: appendWorkforce, remove: removeWorkforce } = useFieldArray({
    control: form.control,
    name: "workforce"
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control: form.control,
    name: "materials"
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images"
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();

      // Adiciona os dados básicos
      formData.append('projectId', values.projectId);
      formData.append('responsibleRncId', values.responsibleRncId);
      formData.append('description', values.description);
      formData.append('serviceOrderId', values.serviceOrderId);
      formData.append('responsibleIdentification', values.responsibleIdentification);
      formData.append('dateOccurrence', values.dateOccurrence);

      // Adiciona a mão de obra
      values.workforce.forEach((worker, index) => {
        formData.append(`workforce[${index}]name`, worker.name);
      });

      // Adiciona os materiais
      values.materials.forEach((material, index) => {
        formData.append(`materials[${index}]name`, material.name);
      });

      // Adiciona as imagens
      values.images.forEach((image, index) => {
        if (image.file) {
          formData.append(`images[${index}]file`, image.file);
        }
        if (image.description) {
          formData.append(`images[${index}]description`, image.description);
        }
      });

      await RncService.createRnc(formData);

      toast({
        title: 'RNC criada com sucesso',
        description: 'O registro de não conformidade foi criado.',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar RNC',
        description: 'Ocorreu um erro ao criar o registro. Tente novamente.',
      });
    }
  };

  const getProjetos = async () => {
    try {
      const projetos = await ObrasService.getAllObras();
      setProjetos(projetos);
    } catch (error) {
      console.log(error);
    }
  };

  const getOsByProject = async (projectId: string) => {
    try {
      const ordemServico = await getServiceOrderByProjectId(projectId);
      setOs(ordemServico);
    } catch (error) {
      console.log(error);
    }
  };

  const getColaboradores = async () => {
    try {
      const response = await ColaboradorService.getAllColaboradores();
      setColaboradores(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProjetos();
    getColaboradores();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  getOsByProject(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projetos.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
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
          name="serviceOrderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem de Serviço (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a OS" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {os.map((x) => (
                    <SelectItem key={x.id} value={x.id.toString()}>
                      {x.serviceOrderNumber} - {x.description}
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
          name="responsibleRncId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável pela RNC</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradores.map((c: Colaborador) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
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
          name="responsibleIdentification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável Indentificacao RNC</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colaboradores.map((c: Colaborador) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOccurrence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data da Ocorrência</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
                <Textarea
                  placeholder="Descreva a não conformidade"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Mão de Obra</h3>
          {workforceFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`workforce.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Nome do trabalhador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeWorkforce(index)}
              >
                Remover
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendWorkforce({ name: '' })}
          >
            Adicionar Mão de Obra
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Materiais</h3>
          {materialFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`materials.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Nome do material" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeMaterial(index)}
              >
                Remover
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendMaterial({ name: '' })}
          >
            Adicionar Material
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Imagens</h3>
          {imageFields.map((field, index) => (
            <div key={field.id} className="space-y-2">
              <FileUploadField
                form={form}
                fileType="imagem"
                activityId={index}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeImage(index)}
              >
                Remover Imagem
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendImage({ file: null, description: '' })}
          >
            Adicionar Imagem
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
        >
          Criar RNC
        </Button>
      </form>
    </Form>
  );
}
