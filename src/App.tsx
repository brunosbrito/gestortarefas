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
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/obras/:obraId" element={<Obras />} />
        <Route path="/obras/:obraId/os" element={<OrdensServico />} />
        <Route path="/obras/:obraId/os/:osId/atividades" element={<Atividades />} />
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