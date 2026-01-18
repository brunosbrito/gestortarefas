import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ErrorBoundary } from '@/components/comercial/ErrorBoundary';

// Lazy load das páginas
const Dashboard = lazy(() => import('./Dashboard'));
const AIChat = lazy(() => import('./ai-chat'));
const OrcamentosList = lazy(() => import('./orcamentos'));
const NovoOrcamento = lazy(() => import('./orcamentos/novo'));
const EditarOrcamento = lazy(() => import('./orcamentos/[id]'));
const PropostasList = lazy(() => import('./propostas'));
const ClientesList = lazy(() => import('./clientes'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const Comercial = () => {
  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="ai-chat" element={<AIChat />} />
            <Route path="orcamentos">
              <Route index element={<OrcamentosList />} />
              <Route path="novo" element={<NovoOrcamento />} />
              <Route path=":id" element={<EditarOrcamento />} />
            </Route>
            <Route path="propostas" element={<PropostasList />} />
            <Route path="clientes" element={<ClientesList />} />
            <Route path="*" element={<Navigate to="/comercial" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
};

export default Comercial;
