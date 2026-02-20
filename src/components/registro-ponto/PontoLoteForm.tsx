import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Search,
  Building,
  ArrowLeft,
  ArrowRight,
  Save,
  Users,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { Obra } from '@/interfaces/ObrasInterface';
import { CreateEffectiveDto } from '@/interfaces/EffectiveInterface';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { normalizeSetorCode } from '@/utils/labels';
import { cn } from '@/lib/utils';

interface PontoLoteFormProps {
  colaboradores: Colaborador[];
  obras: Obra[];
  onSubmit: (registros: CreateEffectiveDto[]) => void;
  onClose: () => void;
  turno: number;
}

interface ColaboradorRegistro extends Colaborador {
  presente: boolean;
  faltou: boolean;
  project?: string;
  reason?: string;
}

// Constantes para os setores
const SETORES = {
  PRODUCAO: 'PRODUCAO',
  ADMINISTRATIVO: 'ADMINISTRATIVO',
  ENGENHARIA: 'ENGENHARIA',
} as const;

const getSetorLabel = (sector: string) => {
  switch (sector) {
    case 'PRODUCAO':
      return 'Produção';
    case 'ADMINISTRATIVO':
      return 'Administrativo';
    case 'ENGENHARIA':
      return 'Engenharia';
    default:
      return sector;
  }
};

// Função para comparação case-insensitive de setores
const isProducao = (sector: string) => {
  return (
    sector?.toUpperCase() === 'PRODUCAO' || sector?.toLowerCase() === 'produção'
  );
};

export const PontoLoteForm: React.FC<PontoLoteFormProps> = ({
  colaboradores,
  obras,
  onSubmit,
  onClose,
  turno,
}) => {
  const isMobile = useIsMobile();
  console.log('PontoLoteForm - obras recebidas:', obras);
  console.log('PontoLoteForm - colaboradores:', colaboradores);
  console.log(
    'PontoLoteForm - setores dos colaboradores:',
    colaboradores.map((c) => ({ nome: c.name, setor: c.sector }))
  );

  const [etapa, setEtapa] = useState<'presentes' | 'faltas'>('presentes');
  const [registros, setRegistros] = useState<ColaboradorRegistro[]>(
    colaboradores
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((col) => ({
        ...col,
        presente: false,
        faltou: false,
      }))
  );

  const [filtroSetor, setFiltroSetor] = useState<string>('');
  const [filtroNome, setFiltroNome] = useState<string>('');
  const [obraGlobal, setObraGlobal] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMultiselect, setOpenMultiselect] = useState(false);
  const [motivoGlobal, setMotivoGlobal] = useState<string>('');

  // Obter setores únicos dos colaboradores (normalizados para evitar duplicatas)
  const setores = Array.from(
    new Set(
      colaboradores
        .map((c) => c.sector?.toUpperCase())
        .filter(Boolean)
    )
  );

  const colaboradoresFiltrados = registros.filter((col) => {
    const matchSetor =
      !filtroSetor ||
      filtroSetor === 'todos' ||
      col.sector?.toUpperCase() === filtroSetor;
    const matchNome =
      !filtroNome || col.name.toLowerCase().includes(filtroNome.toLowerCase());

    // Na etapa de faltas, excluir colaboradores que estão presentes
    if (etapa === 'faltas') {
      return matchSetor && matchNome && !col.presente;
    }

    return matchSetor && matchNome;
  });

  // Verificar se há colaboradores de produção presentes (usando função case-insensitive)
  const presentesProducao = registros.filter(
    (r) => r.presente && isProducao(r.sector)
  );
  const presentesOutrosSetores = registros.filter(
    (r) => r.presente && !isProducao(r.sector)
  );
  const obraObrigatoria = presentesProducao.length > 0;

  console.log('Análise de setores:', {
    presentesProducao: presentesProducao.map((p) => ({
      nome: p.name,
      setor: p.sector,
    })),
    presentesOutrosSetores: presentesOutrosSetores.map((p) => ({
      nome: p.name,
      setor: p.sector,
    })),
    obraObrigatoria,
  });

  const validateProximaEtapa = () => {
    const errors: string[] = [];

    // Validar se há obra selecionada apenas se houver colaboradores de produção presentes
    if (obraObrigatoria && (!obraGlobal || obraGlobal === 'none')) {
      errors.push(
        `Selecione uma obra - obrigatório para os ${presentesProducao.length} colaborador(es) de Produção`
      );
    }

    // Validar se há pelo menos um colaborador presente
    const presentes = registros.filter((r) => r.presente);
    if (presentes.length === 0) {
      errors.push('Marque pelo menos um colaborador como presente');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const validateSubmit = () => {
    const errors: string[] = [];

    // Validar motivos das faltas
    const faltasSemMotivo = registros.filter(
      (r) => r.faltou && (!r.reason || r.reason.trim() === '')
    );
    if (faltasSemMotivo.length > 0) {
      errors.push(
        `${faltasSemMotivo.length} colaborador(es) marcado(s) como falta sem motivo preenchido`
      );
    }

    // Validar se há pelo menos um registro (presente ou falta)
    const registrosValidos = registros.filter((r) => r.presente || r.faltou);
    if (registrosValidos.length === 0) {
      errors.push('É necessário registrar pelo menos um colaborador');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const proximaEtapa = () => {
    if (!validateProximaEtapa()) {
      toast({
        title: 'Validação',
        description: 'Corrija os erros antes de prosseguir',
        variant: 'destructive',
      });
      return;
    }

    setEtapa('faltas');
    setValidationErrors([]);
    toast({ title: 'Agora selecione os colaboradores que faltaram' });
  };

  const voltarEtapa = () => {
    setEtapa('presentes');
    setValidationErrors([]);
  };

  const updateRegistro = (
    id: number,
    field: keyof ColaboradorRegistro,
    value: any
  ) => {
    setRegistros((prev) =>
      prev.map((reg) => {
        if (reg.id === id) {
          const updated = { ...reg, [field]: value };

          // Se está marcando como presente e há obra global selecionada, atribuir apenas para PRODUÇÃO
          if (
            field === 'presente' &&
            value &&
            obraGlobal &&
            obraGlobal !== 'none' &&
            isProducao(reg.sector)
          ) {
            updated.project = obraGlobal;
            console.log(
              `Atribuindo obra "${obraGlobal}" para colaborador de Produção: ${reg.name}`
            );
          }

          // Se está desmarcando como presente, limpar projeto
          if (field === 'presente' && !value) {
            updated.project = undefined;
          }

          return updated;
        }
        return reg;
      })
    );
  };

  // Toggle seleção do colaborador no multiselect mobile
  const toggleColaborador = (id: number) => {
    const field = etapa === 'presentes' ? 'presente' : 'faltou';
    const registro = registros.find((r) => r.id === id);
    if (registro) {
      updateRegistro(id, field, !registro[field]);
    }
  };

  // Remover colaborador da seleção
  const removerColaborador = (id: number) => {
    const field = etapa === 'presentes' ? 'presente' : 'faltou';
    updateRegistro(id, field, false);
  };

  // Obter colaboradores selecionados na etapa atual
  const selecionados = etapa === 'presentes'
    ? registros.filter((r) => r.presente)
    : registros.filter((r) => r.faltou);

  // Aplicar motivo global a todas as faltas
  const aplicarMotivoGlobal = () => {
    if (motivoGlobal.trim()) {
      setRegistros((prev) =>
        prev.map((reg) => {
          if (reg.faltou) {
            return { ...reg, reason: motivoGlobal };
          }
          return reg;
        })
      );
      toast({ title: 'Motivo aplicado a todos os colaboradores com falta' });
    }
  };

  const handleSubmit = async () => {
    if (!validateSubmit()) {
      toast({
        title: 'Validação',
        description: 'Corrija os erros antes de finalizar',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const registrosValidos = registros
        .filter((reg) => reg.presente || reg.faltou)
        .map((reg) => {
          const roleCode = (normalizeSetorCode(reg.sector) || 'PRODUCAO') as
            | 'ENGENHARIA'
            | 'ADMINISTRATIVO'
            | 'PRODUCAO';
          return {
            username: reg.name,
            shift: turno,
            role: roleCode,
            typeRegister: (reg.presente ? roleCode : 'FALTA') as
              | 'PRODUCAO'
              | 'ADMINISTRATIVO'
              | 'ENGENHARIA'
              | 'FALTA',
            project: reg.project,
            sector: reg.sector,
            reason: reg.reason,
            status: reg.presente ? ('PRESENTE' as const) : ('FALTA' as const),
          };
        });

      console.log('Registros válidos:', registrosValidos);

      await onSubmit(registrosValidos);
      onClose();
      toast({
        title: `${registrosValidos.length} registros criados com sucesso!`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resumo = {
    total: registros.length,
    presentes: registros.filter((r) => r.presente).length,
    faltas: registros.filter((r) => r.faltou).length,
    naoRegistrados: registros.filter((r) => !r.presente && !r.faltou).length,
  };

  const obraGlobalNome = obras.find((o) => o.name === obraGlobal)?.name || '';

  const getTurnoLabel = (turno: number) => {
    switch (turno) {
      case 1:
        return '1º Turno';
      case 2:
        return '2º Turno';
      case 3:
        return 'Turno Central';
      default:
        return `${turno}º Central`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#003366]">
          Registro em Lote - {getTurnoLabel(turno)}
        </h2>
        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
          <Badge variant="secondary" className="bg-[#E0E0E0] text-xs sm:text-sm">
            <Users className="w-3 h-3 mr-1" />
            {resumo.total} Total
          </Badge>
          <Badge variant="default" className="bg-[#FFA500] text-white text-xs sm:text-sm">
            {resumo.presentes} Presentes
          </Badge>
          <Badge variant="destructive" className="text-xs sm:text-sm">{resumo.faltas} Faltas</Badge>
          {resumo.naoRegistrados > 0 && (
            <Badge variant="outline" className="text-xs sm:text-sm">
              {resumo.naoRegistrados} Não Registrados
            </Badge>
          )}
        </div>
      </div>

      {/* Etapa atual */}
      <div className="text-center">
        <Badge
          variant={etapa === 'presentes' ? 'default' : 'outline'}
          className="text-sm"
        >
          {etapa === 'presentes'
            ? 'Etapa 1: Marcar Presentes'
            : 'Etapa 2: Selecionar Faltas'}
        </Badge>
      </div>

      {/* Informações sobre setores presentes */}
      {etapa === 'presentes' && resumo.presentes > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-medium text-blue-800">Resumo por Setor:</p>
                <div className="flex gap-2 flex-wrap">
                  {presentesProducao.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-[#FFA500]/20 text-[#003366]"
                    >
                      Produção: {presentesProducao.length} (obra obrigatória)
                    </Badge>
                  )}
                  {presentesOutrosSetores.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Outros setores: {presentesOutrosSetores.length} (obra
                      opcional)
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagens de validação */}
      {validationErrors.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-destructive">
                  Erros de validação:
                </p>
                <ul className="text-sm text-destructive space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros - No mobile mostra apenas seleção de obra */}
      <Card className={cn(isMobile && etapa !== 'presentes' && "hidden")}>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Filtro por nome - apenas desktop */}
            {!isMobile && (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Seleção de obra global (apenas na etapa de presentes) */}
            {etapa === 'presentes' && (
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  value={obraGlobal}
                  onValueChange={(value) => {
                    console.log('Obra selecionada:', value);
                    setObraGlobal(value);
                  }}
                >
                  <SelectTrigger
                    className={`pl-10 ${
                      obraObrigatoria && (!obraGlobal || obraGlobal === 'none')
                        ? 'border-destructive'
                        : ''
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        obraObrigatoria
                          ? 'Selecionar obra (obrigatório para Produção)'
                          : 'Selecionar obra (opcional)'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Nenhuma obra selecionada
                    </SelectItem>
                    <SelectItem value="Fabrica">
                      Fábrica
                    </SelectItem>
                    {obras.map((obra) => (
                      <SelectItem key={obra.id} value={obra.name}>
                        {obra.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtro por setor - apenas desktop */}
            {!isMobile && (
            <Select value={filtroSetor} onValueChange={setFiltroSetor}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                {setores.map((setor) => (
                  <SelectItem key={setor} value={setor!}>
                    {getSetorLabel(setor)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            )}
          </div>

          {/* Indicador de obra global selecionada */}
          {etapa === 'presentes' && obraGlobal && obraGlobal !== 'none' && (
            <div className="mt-3 p-2 bg-[#FFA500]/10 border border-[#FFA500]/20 rounded-md">
              <p className="text-sm text-[#003366]">
                <Building className="inline w-4 h-4 mr-1" />
                Obra selecionada: <strong>{obraGlobalNome}</strong>
                <span className="ml-2 text-muted-foreground">
                  (será atribuída automaticamente aos colaboradores de Produção)
                </span>
              </p>
            </div>
          )}

          {/* Aviso sobre colaboradores excluídos na etapa de faltas */}
          {etapa === 'faltas' && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <Users className="inline w-4 h-4 mr-1" />
                Colaboradores marcados como presentes não aparecem nesta lista.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Colaboradores - Responsiva */}
      <Card>
        <CardContent className="p-3 sm:p-0">
          {isMobile ? (
            // Layout de Multiselect para Mobile usando Drawer
            <div className="space-y-4">
              {/* Botão que abre o Drawer */}
              <Drawer open={openMultiselect} onOpenChange={setOpenMultiselect}>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto min-h-[44px] py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {etapa === 'presentes' ? 'Selecionar Presentes' : 'Selecionar Faltas'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={selecionados.length > 0 ? 'default' : 'secondary'}
                        className={selecionados.length > 0 ? 'bg-[#FFA500]' : ''}
                      >
                        {selecionados.length}
                      </Badge>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh]">
                  <DrawerHeader className="border-b pb-2">
                    <DrawerTitle>
                      {etapa === 'presentes' ? 'Selecionar Presentes' : 'Selecionar Faltas'}
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 flex-1 overflow-hidden flex flex-col">
                    {/* Campo de busca */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar colaborador..."
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {/* Lista de colaboradores com scroll */}
                    <div className="flex-1 overflow-y-auto -mx-4 px-4" style={{ maxHeight: 'calc(85vh - 180px)' }}>
                      <div className="space-y-1">
                        {colaboradoresFiltrados.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            Nenhum colaborador encontrado.
                          </p>
                        ) : (
                          colaboradoresFiltrados.map((registro) => {
                            const isSelected = etapa === 'presentes' ? registro.presente : registro.faltou;
                            return (
                              <button
                                key={registro.id}
                                type="button"
                                onClick={() => toggleColaborador(registro.id)}
                                className={cn(
                                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                  isSelected
                                    ? etapa === 'presentes'
                                      ? "bg-[#FFA500]/10 border border-[#FFA500]"
                                      : "bg-destructive/10 border border-destructive"
                                    : "hover:bg-muted/50 border border-transparent"
                                )}
                              >
                                <div className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-sm border shrink-0",
                                  isSelected
                                    ? etapa === 'presentes'
                                      ? "bg-[#FFA500] border-[#FFA500] text-white"
                                      : "bg-destructive border-destructive text-white"
                                    : "border-muted-foreground"
                                )}>
                                  {isSelected && <Check className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{registro.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {registro.role} • {getSetorLabel(registro.sector)}
                                  </p>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                    {/* Botão de fechar */}
                    <div className="pt-3 border-t mt-3">
                      <Button
                        onClick={() => setOpenMultiselect(false)}
                        className="w-full bg-[#FFA500] hover:bg-[#FFA500]/90"
                      >
                        Confirmar ({selecionados.length} selecionados)
                      </Button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>

              {/* Lista dos selecionados com badges */}
              {selecionados.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {etapa === 'presentes' ? 'Presentes selecionados:' : 'Faltas selecionadas:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selecionados.map((col) => (
                      <Badge
                        key={col.id}
                        variant="secondary"
                        className={cn(
                          "pl-2 pr-1 py-1 flex items-center gap-1",
                          etapa === 'presentes'
                            ? "bg-[#FFA500]/20 text-[#003366]"
                            : "bg-destructive/20 text-destructive"
                        )}
                      >
                        <span className="text-xs">{col.name}</span>
                        <button
                          type="button"
                          onClick={() => removerColaborador(col.id)}
                          className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {/* Para presentes: mostrar info da obra */}
                  {etapa === 'presentes' && obraGlobal && obraGlobal !== 'none' && (
                    <div className="p-2 bg-[#FFA500]/10 border border-[#FFA500]/20 rounded-md">
                      <p className="text-xs text-[#003366]">
                        <Building className="inline w-3 h-3 mr-1" />
                        Obra: <strong>{obraGlobalNome}</strong>
                      </p>
                    </div>
                  )}

                  {/* Para faltas: input de motivo global */}
                  {etapa === 'faltas' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={motivoGlobal}
                          onChange={(e) => setMotivoGlobal(e.target.value)}
                          placeholder="Motivo da falta (aplicar a todos)"
                          className="flex-1 text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={aplicarMotivoGlobal}
                          disabled={!motivoGlobal.trim()}
                        >
                          Aplicar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ou edite individualmente abaixo:
                      </p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selecionados.map((col) => (
                          <div key={col.id} className="flex items-center gap-2">
                            <span className="text-xs font-medium truncate w-24">{col.name}</span>
                            <Input
                              value={col.reason || ''}
                              onChange={(e) => updateRegistro(col.id, 'reason', e.target.value)}
                              placeholder="Motivo"
                              className={cn(
                                "flex-1 h-8 text-xs",
                                !col.reason?.trim() && "border-destructive"
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selecionados.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum colaborador selecionado</p>
                  <p className="text-xs">Clique no botão acima para selecionar</p>
                </div>
              )}
            </div>
          ) : (
            // Layout de Tabela para Desktop
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0 shadow-sm">
                  <tr className="border-b-2 border-border/50">
                    {etapa === 'presentes' ? (
                      <>
                        <th className="p-3 text-left font-semibold text-foreground border-r border-border/30 w-20 text-center">
                          Presente
                        </th>
                        <th className="p-3 text-left font-semibold text-foreground border-r border-border/30">
                          Nome
                        </th>
                        <th className="p-3 text-left font-semibold text-foreground border-r border-border/30">
                          Cargo
                        </th>
                        <th className="p-3 text-left font-semibold text-foreground border-r border-border/30">
                          Setor
                        </th>
                        <th className="p-3 text-left font-semibold text-foreground">
                          Obra
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="p-3 text-left font-semibold text-foreground border-r border-border/30 w-20 text-center">
                          Faltou
                        </th>
                        <th className="p-3 text-left font-semibold text-foreground border-r border-border/30">
                          Nome
                        </th>
                        <th className="p-3 text-left font-semibold text-foreground border-r border-border/30">
                          Cargo
                        </th>
                        <th className="p-3 text-left font-semibold text-foreground border-r border-border/30">
                          Setor
                        </th>
                        <th className="p-3 text-left font-semibold text-foreground">
                          Motivo da Falta *
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {etapa === 'presentes'
                    ? colaboradoresFiltrados.map((registro) => (
                        <tr
                          key={registro.id}
                          className={`hover:bg-muted/30 border-b border-border/30 transition-colors ${
                            registro.presente
                              ? 'bg-[#FFA500]/10 border-l-4 border-l-[#FFA500]'
                              : 'bg-background border-l-4 border-l-transparent'
                          }`}
                        >
                          <td className="p-3 text-center border-r border-border/30">
                            <Checkbox
                              checked={registro.presente}
                              onCheckedChange={(checked) =>
                                updateRegistro(registro.id, 'presente', checked)
                              }
                              className="data-[state=checked]:bg-[#FFA500] data-[state=checked]:border-[#FFA500]"
                            />
                          </td>
                          <td className="p-3 font-medium border-r border-border/30">
                            {registro.name}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground border-r border-border/30">
                            {registro.role}
                          </td>
                          <td className="p-3 border-r border-border/30">
                            <Badge variant="outline" className="text-xs">
                              {getSetorLabel(registro.sector)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {registro.presente && (
                              <div className="text-sm">
                                {isProducao(registro.sector) ? (
                                  registro.project ? (
                                    <Badge
                                      variant="secondary"
                                      className="bg-[#FFA500]/20 text-[#003366]"
                                    >
                                      {registro.project}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      Aguardando obra...
                                    </span>
                                  )
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-800"
                                  >
                                    Obra não obrigatória
                                  </Badge>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    : colaboradoresFiltrados.map((registro) => (
                        <tr
                          key={registro.id}
                          className={`hover:bg-muted/30 border-b border-border/30 transition-colors ${
                            registro.faltou
                              ? 'bg-destructive/10 border-l-4 border-l-destructive'
                              : 'bg-muted/20 border-l-4 border-l-transparent'
                          }`}
                        >
                          <td className="p-3 text-center border-r border-border/30">
                            <Checkbox
                              checked={registro.faltou}
                              onCheckedChange={(checked) =>
                                updateRegistro(registro.id, 'faltou', checked)
                              }
                            />
                          </td>
                          <td className="p-3 font-medium border-r border-border/30">
                            {registro.name}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground border-r border-border/30">
                            {registro.role}
                          </td>
                          <td className="p-3 border-r border-border/30">
                            <Badge variant="outline" className="text-xs">
                              {getSetorLabel(registro.sector)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {registro.faltou && (
                              <Input
                                value={registro.reason || ''}
                                onChange={(e) =>
                                  updateRegistro(
                                    registro.id,
                                    'reason',
                                    e.target.value
                                  )
                                }
                                className={`h-8 text-xs ${
                                  registro.faltou &&
                                  (!registro.reason ||
                                    registro.reason.trim() === '')
                                    ? 'border-destructive'
                                    : ''
                                }`}
                                placeholder="Motivo obrigatório"
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de navegação */}
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'} gap-2`}>
        <div className={`${isMobile ? 'order-2' : ''}`}>
          {etapa === 'faltas' && (
            <Button
              variant="outline"
              onClick={voltarEtapa}
              className={`border-[#FFA500] text-[#FFA500] hover:bg-[#FFA500]/10 ${isMobile ? 'w-full' : ''}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isMobile ? 'Voltar' : 'Voltar aos Presentes'}
            </Button>
          )}
        </div>
        <div className={`flex gap-2 ${isMobile ? 'order-1 flex-col sm:flex-row' : ''}`}>
          <Button 
            variant="outline" 
            onClick={onClose}
            className={`${isMobile ? 'w-full sm:w-auto' : ''}`}
          >
            Cancelar
          </Button>
          {etapa === 'presentes' ? (
            <Button
              onClick={proximaEtapa}
              className={`bg-[#FFA500] hover:bg-[#FFA500]/90 ${isMobile ? 'w-full sm:w-auto' : ''}`}
              disabled={validationErrors.length > 0}
            >
              {isMobile ? (
                <>
                  Selecionar Faltas
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Próximo: Selecionar Faltas
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className={cn(
                "h-11 font-semibold shadow-lg transition-all bg-primary hover:bg-primary/90",
                isMobile ? "w-full sm:w-auto" : "",
                (isSubmitting || validationErrors.length > 0) && "opacity-70"
              )}
              disabled={validationErrors.length > 0 || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Salvar Registros</span>
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
