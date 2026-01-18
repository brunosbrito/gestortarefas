import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, HelpCircle, Lightbulb } from 'lucide-react';
import { CincoPorques } from '@/interfaces/QualidadeInterfaces';
import { Badge } from '@/components/ui/badge';

interface CincoPorquesFormProps {
  value?: CincoPorques;
  onChange: (data: CincoPorques) => void;
}

export const CincoPorquesForm = ({ value, onChange }: CincoPorquesFormProps) => {
  const [data, setData] = useState<CincoPorques>(
    value || {
      problema: '',
      porque1: '',
      porque2: '',
      porque3: '',
      porque4: '',
      porque5: '',
      causaRaiz: '',
    }
  );

  const [nivelAtual, setNivelAtual] = useState<number>(1);

  const handleChange = (field: keyof CincoPorques, newValue: string) => {
    const newData = { ...data, [field]: newValue };
    setData(newData);
    onChange(newData);
  };

  const adicionarNivel = () => {
    if (nivelAtual < 5) {
      setNivelAtual(nivelAtual + 1);
    }
  };

  const removerNivel = () => {
    if (nivelAtual > 1) {
      const campoAtual = `porque${nivelAtual}` as keyof CincoPorques;
      handleChange(campoAtual, '');
      setNivelAtual(nivelAtual - 1);
    }
  };

  const porques = [
    { nivel: 1, campo: 'porque1' as keyof CincoPorques, valor: data.porque1 },
    { nivel: 2, campo: 'porque2' as keyof CincoPorques, valor: data.porque2 },
    { nivel: 3, campo: 'porque3' as keyof CincoPorques, valor: data.porque3 },
    { nivel: 4, campo: 'porque4' as keyof CincoPorques, valor: data.porque4 },
    { nivel: 5, campo: 'porque5' as keyof CincoPorques, valor: data.porque5 },
  ];

  const podeAdicionarNivel = nivelAtual < 5 && data[`porque${nivelAtual}` as keyof CincoPorques]?.trim() !== '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Metodologia dos 5 Porquês
          </CardTitle>
          <CardDescription>
            Pergunte "Por quê?" sucessivamente para identificar a causa raiz do problema.
            Cada resposta deve levar à próxima pergunta até chegar à causa fundamental.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Problema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Problema Identificado</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva o problema que está sendo analisado..."
            value={data.problema}
            onChange={(e) => handleChange('problema', e.target.value)}
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Sequência de Porquês */}
      <div className="space-y-4">
        {porques.slice(0, nivelAtual).map(({ nivel, campo, valor }) => (
          <Card
            key={nivel}
            className={`border-l-4 ${
              nivel === 1
                ? 'border-l-blue-500'
                : nivel === 2
                ? 'border-l-green-500'
                : nivel === 3
                ? 'border-l-yellow-500'
                : nivel === 4
                ? 'border-l-orange-500'
                : 'border-l-red-500'
            }`}
          >
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${
                      nivel === 1
                        ? 'border-blue-500 text-blue-600'
                        : nivel === 2
                        ? 'border-green-500 text-green-600'
                        : nivel === 3
                        ? 'border-yellow-500 text-yellow-600'
                        : nivel === 4
                        ? 'border-orange-500 text-orange-600'
                        : 'border-red-500 text-red-600'
                    }`}
                  >
                    {nivel}º
                  </Badge>
                  Por quê {nivel === 1 && 'isso aconteceu'}?
                </Label>
                {nivel === nivelAtual && nivel > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removerNivel}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Textarea
                placeholder={`Responda: Por quê ${
                  nivel === 1 ? 'o problema ocorreu' : 'a causa anterior aconteceu'
                }?`}
                value={valor}
                onChange={(e) => handleChange(campo, e.target.value)}
                rows={2}
                className="resize-none"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botão para Adicionar Nível */}
      {nivelAtual < 5 && (
        <Button
          variant="outline"
          onClick={adicionarNivel}
          disabled={!podeAdicionarNivel}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar {nivelAtual + 1}º Por quê
        </Button>
      )}

      {/* Causa Raiz Identificada */}
      <Card className="border-2 border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Causa Raiz Identificada
          </CardTitle>
          <CardDescription>
            Com base nas respostas acima, qual é a causa fundamental que originou o problema?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva a causa raiz identificada através da análise dos 5 Porquês..."
            value={data.causaRaiz}
            onChange={(e) => handleChange('causaRaiz', e.target.value)}
            rows={3}
            className="resize-none bg-background"
          />
        </CardContent>
      </Card>

      {/* Dica de Uso */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Dicas para uma boa análise:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Cada "Por quê?" deve ser uma causa direta da resposta anterior</li>
                <li>Evite respostas vagas como "erro humano" ou "falta de atenção"</li>
                <li>Geralmente 3-5 níveis são suficientes para chegar à causa raiz</li>
                <li>A causa raiz deve ser algo que, se corrigido, impede a recorrência</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
