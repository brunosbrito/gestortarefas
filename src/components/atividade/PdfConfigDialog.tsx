
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileText, Settings } from 'lucide-react';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadeFiltros } from '@/hooks/useAtividadeData';

export interface PdfConfig {
  orientation: 'portrait' | 'landscape';
  columns: {
    item: boolean;
    description: boolean;
    macroTask: boolean;
    process: boolean;
    status: boolean;
    project: boolean;
    estimatedTime: boolean;
    totalTime: boolean;
    kpi: boolean;
    progress: boolean;
    quantity: boolean;
    team: boolean;
    startDate: boolean;
    createdAt: boolean;
    observations: boolean;
  };
}

interface PdfConfigDialogProps {
  atividades: AtividadeStatus[];
  filtros: AtividadeFiltros;
  onExport: (config: PdfConfig) => void;
  isExporting: boolean;
}

const DEFAULT_CONFIG: PdfConfig = {
  orientation: 'landscape',
  columns: {
    item: true,
    description: true,
    macroTask: true,
    process: true,
    status: true,
    project: true,
    estimatedTime: true,
    totalTime: false,
    kpi: true,
    progress: true,
    quantity: true,
    team: false,
    startDate: true,
    createdAt: false,
    observations: false,
  }
};

const COLUMN_LABELS = {
  item: 'Item',
  description: 'Descrição',
  macroTask: 'Tarefa Macro',
  process: 'Processo',
  status: 'Status',
  project: 'Obra/Projeto',
  estimatedTime: 'Tempo Estimado',
  totalTime: 'Tempo Total',
  kpi: 'KPI',
  progress: 'Progresso',
  quantity: 'Quantidade',
  team: 'Equipe',
  startDate: 'Data Início',
  createdAt: 'Data Criação',
  observations: 'Observações',
};

export const PdfConfigDialog = ({
  atividades,
  filtros,
  onExport,
  isExporting
}: PdfConfigDialogProps) => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<PdfConfig>(DEFAULT_CONFIG);

  const handleColumnChange = (column: keyof PdfConfig['columns'], checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [column]: checked
      }
    }));
  };

  const handleSelectAll = () => {
    const allTrue = Object.fromEntries(
      Object.keys(config.columns).map(key => [key, true])
    ) as PdfConfig['columns'];
    
    setConfig(prev => ({
      ...prev,
      columns: allTrue
    }));
  };

  const handleSelectNone = () => {
    const allFalse = Object.fromEntries(
      Object.keys(config.columns).map(key => [key, false])
    ) as PdfConfig['columns'];
    
    setConfig(prev => ({
      ...prev,
      columns: allFalse
    }));
  };

  const handleExport = () => {
    onExport(config);
    setOpen(false);
  };

  const selectedCount = Object.values(config.columns).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting || atividades.length === 0}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          {isExporting ? 'Gerando...' : 'PDF'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF7F0E]" />
            Configurar Relatório PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Orientação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Orientação da Página</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={config.orientation}
                onValueChange={(value) => setConfig(prev => ({ ...prev, orientation: value as 'portrait' | 'landscape' }))}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait">Retrato</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape">Paisagem (Recomendado)</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Seleção de Colunas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Colunas do Relatório
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    Selecionar Todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectNone}
                  >
                    Desmarcar Todas
                  </Button>
                </div>
              </CardTitle>
              <p className="text-xs text-gray-600">
                {selectedCount} coluna(s) selecionada(s) • {atividades.length} atividade(s)
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(COLUMN_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={config.columns[key as keyof PdfConfig['columns']]}
                      onCheckedChange={(checked) => 
                        handleColumnChange(key as keyof PdfConfig['columns'], Boolean(checked))
                      }
                    />
                    <Label htmlFor={key} className="text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Preview das Colunas Selecionadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs bg-gray-50 p-3 rounded-md">
                <div className="font-medium mb-2">Colunas que serão incluídas no PDF:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(config.columns)
                    .filter(([_, selected]) => selected)
                    .map(([key, _]) => (
                      <span key={key} className="bg-[#FF7F0E]/20 text-[#003366] px-2 py-1 rounded text-xs">
                        {COLUMN_LABELS[key as keyof typeof COLUMN_LABELS]}
                      </span>
                    ))}
                </div>
                {selectedCount === 0 && (
                  <p className="text-red-500 text-xs">Nenhuma coluna selecionada</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={selectedCount === 0 || isExporting}
              className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isExporting ? 'Gerando PDF...' : 'Gerar PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
