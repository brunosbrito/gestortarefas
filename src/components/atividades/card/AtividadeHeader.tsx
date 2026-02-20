
import { CardHeader, CardTitle } from '@/components/ui/card';
import { GripHorizontal } from 'lucide-react';

interface AtividadeHeaderProps {
  sequencialNumber: number;
  description: string;
}

export const AtividadeHeader = ({ sequencialNumber, description }: AtividadeHeaderProps) => {
  return (
    <CardHeader className="p-3 pb-1">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
            #{sequencialNumber}
          </span>
          <CardTitle className="text-xs font-medium text-foreground/80 leading-tight truncate">
            {description}
          </CardTitle>
        </div>
        <GripHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </CardHeader>
  );
};
