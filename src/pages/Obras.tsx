import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import ObrasService from "@/services/ObrasService";
import { NovaObraDialog } from "@/components/obras/NovaObraDialog";
import { ObraCard } from "@/components/obras/ObraCard";
import { ObraDetalhada } from "@/components/obras/types";

const Obras = () => {
  const [obras, setObras] = useState<ObraDetalhada[]>([]);
  const { toast } = useToast();

  const fetchObras = async () => {
    try {
      const obrasData = await ObrasService.getAllObras();
      const obrasComDetalhes = obrasData?.map(obra => ({
        ...obra,
        horasTrabalhadas: Math.floor(Math.random() * 1000),
        atividades: [
          "Fundação iniciada",
          "Alvenaria em andamento",
          "Instalações elétricas"
        ],
        historico: [
          `${new Date(obra.startDate).toLocaleDateString('pt-BR')} - Início da obra`,
          "15/02/2024 - Fundação concluída",
          "01/03/2024 - Alvenaria iniciada"
        ]
      }));
      setObras(obrasComDetalhes || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar obras',
        description: 'Não foi possível carregar a lista de obras.',
      });
    }
  };

  const handleCreateObra = async (data: any) => {
    try {
      await ObrasService.createObra({
        ...data,
        status: "em_andamento" as const,
      });
      toast({
        title: "Obra criada com sucesso!",
        description: `A obra ${data.name} foi criada.`,
      });
      fetchObras();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar obra",
        description: "Não foi possível criar a obra. Tente novamente mais tarde.",
      });
    }
  };

  const handleEdit = async (obraId: number, data: any) => {
    try {
      const obraAtual = obras.find(o => o.id === obraId);
      if (obraAtual) {
        await ObrasService.updateObra(obraId, {
          ...obraAtual,
          ...data,
        });
        toast({
          title: "Obra atualizada com sucesso!",
          description: `A obra ${data.name} foi atualizada.`,
        });
        fetchObras();
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar obra",
        description: "Não foi possível atualizar a obra. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleFinalizar = async (obraId: number, data: { endDate: string }) => {
    try {
      const obraAtual = obras.find(o => o.id === obraId);
      if (obraAtual) {
        await ObrasService.updateObra(obraId, {
          ...obraAtual,
          status: "finalizado" as const,
          endDate: data.endDate,
        });
        toast({
          title: "Obra finalizada com sucesso!",
          description: `A obra ${obraAtual.name} foi finalizada.`,
        });
        fetchObras();
      }
    } catch (error) {
      toast({
        title: "Erro ao finalizar obra",
        description: "Não foi possível finalizar a obra. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchObras();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-construction-800">Obras</h1>
          <NovaObraDialog onSubmit={handleCreateObra} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obras.map((obra) => (
            <ObraCard
              key={obra.id}
              obra={obra}
              onEdit={handleEdit}
              onFinalizar={handleFinalizar}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Obras;