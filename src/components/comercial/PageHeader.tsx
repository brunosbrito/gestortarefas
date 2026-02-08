import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  backLabel?: string;
}

const PageHeader = ({
  icon: Icon,
  title,
  description,
  iconColor = 'from-blue-600 to-blue-400',
  showBackButton = false,
  onBack,
  backLabel = 'Voltar',
}: PageHeaderProps) => {
  return (
    <div className="mb-8">
      {showBackButton && onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Button>
      )}

      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
