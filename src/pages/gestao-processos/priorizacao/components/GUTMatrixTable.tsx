import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { EscalaGUT, CriteriosGUT } from '@/interfaces/GestaoProcessosInterfaces';

interface GUTMatrixTableProps {
  criterios: CriteriosGUT;
  justificativas: {
    gravidade: string;
    urgencia: string;
    tendencia: string;
  };
  onChange: (criterios: CriteriosGUT) => void;
  onJustificativaChange: (campo: 'gravidade' | 'urgencia' | 'tendencia', valor: string) => void;
  disabled?: boolean;
}

/**
 * Componente para seleção interativa dos critérios GUT
 * Gravidade × Urgência × Tendência
 */
export const GUTMatrixTable = ({
  criterios,
  justificativas,
  onChange,
  onJustificativaChange,
  disabled = false,
}: GUTMatrixTableProps) => {
  // Descrições das escalas GUT
  const escalasGravidade = [
    { valor: 5 as EscalaGUT, label: 'Extremamente Grave', descricao: 'Impacto extremamente alto' },
    { valor: 4 as EscalaGUT, label: 'Muito Grave', descricao: 'Impacto muito alto' },
    { valor: 3 as EscalaGUT, label: 'Grave', descricao: 'Impacto considerável' },
    { valor: 2 as EscalaGUT, label: 'Pouco Grave', descricao: 'Impacto baixo' },
    { valor: 1 as EscalaGUT, label: 'Sem Gravidade', descricao: 'Sem impacto significativo' },
  ];

  const escalasUrgencia = [
    { valor: 5 as EscalaGUT, label: 'Ação Imediata', descricao: 'Resolver imediatamente' },
    { valor: 4 as EscalaGUT, label: 'Urgente', descricao: 'Resolver o mais rápido possível' },
    { valor: 3 as EscalaGUT, label: 'Prazo Curto', descricao: 'Resolver em pouco tempo' },
    { valor: 2 as EscalaGUT, label: 'Pode Esperar', descricao: 'Resolver eventualmente' },
    { valor: 1 as EscalaGUT, label: 'Não tem Pressa', descricao: 'Pode aguardar' },
  ];

  const escalasTendencia = [
    { valor: 5 as EscalaGUT, label: 'Piora Imediata', descricao: 'Irá piorar rapidamente' },
    { valor: 4 as EscalaGUT, label: 'Piora em Breve', descricao: 'Tende a piorar logo' },
    { valor: 3 as EscalaGUT, label: 'Piora Gradual', descricao: 'Tende a piorar a médio prazo' },
    { valor: 2 as EscalaGUT, label: 'Piora Lenta', descricao: 'Piora lentamente' },
    { valor: 1 as EscalaGUT, label: 'Não Piora', descricao: 'Não tende a piorar' },
  ];

  const calcularPontuacao = () => {
    return criterios.gravidade * criterios.urgencia * criterios.tendencia;
  };

  const getClassificacao = (pontuacao: number) => {
    if (pontuacao <= 27) return { label: 'Baixa', color: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' };
    if (pontuacao <= 64) return { label: 'Média', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400' };
    if (pontuacao <= 100) return { label: 'Alta', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400' };
    return { label: 'Crítica', color: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' };
  };

  const pontuacao = calcularPontuacao();
  const classificacao = getClassificacao(pontuacao);

  return (
    <div className="space-y-6">
      {/* Resultado GUT */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Resultado da Matriz GUT</CardTitle>
          <CardDescription>Pontuação = Gravidade × Urgência × Tendência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">G × U × T</div>
                <div className="text-2xl font-bold font-mono">
                  {criterios.gravidade} × {criterios.urgencia} × {criterios.tendencia}
                </div>
              </div>
              <div className="text-4xl font-bold text-muted-foreground">=</div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Pontuação</div>
                <div className="text-4xl font-bold text-primary">{pontuacao}</div>
              </div>
            </div>
            <Badge className={`text-lg px-4 py-2 ${classificacao.color}`}>
              {classificacao.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Gravidade (G) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Gravidade (G) - Impacto do Problema
          </CardTitle>
          <CardDescription>
            Qual é o impacto/consequência se o problema não for resolvido?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={String(criterios.gravidade)}
            onValueChange={(value) =>
              onChange({ ...criterios, gravidade: Number(value) as EscalaGUT })
            }
            disabled={disabled}
          >
            <div className="space-y-2">
              {escalasGravidade.map((escala) => (
                <div
                  key={escala.valor}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                    criterios.gravidade === escala.valor
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={String(escala.valor)} id={`g-${escala.valor}`} />
                  <label
                    htmlFor={`g-${escala.valor}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {escala.valor} - {escala.label}
                        </div>
                        <div className="text-sm text-muted-foreground">{escala.descricao}</div>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {escala.valor}
                      </Badge>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label>Justificativa da Gravidade</Label>
            <Textarea
              placeholder="Explique por que você escolheu esta pontuação para a gravidade..."
              value={justificativas.gravidade}
              onChange={(e) => onJustificativaChange('gravidade', e.target.value)}
              rows={2}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Urgência (U) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5 text-orange-600" />
            Urgência (U) - Prazo para Resolver
          </CardTitle>
          <CardDescription>
            Quanto tempo temos para resolver o problema?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={String(criterios.urgencia)}
            onValueChange={(value) =>
              onChange({ ...criterios, urgencia: Number(value) as EscalaGUT })
            }
            disabled={disabled}
          >
            <div className="space-y-2">
              {escalasUrgencia.map((escala) => (
                <div
                  key={escala.valor}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                    criterios.urgencia === escala.valor
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={String(escala.valor)} id={`u-${escala.valor}`} />
                  <label
                    htmlFor={`u-${escala.valor}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {escala.valor} - {escala.label}
                        </div>
                        <div className="text-sm text-muted-foreground">{escala.descricao}</div>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {escala.valor}
                      </Badge>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label>Justificativa da Urgência</Label>
            <Textarea
              placeholder="Explique por que você escolheu esta pontuação para a urgência..."
              value={justificativas.urgencia}
              onChange={(e) => onJustificativaChange('urgencia', e.target.value)}
              rows={2}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tendência (T) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Tendência (T) - Evolução do Problema
          </CardTitle>
          <CardDescription>
            O problema tende a piorar com o tempo?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={String(criterios.tendencia)}
            onValueChange={(value) =>
              onChange({ ...criterios, tendencia: Number(value) as EscalaGUT })
            }
            disabled={disabled}
          >
            <div className="space-y-2">
              {escalasTendencia.map((escala) => (
                <div
                  key={escala.valor}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                    criterios.tendencia === escala.valor
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={String(escala.valor)} id={`t-${escala.valor}`} />
                  <label
                    htmlFor={`t-${escala.valor}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {escala.valor} - {escala.label}
                        </div>
                        <div className="text-sm text-muted-foreground">{escala.descricao}</div>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {escala.valor}
                      </Badge>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label>Justificativa da Tendência</Label>
            <Textarea
              placeholder="Explique por que você escolheu esta pontuação para a tendência..."
              value={justificativas.tendencia}
              onChange={(e) => onJustificativaChange('tendencia', e.target.value)}
              rows={2}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
