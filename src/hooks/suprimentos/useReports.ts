import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reportsService from '@/services/suprimentos/reportsService';
import { useToast } from '@/hooks/use-toast';

export const useReports = () => {
  return useQuery({
    queryKey: ['suprimentos-reports'],
    queryFn: () => reportsService.getAll(),
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ templateId, filters }: { templateId: string; filters: any }) =>
      reportsService.generate(templateId, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-reports'] });
      toast({
        title: 'Sucesso',
        description: 'Relatório gerado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao gerar relatório',
        variant: 'destructive',
      });
    },
  });
};
