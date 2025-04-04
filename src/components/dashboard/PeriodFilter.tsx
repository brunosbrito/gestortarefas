import { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Folder, FileText } from "lucide-react";
import ObrasService from "@/services/ObrasService";
import { getAllServiceOrders } from "@/services/ServiceOrderService";
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
  const [obras, setObras] = useState<{ id: string; name: string; ordensServico: ServiceOrder[] }[]>([]);
  const [ordensServico, setOrdensServico] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchObras = async () => {
      try {
        setIsLoading(true);
        const response = await ObrasService.getAllObras();
        setObras(response);

        // Carrega todas as ordens de serviço para o filtro geral
        const todasOrdens = await getAllServiceOrders();
        setOrdensServico(todasOrdens);
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
      onFilterChange(period, selectedObra, selectedOrdemServico);
    }
  };

  const handleObraChange = (value: string) => {
    const obraId = value === "todas" ? null : value;
    setSelectedObra(obraId);
    setSelectedOrdemServico(null); // Resetando a OS ao mudar a obra
  
    if (obraId) {
      // Filtra as ordens de serviço que pertencem à obra selecionada
      setOrdensServico(ordensServico.filter((os) => os.projectId?.id === parseInt(obraId)));
    } else {
      // Se for "Todas as Obras", exibe todas as ordens de serviço disponíveis
      setOrdensServico(ordensServico ?? []);
    }
  
    onFilterChange(selectedPeriod, obraId, null);
  };

  const handleOrdemServicoChange = (value: string) => {
    const ordemServicoId = value === "todas" ? null : value;
    setSelectedOrdemServico(ordemServicoId);
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
                <SelectItem key={obra.id} value={obra.id}>
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
          <Select value={selectedOrdemServico || "todas"} onValueChange={handleOrdemServicoChange} disabled={isLoading}>
            <SelectTrigger id="ordemServico" className="w-full sm:w-52">
              <SelectValue placeholder="Todas as Ordens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Ordens</SelectItem>
              {ordensServico.length > 0 ? (
                ordensServico.map((ordem) => (
                  <SelectItem key={ordem.id} value={ordem.id}>
                    {ordem.description}
                  </SelectItem>
                ))
              ) : (
                <p className="text-sm text-gray-500 p-2">Nenhuma ordem disponível</p>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
