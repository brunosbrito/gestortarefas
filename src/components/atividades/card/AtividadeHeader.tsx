
import { CardHeader, CardTitle } from '@/components/ui/card';
import { GripHorizontal } from 'lucide-react';

interface AtividadeHeaderProps {
  sequencialNumber: number;
  description: string;
}

export const AtividadeHeader = ({ sequencialNumber, description }: AtividadeHeaderProps) => {
  return (
    <CardHeader className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#FF7F0E]">
            #{sequencialNumber}
          </span>
          <CardTitle className="text-sm font-medium">
            {description}
          </CardTitle>
        </div>
        <GripHorizontal className="w-4 h-4 text-gray-400" />
      </div>
    </CardHeader>
  );
};
