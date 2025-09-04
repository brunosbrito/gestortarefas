import { ChevronDown } from 'lucide-react';
import { useModule, Module } from '@/contexts/ModuleContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getModuleConfig } from './ModuleMenuItems';

const modules: Module[] = ['task-manager', 'cutting-optimizer', 'stock', 'cost-manager'];

export const ModuleDropdown = () => {
  const { activeModule, setActiveModule } = useModule();
  const currentConfig = getModuleConfig(activeModule);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-9 px-3 text-left justify-start gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
        >
          {currentConfig && <currentConfig.icon className="h-4 w-4" />}
          <span className="font-medium">{currentConfig?.name}</span>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64 bg-card/95 backdrop-blur-sm border-border/50"
      >
        {modules.map((module) => {
          const config = getModuleConfig(module);
          if (!config) return null;
          
          return (
            <DropdownMenuItem
              key={module}
              onClick={() => setActiveModule(module)}
              className={`flex items-center gap-3 p-3 cursor-pointer ${
                activeModule === module 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-accent/50'
              }`}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: config.color + '20' }}
              >
                <config.icon 
                  className="h-4 w-4" 
                  style={{ color: config.color }}
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{config.name}</div>
                <div className="text-xs text-muted-foreground">{config.description}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};