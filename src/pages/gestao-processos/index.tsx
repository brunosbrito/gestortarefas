import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Lazy loading das páginas principais
const Dashboard = lazy(() => import('./Dashboard'));
const FilaAprovacao = lazy(() => import('./FilaAprovacao'));

// Lazy loading - Priorização
const PriorizacaoList = lazy(() => import('./priorizacao/index'));

// Lazy loading - Desdobramento
const DesdobramentoList = lazy(() => import('./desdobramento/index'));

// Lazy loading - PDCA
const PDCAList = lazy(() => import('./pdca/index'));
const PDCADetail = lazy(() => import('./pdca/[id]/index'));

// Lazy loading - Metas SMART
const MetasList = lazy(() => import('./metas/index'));
const MetasDetail = lazy(() => import('./metas/[id]/index'));

// Lazy loading - Planos de Ação 5W2H
const PlanosAcaoList = lazy(() => import('./planos-acao/index'));
const PlanosAcaoDetail = lazy(() => import('./planos-acao/[id]/index'));

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

/**
 * Router do módulo de Gestão de Processos
 *
 * Rotas disponíveis:
 * - /gestao-processos - Dashboard principal
 * - /gestao-processos/aprovacao - Fila de aprovação
 * - /gestao-processos/priorizacao - Priorização de Problemas (GUT)
 * - /gestao-processos/desdobramento - Desdobramento de Problemas
 * - /gestao-processos/pdca - Lista de PDCAs
 * - /gestao-processos/pdca/:id - Detalhe do PDCA
 * - /gestao-processos/metas - Lista de Metas SMART
 * - /gestao-processos/metas/:id - Detalhe da Meta
 * - /gestao-processos/planos-acao - Lista de Planos 5W2H
 * - /gestao-processos/planos-acao/:id - Detalhe do Plano
 */
export default function GestaoProcessosRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Dashboard Principal */}
        <Route index element={<Dashboard />} />

        {/* Fila de Aprovação */}
        <Route path="aprovacao" element={<FilaAprovacao />} />

        {/* Priorização de Problemas (Matriz GUT) */}
        <Route path="priorizacao" element={<PriorizacaoList />} />

        {/* Desdobramento de Problemas */}
        <Route path="desdobramento" element={<DesdobramentoList />} />

        {/* PDCA */}
        <Route path="pdca">
          <Route index element={<PDCAList />} />
          <Route path=":id" element={<PDCADetail />} />
        </Route>

        {/* Metas SMART */}
        <Route path="metas">
          <Route index element={<MetasList />} />
          <Route path=":id" element={<MetasDetail />} />
        </Route>

        {/* Planos de Ação 5W2H */}
        <Route path="planos-acao">
          <Route index element={<PlanosAcaoList />} />
          <Route path=":id" element={<PlanosAcaoDetail />} />
        </Route>

        {/* Redirect inválidos para dashboard */}
        <Route path="*" element={<Navigate to="/gestao-processos" replace />} />
      </Routes>
    </Suspense>
  );
}
