# API de Integração — Gestor de Tarefas GML

**Base URL:** `https://api.gmxindustrial.com.br`
**Versão:** 1.0
**Data:** 2026-03-05

---

## 1. Autenticação

Todas as requisições devem incluir o header `Authorization` com a API Key:

```
Authorization: ApiKey gml_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Obter uma API Key:**
1. Acesse o sistema GML → Configurações → API Keys
2. Clique em "Nova API Key"
3. Copie a chave gerada (exibida **apenas uma vez**)

**Características:**
- Chave armazenada como hash SHA-256 no servidor
- Suporta expiração, whitelist de IPs e permissões granulares
- Registra `lastUsedAt` e `usageCount` automaticamente

**Exemplo de requisição:**
```
GET /api/activities HTTP/1.1
Host: api.gmxindustrial.com.br
Authorization: ApiKey gml_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 2. Atividades

### 2.1 Listar Todas as Atividades

```
GET /api/activities
```

**Resposta:** `200 OK`
```json
[
  {
    "id": 1,
    "description": "Fabricação de estrutura metálica",
    "status": "Em execução",
    "observation": "Observações gerais",
    "timePerUnit": 2.5,
    "quantity": 10,
    "completedQuantity": 4,
    "estimatedTime": "25h",
    "actualTime": 18.5,
    "totalTime": 22.0,
    "plannedStartDate": "2026-02-01T00:00:00.000Z",
    "startDate": "2026-02-03T00:00:00.000Z",
    "endDate": null,
    "pauseDate": null,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-03-01T14:20:00.000Z",
    "cod_sequencial": 1,
    "macroTask": {
      "id": 1,
      "name": "Fabricação"
    },
    "process": {
      "id": 2,
      "name": "Corte e Dobra"
    },
    "collaborators": [
      {
        "id": 1,
        "name": "João Silva",
        "role": "Soldador",
        "sector": "Produção",
        "status": true
      }
    ],
    "project": {
      "id": 5,
      "name": "Galpão Industrial ABC",
      "groupNumber": 2025001,
      "client": "ABC Ltda",
      "address": "Rua X, 123",
      "startDate": "2026-01-10T00:00:00.000Z",
      "endDate": null,
      "status": "em_andamento"
    },
    "serviceOrder": {
      "id": 10,
      "serviceOrderNumber": "OS-001",
      "description": "Estrutura principal",
      "status": "em_andamento",
      "progress": 45,
      "quantity": 1,
      "weight": "5000"
    },
    "createdBy": {
      "id": 1,
      "username": "admin",
      "name": "Administrador"
    },
    "images": [
      {
        "id": 1,
        "imageName": "foto1.jpg",
        "imagePath": "/files/activities/foto1.jpg",
        "description": "Progresso da fabricação"
      }
    ],
    "workedHours": [
      {
        "id": 1,
        "hoursWorked": 8,
        "date": "2026-02-03",
        "colaborador": { "id": 1, "name": "João Silva" }
      }
    ]
  }
]
```

**Status possíveis:**
| Status | Descrição |
|--------|-----------|
| `Planejadas` | Atividade planejada, não iniciada |
| `Em execução` | Em andamento |
| `Concluídas` | Finalizada |
| `Paralizadas` | Pausada temporariamente |
| `Atrasadas` | Atrasada (atualizado automaticamente pelo sistema) |

### 2.2 Buscar Atividade por ID

```
GET /api/activities/{id}
```

**Resposta:** `200 OK` — mesmo formato de item único da listagem.

### 2.3 Atividades por Ordem de Serviço

```
GET /api/activities/service-order/{serviceOrderId}
```

**Resposta:** `200 OK` — array de atividades filtradas pela OS.

---

## 3. Ordens de Serviço

### 3.1 Listar Todas

```
GET /api/service-orders
GET /api/service-orders?projectId={projectId}
```

**Resposta:** `200 OK`
```json
[
  {
    "id": 10,
    "serviceOrderNumber": "OS-001",
    "description": "Estrutura metálica principal",
    "status": "em_andamento",
    "notes": "Prioridade alta",
    "progress": 45,
    "quantity": 1,
    "weight": "5000",
    "projectNumber": "2025001",
    "startDate": "2026-01-15T00:00:00.000Z",
    "createdAt": "2026-01-10T00:00:00.000Z",
    "updatedAt": "2026-03-01T00:00:00.000Z",
    "projectId": {
      "id": 5,
      "name": "Galpão Industrial ABC",
      "groupNumber": 2025001,
      "client": "ABC Ltda",
      "status": "em_andamento"
    },
    "assignedUser": {
      "id": 1,
      "username": "admin",
      "name": "Administrador"
    }
  }
]
```

**Status possíveis:** `em_andamento`, `concluida`, `pausada`

### 3.2 Buscar por Projeto

```
GET /api/service-orders/project/{projectId}
```

---

## 4. Projetos (Obras)

### 4.1 Listar Todos

```
GET /api/projects
```

**Resposta:** `200 OK`
```json
[
  {
    "id": 5,
    "name": "Galpão Industrial ABC",
    "groupNumber": 2025001,
    "client": "ABC Ltda",
    "address": "Rua X, 123 - São Paulo/SP",
    "startDate": "2026-01-10T00:00:00.000Z",
    "endDate": null,
    "observation": "Projeto prioritário",
    "status": "em_andamento"
  }
]
```

### 4.2 Buscar por ID

```
GET /api/projects/{id}
```

---

## 5. Colaboradores

### 5.1 Listar Todos

```
GET /api/collaborators
```

**Resposta:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "João Silva",
    "role": "Soldador",
    "sector": "Produção",
    "status": true,
    "createdAt": "2025-06-01T00:00:00.000Z",
    "updatedAt": "2026-01-15T00:00:00.000Z"
  }
]
```

---

## 6. Horas Trabalhadas (HH)

### 6.1 Consultar HH por Atividade

As horas trabalhadas estão embarcadas na resposta de cada atividade:

```
GET /api/activities/{id}
```

No campo `workedHours`:
```json
{
  "workedHours": [
    {
      "id": 1,
      "hoursWorked": 8,
      "date": "2026-03-05",
      "colaborador": {
        "id": 1,
        "name": "João Silva"
      }
    }
  ]
}
```

### 6.3 Cálculo de HH para Dashboard

Para calcular HH agregado, consuma `GET /api/activities` e agrupe client-side:

**Por Colaborador:**
```
Para cada atividade:
  Para cada workedHours:
    Acumular hoursWorked por colaborador.id
```

**Por Tarefa Macro:**
```
Para cada atividade:
  Agrupar por macroTask.id
  Somar: estimatedTime (converter string "8h30min" → 8.5 horas)
  Somar: totalTime ou actualTime (horas reais)
  Calcular desvio: ((real - estimado) / estimado) × 100
```

**Por Processo:**
```
Mesma lógica, agrupando por process.id
```

**Conversão de tempo estimado (string → horas):**
```
"8h"       → 8.0
"8h30"     → 8.5
"8h30min"  → 8.5
"30min"    → 0.5
"120"      → 120.0 (assume minutos se unidadeTempo === 'minutos')
```

---

## 7. KPIs Comerciais

### 7.1 Consultar KPIs

```
GET /api/orcamentos/kpis
GET /api/orcamentos/kpis?mesAno=2026-03
```

**Parâmetro `mesAno`:** formato `YYYY-MM`. Se omitido, retorna o mês atual.

**Resposta:** `200 OK`
```json
{
  "mesAno": "2026-03",
  "qtdOrcamentos": 12,
  "valorOrcamentos": 1500000.00,
  "taxaConversao": 66.7,
  "margemBruta": 35.2,
  "margemLiquida": 18.5,
  "acoes5S": 3,
  "qtdAprovados": 8,
  "qtdRejeitados": 2,
  "qtdEmAnalise": 5,
  "qtdRascunho": 3,
  "valorAprovados": 980000.00,
  "tendencia": [
    {
      "mesAno": "2025-10",
      "label": "Out/25",
      "qtdOrcamentos": 8,
      "valorOrcamentos": 920000.00
    },
    {
      "mesAno": "2025-11",
      "label": "Nov/25",
      "qtdOrcamentos": 10,
      "valorOrcamentos": 1100000.00
    },
    {
      "mesAno": "2025-12",
      "label": "Dez/25",
      "qtdOrcamentos": 6,
      "valorOrcamentos": 750000.00
    },
    {
      "mesAno": "2026-01",
      "label": "Jan/26",
      "qtdOrcamentos": 9,
      "valorOrcamentos": 1050000.00
    },
    {
      "mesAno": "2026-02",
      "label": "Fev/26",
      "qtdOrcamentos": 11,
      "valorOrcamentos": 1350000.00
    },
    {
      "mesAno": "2026-03",
      "label": "Mar/26",
      "qtdOrcamentos": 12,
      "valorOrcamentos": 1500000.00
    }
  ]
}
```

**Campos:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `mesAno` | string | Mês de referência (YYYY-MM) |
| `qtdOrcamentos` | number | Quantidade de orçamentos criados no mês |
| `valorOrcamentos` | number | Valor total dos orçamentos do mês (R$) |
| `taxaConversao` | number \| null | % de conversão: aprovados / (aprovados + rejeitados) × 100 |
| `margemBruta` | number \| null | Margem bruta média (%) |
| `margemLiquida` | number \| null | Margem líquida média (%) |
| `acoes5S` | number | Quantidade de ações 5S no mês |
| `qtdAprovados` | number | Total de orçamentos aprovados (all-time) |
| `qtdRejeitados` | number | Total de orçamentos rejeitados (all-time) |
| `qtdEmAnalise` | number | Total em análise (all-time) |
| `qtdRascunho` | number | Total em rascunho (all-time) |
| `valorAprovados` | number | Valor total dos aprovados (R$) |
| `tendencia` | array | Histórico dos últimos 6 meses |

### 7.2 Listar Orçamentos

```
GET /api/orcamentos
```

**Resposta:** `200 OK`
```json
[
  {
    "id": "uuid-aqui",
    "numero": "ORC-2026-001",
    "nome": "Galpão Industrial ABC",
    "tipo": "servico",
    "status": "aprovado",
    "clienteNome": "ABC Ltda",
    "clienteCnpj": "12.345.678/0001-90",
    "codigoProjeto": "2025001",
    "areaTotalM2": 500.00,
    "pesoTotalProjeto": 15000.00,
    "custoDirectoTotal": 250000.00,
    "bdiTotal": 50000.00,
    "subtotal": 300000.00,
    "lucroTotal": 60000.00,
    "precoBase": 360000.00,
    "totalVenda": 410000.00,
    "dre": {
      "receitaLiquida": 360000.00,
      "lucroBruto": 110000.00,
      "margemBruta": 30.56,
      "lucroLiquido": 60000.00,
      "margemLiquida": 14.63
    },
    "configuracoes": {
      "bdi": 0.20,
      "lucro": 0.20,
      "encargos": 0.80
    },
    "tributos": {
      "temISS": false,
      "aliquotaISS": 0,
      "aliquotaSimples": 13.89
    },
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-02-15T14:30:00.000Z"
  }
]
```

**Status dos orçamentos:** `rascunho`, `em_analise`, `aprovado`, `rejeitado`

**Tipos:** `servico`, `produto`

### 7.3 Buscar Orçamento por ID

```
GET /api/orcamentos/{id}
```

Retorna o orçamento com todas as composições e itens detalhados.

---

## 8. Ações 5S

### 8.1 Listar Ações

```
GET /api/orcamentos/acoes-5s
GET /api/orcamentos/acoes-5s?mesAno=2026-03
```

**Resposta:** `200 OK`
```json
[
  {
    "id": "uuid",
    "data": "2026-03-01",
    "descricao": "Organização do almoxarifado de consumíveis",
    "mes": "2026-03",
    "createdAt": "2026-03-01T08:00:00.000Z"
  }
]
```

---

## 9. Exemplos de Uso para Dashboard

### 9.1 Dashboard de Atividades

Para montar um dashboard de atividades, faça as seguintes consultas:

```
GET /api/activities        → Todas as atividades
GET /api/projects          → Todos os projetos
GET /api/service-orders    → Todas as ordens de serviço
GET /api/collaborators     → Todos os colaboradores
```

**Indicadores calculados client-side:**

| Indicador | Cálculo |
|-----------|---------|
| Total de Atividades | `activities.length` |
| Atividades Planejadas | `activities.filter(a => a.status === 'Planejadas').length` |
| Atividades Em Execução | `activities.filter(a => a.status === 'Em execução').length` |
| Atividades Concluídas | `activities.filter(a => a.status === 'Concluídas').length` |
| Atividades Paralizadas | `activities.filter(a => a.status === 'Paralizadas').length` |
| Atividades Atrasadas | `activities.filter(a => a.status === 'Atrasadas').length` |
| Total de Projetos | `projects.length` |
| Total de OS | `serviceOrders.length` |

### 9.2 Dashboard de HH Trabalhados

```
GET /api/activities   → Todas as atividades (inclui workedHours, macroTask, process)
```

**HH por Colaborador:**
```javascript
const hhPorColaborador = {};
activities.forEach(atividade => {
  atividade.workedHours.forEach(wh => {
    const id = wh.colaborador.id;
    if (!hhPorColaborador[id]) {
      hhPorColaborador[id] = {
        nome: wh.colaborador.name,
        totalHoras: 0,
        qtdAtividades: 0
      };
    }
    hhPorColaborador[id].totalHoras += wh.hoursWorked;
  });
  // Contar atividades distintas por colaborador
  atividade.collaborators.forEach(c => {
    if (hhPorColaborador[c.id]) {
      hhPorColaborador[c.id].qtdAtividades++;
    }
  });
});
```

**HH por Tarefa Macro (Estimado vs Real):**
```javascript
const hhPorMacroTask = {};
activities.forEach(atividade => {
  const macroId = atividade.macroTask?.id;
  if (!macroId) return;

  if (!hhPorMacroTask[macroId]) {
    hhPorMacroTask[macroId] = {
      nome: atividade.macroTask.name,
      horasEstimadas: 0,
      horasReais: 0,
      qtdAtividades: 0
    };
  }

  hhPorMacroTask[macroId].horasEstimadas += parseTimeToHours(atividade.estimatedTime);
  hhPorMacroTask[macroId].horasReais += atividade.totalTime || 0;
  hhPorMacroTask[macroId].qtdAtividades++;
});

// Desvio percentual
Object.values(hhPorMacroTask).forEach(mt => {
  mt.desvio = mt.horasEstimadas > 0
    ? ((mt.horasReais - mt.horasEstimadas) / mt.horasEstimadas) * 100
    : 0;
});
```

### 9.3 Dashboard Comercial (KPIs)

```
GET /api/orcamentos/kpis?mesAno=2026-03
```

Com a resposta, monte:

| Card | Valor | Fonte |
|------|-------|-------|
| Orçamentos no Mês | `qtdOrcamentos` | direto |
| Valor Total | `R$ valorOrcamentos` | direto |
| Taxa de Conversão | `taxaConversao%` | direto |
| Margem Bruta | `margemBruta%` | direto |
| Margem Líquida | `margemLiquida%` | direto |
| Aprovados | `qtdAprovados` | direto |
| Em Análise | `qtdEmAnalise` | direto |
| Rejeitados | `qtdRejeitados` | direto |
| Valor Aprovados | `R$ valorAprovados` | direto |
| Ações 5S | `acoes5S` | direto |

**Gráfico de Tendência (últimos 6 meses):**
```javascript
// tendencia[] já vem ordenado cronologicamente
kpis.tendencia.forEach(mes => {
  // mes.label = "Mar/26"
  // mes.qtdOrcamentos = 12
  // mes.valorOrcamentos = 1500000
});
```

---

## 10. Filtros por Período

Para filtrar atividades por período no dashboard, aplique filtros client-side:

```javascript
function filtrarPorPeriodo(activities, periodo, dataInicio, dataFim) {
  const agora = new Date();

  switch (periodo) {
    case 'hoje':
      return activities.filter(a =>
        isSameDay(new Date(a.createdAt), agora)
      );
    case 'semana_atual':
      return activities.filter(a =>
        isSameWeek(new Date(a.createdAt), agora)
      );
    case 'mes_atual':
      return activities.filter(a =>
        isSameMonth(new Date(a.createdAt), agora)
      );
    case 'trimestre_atual':
      return activities.filter(a => {
        const d = new Date(a.createdAt);
        const trimInicio = new Date(agora.getFullYear(), Math.floor(agora.getMonth() / 3) * 3, 1);
        return d >= trimInicio && d <= agora;
      });
    case 'ano_atual':
      return activities.filter(a =>
        new Date(a.createdAt).getFullYear() === agora.getFullYear()
      );
    case 'personalizado':
      return activities.filter(a => {
        const d = new Date(a.createdAt);
        return d >= new Date(dataInicio) && d <= new Date(dataFim);
      });
  }
}
```

---

## 11. Códigos de Erro

| Código | Significado |
|--------|-------------|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `204` | Operação sem conteúdo (delete, revoke) |
| `400` | Requisição inválida (campos obrigatórios, validação) |
| `401` | Não autenticado (token inválido ou API key inválida) |
| `403` | Sem permissão |
| `404` | Recurso não encontrado |
| `500` | Erro interno do servidor |

**Exemplo de erro:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 12. Rate Limiting e Boas Práticas

1. **Cache:** Os KPIs não mudam frequentemente. Recomenda-se cache de 5-10 minutos.
2. **Paginação:** A API retorna todos os registros. Para grandes volumes, implemente paginação client-side.
3. **Polling:** Para dashboards em tempo real, faça polling a cada 30-60 segundos nas atividades.
4. **API Key:** Use uma API Key dedicada para cada sistema integrado. Revogue chaves não utilizadas.
5. **IP Whitelist:** Configure IPs permitidos na API Key para maior segurança.

---

## 13. Referência Rápida de Endpoints

### Produção (PCP)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/activities` | Todas as atividades |
| `GET` | `/api/activities/{id}` | Atividade por ID |
| `GET` | `/api/activities/service-order/{id}` | Atividades por OS |
| `GET` | `/api/projects` | Todos os projetos |
| `GET` | `/api/projects/{id}` | Projeto por ID |
| `GET` | `/api/service-orders` | Todas as OS |
| `GET` | `/api/service-orders/{id}` | OS por ID |
| `GET` | `/api/service-orders/project/{id}` | OS por projeto |
| `GET` | `/api/collaborators` | Todos os colaboradores |

### Comercial

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/orcamentos/kpis` | KPIs comerciais |
| `GET` | `/api/orcamentos/kpis?mesAno=YYYY-MM` | KPIs por mês |
| `GET` | `/api/orcamentos` | Todos os orçamentos |
| `GET` | `/api/orcamentos/{id}` | Orçamento por ID |
| `GET` | `/api/orcamentos/acoes-5s` | Ações 5S |

