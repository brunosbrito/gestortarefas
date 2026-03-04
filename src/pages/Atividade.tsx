import { useState } from 'react';
import Layout from '@/components/Layout';
import { AtividadesTableContent } from '@/components/atividade/AtividadesTableContent';
import { AtividadeFiltrosComponent, GanttGroupBy } from '@/components/atividade/AtividadeFiltros';
import { GanttChart } from '@/components/gantt';
import { ClipboardList, GanttChartSquare, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAtividadeData } from '@/hooks/useAtividadeData';

const Atividade = () => {
  const [groupBy, setGroupBy] = useState<GanttGroupBy>(null);
  const [activeTab, setActiveTab] = useState('lista');

  const {
    atividadesFiltradas,
    filtros,
    isLoadingAtividades,
    tarefasMacro,
    processos,
    colaboradores,
    obras,
    handleFiltroChange,
    limparFiltros,
  } = useAtividadeData();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Atividades</h1>
            <p className="text-muted-foreground">Visualize e gerencie todas as atividades do sistema</p>
          </div>
        </div>

        {/* Filtros - ACIMA das abas */}
        <AtividadeFiltrosComponent
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          onLimparFiltros={limparFiltros}
          tarefasMacro={tarefasMacro || []}
          processos={processos || []}
          colaboradores={colaboradores || []}
          obras={obras || []}
          isLoading={isLoadingAtividades}
          showGroupingSelector={activeTab === 'gantt'}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
        />

        {/* Abas - ABAIXO dos filtros */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="lista" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Atividades
            </TabsTrigger>
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <GanttChartSquare className="w-4 h-4" />
              Gráfico Gantt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="mt-6">
            <AtividadesTableContent
              atividades={atividadesFiltradas}
              filtros={filtros}
              isLoading={isLoadingAtividades}
            />
          </TabsContent>

          <TabsContent value="gantt" className="mt-6">
            {isLoadingAtividades ? (
              <div className="flex justify-center items-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <GanttChart
                activities={atividadesFiltradas}
                height="600px"
                title="Cronograma de Atividades"
                showExpandButton={true}
                groupBy={groupBy}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Atividade;
