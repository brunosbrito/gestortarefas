# Dashboard PCP — Documentação Técnica da Reforma

> **Versão**: 2.0
> **Data**: 2026-02-19
> **Branch**: `atualização-dash-pcp`
> **Para**: Equipe Backend (início de implementação: 2026-02-20)

---

## 1. Visão Geral das Mudanças

O Dashboard PCP foi reformulado para oferecer **alertas preditivos** em vez de apenas dados retrospectivos. As principais mudanças são:

| Área | Antes | Depois |
|------|-------|--------|
| KPI Cards | 6 cards genéricos (eficiência, taxa no prazo...) | 6 novos cards divididos em **Alertas** e **Performance** |
| Gráficos | Apenas atividades **Concluídas** | Atividades Concluídas **+ Em Andamento** |
| Carga de equipe | Não existia | Novo gráfico "Carga por Colaborador" |
| Click-through | Não existia | Clicar no gráfico abre lista de atividades do grupo |

---

## 2. Endpoints Utilizados pelo Dashboard

### 2.1 Atividades — `GET /activities`

**Consumido por**: `dashboardStore.ts`, `StatisticsService.ts`

Este é o endpoint mais crítico para o dashboard. O front busca **todas as atividades** sem filtro de status e faz o filtro localmente.

#### Campos obrigatórios na resposta:

```json
{
  "id": 123,
  "description": "Corte de chapas",
  "status": "Em andamento",
  "estimatedTime": 8,
  "actualTime": 5,
  "totalTime": 5,
  "timePerUnit": null,
  "quantity": null,
  "progress": 62,
  "createdAt": "2026-01-15T08:00:00Z",
  "updatedAt": "2026-02-10T14:30:00Z",
  "plannedStartDate": "2026-01-14T07:00:00Z",
  "startDate": "2026-01-15T07:00:00Z",
  "endDate": "2026-02-15T17:00:00Z",
  "cod_sequencial": 45,
  "macroTask": {
    "id": 3,
    "name": "CORTE"
  },
  "process": {
    "id": 7,
    "name": "Plasma"
  },
  "project": {
    "id": 12,
    "name": "Obra Santos Dumont"
  },
  "serviceOrder": {
    "id": 55,
    "serviceOrderNumber": "OS-2026-055",
    "description": "Estrutura metálica bloco A"
  },
  "team": [
    { "id": 8, "name": "João Silva" },
    { "id": 9, "name": "Maria Costa" }
  ]
}
```

---

#### Descrição detalhada dos campos críticos:

| Campo | Tipo | Obrigatório | Descrição e Impacto no Dashboard |
|-------|------|-------------|----------------------------------|
| `id` | `number` | ✅ | Identificador único |
| `description` | `string` | ✅ | Nome exibido na tabela de atividades |
| `status` | `string` | ✅ | **Ver seção 3** — valores exatos esperados |
| `estimatedTime` | `number` | ✅ | Horas estimadas. Usado em KPIs, eficiência e gráficos |
| `actualTime` | `number` | ✅ | Horas reais já trabalhadas na atividade |
| `totalTime` | `number` | ⚠️ | Horas totais ao concluir. Fallback de `actualTime` |
| `progress` | `number` | ⚠️ | Percentual 0-100. Se não enviado, o front calcula pelo status |
| `plannedStartDate` | `datetime` | ✅ | Data de início planejada. Usado para calcular **"início atrasado"** |
| `startDate` | `datetime` | ✅ | Data real de início. Usado para carga de colaboradores (últimos 7d) |
| `endDate` | `datetime` | ✅ | Data de fim prevista/real. Usado para verificar **atraso** e carga |
| `createdAt` | `datetime` | ✅ | Data de criação. Usado para filtros de período |
| `macroTask.id` | `number` | ✅ | ID da tarefa macro para agrupamento no gráfico |
| `macroTask.name` | `string` | ✅ | Nome exibido no gráfico de macros |
| `process.id` | `number` | ✅ | ID do processo para agrupamento no gráfico |
| `process.name` | `string` | ✅ | Nome exibido no gráfico de processos e filtros |
| `project.id` | `number` | ✅ | ID da obra para filtro |
| `project.name` | `string` | ✅ | Nome exibido na tabela |
| `serviceOrder.id` | `number` | ✅ | ID da OS para filtro |
| `serviceOrder.serviceOrderNumber` | `string` | ✅ | Número da OS exibido na tabela |
| `serviceOrder.description` | `string` | ⚠️ | Descrição da OS |
| `team` | `array` | ✅ | **Ver seção 4** — Equipe atribuída, crítica para o gráfico de carga |
| `cod_sequencial` | `number` | ⚠️ | Código sequencial exibido na tabela |
| `timePerUnit` | `number` | ⚠️ | Tempo por unidade. Usado para calcular `totalTime` quando não informado |
| `quantity` | `number` | ⚠️ | Quantidade de unidades. Idem ao anterior |

---

### 2.2 Colaboradores — `GET /collaboradores`

**Consumido por**: `TeamCapacityChart.tsx` (novo gráfico)

#### Campos obrigatórios na resposta:

```json
{
  "id": 8,
  "name": "João Silva",
  "status": true,
  "sector": "PRODUÇÃO"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `number` | ✅ | Usado para cruzar com `team[].id` da atividade |
| `name` | `string` | ✅ | Nome exibido no gráfico de carga |
| `status` | `boolean` | ✅ | `true` = ativo. Somente ativos aparecem no gráfico |
| `sector` | `string` | ✅ | **Deve começar com `"PRODU"` ou `"ENGENH"`** — apenas esses setores são incluídos no gráfico de capacidade |

**Atenção**: O gráfico de carga pré-popula com **todos** os colaboradores ativos de Produção e Engenharia, mesmo os que não têm atividades no período selecionado. Isso garante visibilidade de quem está ocioso.

---

### 2.3 Obras — `GET /obras`

**Consumido por**: `dashboardStore.ts`

Campos utilizados: `id`, `name`, `createdAt`

---

### 2.4 Ordens de Serviço — `GET /service-orders`

**Consumido por**: `dashboardStore.ts`

Campos utilizados: `id`, `serviceOrderNumber`, `description`, `projectId`, `status`, `createdAt`

---

## 3. Valores de Status Esperados (Enum)

O front-end normaliza os status recebidos. A tabela abaixo mostra quais strings o backend pode retornar e como serão mapeados:

| Status Recebido da API | Status Normalizado (interno) | Comportamento |
|------------------------|------------------------------|---------------|
| `"Planejado"`, `"Planejadas"`, `"Planejada"` | `"Planejado"` | Atividade não iniciada. Verifica `plannedStartDate` para "início atrasado" |
| `"Pendente"` | `"Pendente"` | Tratado como "em andamento" para fins de risco |
| `"Em andamento"` | `"Em andamento"` | Ativa nos gráficos de Macro/Processo. Contada em KPIs de risco |
| `"Concluídas"`, `"Concluída"` | `"Concluída"` | Finalizada. Contada em progresso e eficiência operacional |
| `"Paralizada"` | `"Paralizada"` | Automaticamente marcada como **em risco** e **bloqueio de processo** |

> **Importante**: A distinção `"Concluídas"` vs `"Concluída"` é tratada com tolerância no front, mas padronizar para `"Concluída"` (singular) é recomendado.

---

## 4. Estrutura do Campo `team` (Equipe)

O gráfico de **Carga por Colaborador** e os KPIs de sobrecarga dependem completamente desse campo.

### Formato aceito:

```json
"team": [
  { "id": 8, "name": "João Silva" },
  { "id": 9, "name": "Maria Costa" }
]
```

O campo `id` do membro **deve corresponder ao `id` do colaborador** retornado pelo endpoint `/colaboradores`. Essa é a chave de cruzamento entre as duas entidades.

**Outros formatos aceitos** (retrocompatibilidade):
```json
"team": [
  { "collaboratorId": 8, "name": "João Silva" }
]
```
> O front aceita tanto `member.id` quanto `member.collaboratorId` como identificador.

---

## 5. Lógica de Cálculo dos KPIs (para entender a dependência dos dados)

### KPI 1 — Atividades em Risco

Conta atividades que se enquadram em **ao menos uma** das condições:

1. **Início atrasado**: `status === 'Planejado'` E `plannedStartDate < hoje`
2. **Em atraso**: `status === 'Em andamento'` E `endDate < hoje`
3. **Acima do tempo**: `status === 'Em andamento'` E `actualTime > estimatedTime × 1.2`

> Campos necessários: `status`, `plannedStartDate`, `endDate`, `actualTime`, `estimatedTime`

---

### KPI 2 — Gargalos de Processo

Agrupa atividades por `process.id`, calcula para cada processo:

```
% bloqueado = (paralizadas + atrasadas) / total × 100
```

Mostra o processo com **maior percentual bloqueado**.

> Campos necessários: `status`, `endDate`, `process.id`, `process.name`

---

### KPI 3 — Sobrecarga Próximos 7 Dias

```
% capacidade = Σ estimatedTime (atividades com startDate nos próximos 7d)
               ───────────────────────────────────────────────────────
               quantidade_colaboradores × 44h/semana
```

> Campos necessários: `startDate`, `estimatedTime`, `team`

---

### KPI 4 — Progresso Geral

```
% progresso = concluídas / total_atividades × 100
```

> Campos necessários: `status`

---

### KPI 5 — Eficiência Operacional (últimos 30 dias)

```
% no prazo = atividades com (actualTime ≤ estimatedTime) E endDate nos últimos 30d
             ──────────────────────────────────────────────────────────────────────
             total concluídas com endDate nos últimos 30d
```

> Campos necessários: `status`, `endDate`, `actualTime`, `estimatedTime`

---

### KPI 6 — Variação de Cronograma (IVC)

```
IVC = Σ actualTime (atividades Em Andamento)
      ─────────────────────────────────────
      Σ estimatedTime (atividades Em Andamento)
```

- `IVC < 1.0`: adiantado
- `1.0 – 1.05`: no prazo ✅
- `1.05 – 1.15`: atenção ⚠️
- `> 1.15`: atrasado 🔴

> Campos necessários: `status`, `actualTime`, `estimatedTime`

---

## 6. Gráfico de Carga por Colaborador (novo)

### O que exibe:
- Barras horizontais — um colaborador por linha
- **Azul**: Horas trabalhadas (últimos 7 dias) — baseado em `endDate` (ou `startDate` se `Em andamento`)
- **Verde**: Horas agendadas (próximos 7 dias) — baseado em `startDate` futuro
- **Verde → Vermelho**: quando `utilizationRate > 100%`
- **Linha vermelha pontilhada**: capacidade de 44h/semana

### Lógica de horas por colaborador:
- Horas distribuídas igualmente entre os membros da equipe: `horas / team.length`
- Capacidade padrão: **44h/semana** (Seg–Qui 9h líquidas + Sex 8h líquidas)

### Filtros disponíveis no gráfico:
- Setor (Produção / Engenharia)
- Processo
- Macro Task

---

## 7. Gráficos de Performance (Modificados)

### MacroTasksChart e ProcessHoursChart

**Mudança principal**: agora incluem atividades com `status === 'Em andamento'`, além das concluídas.

**Agrupamento**:
- Barras azuis: horas estimadas
- Barras laranjas/verdes: horas trabalhadas (de `totalTime` ou `actualTime`)

**Cálculo de eficiência no tooltip**:
```
eficiência% = (estimatedHours - actualHours) / estimatedHours × 100
```

---

### ProductivityTrendsChart

Agrupa atividades **concluídas** por semana (últimas 12 semanas).

Por semana calcula:
- `completedCount`: atividades concluídas (com `endDate` na semana)
- `avgEfficiency%`: eficiência média
- `onTimeRate%`: % entregues no prazo (`actualTime ≤ estimatedTime`)
- `startedCount`: atividades iniciadas na semana (com `startDate` na semana)

> Campos necessários: `endDate`, `startDate`, `estimatedTime`, `actualTime`

---

## 8. Click-Through — Lista de Atividades por Grupo

Ao clicar em qualquer barra dos gráficos, abre um modal com a lista detalhada das atividades daquele grupo.

A tabela (`FilteredActivitiesTable`) exibe as colunas:

| Coluna | Campo da API |
|--------|-------------|
| Cód. | `cod_sequencial` |
| Atividade | `description` |
| Status | `status` |
| Macro Task | `macroTask.name` |
| Processo | `process.name` |
| OS | `serviceOrder.serviceOrderNumber` |
| Obra | `project.name` |
| Equipe | `team[].name` |
| Tempo Est. | `estimatedTime` |
| Tempo Real | `totalTime` ou `actualTime` |

---

## 9. Resumo dos Campos Críticos para Implementação

Os campos abaixo têm o maior impacto nos KPIs e no gráfico de carga. Se algum estiver ausente ou inconsistente, os indicadores serão imprecisos:

| Campo | Impacto se ausente |
|-------|--------------------|
| `status` (valores corretos) | Todos os KPIs e contadores incorretos |
| `estimatedTime` | KPIs de risco, eficiência e sobrecarga zerados |
| `actualTime` | KPIs de variação de cronograma e eficiência operacional zerados |
| `plannedStartDate` | KPI "Início Atrasado" nunca dispara |
| `endDate` | Atrasos não detectados; Eficiência Operacional incalculável |
| `startDate` | Gráfico de carga (próximos 7d) incorreto |
| `team[].id` | Gráfico de Carga por Colaborador sem dados |
| `colaborador.sector` | Gráfico de Carga não exibe colaboradores |

---

## 10. Estrutura de Arquivos Modificados/Criados

```
src/
├── components/dashboard/
│   ├── DashboardKPIsNew.tsx          ← NOVO: 6 KPI cards (Alertas + Performance)
│   ├── ActivityDrilldownDialog.tsx   ← NOVO: Dialog de click-through nos gráficos
│   ├── ActivityStatusCards.tsx       ← MODIFICADO: prop `compact` adicionada
│   └── charts/
│       ├── MacroTasksChart.tsx       ← MODIFICADO: inclui Em Andamento + click-through
│       ├── ProcessHoursChart.tsx     ← MODIFICADO: inclui Em Andamento + click-through
│       ├── ProductivityTrendsChart.tsx ← MODIFICADO: linha meta + 4ª métrica + click-through
│       └── TeamCapacityChart.tsx     ← NOVO: carga por colaborador
├── services/
│   └── StatisticsService.ts         ← MODIFICADO: inclui status 'Em andamento' nos filtros
└── Dashboard.tsx                     ← MODIFICADO: 5 seções collapsibles
```

---

## 11. Perguntas Frequentes para o Backend

**Q: O campo `actualTime` é diferente de `totalTime`?**
R: Sim. `actualTime` = horas trabalhadas até o momento (parcial, para atividades Em Andamento). `totalTime` = total ao concluir. O front usa `actualTime` para KPIs de atividades em andamento e `totalTime` como fallback para concluídas.

**Q: `estimatedTime` é em horas ou minutos?**
R: O front trata como **horas**. A função `parseTimeToHours()` aceita tanto `number` (horas) quanto strings no formato `"HH:MM"`. Se o backend enviar minutos, os cálculos de eficiência estarão errados.

**Q: O dashboard faz múltiplas chamadas para `/activities`?**
R: Sim, 4 chamadas independentes: `dashboardStore` (lista geral) + `dataMacroTask` + `dataProcess` + `dataCollaborators`. Considerar endpoint de sumário ou cache adequado.

**Q: `plannedStartDate` vs `startDate`?**
R: `plannedStartDate` = data de início **prevista no planejamento**. `startDate` = data em que a atividade foi **efetivamente iniciada**.

**Q: Qual é a capacidade padrão por colaborador?**
R: O front usa **44h/semana** (Seg–Qui: 9h líquidas × 4 + Sex: 8h líquidas). Valor hardcoded, mas pode ser parametrizado futuramente.
