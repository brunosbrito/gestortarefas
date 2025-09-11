
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Index';
import Obras from './pages/Obras';
import OrdensServico from './pages/obras/os';
import Atividades from './pages/obras/os/atividades';
import RegistroPonto from './pages/RegistroPonto';
import { Toaster } from '@/components/ui/toaster';
import Login from './pages/Login';
import Colaboradores from './pages/gerenciamento/colaboradores';
import TarefasMacro from './pages/gerenciamento/tarefas-macro';
import Processos from './pages/gerenciamento/processos';
import ValorPorCargo from './pages/gerenciamento/valor-por-cargo';
import Fabricas from './pages/Fabricas';
import Mineradoras from './pages/Mineradoras';
import NaoConformidades from './pages/nao-conformidades';
import Atividade from './pages/Atividade';
import AssistenteIA from './pages/AssistenteIA';
import { ssoService } from './services/SSOService';

function App() {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize SSO on app startup
  useEffect(() => {
    const initializeSSO = async () => {
      try {
        console.log('🚀 Initializing gestortarefas with SSO...');
        
        // Initialize SSO service (checks localStorage and postMessage)
        const ssoData = await ssoService.initialize();
        
        if (ssoData) {
          console.log('✅ SSO Authentication successful:', {
            hasToken: !!ssoData.token,
            user: ssoData.user?.username || ssoData.user?.email,
            roles: ssoData.user?.roles,
            expiresAt: new Date(ssoData.expiresAt).toISOString()
          });
          
          setIsAuthenticated(true);
          
          // Setup ongoing postMessage listener
          ssoService.setupPostMessageListener();
          
          // Navigate to dashboard if currently on login page
          if (window.location.pathname === '/' || window.location.pathname === '/login') {
            window.location.replace('/dashboard');
          }
        } else {
          console.log('❌ No SSO authentication available - showing login');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing SSO:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initializeSSO();

    // Listen for SSO changes
    const unsubscribe = ssoService.subscribe((ssoData) => {
      setIsAuthenticated(!!ssoData);
      if (!ssoData) {
        console.log('🔓 SSO session expired or cleared');
        window.location.replace('/');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Show loading while checking authentication
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/atividade" element={<Atividade />} />
        <Route path="/assistente-ia" element={<AssistenteIA />} />
        <Route path="/programacao" element={<Atividade />} />
        <Route path="/obras" element={<Obras />} />
        <Route path="/fabricas" element={<Fabricas />} />
        <Route path="/mineradoras" element={<Mineradoras />} />
        <Route path="/nao-conformidades" element={<NaoConformidades />} />
        <Route path="/obras/:projectId/os" element={<OrdensServico />} />
        <Route
          path="/obras/:projectId/os/:serviceOrderId/atividades"
          element={<Atividades />}
        />
        <Route path="/ponto" element={<RegistroPonto />} />
        <Route
          path="/gerenciamento/colaboradores"
          element={<Colaboradores />}
        />
        <Route path="/gerenciamento/tarefas-macro" element={<TarefasMacro />} />
        <Route path="/gerenciamento/processos" element={<Processos />} />
        <Route path="/gerenciamento/valor-por-cargo" element={<ValorPorCargo />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
