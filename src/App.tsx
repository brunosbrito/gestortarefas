import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

// Login carregado imediatamente (página inicial)
import Login from './pages/Login';

// Lazy loading para todas as outras páginas (code splitting)
const Dashboard = lazy(() => import('./pages/Index'));
const Users = lazy(() => import('./pages/Users'));
const Obras = lazy(() => import('./pages/Obras'));
const OrdensServico = lazy(() => import('./pages/obras/os'));
const Atividades = lazy(() => import('./pages/obras/os/atividades'));
const RegistroPonto = lazy(() => import('./pages/RegistroPonto'));
const Colaboradores = lazy(() => import('./pages/gerenciamento/colaboradores'));
const TarefasMacro = lazy(() => import('./pages/gerenciamento/tarefas-macro'));
const Processos = lazy(() => import('./pages/gerenciamento/processos'));
const ValorPorCargo = lazy(() => import('./pages/gerenciamento/valor-por-cargo'));
const Fabricas = lazy(() => import('./pages/Fabricas'));
const Mineradoras = lazy(() => import('./pages/Mineradoras'));
const NaoConformidades = lazy(() => import('./pages/nao-conformidades'));
const Atividade = lazy(() => import('./pages/Atividade'));
const AssistenteIA = lazy(() => import('./pages/AssistenteIA'));
const EmConstrucao = lazy(() => import('./pages/EmConstrucao'));
const DashboardQualidade = lazy(() => import('./pages/qualidade'));
const AssistenteIAQualidade = lazy(() => import('./pages/qualidade/assistente-ia'));
const AcoesCorretivas = lazy(() => import('./pages/qualidade/acoes-corretivas'));
const Inspecoes = lazy(() => import('./pages/qualidade/inspecoes'));
const PlanosInspecao = lazy(() => import('./pages/qualidade/planos-inspecao'));
const Certificados = lazy(() => import('./pages/qualidade/certificados'));
const Calibracao = lazy(() => import('./pages/qualidade/calibracao'));
const Databook = lazy(() => import('./pages/qualidade/databook'));
const Suprimentos = lazy(() => import('./pages/suprimentos'));

// Módulo Cronogramas
const DashboardCronogramas = lazy(() => import('./pages/cronograma'));
const GanttView = lazy(() => import('./pages/cronograma/gantt'));
const GanttTestVanilla = lazy(() => import('./pages/cronograma/gantt/GanttTestVanilla'));

// Módulo Comercial
const Comercial = lazy(() => import('./pages/comercial'));

// Módulo Gestão de Processos
const GestaoProcessos = lazy(() => import('./pages/gestao-processos'));

// Módulo PCP - Pipeline de Projetos (FASE 4)
const PipelineProjetos = lazy(() => import('./pages/pcp/pipeline'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router basename="/">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/atividade" element={<Atividade />} />
          <Route path="/assistente-ia" element={<AssistenteIA />} />
          <Route path="/programacao" element={<Atividade />} />
          <Route path="/users" element={<Users />} />
          <Route path="/obras" element={<Obras />} />
          <Route path="/fabricas" element={<Fabricas />} />
          <Route path="/mineradoras" element={<Mineradoras />} />
          <Route path="/nao-conformidades" element={<NaoConformidades />} />
          <Route path="/qualidade" element={<DashboardQualidade />} />
          <Route path="/qualidade/assistente-ia" element={<AssistenteIAQualidade />} />
          <Route path="/qualidade/acoes-corretivas" element={<AcoesCorretivas />} />
          <Route path="/qualidade/inspecoes" element={<Inspecoes />} />
          <Route path="/qualidade/planos-inspecao" element={<PlanosInspecao />} />
          <Route path="/qualidade/certificados" element={<Certificados />} />
          <Route path="/qualidade/calibracao" element={<Calibracao />} />
          <Route path="/qualidade/indicadores" element={<DashboardQualidade />} />
          <Route path="/qualidade/databook" element={<Databook />} />
          <Route path="/suprimentos/*" element={<Suprimentos />} />
          <Route path="/cronograma" element={<DashboardCronogramas />} />
          <Route path="/cronograma/:id/gantt" element={<GanttView />} />
          <Route path="/cronograma/test-vanilla" element={<GanttTestVanilla />} />
          <Route path="/comercial/*" element={<Comercial />} />
          <Route path="/gestao-processos/*" element={<GestaoProcessos />} />
          <Route path="/pcp/pipeline" element={<PipelineProjetos />} />
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
      </Suspense>
      <Toaster />
    </Router>
  );
}

export default App;
