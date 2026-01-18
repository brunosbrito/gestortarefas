import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reportsService from '@/services/suprimentos/reportsService';
import { useToast } from '@/hooks/use-toast';

// ==================== Report Hooks ====================

// Get all report templates
export const useReportTemplates = () => {
  return useQuery({
    queryKey: ['suprimentos-report-templates'],
    queryFn: async () => {
      const response = await reportsService.getTemplates();
      return response.data;
    },
  });
};

// Get single template by ID
export const useReportTemplate = (id: string) => {
  return useQuery({
    queryKey: ['suprimentos-report-templates', id],
    queryFn: async () => {
      const response = await reportsService.getTemplateById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Get all generated reports (history)
export const useReports = () => {
  return useQuery({
    queryKey: ['suprimentos-reports'],
    queryFn: async () => {
      const response = await reportsService.getAll();
      return response.data;
    },
  });
};

// Get single generated report by ID
export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['suprimentos-reports', id],
    queryFn: async () => {
      const response = await reportsService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Generate a new report
export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      templateId,
      filters,
      exportFormat,
    }: {
      templateId: string;
      filters: any;
      exportFormat?: 'pdf' | 'excel' | 'csv';
    }) => reportsService.generate(templateId, filters, exportFormat),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-reports'] });
      queryClient.invalidateQueries({ queryKey: ['suprimentos-report-stats'] });
      toast({
        title: 'Sucesso',
        description: response.message || 'Relatório gerado com sucesso',
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

// Download a report
export const useDownloadReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => reportsService.download(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-reports'] });
      queryClient.invalidateQueries({ queryKey: ['suprimentos-reports', id] });
      toast({
        title: 'Download Iniciado',
        description: 'O download do relatório foi iniciado',
      });

      // In a real app, this would trigger a browser download
      console.log('Download URL:', response.data.url);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao fazer download do relatório',
        variant: 'destructive',
      });
    },
  });
};

// Delete a report
export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => reportsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-reports'] });
      queryClient.invalidateQueries({ queryKey: ['suprimentos-report-stats'] });
      toast({
        title: 'Sucesso',
        description: 'Relatório excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir relatório',
        variant: 'destructive',
      });
    },
  });
};

// Get report statistics
export const useReportStats = () => {
  return useQuery({
    queryKey: ['suprimentos-report-stats'],
    queryFn: async () => {
      const response = await reportsService.getStats();
      return response.data;
    },
  });
};
