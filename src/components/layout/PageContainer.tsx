import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageContainerProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Container padrão para páginas do sistema
 *
 * IMPORTANTE: NÃO usa h-screen para não quebrar o scroll do Layout
 * Fornece estados de loading e erro consistentes
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  loading = false,
  error = null,
  onRetry,
}) => {
  // Estado de loading com skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="h-32 bg-muted rounded-3xl"></div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl"></div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="h-96 bg-muted rounded-xl"></div>
      </div>
    );
  }

  // Estado de erro com opção de retry
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Erro ao carregar dados
                </h3>
                <p className="text-sm text-muted-foreground">
                  {error.message || 'Ocorreu um erro inesperado ao carregar as informações.'}
                </p>
              </div>

              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  className="w-full"
                >
                  Tentar Novamente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado normal - renderiza conteúdo
  return <div className="space-y-6">{children}</div>;
};

/**
 * Skeleton específico para páginas de lista
 */
export const ListPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="h-10 w-32 bg-muted rounded"></div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted rounded"></div>
        ))}
      </div>

      {/* Tabela */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted rounded"></div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton específico para páginas de dashboard
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header gradient */}
      <div className="h-40 bg-gradient-to-r from-muted to-muted/50 rounded-3xl"></div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted rounded-xl"></div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-xl"></div>
        <div className="h-80 bg-muted rounded-xl"></div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-muted rounded-xl"></div>
        <div className="h-96 bg-muted rounded-xl"></div>
      </div>
    </div>
  );
};
