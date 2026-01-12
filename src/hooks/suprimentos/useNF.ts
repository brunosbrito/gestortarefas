import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import nfService from '@/services/suprimentos/nfService';
import { useToast } from '@/hooks/use-toast';

export const useNFs = (contractId?: number) => {
  return useQuery({
    queryKey: ['suprimentos-nf', contractId],
    queryFn: () => nfService.getAll(contractId),
  });
};

export const useNF = (id: number) => {
  return useQuery({
    queryKey: ['suprimentos-nf', id],
    queryFn: () => nfService.getById(id),
    enabled: !!id,
  });
};

export const useNFStats = () => {
  return useQuery({
    queryKey: ['suprimentos-nf', 'stats'],
    queryFn: () => nfService.getStats(),
  });
};

export const useValidateNF = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => nfService.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-nf'] });
      queryClient.invalidateQueries({ queryKey: ['suprimentos-contracts'] });
      toast({
        title: 'Sucesso',
        description: 'NF validada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao validar NF',
        variant: 'destructive',
      });
    },
  });
};

export const useRejectNF = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => nfService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-nf'] });
      toast({
        title: 'NF Rejeitada',
        description: 'Nota fiscal rejeitada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao rejeitar NF',
        variant: 'destructive',
      });
    },
  });
};

export const useImportNFXML = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => nfService.importXML(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-nf'] });
      toast({
        title: 'Importação Concluída',
        description: 'NF importada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na Importação',
        description: error.message || 'Erro ao importar NF',
        variant: 'destructive',
      });
    },
  });
};

export const useProcessFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (folderName: string) => nfService.processFolder(folderName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suprimentos-nf'] });
      toast({
        title: 'Processamento Iniciado',
        description: data.message || 'Pasta enviada para processamento',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no Processamento',
        description: error.message || 'Erro ao processar pasta no n8n',
        variant: 'destructive',
      });
    },
  });
};

// Hook para buscar NFs de um contrato com detalhes completos
export const useContractNFsDetailed = (contractId: number) => {
  return useQuery({
    queryKey: ['suprimentos-contract-nfs-detailed', contractId],
    queryFn: async () => {
      // Este método retorna contrato + summary + nfs
      const response = await nfService.getAll(contractId);
      return response.data;
    },
    enabled: !!contractId,
  });
};

// Download de XML e PDF
export const useDownloadNFXML = () => {
  const { toast } = useToast();

  const downloadXML = async (nfId: number, nfNumero: string) => {
    try {
      const blob = await nfService.downloadXML(nfId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NF_${nfNumero}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download Concluído',
        description: 'Arquivo XML baixado com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro no Download',
        description: error.message || 'Erro ao baixar XML',
        variant: 'destructive',
      });
    }
  };

  return { downloadXML };
};

export const useDownloadNFPDF = () => {
  const { toast } = useToast();

  const downloadPDF = async (nfId: number, nfNumero: string) => {
    try {
      const blob = await nfService.downloadPDF(nfId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DANFE_${nfNumero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download Concluído',
        description: 'Arquivo PDF baixado com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro no Download',
        description: error.message || 'Erro ao baixar PDF',
        variant: 'destructive',
      });
    }
  };

  return { downloadPDF };
};

// Alias para compatibilidade com componentes originais
export const useValidateNotaFiscal = useValidateNF;
