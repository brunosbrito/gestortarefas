import { useModule } from '@/contexts/ModuleContext';
import { Badge } from '@/components/ui/badge';
import { getModuleConfig } from './ModuleMenuItems';

export const ModuleIndicator = () => {
  const { activeModule } = useModule();
  const config = getModuleConfig(activeModule);

  if (!config) return null;

  return (
    <Badge 
      variant="secondary" 
      className="hidden md:flex items-center gap-1.5 bg-white/10 text-white border-white/20 hover:bg-white/20"
    >
      <config.icon className="h-3 w-3" />
      <span className="text-xs font-medium">{config.name}</span>
    </Badge>
  );
};