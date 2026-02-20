import GenericStatusBadge, { PROPOSTA_STATUS_MAP } from '@/components/comercial/GenericStatusBadge';
import { Proposta } from '@/interfaces/PropostaInterface';

interface StatusBadgeProps {
  status: Proposta['status'];
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <GenericStatusBadge status={status} statusMap={PROPOSTA_STATUS_MAP} />;
};

export default StatusBadge;
