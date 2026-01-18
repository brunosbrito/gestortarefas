import { Badge } from '@/components/ui/badge';
import { Proposta } from '@/interfaces/PropostaInterface';

interface StatusBadgeProps {
  status: Proposta['status'];
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const badges = {
    rascunho: {
      label: 'Rascunho',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    em_analise: {
      label: 'Em Análise',
      className: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    aprovada: {
      label: 'Aprovada',
      className: 'bg-green-100 text-green-700 border-green-300',
    },
    rejeitada: {
      label: 'Rejeitada',
      className: 'bg-red-100 text-red-700 border-red-300',
    },
    cancelada: {
      label: 'Cancelada',
      className: 'bg-gray-200 text-gray-800 border-gray-400',
    },
  };

  const badge = badges[status];

  return <Badge className={badge.className}>{badge.label}</Badge>;
};

export default StatusBadge;
