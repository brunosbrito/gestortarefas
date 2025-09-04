import React, { createContext, useContext, useState } from 'react';

export type Module = 'task-manager' | 'cutting-optimizer' | 'stock' | 'cost-manager';

interface ModuleContextType {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const useModule = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModule deve ser usado dentro de um ModuleProvider');
  }
  return context;
};

interface ModuleProviderProps {
  children: React.ReactNode;
}

export const ModuleProvider = ({ children }: ModuleProviderProps) => {
  const [activeModule, setActiveModule] = useState<Module>('task-manager');

  return (
    <ModuleContext.Provider value={{ activeModule, setActiveModule }}>
      {children}
    </ModuleContext.Provider>
  );
};