
import { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Folder, FileText, Calendar } from "lucide-react";
import ObrasService from "@/services/ObrasService";
import { getServiceOrderByProjectId } from "@/services/ServiceOrderService";
import { ServiceOrder } from "@/interfaces/ServiceOrderInterface";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type PeriodFilterType = "7dias" | "1mes" | "3meses" | "todos" | "personalizado";

interface PeriodFilterProps {
  onFilterChange: (
    period: PeriodFilterType, 
    obraId?: string | null, 
    ordemServicoId?: string | null,
    startDate?: Date | null,
    endDate?: Date | null
  ) => void;
  defaultValue?: PeriodFilterType;
}

export const PeriodFilter = ({ onFilterChange, defaultValue = "todos" }: PeriodFilterProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilterType>(defaultValue);
  const [selectedObra, setSelectedObra] = useState<string | null>(null);
  const [selectedOrdemServico, setSelectedOrdemServico] = useState<string | null>(null);
  const [obras, setObras] = useState<{ id: string; name: string; }[]>([]);
  const [ordensServico, setOrdensServico] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchObras = async () => {
      try {
        setIsLoading(true);
        const response = await ObrasService.getAllObras();
        setObras(response);
      } catch (error) {
        setObras([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchObras();
  }, []);

  const handlePeriodChange = (value: string) => {
    if (value) {
      const period = value as PeriodFilterType;
      setSelectedPeriod(period);
      
      // Resetar datas customizadas se escolher outro período
      if (period !== 'personalizado') {
        setStartDate(null);
        setEndDate(null);
      }
      
      // Mantem os filtros de obra e ordem de serviço ao mudar o período
      onFilterChange(
        period, 
        selectedObra, 
        selectedOrdemServico, 
        period === 'personalizado' ? startDate : null, 
        period === 'personalizado' ? endDate : null
      );
    }
  };

  const handleObraChange = async (value: string) => {
    try {
      setIsLoading(true);
      const obraIdValue = value === "todas" ? null : value;
      setSelectedObra(obraIdValue);
      setSelectedOrdemServico(null); // Resetando a OS ao mudar a obra
      
      if (obraIdValue) {
        // Carrega ordens de serviço específicas da obra selecionada
        const osData = await getServiceOrderByProjectId(obraIdValue);
        setOrdensServico(osData);
      } else {
        // Se selecionar "Todas as Obras", limpa as ordens de serviço
        setOrdensServico([]);
      }
      
      // Aplicar filtro com a obra e período personalizado se selecionado
      onFilterChange(
        selectedPeriod, 
        obraIdValue, 
        null, 
        selectedPeriod === 'personalizado' ? startDate : null, 
        selectedPeriod === 'personalizado' ? endDate : null
      );
    } catch (error) {
      setOrdensServico([]);
      onFilterChange(
        selectedPeriod, 
        obraIdValue, 
        null, 
        selectedPeriod === 'personalizado' ? startDate : null, 
        selectedPeriod === 'personalizado' ? endDate : null
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrdemServicoChange = (value: string) => {
    const ordemServicoId = value === "todas" ? null : value;
    setSelectedOrdemServico(ordemServicoId);
    
    // Aplicar todos os filtros: período, obra, ordem de serviço e datas personalizadas
    onFilterChange(
      selectedPeriod, 
      selectedObra, 
      ordemServicoId, 
      selectedPeriod === 'personalizado' ? startDate : null, 
      selectedPeriod === 'personalizado' ? endDate : null
    );
  };

  // Nova função para lidar com a aplicação de datas personalizadas
  const handleApplyCustomDates = () => {
    if (selectedPeriod === 'personalizado') {
      onFilterChange(selectedPeriod, selectedObra, selectedOrdemServico, startDate, endDate);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Filtro por Período */}
        <div className="flex items-center">
          <CalendarDays className="w-5 h-5 mr-2 text-[#FF7F0E]" />
          <h3 className="text-sm font-medium text-gray-700">Filtrar por Período:</h3>
        </div>
        <ToggleGroup type="single" value={selectedPeriod} onValueChange={handlePeriodChange} className="flex-wrap">
          <ToggleGroupItem value="7dias" className="text-xs border-gray-200 hover:bg-[#FF7F0E]/10 data-[state=on]:bg-[#FF7F0E]/20">7 dias</ToggleGroupItem>
          <ToggleGroupItem value="1mes" className="text-xs border-gray-200 hover:bg-[#FF7F0E]/10 data-[state=on]:bg-[#FF7F0E]/20">1 mês</ToggleGroupItem>
          <ToggleGroupItem value="3meses" className="text-xs border-gray-200 hover:bg-[#FF7F0E]/10 data-[state=on]:bg-[#FF7F0E]/20">3 meses</ToggleGroupItem>
          <ToggleGroupItem value="todos" className="text-xs border-gray-200 hover:bg-[#FF7F0E]/10 data-[state=on]:bg-[#FF7F0E]/20">Todos</ToggleGroupItem>
          <ToggleGroupItem value="personalizado" className="text-xs border-gray-200 hover:bg-[#FF7F0E]/10 data-[state=on]:bg-[#FF7F0E]/20">Personalizado</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Seletores de data - aparecem apenas quando personalizado estiver selecionado */}
      {selectedPeriod === 'personalizado' && (
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          {/* Seletor de Data Inicial */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm mb-1 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-[#FF7F0E]" />
              Data Inicial
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[200px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={setStartDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Seletor de Data Final */}
          <div className="w-full sm:w-auto">
            <label className="block text-sm mb-1 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-[#FF7F0E]" />
              Data Final
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[200px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={setEndDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Botão de Aplicar */}
          <div className="flex items-end">
            <Button 
              onClick={handleApplyCustomDates}
              className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/80 text-white"
              disabled={!startDate || !endDate}
            >
              Aplicar Datas
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Filtro por Obra */}
        <div className="w-full sm:w-auto">
          <label htmlFor="obra" className="block text-sm mb-1 flex items-center">
            <Folder className="w-4 h-4 mr-2 text-[#FF7F0E]" />
            Obra
          </label>
          <Select value={selectedObra || "todas"} onValueChange={handleObraChange} disabled={isLoading}>
            <SelectTrigger id="obra" className="w-full sm:w-52">
              <SelectValue placeholder="Todas as Obras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Obras</SelectItem>
              {obras.map((obra) => (
                <SelectItem key={obra.id} value={obra.id.toString()}>
                  {obra.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Ordem de Serviço */}
        <div className="w-full sm:w-auto">
          <label htmlFor="ordemServico" className="block text-sm mb-1 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-[#FF7F0E]" />
            Ordem de Serviço
          </label>
          <Select 
            value={selectedOrdemServico || "todas"} 
            onValueChange={handleOrdemServicoChange} 
            disabled={isLoading || !selectedObra}
          >
            <SelectTrigger id="ordemServico" className="w-full sm:w-52">
              <SelectValue placeholder={selectedObra ? "Todas as Ordens" : "Selecione uma obra primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {selectedObra ? (
                <>
                  <SelectItem value="todas">Todas as Ordens</SelectItem>
                  {ordensServico.length > 0 ? (
                    ordensServico.map((ordem) => (
                      <SelectItem key={ordem.id} value={ordem.id.toString()}>
                        {ordem.serviceOrderNumber + " - " + ordem.description.substring(0, 20)}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-2">Nenhuma ordem disponível</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 p-2">Selecione uma obra primeiro</p>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
