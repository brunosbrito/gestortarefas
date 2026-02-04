import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';
import { needsFormatting, formatByFieldType } from '@/lib/textFormatting';

interface TextFormatSuggestionProps {
  currentValue: string;
  fieldType: 'headline' | 'normal' | 'title';
  onApply: (formattedValue: string) => void;
  className?: string;
}

export function TextFormatSuggestion({
  currentValue,
  fieldType,
  onApply,
  className = '',
}: TextFormatSuggestionProps) {
  // Detecta o tipo de formatação baseado no fieldType
  const formatType = fieldType === 'headline' ? 'upper' : 'sentence';

  // Verifica se precisa de formatação
  const needsFormat = needsFormatting(currentValue, formatType);

  if (!needsFormat || !currentValue.trim()) {
    return null;
  }

  const formattedValue = formatByFieldType(currentValue, fieldType);

  const getFormatLabel = () => {
    switch (fieldType) {
      case 'headline':
        return 'MAIÚSCULO';
      case 'normal':
        return 'Capitalizado';
      case 'title':
        return 'Título';
      default:
        return 'Formatado';
    }
  };

  return (
    <div className={`flex items-center gap-2 mt-1 ${className}`}>
      <Badge variant="secondary" className="text-xs">
        <Wand2 className="h-3 w-3 mr-1" />
        Sugestão
      </Badge>
      <span className="text-xs text-muted-foreground truncate max-w-xs">
        {formattedValue}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 text-xs"
        onClick={() => onApply(formattedValue)}
      >
        Aplicar
      </Button>
    </div>
  );
}
