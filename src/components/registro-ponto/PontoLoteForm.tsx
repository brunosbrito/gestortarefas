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
  Search,
  Building,
  ArrowLeft,
  ArrowRight,
  Save,
  Users,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Colaborador } from '@/interfaces/ColaboradorInterface';
import { Obra } from '@/interfaces/ObrasInterface';
import { CreateEffectiveDto } from '@/interfaces/EffectiveInterface';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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

  // Obter setores únicos dos colaboradores
  const setores = Array.from(
    new Set(colaboradores.map((c) => c.sector).filter(Boolean))
  );

  const colaboradoresFiltrados = registros.filter((col) => {
    const matchSetor =
      !filtroSetor || filtroSetor === 'todos' || col.sector === filtroSetor;
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

  const handleSubmit = () => {
    if (!validateSubmit()) {
      toast({
        title: 'Validação',
        description: 'Corrija os erros antes de finalizar',
        variant: 'destructive',
      });
      return;
    }

    const registrosValidos = registros
      .filter((reg) => reg.presente || reg.faltou)
      .map((reg) => ({
        username: reg.name,
        shift: turno,
        role: reg.sector as 'ENGENHARIA' | 'ADMINISTRATIVO' | 'PRODUCAO',
        typeRegister: (reg.presente ? reg.sector : 'FALTA') as
          | 'PRODUCAO'
          | 'ADMINISTRATIVO'
          | 'ENGENHARIA'
          | 'FALTA',
        project: reg.project,
        sector: reg.sector,
        reason: reg.reason,
        status: reg.presente ? ('PRESENTE' as const) : ('FALTA' as const),
      }));

    console.log('Registros válidos:', registrosValidos);

    onSubmit(registrosValidos);
    onClose();
    toast({
      title: `${registrosValidos.length} registros criados com sucesso!`,
    });
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

      {/* Filtros */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Filtro por nome */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                className="pl-10"
              />
            </div>

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

            {/* Filtro por setor */}
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
        <CardContent className="p-0">
          {isMobile ? (
            // Layout de Cards para Mobile
            <div className="max-h-96 overflow-y-auto p-3 space-y-3">
              {colaboradoresFiltrados.map((registro) => (
                <Card
                  key={registro.id}
                  className={`${
                    etapa === 'presentes'
                      ? registro.presente
                        ? 'bg-[#FFA500]/10 border-[#FFA500]'
                        : 'bg-background'
                      : registro.faltou
                      ? 'bg-destructive/10 border-destructive'
                      : 'bg-muted/20'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 pt-1">
                        <Checkbox
                          checked={etapa === 'presentes' ? registro.presente : registro.faltou}
                          onCheckedChange={(checked) =>
                            updateRegistro(
                              registro.id,
                              etapa === 'presentes' ? 'presente' : 'faltou',
                              checked
                            )
                          }
                          className={etapa === 'presentes' ? "data-[state=checked]:bg-[#FFA500] data-[state=checked]:border-[#FFA500]" : ""}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-medium text-sm">{registro.name}</h3>
                          <p className="text-xs text-muted-foreground">{registro.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getSetorLabel(registro.sector)}
                          </Badge>
                        </div>
                        {etapa === 'presentes' && registro.presente && (
                          <div className="text-xs">
                            {isProducao(registro.sector) ? (
                              registro.project ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-[#FFA500]/20 text-[#003366] text-xs"
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
                                className="bg-green-100 text-green-800 text-xs"
                              >
                                Obra não obrigatória
                              </Badge>
                            )}
                          </div>
                        )}
                        {etapa === 'faltas' && registro.faltou && (
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Layout de Tabela para Desktop
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-[#E0E0E0] sticky top-0">
                  <tr>
                    {etapa === 'presentes' ? (
                      <>
                        <th className="p-3 text-left font-medium">Presente</th>
                        <th className="p-3 text-left font-medium">Nome</th>
                        <th className="p-3 text-left font-medium">Cargo</th>
                        <th className="p-3 text-left font-medium">Setor</th>
                        <th className="p-3 text-left font-medium">Obra</th>
                      </>
                    ) : (
                      <>
                        <th className="p-3 text-left font-medium">Faltou</th>
                        <th className="p-3 text-left font-medium">Nome</th>
                        <th className="p-3 text-left font-medium">Cargo</th>
                        <th className="p-3 text-left font-medium">Setor</th>
                        <th className="p-3 text-left font-medium">
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
                          className={`hover:bg-muted/30 ${
                            registro.presente
                              ? 'bg-[#FFA500]/10 border-l-4 border-[#FFA500]'
                              : 'bg-background'
                          }`}
                        >
                          <td className="p-3 text-center">
                            <Checkbox
                              checked={registro.presente}
                              onCheckedChange={(checked) =>
                                updateRegistro(registro.id, 'presente', checked)
                              }
                              className="data-[state=checked]:bg-[#FFA500] data-[state=checked]:border-[#FFA500]"
                            />
                          </td>
                          <td className="p-3 font-medium">{registro.name}</td>
                          <td className="p-3">{registro.role}</td>
                          <td className="p-3">
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
                          className={`hover:bg-muted/30 ${
                            registro.faltou
                              ? 'bg-destructive/10 border-l-4 border-destructive'
                              : 'bg-muted/20'
                          }`}
                        >
                          <td className="p-3 text-center">
                            <Checkbox
                              checked={registro.faltou}
                              onCheckedChange={(checked) =>
                                updateRegistro(registro.id, 'faltou', checked)
                              }
                            />
                          </td>
                          <td className="p-3 font-medium">{registro.name}</td>
                          <td className="p-3">{registro.role}</td>
                          <td className="p-3">
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
              className={`bg-[#FFA500] hover:bg-[#FFA500]/90 ${isMobile ? 'w-full sm:w-auto' : ''}`}
              disabled={validationErrors.length > 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Registros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
