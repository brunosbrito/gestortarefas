import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ErrorBoundary } from '@/components/suprimentos/ErrorBoundary';

const Dashboard = lazy(() => import('./Dashboard'));
const Contratos = lazy(() => import('./contratos'));
const NovoContrato = lazy(() => import('./contratos/novo'));
const DetalhesContrato = lazy(() => import('./contratos/[id]'));
const EditarContratoForm = lazy(() => import('./contratos/[id]/editar'));
const NotasFiscais = lazy(() => import('./notas-fiscais'));
const ImportarNF = lazy(() => import('./notas-fiscais/importar'));
const OrcadoRealizado = lazy(() => import('./orcado-realizado'));
const CentrosCusto = lazy(() => import('./centros-custo'));
const Compras = lazy(() => import('./compras'));
const Relatorios = lazy(() => import('./relatorios'));
const Analytics = lazy(() => import('./analytics'));
const Metas = lazy(() => import('./metas'));
const Contas = lazy(() => import('./contas'));
const OneDrive = lazy(() => import('./onedrive'));
const AIChat = lazy(() => import('./ai-chat'));

// Compras
const Requisicoes = lazy(() => import('./compras/requisicoes'));
const Cotacoes = lazy(() => import('./compras/cotacoes'));

// Logística
const LogisticaDashboard = lazy(() => import('./logistica/Dashboard'));
const Veiculos = lazy(() => import('./logistica/veiculos'));
const Motoristas = lazy(() => import('./logistica/motoristas'));
const Transportadoras = lazy(() => import('./logistica/transportadoras'));
const TiposManutencao = lazy(() => import('./logistica/tipos-manutencao'));
const FornecedoresServicos = lazy(() => import('./logistica/fornecedores-servicos'));
const Rotas = lazy(() => import('./logistica/rotas'));
const ChecklistsSaida = lazy(() => import('./logistica/checklists-saida'));
const ChecklistsRetorno = lazy(() => import('./logistica/checklists-retorno'));
const Manutencoes = lazy(() => import('./logistica/manutencoes'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const Suprimentos = () => {
  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route index element={<Dashboard />} />

          {/* Contratos de Suprimentos */}
          <Route path="contratos">
            <Route index element={<Contratos />} />
            <Route path="novo" element={<NovoContrato />} />
            <Route path=":id" element={<DetalhesContrato />} />
            <Route path=":id/editar" element={<EditarContratoForm />} />
          </Route>

          {/* Notas Fiscais */}
          <Route path="notas-fiscais">
            <Route index element={<NotasFiscais />} />
            <Route path="importar" element={<ImportarNF />} />
          </Route>

          {/* Outras rotas */}
          <Route path="orcado-realizado" element={<OrcadoRealizado />} />
          <Route path="centros-custo" element={<CentrosCusto />} />
          <Route path="compras" element={<Compras />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="metas" element={<Metas />} />
          <Route path="contas" element={<Contas />} />
          <Route path="onedrive" element={<OneDrive />} />
          <Route path="ai-chat" element={<AIChat />} />

          {/* Compras */}
          <Route path="compras">
            <Route path="requisicoes" element={<Requisicoes />} />
            <Route path="cotacoes" element={<Cotacoes />} />
          </Route>

          {/* Logística */}
          <Route path="logistica">
            <Route index element={<LogisticaDashboard />} />
            <Route path="veiculos" element={<Veiculos />} />
            <Route path="motoristas" element={<Motoristas />} />
            <Route path="transportadoras" element={<Transportadoras />} />
            <Route path="tipos-manutencao" element={<TiposManutencao />} />
            <Route path="fornecedores-servicos" element={<FornecedoresServicos />} />
            <Route path="rotas" element={<Rotas />} />
            <Route path="checklists-saida" element={<ChecklistsSaida />} />
            <Route path="checklists-retorno" element={<ChecklistsRetorno />} />
            <Route path="manutencoes" element={<Manutencoes />} />
          </Route>

          <Route path="*" element={<Navigate to="/suprimentos" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
};

export default Suprimentos;
