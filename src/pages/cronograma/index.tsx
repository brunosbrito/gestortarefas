/**
 * Dashboard do Módulo de Cronogramas
 * Sistema: Gestor Master - GMX Soluções Industriais
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CronogramaService from '@/services/CronogramaService';
import type { Cronograma } from '@/interfaces/CronogramaInterfaces';
import { useToast } from '@/hooks/use-toast';
import { NovoCronogramaDialog } from './NovoCronogramaDialog';

export default function DashboardCronogramas() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadCronogramas();
  }, []);

  const loadCronogramas = async () => {
    setLoading(true);
    try {
      const data = await CronogramaService.getAll();
      setCronogramas(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar cronogramas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejamento':
        return 'bg-gray-100 text-gray-700 border-l-gray-400';
      case 'ativo':
        return 'bg-blue-50 text-blue-700 border-l-blue-500';
      case 'pausado':
        return 'bg-yellow-50 text-yellow-700 border-l-yellow-500';
      case 'concluido':
        return 'bg-green-50 text-green-700 border-l-green-500';
      case 'cancelado':
        return 'bg-red-50 text-red-700 border-l-red-500';
      default:
        return 'bg-gray-50 text-gray-700 border-l-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planejamento: 'Planejamento',
      ativo: 'Ativo',
      pausado: 'Pausado',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando cronogramas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-8 h-8" />
            Cronogramas
          </h1>
          <p className="text-muted-foreground mt-1">
            Planejamento e controle de cronogramas de projetos
          </p>
        </div>
        <Button size="lg" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cronograma
        </Button>
      </div>

      {/* Lista de Cronogramas */}
      {cronogramas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum cronograma cadastrado
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Crie seu primeiro cronograma para começar
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Cronograma
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cronogramas.map((cronograma) => (
            <Card
              key={cronograma.id}
              className={`border-l-4 hover:shadow-lg transition-shadow cursor-pointer ${getStatusColor(cronograma.status)}`}
              onClick={() => navigate(`/cronograma/${cronograma.id}/gantt`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{cronograma.nome}</CardTitle>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-white/50">
                    {getStatusLabel(cronograma.status)}
                  </span>
                </div>
                <CardDescription className="line-clamp-2">
                  {cronograma.descricao || 'Sem descrição'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Obra:</span>
                  <span className="font-medium">{cronograma.project?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Período:</span>
                  <span className="font-medium">
                    {new Date(cronograma.dataInicio).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(cronograma.dataFim).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{cronograma.progressoGeral}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${cronograma.progressoGeral}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Novo Cronograma */}
      <NovoCronogramaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaveSuccess={loadCronogramas}
      />
    </div>
  );
}
