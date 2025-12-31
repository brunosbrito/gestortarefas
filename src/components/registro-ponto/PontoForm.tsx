import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { toast } from 'sonner';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { Obra } from '@/interfaces/ObrasInterface';
import { CreateEffectiveDto } from '@/interfaces/EffectiveInterface';
import { normalizeSetorCode } from '@/utils/labels';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  shift: z.string({ required_error: 'Selecione o turno' }),
  typeRegister: z.enum(['PRODUCAO', 'ADMINISTRATIVO', 'ENGENHARIA', 'FALTA'], {
    required_error: 'Selecione o tipo de registro',
  }),
  username: z.string({ required_error: 'Selecione o colaborador' }),
  project: z.string().optional(),
  sector: z.string().optional(),
  reason: z.string().optional(),
  role: z.enum(['PRODUCAO', 'ADMINISTRATIVO', 'ENGENHARIA']).optional(),
  status: z.enum(['PRESENTE', 'FALTA']).optional(),
});

interface PontoFormProps {
  onSubmit: (data: CreateEffectiveDto) => void;
  obras: Obra[];
  colaboradores: Colaborador[];
  onClose: () => void;
  defaultValues?: z.infer<typeof formSchema>;
  isEdit?: boolean;
}

export const PontoForm = ({
  onSubmit,
  obras,
  colaboradores,
  onClose,
  defaultValues,
  isEdit = false,
}: PontoFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      shift: '',
      typeRegister: 'PRODUCAO',
      username: '',
      project: '',
      sector: '',
      reason: '',
    },
  });

  const tipoRegistro = form.watch('typeRegister');

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const colaborador = colaboradores.find((c) => c.name === data.username);
      const roleCode =
        normalizeSetorCode(colaborador?.sector) ||
        normalizeSetorCode(data.typeRegister) ||
        'PRODUCAO';

      const effectiveData: CreateEffectiveDto = {
        username: data.username,
        shift: Number(data.shift),
        role: roleCode,
        project: data.project,
        typeRegister: data.typeRegister,
        reason: data.reason,
        sector: data.sector,
        status: data.typeRegister === 'FALTA' ? 'FALTA' : 'PRESENTE',
        createdAt: new Date(),
      };

      await onSubmit(effectiveData);
      form.reset();
      onClose();
      toast.success(
        isEdit
          ? 'Registro atualizado com sucesso'
          : 'Registro adicionado com sucesso'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 md:space-y-8">
        <FormField
          control={form.control}
          name="shift"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Turno <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={cn(
                    form.formState.errors.shift && "border-destructive bg-destructive/5"
                  )}>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1º Turno</SelectItem>
                  <SelectItem value="2">2º Turno</SelectItem>
                  <SelectItem value="3">Turno Central</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.shift && (
                <FormMessage className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {form.formState.errors.shift.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="typeRegister"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Registro</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PRODUCAO">Produção</SelectItem>
                  <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                  <SelectItem value="ENGENHARIA">Engenharia</SelectItem>
                  <SelectItem value="FALTA">Falta</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colaborador</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colaboradores.map((col) => (
                    <SelectItem key={col.name} value={col.name}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {tipoRegistro === 'PRODUCAO' && (
          <FormField
            control={form.control}
            name="project"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Obra</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a obra" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Fabrica">
                      Fabrica
                    </SelectItem>
                    {obras.map((obra) => (
                      <SelectItem key={obra.name} value={obra.name}>
                        {obra.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(tipoRegistro === 'ADMINISTRATIVO' ||
          tipoRegistro === 'ENGENHARIA') && (
          <FormField
            control={form.control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Setor</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o setor" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {tipoRegistro === 'FALTA' && (
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo da Falta</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Digite o motivo da falta" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full h-11 font-semibold shadow-lg transition-all bg-primary hover:bg-primary/90",
              isSubmitting && "opacity-70"
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isEdit ? 'Salvando...' : 'Salvando...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{isEdit ? 'Salvar Alterações' : 'Salvar Registro'}</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
