/**
 * Dialog para Importar Atividades de OS para o Cronograma
 * Sistema: Gestor Master - GMX Soluções Industriais
 * Módulo: Cronogramas
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { ServiceOrder } from '@/interfaces/ServiceOrderInterface';
import { Activity } from '@/interfaces/AtividadeInterface';
import { getServiceOrderByProjectId } from '@/services/ServiceOrderService';
import { getActivitiesByServiceOrderId } from '@/services/ActivityService';
import TarefaCronogramaService from '@/services/TarefaCronogramaService';
import type { ImportacaoAtividades } from '@/interfaces/CronogramaInterfaces';

interface ImportarAtividadesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cronogramaId: string;
  projectId: string;
  onImportSuccess?: () => void;
}

export function ImportarAtividadesDialog({
  open,
  onOpenChange,
  cronogramaId,
  projectId,
  onImportSuccess,
}: ImportarAtividadesDialogProps) {
  const { toast } = useToast();

  const [ordens, setOrdens] = useState<ServiceOrder[]>([]);
  const [atividades, setAtividades] = useState<Activity[]>([]);
  const [selectedOS, setSelectedOS] = useState<string>('');
  const [selectedAtividades, setSelectedAtividades] = useState<number[]>([]);
  const [isLoadingOS, setIsLoadingOS] = useState(false);
  const [isLoadingAtividades, setIsLoadingAtividades] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Configurações
  const [criarDependencias, setCriarDependencias] = useState(true);
  const [mapearResponsaveis, setMapearResponsaveis] = useState(true);
  const [sincronizarProgresso, setSincronizarProgresso] = useState(true);

  useEffect(() => {
    if (open && projectId) {
      loadOrdensServico();
    }
  }, [open, projectId]);

  const loadOrdensServico = async () => {
    setIsLoadingOS(true);
    try {
      const data = await getServiceOrderByProjectId(projectId);
      setOrdens(data);
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar ordens de serviço',
      });
    } finally {
      setIsLoadingOS(false);
    }
  };

  const loadAtividades = async (serviceOrderId: string) => {
    setIsLoadingAtividades(true);
    setAtividades([]);
    setSelectedAtividades([]);

    try {
      const data = await getActivitiesByServiceOrderId(serviceOrderId);
      setAtividades(data);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar atividades',
      });
    } finally {
      setIsLoadingAtividades(false);
    }
  };

  const handleOSChange = (value: string) => {
    setSelectedOS(value);
    if (value) {
      loadAtividades(value);
    }
  };

  const toggleAtividade = (atividadeId: number) => {
    setSelectedAtividades((prev) =>
      prev.includes(atividadeId)
        ? prev.filter((id) => id !== atividadeId)
        : [...prev, atividadeId]
    );
  };

  const toggleAll = () => {
    if (selectedAtividades.length === atividades.length) {
      setSelectedAtividades([]);
    } else {
      setSelectedAtividades(atividades.map((a) => a.id));
    }
  };

  const handleImport = async () => {
    if (selectedAtividades.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhuma atividade selecionada',
        description: 'Selecione pelo menos uma atividade para importar',
      });
      return;
    }

    setIsImporting(true);
    try {
      const importData: ImportacaoAtividades = {
        cronogramaId,
        projectId,
        serviceOrderIds: [parseInt(selectedOS)],
        atividadeIds: selectedAtividades, // Enviar IDs das atividades selecionadas
        configuracao: {
          criarDependencias,
          mapearResponsaveis,
          sincronizarProgresso,
        },
      };

      const resultado = await TarefaCronogramaService.importarAtividades(importData);

      toast({
        title: 'Importação concluída',
        description: `${resultado.tarefasImportadas} tarefas importadas com sucesso`,
      });

      onImportSuccess?.();
      onOpenChange(false);

      // Reset
      setSelectedOS('');
      setAtividades([]);
      setSelectedAtividades([]);
    } catch (error) {
      console.error('Erro ao importar atividades:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao importar',
        description: 'Ocorreu um erro ao importar as atividades. Tente novamente.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Pendente': 'bg-gray-100 text-gray-700',
      'Fazendo': 'bg-blue-100 text-blue-700',
      'Concluída': 'bg-green-100 text-green-700',
      'Cancelada': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Importar Atividades
          </DialogTitle>
          <DialogDescription>
            Selecione as atividades de uma Ordem de Serviço para importar para o cronograma
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selecionar OS */}
          <div className="space-y-2">
            <Label>
              Ordem de Serviço <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedOS} onValueChange={handleOSChange} disabled={isLoadingOS}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma OS" />
              </SelectTrigger>
              <SelectContent>
                {ordens.length === 0 ? (
                  <SelectItem value="0" disabled>
                    Nenhuma OS disponível
                  </SelectItem>
                ) : (
                  ordens.map((os) => (
                    <SelectItem key={os.id} value={os.id.toString()}>
                      OS #{os.id} - {os.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Lista de Atividades */}
          {selectedOS && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>
                    Atividades ({selectedAtividades.length}/{atividades.length} selecionadas)
                  </Label>
                  {atividades.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleAll}
                    >
                      {selectedAtividades.length === atividades.length
                        ? 'Desmarcar Todas'
                        : 'Selecionar Todas'}
                    </Button>
                  )}
                </div>

                {isLoadingAtividades ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : atividades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma atividade encontrada nesta OS
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                    {atividades.map((atividade) => (
                      <div
                        key={atividade.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleAtividade(atividade.id)}
                      >
                        <Checkbox
                          checked={selectedAtividades.includes(atividade.id)}
                          onCheckedChange={() => toggleAtividade(atividade.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{atividade.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusBadge(atividade.status)} variant="outline">
                              {atividade.status}
                            </Badge>
                            {atividade.estimatedTime && (
                              <span className="text-xs text-muted-foreground">
                                {atividade.estimatedTime}h estimadas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Configurações */}
              <div className="space-y-3">
                <Label>Configurações de Importação</Label>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="criar-dependencias"
                      checked={criarDependencias}
                      onCheckedChange={(checked) => setCriarDependencias(checked as boolean)}
                    />
                    <div className="space-y-1 leading-none">
                      <label
                        htmlFor="criar-dependencias"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Criar dependências sequenciais
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Cada tarefa dependerá da anterior (Fim-Início)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="mapear-responsaveis"
                      checked={mapearResponsaveis}
                      onCheckedChange={(checked) => setMapearResponsaveis(checked as boolean)}
                    />
                    <div className="space-y-1 leading-none">
                      <label
                        htmlFor="mapear-responsaveis"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Mapear responsáveis
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Atribuir colaboradores das atividades às tarefas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="sincronizar-progresso"
                      checked={sincronizarProgresso}
                      onCheckedChange={(checked) => setSincronizarProgresso(checked as boolean)}
                    />
                    <div className="space-y-1 leading-none">
                      <label
                        htmlFor="sincronizar-progresso"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sincronizar progresso automaticamente
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Manter progresso atualizado com as atividades reais
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedOS || selectedAtividades.length === 0 || isImporting}
            >
              {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Importar {selectedAtividades.length > 0 && `(${selectedAtividades.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
