
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileSpreadsheet, Download } from 'lucide-react';
import { AtividadeStatus } from '@/interfaces/AtividadeStatus';
import { AtividadeFiltros } from '@/hooks/useAtividadeData';

export interface ExcelConfig {
  columns: {
    item: boolean;
    description: boolean;
    macroTask: boolean;
    process: boolean;
    status: boolean;
    project: boolean;
    serviceOrder: boolean;
    estimatedTime: boolean;
    totalTime: boolean;
    kpi: boolean;
    progress: boolean;
    quantityTotal: boolean;
    quantityCompleted: boolean;
    team: boolean;
    startDate: boolean;
    endDate: boolean;
    createdAt: boolean;
    observations: boolean;
    client: boolean;
    address: boolean;
  };
}

const COLUMN_LABELS = {
  item: 'Item',
  description: 'Descrição',
  macroTask: 'Tarefa Macro',
  process: 'Processo',
  status: 'Status',
  project: 'Obra/Projeto',
  serviceOrder: 'OS',
  estimatedTime: 'Tempo Estimado',
  totalTime: 'Tempo Total (h)',
  kpi: 'KPI (%)',
  progress: 'Progresso (%)',
  quantityTotal: 'Quantidade Total',
  quantityCompleted: 'Quantidade Concluída',
  team: 'Equipe',
  startDate: 'Data Início',
  endDate: 'Data Fim',
  createdAt: 'Data Criação',
  observations: 'Observações',
  client: 'Cliente',
  address: 'Endereço',
};

const DEFAULT_CONFIG: ExcelConfig = {
  columns: {
    item: true,
    description: true,
    macroTask: true,
    process: true,
    status: true,
    project: true,
    serviceOrder: true,
    estimatedTime: true,
    totalTime: false,
    kpi: true,
    progress: true,
    quantityTotal: false,
    quantityCompleted: false,
    team: true,
    startDate: true,
    endDate: false,
    createdAt: false,
    observations: false,
    client: false,
    address: false,
  },
};

interface ExcelConfigDialogProps {
  atividades: AtividadeStatus[];
  filtros: AtividadeFiltros;
  onExport: (config: ExcelConfig) => void;
  isExporting: boolean;
}

export const ExcelConfigDialog: React.FC<ExcelConfigDialogProps> = ({
  atividades,
  filtros,
  onExport,
  isExporting,
}) => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ExcelConfig>(DEFAULT_CONFIG);

  const handleColumnToggle = (column: keyof ExcelConfig['columns']) => {
    setConfig(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [column]: !prev.columns[column],
      },
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.fromEntries(
      Object.keys(config.columns).map(key => [key, true])
    ) as ExcelConfig['columns'];
    
    setConfig(prev => ({
      ...prev,
      columns: allSelected,
    }));
  };

  const handleDeselectAll = () => {
    const allDeselected = Object.fromEntries(
      Object.keys(config.columns).map(key => [key, false])
    ) as ExcelConfig['columns'];
    
    setConfig(prev => ({
      ...prev,
      columns: allDeselected,
    }));
  };

  const handleExport = () => {
    onExport(config);
    setOpen(false);
  };

  const selectedColumnsCount = Object.values(config.columns).filter(Boolean).length;
  const canExport = selectedColumnsCount > 0 && atividades.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting || atividades.length === 0}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {isExporting ? 'Gerando...' : 'Excel'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#FF7F0E]" />
            Configurar Relatório Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Resumo da Exportação</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• {atividades.length} atividades selecionadas</p>
              <p>• {selectedColumnsCount} colunas selecionadas</p>
            </div>
          </div>

          {/* Seleção de colunas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Colunas para incluir</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Selecionar Todas
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                  Desmarcar Todas
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(COLUMN_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={config.columns[key as keyof ExcelConfig['columns']]}
                    onCheckedChange={() => handleColumnToggle(key as keyof ExcelConfig['columns'])}
                  />
                  <Label htmlFor={key} className="text-sm font-normal">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ações */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={!canExport || isExporting}
              className="bg-[#FF7F0E] hover:bg-[#e56f00] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Gerando...' : 'Gerar Excel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
