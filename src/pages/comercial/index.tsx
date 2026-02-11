import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load das páginas
const Dashboard = lazy(() => import('./Dashboard'));
const OrcamentosList = lazy(() => import('./orcamentos'));
const NovoOrcamento = lazy(() => import('./orcamentos/novo'));
const OrcamentoDetalhes = lazy(() => import('./orcamentos/[id]'));
const PropostasList = lazy(() => import('./propostas'));
const ConfiguracaoSalarial = lazy(() => import('./configuracao/ConfiguracaoSalarial'));
const TabelaCargos = lazy(() => import('./configuracao/TabelaCargos'));

// Cadastros - FASE 3
const TabelaConsumiveis = lazy(() => import('./cadastros/TabelaConsumiveis'));
const TabelaMobilizacao = lazy(() => import('./cadastros/TabelaMobilizacao'));

// Templates - FASE 5
const TemplatesPage = lazy(() => import('./orcamentos/templates'));

// Lista de Corte - FASE 6
const ListaCortePage = lazy(() => import('./orcamentos/lista-corte'));

// Relatórios - FASE 9
const RelatoriosPage = lazy(() => import('./Relatorios'));

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
          <Route path="dashboard" element={<Dashboard />} />

          {/* Submódulo ORÇAMENTOS */}
          <Route path="orcamentos">
            <Route index element={<OrcamentosList />} />
            <Route path="novo" element={<NovoOrcamento />} />
            <Route path=":id" element={<OrcamentoDetalhes />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="lista-corte" element={<ListaCortePage />} />
          </Route>
          <Route path="propostas" element={<PropostasList />} />

          {/* Submódulo CADASTROS - Configuração */}
          <Route path="configuracao">
            <Route path="salarial" element={<ConfiguracaoSalarial />} />
            <Route path="cargos" element={<TabelaCargos />} />
          </Route>

          {/* Submódulo CADASTROS - Novos (FASE 3) */}
          <Route path="cadastros">
            <Route path="consumiveis" element={<TabelaConsumiveis />} />
            <Route path="mobilizacao" element={<TabelaMobilizacao />} />
            <Route path="desmobilizacao" element={<TabelaMobilizacao />} />
          </Route>

          {/* Relatórios (FASE 9) */}
          <Route path="relatorios" element={<RelatoriosPage />} />

          <Route path="*" element={<Navigate to="/comercial" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Comercial;
