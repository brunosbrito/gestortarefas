import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <CardTitle className="text-2xl">Algo deu errado</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Ocorreu um erro inesperado ao carregar este módulo. Por favor, tente
                recarregar a página.
              </p>

              {this.state.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-mono text-red-800">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="p-4 bg-gray-50 border rounded-lg">
                  <summary className="cursor-pointer font-medium text-sm mb-2">
                    Stack Trace (Dev Only)
                  </summary>
                  <pre className="text-xs overflow-auto max-h-96 font-mono text-gray-700">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Página
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/comercial')}
                  className="w-full"
                >
                  Voltar ao Dashboard
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Se o problema persistir, entre em contato com o suporte técnico.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
