
import { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Folder, FileText } from "lucide-react";
import ObrasService from "@/services/ObrasService";
import { getServiceOrderByProjectId, getAllServiceOrders } from "@/services/ServiceOrderService";
import { ServiceOrder } from "@/interfaces/ServiceOrderInterface";

export type PeriodFilterType = "7dias" | "1mes" | "3meses" | "todos";

interface PeriodFilterProps {
  onFilterChange: (period: PeriodFilterType, obraId?: string | null, ordemServicoId?: string | null) => void;
  defaultValue?: PeriodFilterType;
}

export const PeriodFilter = ({ onFilterChange, defaultValue = "todos" }: PeriodFilterProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilterType>(defaultValue);
  const [selectedObra, setSelectedObra] = useState<string | null>(null);
  const [selectedOrdemServico, setSelectedOrdemServico] = useState<string | null>(null);
  const [obras, setObras] = useState<{ id: string; name: string; }[]>([]);
  const [ordensServico, setOrdensServico] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchObras = async () => {
      try {
        setIsLoading(true);
        const response = await ObrasService.getAllObras();
        setObras(response);
      } catch (error) {
        console.error("Erro ao buscar obras:", error);
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
      // Mantem os filtros de obra e ordem de serviço ao mudar o período
      onFilterChange(period, selectedObra, selectedOrdemServico);
    }
  };

  const handleObraChange = async (value: string) => {
    try {
      setIsLoading(true);
      const obraId = value === "todas" ? null : value;
      setSelectedObra(obraId);
      setSelectedOrdemServico(null); // Resetando a OS ao mudar a obra
      
      if (obraId) {
        console.log("Buscando ordens de serviço para a obra:", obraId);
        // Carrega ordens de serviço específicas da obra selecionada
        const osData = await getServiceOrderByProjectId(obraId);
        console.log("Ordens de serviço carregadas:", osData.length);
        setOrdensServico(osData);
      } else {
        // Se selecionar "Todas as Obras", limpa as ordens de serviço
        setOrdensServico([]);
      }
      
      // Aplicar filtro apenas com a obra, sem ordem de serviço
      onFilterChange(selectedPeriod, obraId, null);
    } catch (error) {
      console.error("Erro ao carregar ordens de serviço:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrdemServicoChange = (value: string) => {
    const ordemServicoId = value === "todas" ? null : value;
    console.log("Ordem de serviço selecionada:", ordemServicoId);
    setSelectedOrdemServico(ordemServicoId);
    
    // Aplicar todos os filtros: período, obra e ordem de serviço
    onFilterChange(selectedPeriod, selectedObra, ordemServicoId);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
        </ToggleGroup>

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
                        {ordem.description}
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
