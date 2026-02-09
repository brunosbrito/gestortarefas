import { ReactNode } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GenericListPageProps<T> {
  // Header
  title: string;
  subtitle: string;
  icon: ReactNode;
  backUrl?: string;

  // Data
  items: T[];

  // Actions
  onCreateNew?: () => void;
  createButtonText?: string;

  // Children (será a tabela customizada)
  children: ReactNode;
}

function GenericListPage<T>({
  title,
  subtitle,
  icon,
  backUrl = '/comercial',
  items,
  onCreateNew,
  createButtonText = 'Novo Item',
  children,
}: GenericListPageProps<T>) {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6 min-h-0 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(backUrl)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {icon}
                {title}
              </h1>
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo customizado (filtros + tabela) */}
        {children}
      </div>
    </Layout>
  );
}

export default GenericListPage;
