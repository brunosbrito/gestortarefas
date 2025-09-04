import { ClipboardList, Scissors, Package, DollarSign } from 'lucide-react';
import { useModule, Module } from '@/contexts/ModuleContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const modules = [
  {
    id: 'task-manager' as Module,
    label: 'Gestor de Tarefas',
    icon: ClipboardList,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    activeColor: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
  },
  {
    id: 'cutting-optimizer' as Module,
    label: 'Otimizador Plano Corte',
    icon: Scissors,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    activeColor: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
  },
  {
    id: 'stock' as Module,
    label: 'Estoque',
    icon: Package,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    activeColor: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
  },
  {
    id: 'cost-manager' as Module,
    label: 'Gestor de Custos',
    icon: DollarSign,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    activeColor: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
  },
];

export const ModuleSelector = () => {
  const { activeModule, setActiveModule } = useModule();

  return (
    <div className="p-3 border-b border-border">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Módulos
      </h3>
      <div className="space-y-1">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <Button
              key={module.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveModule(module.id)}
              className={cn(
                "w-full justify-start h-auto p-3 rounded-lg transition-all",
                isActive 
                  ? module.activeColor
                  : `${module.bgColor} hover:${module.activeColor.split(' ')[0]} hover:${module.activeColor.split(' ')[1]}`
              )}
            >
              <Icon className={cn("w-4 h-4 mr-3", isActive ? "" : module.color)} />
              <span className="text-sm font-medium truncate">{module.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};