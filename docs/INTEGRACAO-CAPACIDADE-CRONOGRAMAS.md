# INTEGRAÇÃO: Capacidade Produtiva ↔ Cronogramas

**FASE 3 PCP** - Sistema: Gestor Master - GMX Soluções Industriais

---

## 📋 Visão Geral

Este documento descreve como o módulo **Capacidade Produtiva** (FASE 3 PCP) se integra com o módulo **Cronogramas** existente do sistema.

A integração permite:
- ✅ **Validar capacidade** antes de alocar recursos em tarefas
- ✅ **Detectar conflitos** quando múltiplos projetos competem pelo mesmo recurso
- ✅ **Sugerir nivelamento** de recursos baseado em disponibilidade real
- ✅ **Simular impacto** de novos projetos na capacidade existente

---

## 🔗 Arquitetura de Integração

```
┌────────────────────────────────────────────────────────────────┐
│  CRONOGRAMAS (Já Existe)                                       │
├────────────────────────────────────────────────────────────────┤
│  1. Usuário cria Cronograma para Projeto X                    │
│  2. Define Tarefas com dependências                           │
│  3. Aloca Recursos (RecursoCronogramaService)                  │
│     └─ Colaborador Y em Tarefa Z (X horas)                    │
└──────────────────┬─────────────────────────────────────────────┘
                   │
                   ↓ (INTEGRAÇÃO - FASE 3)
┌────────────────────────────────────────────────────────────────┐
│  CAPACIDADE PRODUTIVA (Novo - FASE 3)                          │
├────────────────────────────────────────────────────────────────┤
│  4. CapacidadeProdutivaService.calcularAnaliseConsolidada()    │
│     - Lê alocações de RecursoCronogramaService                 │
│     - Calcula horas disponíveis por recurso                    │
│     - Compara: Disponível vs Alocado                           │
│  5. Detecta Gargalos (utilização > 90%)                        │
│  6. Detecta Conflitos (mesmo recurso, datas sobrepostas)       │
│  7. Gera Sugestões de Nivelamento                              │
└──────────────────┬─────────────────────────────────────────────┘
                   │
                   ↓ (FEEDBACK)
┌────────────────────────────────────────────────────────────────┐
│  VALIDAÇÃO NO CRONOGRAMA (Proposto)                            │
├────────────────────────────────────────────────────────────────┤
│  8. Antes de Salvar Alocação:                                  │
│     - CronogramaService.validarCapacidade()                    │
│     - Chama CapacidadeProdutivaService                         │
│     - Se gargalo detectado → ALERTA ao usuário                 │
│     - Permite continuar com confirmação                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 📦 Componentes Envolvidos

### 1. **RecursoCronogramaService** (Existente)
- **Localização**: `src/services/RecursoCronogramaService.ts`
- **Função**: Gerencia alocação de recursos em tarefas de cronograma
- **Métodos Principais**:
  - `alocarRecurso(tarefaId, colaboradorId, percentualAlocacao)`
  - `getAlocacoesPorRecurso(recursoId)`
  - `getAlocacoesPorProjeto(projetoId)`

### 2. **CapacidadeProdutivaService** (Novo - FASE 3)
- **Localização**: `src/services/CapacidadeProdutivaService.ts`
- **Função**: Calcula capacidade e identifica gargalos
- **Métodos Principais**:
  - `calcularAnaliseConsolidada(request)` - Análise multi-projeto
  - `gerarDashboard()` - KPIs e gráficos
  - `simularNovoProjeto()` - Simula impacto

### 3. **CronogramaService** (Existente)
- **Localização**: `src/services/CronogramaService.ts`
- **Função**: Gerencia cronogramas e dependências
- **Integração Proposta**:
  - ✅ Adicionar método `validarCapacidade(tarefaId, recursoId, horas)` que consulta CapacidadeProdutivaService

---

## 🔄 Fluxo de Dados

### Fluxo 1: Análise de Capacidade

```typescript
// 1. Cronograma aloca recursos
await RecursoCronogramaService.alocarRecurso({
  tarefaCronogramaId: 101,
  colaboradorId: 5,
  percentualAlocacao: 80,
  horasAlocadas: 120
});

// 2. Capacidade lê alocações (mock ou integração futura)
const analise = await CapacidadeProdutivaService.calcularAnaliseConsolidada({
  projetoIds: [1, 2, 3],
  periodoInicio: '2026-01-01',
  periodoFim: '2026-03-31'
});

// 3. Resultado indica gargalos
if (analise.gargalos.length > 0) {
  console.log('Gargalos detectados:', analise.gargalos);
  // Dashboard mostra alerta visual
}
```

### Fluxo 2: Validação Antes de Alocar (Proposto)

```typescript
// Em CronogramaService (método a adicionar)
async validarCapacidade(tarefaId: number, recursoId: number, horasNovas: number): Promise<{
  valido: boolean;
  mensagem: string;
  taxaUtilizacao: number;
}> {
  // Calcula análise para o recurso específico
  const analise = await CapacidadeProdutivaService.calcularAnaliseConsolidada({
    recursoIds: [recursoId]
  });

  const recurso = analise.analisesPorRecurso[0];
  const taxaNova = ((recurso.horasAlocadas + horasNovas) / recurso.horasDisponiveis) * 100;

  if (taxaNova > 90) {
    return {
      valido: false,
      mensagem: `⚠️ ATENÇÃO: Recurso ficará sobrecarregado (${taxaNova.toFixed(1)}%). Deseja continuar?`,
      taxaUtilizacao: taxaNova
    };
  }

  return {
    valido: true,
    mensagem: `✅ Capacidade OK (${taxaNova.toFixed(1)}%)`,
    taxaUtilizacao: taxaNova
  };
}
```

### Fluxo 3: Simulação de Novo Projeto

```typescript
// Antes de aceitar nova proposta comercial
const simulacao = await CapacidadeProdutivaService.simularNovoProjeto(
  'Galpão Logístico - Cliente ABC',
  800, // 800 horas estimadas
  '2026-03-01',
  '2026-05-31'
);

if (!simulacao.viavel) {
  console.warn('Projeto NÃO viável:', simulacao.mensagem);
  console.log('Data ideal:', simulacao.dataIdealInicio);
  // Sugerir postergar ou contratar temporários
}
```

---

## 📊 Dados Compartilhados

### Interface `AlocacaoRecurso` (Capacidade)

Esta interface no módulo Capacidade **mapeia** dados do `RecursoCronograma` (existente):

```typescript
// FASE 3 - CapacidadeInterface.ts
export interface AlocacaoRecurso {
  id: string;
  recursoId: number;              // → RecursoCronograma.colaboradorId
  recursoNome: string;
  recursoTipo: TipoRecurso;
  projetoId: number;              // → Cronograma.projetoId
  projetoNome: string;
  tarefaCronogramaId?: number;    // → RecursoCronograma.tarefaCronogramaId
  tarefaDescricao?: string;
  dataInicio: string;             // → TarefaCronograma.dataInicio
  dataFim: string;                // → TarefaCronograma.dataFim
  horasAlocadas: number;          // → RecursoCronograma.horasAlocadas
  percentualAlocacao: number;     // → RecursoCronograma.percentualAlocacao
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
}
```

### Conversão (Futuro - Integração Backend)

```typescript
// Método auxiliar para converter RecursoCronograma → AlocacaoRecurso
function converterParaAlocacao(recursoCronograma: RecursoCronograma): AlocacaoRecurso {
  return {
    id: `aloc-${recursoCronograma.id}`,
    recursoId: recursoCronograma.colaboradorId,
    recursoNome: recursoCronograma.colaborador.nome,
    recursoTipo: 'colaborador',
    projetoId: recursoCronograma.tarefa.cronograma.projetoId,
    projetoNome: recursoCronograma.tarefa.cronograma.projeto.nome,
    tarefaCronogramaId: recursoCronograma.tarefaCronogramaId,
    tarefaDescricao: recursoCronograma.tarefa.nome,
    dataInicio: recursoCronograma.tarefa.dataInicio,
    dataFim: recursoCronograma.tarefa.dataFim,
    horasAlocadas: recursoCronograma.horasAlocadas,
    percentualAlocacao: recursoCronograma.percentualAlocacao,
    status: recursoCronograma.tarefa.status === 'concluida' ? 'concluida' : 'em_andamento',
  };
}
```

---

## 🚀 Implementação Futura (Backend Integration)

### Passo 1: Adicionar Método no CronogramaService

```typescript
// src/services/CronogramaService.ts

import CapacidadeProdutivaService from './CapacidadeProdutivaService';

class CronogramaServiceClass {
  // ... métodos existentes ...

  /**
   * NOVO: Valida capacidade antes de alocar recurso
   */
  async validarCapacidadeAntesSalvar(
    tarefaId: number,
    recursoId: number,
    horasNovas: number
  ): Promise<{ valido: boolean; mensagem: string; taxaUtilizacao: number }> {
    const analise = await CapacidadeProdutivaService.calcularAnaliseConsolidada({
      recursoIds: [recursoId]
    });

    if (analise.analisesPorRecurso.length === 0) {
      return { valido: true, mensagem: 'Recurso não encontrado', taxaUtilizacao: 0 };
    }

    const recurso = analise.analisesPorRecurso[0];
    const taxaNova = ((recurso.horasAlocadas + horasNovas) / recurso.horasDisponiveis) * 100;

    if (taxaNova > 90) {
      return {
        valido: false,
        mensagem: `⚠️ ATENÇÃO: Recurso "${recurso.recurso.nome}" ficará sobrecarregado (${taxaNova.toFixed(1)}%). Deseja continuar?`,
        taxaUtilizacao: taxaNova
      };
    }

    return {
      valido: true,
      mensagem: `✅ Capacidade OK (${taxaNova.toFixed(1)}%)`,
      taxaUtilizacao: taxaNova
    };
  }
}
```

### Passo 2: Usar Validação na UI (Cronograma Gantt)

```typescript
// src/pages/cronograma/gantt/index.tsx

const handleAlocarRecurso = async (tarefaId: number, recursoId: number, horas: number) => {
  // NOVO: Validar capacidade antes
  const validacao = await CronogramaService.validarCapacidadeAntesSalvar(
    tarefaId,
    recursoId,
    horas
  );

  if (!validacao.valido) {
    // Mostrar AlertDialog de confirmação
    const confirmar = await mostrarDialogoConfirmacao(validacao.mensagem);
    if (!confirmar) {
      return; // Cancelar alocação
    }
  }

  // Prosseguir com alocação
  await RecursoCronogramaService.alocarRecurso({
    tarefaCronogramaId: tarefaId,
    colaboradorId: recursoId,
    horasAlocadas: horas,
    // ...
  });

  toast({
    title: 'Recurso Alocado',
    description: validacao.mensagem
  });
};
```

---

## 📈 Benefícios da Integração

### 1. **Prevenção Proativa de Gargalos**
- Sistema alerta **ANTES** de criar sobrecarga
- Evita surpresas no meio do projeto
- Permite ajustes antecipados

### 2. **Visibilidade Multi-Projeto**
- Dashboard consolidado de capacidade
- Identifica recursos ociosos que podem ser realocados
- Detecta conflitos entre projetos simultâneos

### 3. **Simulação de Cenários**
- Responde "Posso aceitar este novo projeto?"
- Calcula data ideal para início
- Sugere contratação temporária quando necessário

### 4. **Nivelamento de Recursos**
- Sugestões automáticas de otimização
- Redistribuição de carga de trabalho
- Maximização de utilização (70-90% ideal)

### 5. **Controle de Custos**
- Calcula custo de horas extras necessárias
- Identifica oportunidades de economia
- Justifica contratações

---

## 🧪 Teste da Integração (Mock Mode)

### Cenário de Teste 1: Detectar Gargalo

```bash
# 1. Acesse Dashboard Capacidade
http://localhost:8080/pcp/capacidade

# 2. Observe KPI "Gargalos Detectados"
# Deve mostrar recursos com utilização > 90%

# 3. Clique em um recurso gargalo na tabela
# Expand para ver detalhes e sugestões
```

### Cenário de Teste 2: Simular Novo Projeto

```bash
# 1. No Dashboard Capacidade, clique "Simular Novo Projeto"

# 2. Preencha:
Nome: Galpão Logístico - Cliente ABC
Horas: 800
Data Início: 2026-03-01
Data Fim: 2026-05-31

# 3. Clique "Simular"

# 4. Observe resultado:
✅ Viável → Taxa de utilização resultante < 90%
❌ Não Viável → Mostra data ideal e sugestões
```

### Cenário de Teste 3: Identificar Recursos Ociosos

```bash
# 1. No Dashboard Capacidade, role até seção "Recursos Ociosos"

# 2. Observe recursos com utilização < 50%

# 3. Use esta informação ao alocar novos projetos
# Alocar preferencialmente em recursos ociosos
```

---

## 🔮 Roadmap de Integração

### ✅ FASE 3 - Implementado (Mock)
- [x] Interface `CapacidadeInterface.ts` completa
- [x] Service `CapacidadeProdutivaService.ts` com cálculos
- [x] Dashboard completo com KPIs e gráficos
- [x] Simulador de novos projetos
- [x] Detecção de gargalos e conflitos

### 🔄 FASE 3.5 - Integração Backend (Futuro)
- [ ] Conectar CapacidadeService com RecursoCronogramaService real
- [ ] Método `validarCapacidadeAntesSalvar()` no CronogramaService
- [ ] AlertDialog de confirmação na UI de alocação
- [ ] Sincronização em tempo real (WebSocket ou polling)

### 🚀 FASE 4 - Pipeline de Projetos (Próxima)
- [ ] Integração com Propostas Comerciais
- [ ] Previsão de demanda futura
- [ ] Análise de viabilidade antes de aceitar proposta
- [ ] Timeline de projetos futuros vs capacidade

---

## 📚 Referências

- **Plano Completo**: `C:\Users\User\.claude\plans\greedy-twirling-abelson.md`
- **Interface Capacidade**: `src/interfaces/CapacidadeInterface.ts`
- **Service Capacidade**: `src/services/CapacidadeProdutivaService.ts`
- **Dashboard**: `src/pages/pcp/capacidade/index.tsx`
- **Cronogramas Existente**: `src/pages/cronograma/`

---

**Status**: ✅ FASE 3 Completa - Integração Conceitual Documentada
**Próximo Passo**: Revisão crítica completa da FASE 3 (conforme instrução registrada)
