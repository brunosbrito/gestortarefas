
import { CardHeader, CardTitle } from '@/components/ui/card';
import { GripHorizontal } from 'lucide-react';

interface AtividadeHeaderProps {
  sequencialNumber: number;
  description: string;
}

export const AtividadeHeader = ({ sequencialNumber, description }: AtividadeHeaderProps) => {
  return (
    <CardHeader className="p-4 pb-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-[#FF7F0E] bg-[#FF7F0E]/10 px-2 py-1 rounded-md">
              #{sequencialNumber}
            </span>
          </div>
          <CardTitle className="text-sm font-medium text-gray-700 leading-tight">
            {description}
          </CardTitle>
        </div>
        <GripHorizontal className="w-4 h-4 text-gray-400 mt-2 flex-shrink-0" />
      </div>
    </CardHeader>
  );
};
