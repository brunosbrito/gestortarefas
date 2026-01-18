import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Plus,
  X,
  Wrench,
  Users,
  Cog,
  Package,
  TreePine,
  Ruler,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';
import { DiagramaIshikawa } from '@/interfaces/QualidadeInterfaces';
import { Badge } from '@/components/ui/badge';

interface IshikawaFormProps {
  value?: DiagramaIshikawa;
  onChange: (data: DiagramaIshikawa) => void;
}

const categorias = [
  { key: 'metodo', nome: 'Método', icon: Wrench, cor: 'blue' },
  { key: 'maquina', nome: 'Máquina', icon: Cog, cor: 'red' },
  { key: 'maoDeObra', nome: 'Mão de Obra', icon: Users, cor: 'green' },
  { key: 'material', nome: 'Material', icon: Package, cor: 'yellow' },
  { key: 'meioAmbiente', nome: 'Meio Ambiente', icon: TreePine, cor: 'purple' },
  { key: 'medida', nome: 'Medida', icon: Ruler, cor: 'orange' },
] as const;

export const IshikawaForm = ({ value, onChange }: IshikawaFormProps) => {
  const [data, setData] = useState<DiagramaIshikawa>(
    value || {
      problema: '',
      categorias: {
        metodo: [],
        maquina: [],
        maoDeObra: [],
        material: [],
        meioAmbiente: [],
        medida: [],
      },
      causaRaiz: '',
    }
  );

  const [novasCausas, setNovasCausas] = useState<Record<string, string>>({
    metodo: '',
    maquina: '',
    maoDeObra: '',
    material: '',
    meioAmbiente: '',
    medida: '',
  });

  const handleProblemaChange = (problema: string) => {
    const newData = { ...data, problema };
    setData(newData);
    onChange(newData);
  };

  const handleCausaRaizChange = (causaRaiz: string) => {
    const newData = { ...data, causaRaiz };
    setData(newData);
    onChange(newData);
  };

  const adicionarCausa = (categoria: keyof DiagramaIshikawa['categorias']) => {
    const novaCausa = novasCausas[categoria]?.trim();
    if (!novaCausa) return;

    const newData = {
      ...data,
      categorias: {
        ...data.categorias,
        [categoria]: [...data.categorias[categoria], novaCausa],
      },
    };

    setData(newData);
    onChange(newData);
    setNovasCausas({ ...novasCausas, [categoria]: '' });
  };

  const removerCausa = (categoria: keyof DiagramaIshikawa['categorias'], index: number) => {
    const newData = {
      ...data,
      categorias: {
        ...data.categorias,
        [categoria]: data.categorias[categoria].filter((_, i) => i !== index),
      },
    };

    setData(newData);
    onChange(newData);
  };

  const getCorClasses = (cor: string) => {
    const cores = {
      blue: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
      red: 'border-red-500 bg-red-50 dark:bg-red-950/20',
      green: 'border-green-500 bg-green-50 dark:bg-green-950/20',
      yellow: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
      purple: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20',
      orange: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20',
    };
    return cores[cor as keyof typeof cores] || cores.blue;
  };

  const getIconColor = (cor: string) => {
    const cores = {
      blue: 'text-blue-600 dark:text-blue-500',
      red: 'text-red-600 dark:text-red-500',
      green: 'text-green-600 dark:text-green-500',
      yellow: 'text-yellow-600 dark:text-yellow-500',
      purple: 'text-purple-600 dark:text-purple-500',
      orange: 'text-orange-600 dark:text-orange-500',
    };
    return cores[cor as keyof typeof cores] || cores.blue;
  };

  const totalCausas = Object.values(data.categorias).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Diagrama de Ishikawa (6M's)
          </CardTitle>
          <CardDescription>
            Também conhecido como Diagrama de Espinha de Peixe, organiza as possíveis causas do
            problema em 6 categorias principais.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Problema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Problema a ser Analisado</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva o problema que está sendo analisado..."
            value={data.problema}
            onChange={(e) => handleProblemaChange(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categorias.map(({ key, nome, icon: Icon, cor }) => {
              const qtd = data.categorias[key as keyof DiagramaIshikawa['categorias']].length;
              return (
                <div key={key} className="text-center">
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${getIconColor(cor)}`} />
                  <div className="text-2xl font-bold">{qtd}</div>
                  <div className="text-xs text-muted-foreground">{nome}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t text-center">
            <span className="text-sm text-muted-foreground">
              Total de causas identificadas:{' '}
              <span className="font-bold text-foreground">{totalCausas}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Categorias (6M's) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categorias.map(({ key, nome, icon: Icon, cor }) => (
          <Card key={key} className={`border-l-4 ${getCorClasses(cor)}`}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className={`w-5 h-5 ${getIconColor(cor)}`} />
                {nome}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Lista de Causas */}
              {data.categorias[key as keyof DiagramaIshikawa['categorias']].length > 0 && (
                <div className="space-y-2">
                  {data.categorias[key as keyof DiagramaIshikawa['categorias']].map(
                    (causa, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 bg-background p-2 rounded-md group"
                      >
                        <span className="flex-1 text-sm">{causa}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removerCausa(key as keyof DiagramaIshikawa['categorias'], index)
                          }
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Input para Nova Causa */}
              <div className="flex gap-2">
                <Input
                  placeholder={`Adicionar causa em ${nome}...`}
                  value={novasCausas[key] || ''}
                  onChange={(e) => setNovasCausas({ ...novasCausas, [key]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      adicionarCausa(key as keyof DiagramaIshikawa['categorias']);
                    }
                  }}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => adicionarCausa(key as keyof DiagramaIshikawa['categorias'])}
                  disabled={!novasCausas[key]?.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Causa Raiz Identificada */}
      <Card className="border-2 border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Causa Raiz Identificada
          </CardTitle>
          <CardDescription>
            Após análise de todas as categorias, qual é a causa fundamental identificada?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Descreva a causa raiz identificada através do Diagrama de Ishikawa..."
            value={data.causaRaiz}
            onChange={(e) => handleCausaRaizChange(e.target.value)}
            rows={3}
            className="resize-none bg-background"
          />
        </CardContent>
      </Card>

      {/* Legenda dos 6M's */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">Significado dos 6M's:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Método:</span> Procedimentos, instruções,
                  processos
                </div>
                <div>
                  <span className="font-semibold">Máquina:</span> Equipamentos, ferramentas,
                  sistemas
                </div>
                <div>
                  <span className="font-semibold">Mão de Obra:</span> Pessoas, habilidades,
                  treinamento
                </div>
                <div>
                  <span className="font-semibold">Material:</span> Matéria-prima, insumos,
                  componentes
                </div>
                <div>
                  <span className="font-semibold">Meio Ambiente:</span> Condições ambientais,
                  layout, espaço
                </div>
                <div>
                  <span className="font-semibold">Medida:</span> Instrumentos, padrões,
                  especificações
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
