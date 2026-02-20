import { Badge } from '@/components/ui/badge';

export interface StatusConfig {
  label: string;
  className: string;
}

export type StatusMap<T extends string> = Record<T, StatusConfig>;

interface GenericStatusBadgeProps<T extends string> {
  status: T;
  statusMap: StatusMap<T>;
}

function GenericStatusBadge<T extends string>({
  status,
  statusMap,
}: GenericStatusBadgeProps<T>) {
  const config = statusMap[status];

  if (!config) {
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-300">
        {String(status)}
      </Badge>
    );
  }

  return <Badge className={config.className}>{config.label}</Badge>;
}

export default GenericStatusBadge;

// Configurações pré-definidas para reutilização
export const PROPOSTA_STATUS_MAP: StatusMap<'rascunho' | 'em_analise' | 'aprovada' | 'rejeitada' | 'cancelada'> = {
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

export const ORCAMENTO_STATUS_MAP: StatusMap<'rascunho' | 'em_aprovacao' | 'aprovado' | 'reprovado' | 'concluido'> = {
  rascunho: {
    label: 'Rascunho',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  em_aprovacao: {
    label: 'Em Aprovação',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  aprovado: {
    label: 'Aprovado',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
  reprovado: {
    label: 'Reprovado',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
  concluido: {
    label: 'Concluído',
    className: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  },
};
