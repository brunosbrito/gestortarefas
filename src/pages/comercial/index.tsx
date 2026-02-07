import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load das páginas
const Dashboard = lazy(() => import('./Dashboard'));
const OrcamentosList = lazy(() => import('./orcamentos'));
const NovoOrcamento = lazy(() => import('./orcamentos/novo'));
const EditarOrcamento = lazy(() => import('./orcamentos/[id]'));
const PropostasList = lazy(() => import('./propostas'));

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
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="orcamentos">
            <Route index element={<OrcamentosList />} />
            <Route path="novo" element={<NovoOrcamento />} />
            <Route path=":id" element={<EditarOrcamento />} />
          </Route>
          <Route path="propostas" element={<PropostasList />} />
          <Route path="*" element={<Navigate to="/comercial" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Comercial;
