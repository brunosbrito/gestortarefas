import { Badge } from '@/components/ui/badge';
import {
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';
import { StatusDocumentoGP, StatusAcaoGP, StatusPDCA } from '@/interfaces/GestaoProcessosInterfaces';

interface StatusBadgeProps {
  status: StatusDocumentoGP | StatusAcaoGP | StatusPDCA;
  className?: string;
}

/**
 * Badge para exibição de status dos documentos de Gestão de Processos
 * Suporta múltiplos tipos de status com cores e ícones apropriados
 */
export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  // Configuração de status de documentos (workflow de aprovação)
  const statusDocumentoConfig: Record<
    StatusDocumentoGP,
    { variant: any; label: string; icon: any; className: string }
  > = {
    rascunho: {
      variant: 'secondary',
      label: 'Rascunho',
      icon: FileEdit,
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
    aguardando_aprovacao: {
      variant: 'default',
      label: 'Aguardando Aprovação',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
    },
    aprovado: {
      variant: 'default',
      label: 'Aprovado',
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
    },
    rejeitado: {
      variant: 'destructive',
      label: 'Rejeitado',
      icon: XCircle,
      className: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
    },
  };

  // Configuração de status de ações (5W2H, PDCA)
  const statusAcaoConfig: Record<
    StatusAcaoGP,
    { variant: any; label: string; icon: any; className: string }
  > = {
    pendente: {
      variant: 'secondary',
      label: 'Pendente',
      icon: AlertCircle,
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
    em_andamento: {
      variant: 'default',
      label: 'Em Andamento',
      icon: PlayCircle,
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
    },
    concluida: {
      variant: 'default',
      label: 'Concluída',
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
    },
    verificada: {
      variant: 'default',
      label: 'Verificada',
      icon: ShieldCheck,
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
    },
  };

  // Configuração de status de PDCA
  const statusPDCAConfig: Record<
    StatusPDCA,
    { variant: any; label: string; icon: any; className: string }
  > = {
    planejamento: {
      variant: 'default',
      label: 'Planejamento',
      icon: FileEdit,
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
    },
    execucao: {
      variant: 'default',
      label: 'Execução',
      icon: PlayCircle,
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
    },
    verificacao: {
      variant: 'default',
      label: 'Verificação',
      icon: ShieldCheck,
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
    },
    acao: {
      variant: 'default',
      label: 'Ação',
      icon: AlertCircle,
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
    },
    concluido: {
      variant: 'default',
      label: 'Concluído',
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
    },
    cancelado: {
      variant: 'destructive',
      label: 'Cancelado',
      icon: XCircle,
      className: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
    },
  };

  // Determina qual configuração usar baseado no status
  const getConfig = () => {
    if (status in statusDocumentoConfig) {
      return statusDocumentoConfig[status as StatusDocumentoGP];
    }
    if (status in statusPDCAConfig) {
      return statusPDCAConfig[status as StatusPDCA];
    }
    if (status in statusAcaoConfig) {
      return statusAcaoConfig[status as StatusAcaoGP];
    }
    // Fallback
    return {
      variant: 'secondary',
      label: status,
      icon: AlertCircle,
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 w-fit ${config.className} ${className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};
