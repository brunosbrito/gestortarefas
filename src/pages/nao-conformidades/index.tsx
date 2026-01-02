import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Filter,
  Users,
  Package,
  Image,
  Eye,
  Edit,
  ClipboardCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NovaRNCDialog } from './NovaRNCDialog';
import RncService from '@/services/NonConformityService';
import { NonConformity } from '@/interfaces/RncInterface';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Obra } from '@/interfaces/ObrasInterface';
import ObrasService from '@/services/ObrasService';
import { DetalhesRNCDialog } from './DetalhesRNCDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MaoObraForm } from './components/MaoObraForm';
import { MateriaisForm } from './components/MateriaisForm';
import { ImagensForm } from './components/ImagensForm';
import { AcaoCorretivaForm } from './components/AcaoCorretivaForm';

const NaoConformidades = () => {
  const { toast } = useToast();
  const [showNovaRNCDialog, setShowNovaRNCDialog] = useState(false);
  const [dadosRnc, setDadosRnc] = useState<NonConformity[]>([]);
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<string>('');
  const [mostrarFinalizadas, setMostrarFinalizadas] = useState<
    'todas' | 'em_andamento'
  >('todas');
  const [rncSelecionada, setRncSelecionada] = useState<NonConformity | null>(
    null
  );
  const [showDetalhesDialog, setShowDetalhesDialog] = useState(false);
  const [showMaoObraDialog, setShowMaoObraDialog] = useState(false);
  const [showMateriaisDialog, setShowMateriaisDialog] = useState(false);
  const [showImagensDialog, setShowImagensDialog] = useState(false);
  const [editandoRnc, setEditandoRnc] = useState<NonConformity | null>(null);
  const [showAcaoCorretivaDialog, setShowAcaoCorretivaDialog] = useState(false);

  const getAllRnc = async () => {
    const rnc = await RncService.getAllRnc();
    setDadosRnc(rnc);
  };

  const getProjetos = async () => {
    try {
      const projetos = await ObrasService.getAllObras();
      setProjetos(projetos);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllRnc();
    getProjetos();
  }, []);

  const rncsFiltradas = dadosRnc.filter((rnc) => {
    const filtroStatus =
      mostrarFinalizadas === 'todas' ? true : !rnc.dateConclusion;
    const filtroProjeto = projetoSelecionado
      ? rnc.project.id === projetoSelecionado
      : true;

    return filtroStatus && filtroProjeto;
  });

  const handleRncClick = (rnc: NonConformity) => {
    setRncSelecionada(rnc);
    setShowDetalhesDialog(true);
  };

  const handleMaoObraClick = (rnc: NonConformity) => {
    setRncSelecionada(rnc);
    setShowMaoObraDialog(true);
  };

  const handleMateriaisClick = (rnc: NonConformity) => {
    setRncSelecionada(rnc);
    setShowMateriaisDialog(true);
  };

  const handleImagensClick = (rnc: NonConformity) => {
    setRncSelecionada(rnc);
    setShowImagensDialog(true);
  };

  const handleEditClick = (rnc: NonConformity, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditandoRnc(rnc);
    setShowNovaRNCDialog(true);
  };

  const handleAcaoCorretivaClick = (rnc: NonConformity) => {
    setRncSelecionada(rnc);
    setShowAcaoCorretivaDialog(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-construction-800">
            RNC - Registro de Não Conformidade
          </h1>
          <Button
            onClick={() => {
              setEditandoRnc(null);
              setShowNovaRNCDialog(true);
            }}
            className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova RNC
          </Button>
        </div>

        {/* Indicadores de Performance */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Indicadores de Performance</h2>
              <p className="text-sm text-muted-foreground">Métricas agregadas das não conformidades</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-gray-400 bg-gray-50/30">
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{dadosRnc.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">RNCs</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/30">
            <CardHeader className="pb-2">
              <CardDescription>Em Andamento</CardDescription>
              <CardTitle className="text-3xl text-yellow-700">
                {dadosRnc.filter(r => !r.dateConclusion).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Abertas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-green-50/30">
            <CardHeader className="pb-2">
              <CardDescription>Finalizadas</CardDescription>
              <CardTitle className="text-3xl text-green-700">
                {dadosRnc.filter(r => r.dateConclusion).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">Concluídas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 bg-red-50/30">
            <CardHeader className="pb-2">
              <CardDescription>Com Ação Corretiva</CardDescription>
              <CardTitle className="text-3xl text-red-700">
                {dadosRnc.filter(r => r.correctiveAction).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">Ações definidas</span>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-construction-100 rounded-lg">
          <Filter className="h-5 w-5 text-construction-600" />
          <RadioGroup
            defaultValue="todas"
            onValueChange={(value) =>
              setMostrarFinalizadas(value as 'todas' | 'em_andamento')
            }
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="todas" id="todas" />
              <label htmlFor="todas">Todas</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="em_andamento" id="em_andamento" />
              <label htmlFor="em_andamento">Em Andamento</label>
            </div>
          </RadioGroup>

          <Select
            value={projetoSelecionado}
            onValueChange={setProjetoSelecionado}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os projetos</SelectItem>
              {projetos.map((projeto) => (
                <SelectItem
                  key={projeto.id}
                  value={projeto.id ? projeto.id.toString() : 'unknown'}
                >
                  {projeto.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rncsFiltradas.map((rnc) => {
            // Determinar cor da borda baseado no status
            const getBorderColor = () => {
              if (rnc.dateConclusion) return 'border-l-green-500 bg-green-50/30';
              return 'border-l-yellow-500 bg-yellow-50/30';
            };

            return (
            <Card key={rnc.id} className={`hover:shadow-lg transition-all border-l-4 ${getBorderColor()}`}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-construction-800 flex justify-between items-center">
                  <span>RNC #{String(rnc.code).padStart(3, '0')}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleEditClick(rnc, e)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  OS: {rnc.serviceOrder?.description} |{' '}
                  {format(new Date(rnc.dateOccurrence), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-construction-600">
                    <strong>Identificado por:</strong>{' '}
                    {rnc.responsibleIdentification.name}
                  </p>
                  <p className="text-sm text-construction-600">
                    <strong>Descrição:</strong> {rnc.description}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRncClick(rnc)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Visualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMaoObraClick(rnc);
                  }}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Mão de Obra
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMateriaisClick(rnc);
                  }}
                >
                  <Package className="w-4 h-4 mr-1" />
                  Materiais
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImagensClick(rnc);
                  }}
                >
                  <Image className="w-4 h-4 mr-1" />
                  Imagens
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcaoCorretivaClick(rnc);
                  }}
                >
                  <ClipboardCheck className="w-4 h-4 mr-1" />
                  Ação Corretiva
                </Button>
              </CardFooter>
            </Card>
            );
          })}
        </div>

        <NovaRNCDialog
          open={showNovaRNCDialog}
          onOpenChange={setShowNovaRNCDialog}
          rncParaEditar={editandoRnc}
          onSaveSuccess={() => {
            getAllRnc();
          }}
        />

        <DetalhesRNCDialog
          rnc={rncSelecionada}
          open={showDetalhesDialog}
          onOpenChange={setShowDetalhesDialog}
        />

        <Dialog open={showMaoObraDialog} onOpenChange={setShowMaoObraDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Mão de Obra - RNC #
                {String(rncSelecionada?.code).padStart(3, '0')}
              </DialogTitle>
            </DialogHeader>
            {rncSelecionada && (
              <MaoObraForm
                rnc={rncSelecionada.id}
                onClose={() => setShowMaoObraDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={showMateriaisDialog}
          onOpenChange={setShowMateriaisDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Materiais - RNC {String(rncSelecionada?.code).padStart(3, '0')}
              </DialogTitle>
            </DialogHeader>
            {rncSelecionada && (
              <MateriaisForm
                rnc={rncSelecionada.id}
                onClose={() => setShowMateriaisDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showImagensDialog} onOpenChange={setShowImagensDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Imagens - RNC {String(rncSelecionada?.code).padStart(3, '0')}
              </DialogTitle>
            </DialogHeader>
            {rncSelecionada && (
              <ImagensForm
                rncId={rncSelecionada.id}
                onClose={() => setShowImagensDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={showAcaoCorretivaDialog}
          onOpenChange={setShowAcaoCorretivaDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Ação Corretiva - RNC{' '}
                {String(rncSelecionada?.code).padStart(3, '0')}
              </DialogTitle>
            </DialogHeader>
            {rncSelecionada && (
              <AcaoCorretivaForm
                rnc={rncSelecionada}
                onClose={() => {
                  setShowAcaoCorretivaDialog(false);
                  getAllRnc();
                }}
                onUpdate={() => getAllRnc()}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default NaoConformidades;
