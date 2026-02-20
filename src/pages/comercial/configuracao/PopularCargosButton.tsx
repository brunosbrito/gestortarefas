import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { CargoService } from '@/services/CargoService';
import { CreateCargo } from '@/interfaces/CargoInterface';

interface PopularCargosButtonProps {
  onComplete: () => void;
}

const PopularCargosButton = ({ onComplete }: PopularCargosButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const cargosIniciais: CreateCargo[] = [
    {
      nome: 'AJUD_GERAL',
      categoria: 'ambos',
      tipoContrato: 'mensalista',
      salarioBase: 1650.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 5.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 15.0,
        epiEpc: 8.0,
        outros: 0,
      },
      observacoes: '5.5 - Auxiliar geral em atividades de fabricação',
    },
    {
      nome: 'CALDEIREIRO',
      categoria: 'fabricacao',
      tipoContrato: 'mensalista',
      salarioBase: 3200.0,
      temPericulosidade: false,
      grauInsalubridade: 'medio',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 8.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 20.0,
        epiEpc: 15.0,
        outros: 0,
      },
      observacoes: '5.3 - Profissional de caldeiraria industrial',
    },
    {
      nome: 'ELETRICISTA',
      categoria: 'ambos',
      tipoContrato: 'mensalista',
      salarioBase: 3500.0,
      temPericulosidade: true,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 8.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 22.0,
        epiEpc: 20.0,
        outros: 0,
      },
      observacoes: '5.8 - Eletricista industrial com periculosidade',
    },
    {
      nome: 'LIDER EQUIPE',
      categoria: 'fabricacao',
      tipoContrato: 'mensalista',
      salarioBase: 4200.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 10.0, almoco: 22.0, janta: 0, cestaBasica: 0 },
        transporte: 15.0,
        uniforme: 8.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 25.0,
        epiEpc: 12.0,
        outros: 0,
      },
      observacoes: '5.2 - Líder de equipe de produção',
    },
    {
      nome: 'MEC.MANUTENÇÃO',
      categoria: 'fabricacao',
      tipoContrato: 'mensalista',
      salarioBase: 3800.0,
      temPericulosidade: false,
      grauInsalubridade: 'minimo',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 8.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 20.0,
        epiEpc: 15.0,
        outros: 0,
      },
      observacoes: '5.4 - Mecânico de manutenção industrial',
    },
    {
      nome: 'MEC.MONTADOR',
      categoria: 'montagem',
      tipoContrato: 'mensalista',
      salarioBase: 2800.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 7.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 18.0,
        epiEpc: 12.0,
        outros: 0,
      },
      observacoes: '5.11 - Mecânico montador industrial',
    },
    {
      nome: 'MOTORISTA',
      categoria: 'ambos',
      tipoContrato: 'mensalista',
      salarioBase: 2400.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
        transporte: 0,
        uniforme: 6.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 18.0,
        epiEpc: 5.0,
        outros: 0,
      },
      observacoes: '5.7 - Motorista de veículos da empresa',
    },
    {
      nome: 'PCP',
      categoria: 'fabricacao',
      tipoContrato: 'mensalista',
      salarioBase: 3600.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 10.0, almoco: 20.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 6.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 22.0,
        epiEpc: 5.0,
        outros: 0,
      },
      observacoes: '5.6 - Planejamento e Controle de Produção',
    },
    {
      nome: 'PEDREIRO',
      categoria: 'montagem',
      tipoContrato: 'mensalista',
      salarioBase: 2600.0,
      temPericulosidade: false,
      grauInsalubridade: 'minimo',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 18.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 7.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 18.0,
        epiEpc: 10.0,
        outros: 0,
      },
      observacoes: '5.9 - Pedreiro para obras e montagens',
    },
    {
      nome: 'SUPERVISOR OBRA',
      categoria: 'montagem',
      tipoContrato: 'mensalista',
      salarioBase: 5500.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 12.0, almoco: 25.0, janta: 0, cestaBasica: 100.0 },
        transporte: 20.0,
        uniforme: 10.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 35.0,
        epiEpc: 15.0,
        outros: 0,
      },
      observacoes: '5.1 - Supervisor de obras e montagens',
    },
    {
      nome: 'TEC. SEGURANÇA',
      categoria: 'ambos',
      tipoContrato: 'mensalista',
      salarioBase: 3200.0,
      temPericulosidade: false,
      grauInsalubridade: 'nenhum',
      horasMes: 184,
      custos: {
        alimentacao: { cafeManha: 8.0, almoco: 20.0, janta: 0, cestaBasica: 0 },
        transporte: 12.0,
        uniforme: 7.0,
        despesasAdmissionais: 3.0,
        assistenciaMedica: 20.0,
        epiEpc: 10.0,
        outros: 0,
      },
      observacoes: '5.10 - Técnico de segurança do trabalho',
    },
  ];

  const handlePopular = async () => {
    try {
      setLoading(true);

      let criados = 0;
      let erros = 0;

      for (const cargo of cargosIniciais) {
        try {
          await CargoService.create(cargo);
          criados++;
        } catch (error) {
          console.error(`Erro ao criar cargo ${cargo.nome}:`, error);
          erros++;
        }
      }

      if (erros === 0) {
        toast({
          title: 'Sucesso!',
          description: `${criados} cargos foram criados com sucesso.`,
          duration: 5000,
        });
      } else {
        toast({
          title: 'Parcialmente concluído',
          description: `${criados} cargos criados, ${erros} erros encontrados.`,
          variant: 'destructive',
          duration: 5000,
        });
      }

      onComplete();
    } catch (error) {
      console.error('Erro ao popular cargos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível popular os cargos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Popular Cargos Iniciais
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Popular cargos iniciais?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação irá criar 11 cargos padrão da lista de Mão de Obra - Fabricação:
            <div className="mt-3 p-3 bg-muted rounded-md text-sm">
              <ul className="space-y-1">
                <li>• AJUD_GERAL</li>
                <li>• CALDEIREIRO</li>
                <li>• ELETRICISTA</li>
                <li>• LIDER EQUIPE</li>
                <li>• MEC.MANUTENÇÃO</li>
                <li>• MEC.MONTADOR</li>
                <li>• MOTORISTA</li>
                <li>• PCP</li>
                <li>• PEDREIRO</li>
                <li>• SUPERVISOR OBRA</li>
                <li>• TEC. SEGURANÇA</li>
              </ul>
            </div>
            <p className="mt-3 text-xs">
              Os cargos serão criados com valores e adicionais apropriados conforme CLT.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePopular}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Cargos'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PopularCargosButton;
