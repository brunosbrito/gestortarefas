import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Index';
import Users from './pages/Users';
import Obras from './pages/Obras';
import OrdensServico from './pages/obras/os';
import Atividades from './pages/obras/os/atividades';
import RegistroPonto from './pages/RegistroPonto';
import { Toaster } from '@/components/ui/toaster';
import Login from './pages/Login';
import Colaboradores from './pages/gerenciamento/colaboradores';
import TarefasMacro from './pages/gerenciamento/tarefas-macro';
import Processos from './pages/gerenciamento/processos';

function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/obras" element={<Obras />} />
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
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;