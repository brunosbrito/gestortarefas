import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HelpCircle,
  Lightbulb,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  MapPin,
  FileText,
} from 'lucide-react';
import { AnaliseAcaoCorretiva } from '@/interfaces/QualidadeInterfaces';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AnaliseAcaoCorretivaService from '@/services/AnaliseAcaoCorretivaService';
import { useToast } from '@/hooks/use-toast';

interface DetalhesAnaliseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analise: AnaliseAcaoCorretiva | null;
  onUpdate?: () => void;
}

export const DetalhesAnaliseDialog = ({
  open,
  onOpenChange,
  analise,
  onUpdate,
}: DetalhesAnaliseDialogProps) => {
  const { toast } = useToast();
  const [updatingAcao, setUpdatingAcao] = useState<string | null>(null);

  if (!analise) return null;

  const handleStatusChange = async (acaoId: string, novoStatus: string) => {
    try {
      setUpdatingAcao(acaoId);
      await AnaliseAcaoCorretivaService.updateStatusAcao(
        analise.id,
        acaoId,
        novoStatus as any
      );
      toast({
        title: 'Status atualizado',
        description: 'O status da ação foi atualizado com sucesso',
      });
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingAcao(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pendente: { variant: 'secondary' as const, label: 'Pendente', icon: AlertCircle, color: 'text-yellow-600' },
      em_andamento: { variant: 'default' as const, label: 'Em Andamento', icon: Clock, color: 'text-blue-600' },
      concluida: { variant: 'outline' as const, label: 'Concluída', icon: CheckCircle2, color: 'text-green-600' },
      verificada: { variant: 'default' as const, label: 'Verificada', icon: CheckCircle2, color: 'text-primary' },
    };

    const { variant, label, icon: Icon, color } = config[status as keyof typeof config] || config.pendente;

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className={`w-3 h-3 ${color}`} />
        {label}
      </Badge>
    );
  };

  const contarAcoesPorStatus = () => {
    const total = analise.acoes?.length || 0;
    const pendentes = analise.acoes?.filter(a => a.status === 'pendente').length || 0;
    const emAndamento = analise.acoes?.filter(a => a.status === 'em_andamento').length || 0;
    const concluidas = analise.acoes?.filter(a => a.status === 'concluida' || a.status === 'verificada').length || 0;
    const progresso = total > 0 ? (concluidas / total) * 100 : 0;

    return { total, pendentes, emAndamento, concluidas, progresso };
  };

  const { total, pendentes, emAndamento, concluidas, progresso } = contarAcoesPorStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Detalhes da Análise
          </DialogTitle>
          <DialogDescription>
            RNC #{analise.rnc?.code} - {analise.rnc?.description}
          </DialogDescription>
        </DialogHeader>

        {/* Resumo Geral */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Obra</div>
                <div className="font-medium">{analise.rnc?.project?.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Método de Análise</div>
                <div className="font-medium">
                  {analise.metodoAnalise === 'cinco_porques' && '5 Porquês'}
                  {analise.metodoAnalise === 'ishikawa' && 'Diagrama de Ishikawa'}
                  {analise.metodoAnalise === 'ambos' && 'Ambos (5 Porquês + Ishikawa)'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Data da Análise</div>
                <div className="font-medium">
                  {format(new Date(analise.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Progresso Geral</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                  <span className="font-medium text-sm">{Math.round(progresso)}%</span>
                </div>
              </div>
            </div>

            {/* Contadores */}
            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">Total Ações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendentes}</div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{emAndamento}</div>
                <div className="text-xs text-muted-foreground">Em Andamento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{concluidas}</div>
                <div className="text-xs text-muted-foreground">Concluídas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs com Análise e Ações */}
        <Tabs defaultValue="analise" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analise">Análise de Causa Raiz</TabsTrigger>
            <TabsTrigger value="acoes">Plano de Ação ({total})</TabsTrigger>
          </TabsList>

          {/* Tab: Análise */}
          <TabsContent value="analise" className="space-y-6 mt-6">
            {/* Causa Raiz */}
            <Card className="border-2 border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Causa Raiz Identificada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{analise.causaRaizIdentificada}</p>
              </CardContent>
            </Card>

            {/* 5 Porquês */}
            {analise.cincoPorques && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                    Análise dos 5 Porquês
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground mb-1">Problema:</div>
                    <p>{analise.cincoPorques.problema}</p>
                  </div>

                  {[1, 2, 3, 4, 5].map((n) => {
                    const porque = analise.cincoPorques?.[`porque${n}` as keyof typeof analise.cincoPorques];
                    if (!porque) return null;

                    return (
                      <div key={n} className="border-l-4 border-l-blue-500 pl-4">
                        <div className="text-sm font-semibold text-blue-600 mb-1">
                          {n}º Por quê?
                        </div>
                        <p className="text-sm">{porque}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Ishikawa */}
            {analise.ishikawa && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Diagrama de Ishikawa (6M's)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground mb-1">Problema:</div>
                    <p>{analise.ishikawa.problema}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analise.ishikawa.categorias).map(([categoria, causas]) => {
                      if (causas.length === 0) return null;

                      const nomes = {
                        metodo: 'Método',
                        maquina: 'Máquina',
                        maoDeObra: 'Mão de Obra',
                        material: 'Material',
                        meioAmbiente: 'Meio Ambiente',
                        medida: 'Medida',
                      };

                      return (
                        <div key={categoria} className="bg-muted p-3 rounded-lg">
                          <div className="font-semibold text-sm mb-2">
                            {nomes[categoria as keyof typeof nomes]}
                          </div>
                          <ul className="list-disc list-inside space-y-1">
                            {causas.map((causa, i) => (
                              <li key={i} className="text-sm">{causa}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Ações */}
          <TabsContent value="acoes" className="space-y-4 mt-6">
            {analise.acoes && analise.acoes.length > 0 ? (
              analise.acoes.map((acao, index) => (
                <Card key={acao.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <CardTitle className="text-base">{acao.oQue}</CardTitle>
                      </div>
                      {getStatusBadge(acao.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                            <FileText className="w-4 h-4" />
                            Por quê? (Why)
                          </div>
                          <p className="text-sm">{acao.porque}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                            <User className="w-4 h-4" />
                            Quem? (Who)
                          </div>
                          <p className="text-sm">{acao.quem?.name || 'Não definido'}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                            <Calendar className="w-4 h-4" />
                            Quando? (When)
                          </div>
                          <p className="text-sm">
                            {acao.quando && format(new Date(acao.quando), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {acao.onde && (
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                              <MapPin className="w-4 h-4" />
                              Onde? (Where)
                            </div>
                            <p className="text-sm">{acao.onde}</p>
                          </div>
                        )}

                        {acao.quantoCusta !== undefined && (
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                              <DollarSign className="w-4 h-4" />
                              Quanto custa? (How Much)
                            </div>
                            <p className="text-sm">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(acao.quantoCusta)}
                            </p>
                          </div>
                        )}

                        <div>
                          <div className="text-sm font-semibold text-muted-foreground mb-1">
                            Status
                          </div>
                          <Select
                            value={acao.status}
                            onValueChange={(value) => handleStatusChange(acao.id, value)}
                            disabled={updatingAcao === acao.id}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="em_andamento">Em Andamento</SelectItem>
                              <SelectItem value="concluida">Concluída</SelectItem>
                              <SelectItem value="verificada">Verificada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="text-sm font-semibold text-muted-foreground mb-1">
                          Como? (How)
                        </div>
                        <p className="text-sm bg-muted p-3 rounded-lg">{acao.como}</p>
                      </div>

                      {acao.observacoes && (
                        <div className="md:col-span-2">
                          <div className="text-sm font-semibold text-muted-foreground mb-1">
                            Observações
                          </div>
                          <p className="text-sm bg-muted p-3 rounded-lg">{acao.observacoes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhuma ação corretiva definida
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
