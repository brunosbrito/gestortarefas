import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createServiceOrder } from '@/services/ServiceOrderService';
import { CreateServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { formSchema, FormValues } from './osFormSchema';
import { OSFormFields } from './OSFormFields';
import { useParams } from 'react-router-dom';
import { FileUploadField } from '@/components/atividades/FileUploadField';

function getUserIdFromLocalStorage(): number | null {
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId) : null;
}

export const NovaOSForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const { projectId } = useParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'em_andamento',
      description: '',
      projectId: Number(projectId),
      startDate: '',
      notes: '',
      assignedUser: 0,
      projectNumber: '',
      quantity: 0,
      weight: '',
      progress: 0,
      arquivo: undefined,
      arquivoDescricao: '',
      imagem: undefined,
      imagemDescricao: '',
    },
  });

  const handleSubmit = async (data: FormValues) => {
    const userId = getUserIdFromLocalStorage();
    const formData = new FormData();

    const serviceOrderData: CreateServiceOrder = {
      description: data.description,
      projectId: data.projectId,
      startDate: data.startDate,
      status: data.status,
      notes: data.notes,
      assignedUser: userId || undefined,
      projectNumber: data.projectNumber,
      quantity: data.quantity,
      weight: data.weight,
    };

    // Adiciona os dados da OS ao FormData
    Object.entries(serviceOrderData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Adiciona o arquivo se existir
    if (data.arquivo) {
      formData.append('arquivo', data.arquivo);
      if (data.arquivoDescricao) {
        formData.append('arquivoDescricao', data.arquivoDescricao);
      }
    }

    // Adiciona a imagem se existir
    if (data.imagem) {
      formData.append('imagem', data.imagem);
      if (data.imagemDescricao) {
        formData.append('imagemDescricao', data.imagemDescricao);
      }
    }

    try {
      await createServiceOrder(formData);

      toast({
        variant: 'default',
        title: 'Ordem de Serviço criada',
        description: 'A nova ordem de serviço foi criada com sucesso.',
      });

      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar Ordem de Serviço',
        description: 'Não foi possível criar a ordem de serviço.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <OSFormFields form={form} />
        <FileUploadField 
          form={form} 
          fileType="arquivo" 
          accept=".pdf,.doc,.docx,.xls,.xlsx"
        />
        <FileUploadField 
          form={form} 
          fileType="imagem" 
          accept="image/*"
        />
        <Button
          type="submit"
          className="w-full bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
        >
          Criar OS
        </Button>
      </form>
    </Form>
  );
};