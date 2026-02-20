import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Captura erros não tratados em componentes filhos e exibe UI de fallback
 * ao invés de quebrar o app inteiro.
 *
 * Uso:
 * ```tsx
 * <ErrorBoundary>
 *   <SeuComponente />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);

    // Aqui você pode integrar com serviço de error tracking
    // Ex: Sentry.captureException(error, { extra: errorInfo });

    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleGoHome = () => {
    this.handleReset();
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      // Se forneceu fallback customizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de erro padrão
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full border-destructive/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="rounded-full bg-destructive/10 p-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    Oops! Algo deu errado
                  </h1>
                  <p className="text-muted-foreground">
                    Ocorreu um erro inesperado na aplicação
                  </p>
                </div>

                {/* Error Details (dev mode) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-left">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      Detalhes do erro (modo desenvolvimento)
                    </summary>
                    <div className="mt-4 p-4 bg-muted rounded-lg overflow-auto">
                      <p className="text-xs font-mono text-destructive">
                        {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <pre className="mt-2 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tentar Novamente
                  </Button>

                  <Button
                    onClick={this.handleGoHome}
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Ir para Dashboard
                  </Button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-muted-foreground">
                  Se o problema persistir, entre em contato com o suporte
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook helper para usar Error Boundary de forma funcional
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};
