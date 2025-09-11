import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; 
import Dashboard from '../pages/Index';
import Obras from '../pages/Obras';
import OrdensServico from '../pages/obras/os';
import Atividades from '../pages/obras/os/atividades';
import RegistroPonto from '../pages/RegistroPonto';
import { Toaster } from '@/components/ui/toaster';
import Colaboradores from '../pages/gerenciamento/colaboradores';
import TarefasMacro from '../pages/gerenciamento/tarefas-macro';
import Processos from '../pages/gerenciamento/processos';
import ValorPorCargo from '../pages/gerenciamento/valor-por-cargo';
import Fabricas from '../pages/Fabricas';
import Mineradoras from '../pages/Mineradoras';
import NaoConformidades from '../pages/nao-conformidades';
import Atividade from '../pages/Atividade';
import AssistenteIA from '../pages/AssistenteIA';

interface TaskAppProps {
  token?: string;
  user?: any;
  onNavigate?: (path: string) => void;
}

// Context para compartilhar dados SSO
const SSOContext = React.createContext<{
  token?: string;
  user?: any;
  onNavigate?: (path: string) => void;
}>({});

export const useSSO = () => React.useContext(SSOContext);

const TaskApp: React.FC<TaskAppProps> = ({ token, user, onNavigate }) => {
  // Store token and user in localStorage for API calls
  useEffect(() => {
    if (token) {
      // Store with standard key for compatibility with existing services
      localStorage.setItem('authToken', token);
      // Also store user ID if available for legacy components
      if (user?.id) {
        localStorage.setItem('userId', user.id);
      }
    }
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }, [token, user]);

  return (
    <SSOContext.Provider value={{ token, user, onNavigate }}>
      <div className="h-full w-full">
        <Routes>
          {/* Dashboard Principal */}
          <Route path="/" element={<Dashboard />} />
          
          
          {/* Obras e Projetos */}
          <Route path="/obras" element={<Obras />} />
          <Route path="/obra/:obraId" element={<OrdensServico />} />
          <Route path="/obra/:obraId/os/:osId" element={<Atividades />} />
          <Route path="/atividade/:id" element={<Atividade />} />
          
          {/* Registro de Ponto */}
          <Route path="/registro-ponto" element={<RegistroPonto />} />
          
          {/* Gerenciamento */}
          <Route path="/gerenciamento/colaboradores" element={<Colaboradores />} />
          <Route path="/gerenciamento/tarefas-macro" element={<TarefasMacro />} />
          <Route path="/gerenciamento/processos" element={<Processos />} />
          <Route path="/gerenciamento/valor-por-cargo" element={<ValorPorCargo />} />
          
          {/* Fábricas e Mineradoras */}
          <Route path="/fabricas" element={<Fabricas />} />
          <Route path="/mineradoras" element={<Mineradoras />} />
          
          {/* Não Conformidades */}
          <Route path="/nao-conformidades" element={<NaoConformidades />} />
          
          {/* Assistente IA */}
          <Route path="/assistente-ia" element={<AssistenteIA />} />
          
          {/* Rota padrão */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
        
        <Toaster />
      </div>
    </SSOContext.Provider>
  );
};

export default TaskApp;
