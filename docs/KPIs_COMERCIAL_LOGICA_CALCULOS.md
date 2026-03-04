# KPIs Comercial — Lógica de Cálculos

**Destinatário:** Yasmin (equipe de desenvolvimento)
**Data:** 2026-03-04
**Sistema de origem:** GestorTarefas — Módulo Comercial (branch `Modulo_Comercial`)

---

## Contexto

Esta página (`/comercial/kpis`) exibe 6 KPIs mensais para a equipe comercial.
Os dados de orçamentos vêm de `OrcamentoService.getAll()`. As metas e as ações 5S são persistidas em `localStorage`.

---

## Estrutura de Dados — Orçamento

Campos relevantes para os cálculos (retornados pela API ou calculados localmente pelo service):

```typescript
interface Orcamento {
  id: string;
  status?: 'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado';
  createdAt: string;   // ISO 8601 — filtragem de mês de criação
  updatedAt: string;   // ISO 8601 — filtragem de mês de decisão (KPI 3)

  // Valores calculados (prontos na resposta da API)
  custoDirectoTotal: number;
  bdiTotal: number;
  subtotal: number;      // = custoDirectoTotal + bdiTotal
  tributosTotal: number;
  totalVenda: number;    // = subtotal + tributosTotal

  dre: {
    receitaLiquida: number;   // = subtotal × (1 - aliquotaSimples/100)
    lucroBruto: number;       // = receitaLiquida - custoDirectoTotal
    margemBruta: number;      // % — ver nota abaixo
    lucroLiquido: number;     // = lucroBruto - bdiTotal (pode ser 0 — ver Margem Líquida)
    margemLiquida: number;    // % — pode ser 0 quando lucro não configurado
  };

  // BDI Detalhado (opcional — preenchido pelo usuário em Dados Gerais)
  configuracoesDetalhadas?: {
    bdi?: {
      lucro?: { percentual: number; habilitado: boolean; };
    };
  };
}
```

---

## Filtros de Período

Todos os KPIs são filtrados pelo **mês e ano selecionado** no header da página.
O usuário navega com botões ← Mês Anterior / Mês Seguinte.

```
Filtro padrão: mês atual (ex: "2026-03")
```

---

## KPI 1 — Quantidade de Orçamentos

**O que mede:** Quantos orçamentos foram criados no mês selecionado.

**Fórmula:**
```
qtdOrcamentos = orcamentos.filter(o => isMesmoMes(o.createdAt, mesAno)).length
```

**Onde `isMesmoMes` significa:**
- Extrair `YYYY-MM` do campo `createdAt`
- Comparar com o período selecionado

**Meta padrão:** 10 orçamentos/mês

**Semáforo:**
- Verde: `valor >= meta`
- Amarelo: `valor >= meta × 0.8` (≥ 80% da meta)
- Vermelho: `valor < meta × 0.8`

**Exemplo:**
```
Meta = 10, Valor = 9 → 9 ≥ 8 → Amarelo (89% da meta)
Meta = 10, Valor = 12 → Verde
Meta = 10, Valor = 6 → Vermelho
```

---

## KPI 2 — Valor Total Orçado

**O que mede:** Soma dos valores de venda (`totalVenda`) dos orçamentos criados no mês.

**Fórmula:**
```
valorOrcamentos = Σ orcamentos[mesAno].totalVenda
```

**Meta padrão:** R$ 6.000.000/mês

**Semáforo:** mesma regra do KPI 1 (Verde ≥ meta; Amarelo ≥ 80%; Vermelho < 80%)

**Exemplo:**
```
Meta = 6.000.000
Orçamentos do mês: [R$ 2.000.000, R$ 1.500.000, R$ 3.000.000]
Valor = R$ 6.500.000 → Verde
```

---

## KPI 3 — Taxa de Conversão

**O que mede:** Percentual de orçamentos aprovados em relação aos orçamentos com decisão final (aprovados + rejeitados) no mês.

**Fórmula:**
```
decididos = orcamentos.filter(o =>
  isMesmoMes(o.updatedAt, mesAno) &&
  (o.status === 'aprovado' || o.status === 'rejeitado')
)

aprovados = decididos.filter(o => o.status === 'aprovado')

taxaConversao = aprovados.length / decididos.length × 100
```

> **Filtro:** usa `updatedAt` (data da decisão), NÃO `createdAt`.
> **Exclui:** `rascunho` e `em_analise` — esses ainda estão no pipeline, não têm decisão.
> **Quando `decididos = 0`:** retornar `null` / exibir "—" (sem dados suficientes).

**Meta padrão:** 10%

**Semáforo:** Verde ≥ meta; Amarelo ≥ 80% meta; Vermelho < 80% meta

**Exemplo:**
```
Decididos no mês: 5 (3 aprovados + 2 rejeitados)
Taxa = 3/5 × 100 = 60% → Verde (meta é 10%)
```

---

## KPI 4 — Margem Bruta

**O que mede:** Percentual médio de BDI em relação à receita líquida, considerando apenas orçamentos aprovados.

**Fórmula:**
```
orcamentosAprovadosMes = orcamentos.filter(o =>
  isMesmoMes(o.updatedAt, mesAno) && o.status === 'aprovado'
)

somaReceitaLiquida = Σ orcamentosAprovadosMes.dre.receitaLiquida
somaBdiTotal = Σ orcamentosAprovadosMes.bdiTotal

margemBruta = somaBdiTotal / somaReceitaLiquida × 100
```

> **Por que BDI/ReceitaLíquida?** A receita líquida (`subtotal`) já inclui o BDI. O BDI como % da receita líquida representa a margem comercial bruta (antes dos impostos e do lucro líquido). Essa é a fórmula que o próprio sistema usa internamente em `dre.margemBruta`.

> **Quando `somaReceitaLiquida = 0`:** retornar `null` / exibir "—".

**Meta padrão:** intervalo 20% a 25%

**Semáforo com intervalo:**
- Verde: `20 ≤ margemBruta ≤ 25`
- Amarelo: `16 ≤ margemBruta < 20` (80% do mínimo)
- Vermelho: `margemBruta < 16` ou `margemBruta > 30` (muito acima do esperado também é sinal de alerta)

**Exemplo:**
```
Orçamentos aprovados:
  Orc-1: bdiTotal=500.000, receitaLiquida=2.000.000
  Orc-2: bdiTotal=300.000, receitaLiquida=1.200.000
  Orc-3: bdiTotal=400.000, receitaLiquida=1.600.000

somaBdi = 1.200.000
somaReceita = 4.800.000
margemBruta = 1.200.000 / 4.800.000 × 100 = 25% → Verde
```

---

## KPI 5 — Margem Líquida

**O que mede:** Percentual de lucro líquido em relação ao total de venda, considerando apenas orçamentos aprovados onde o componente "Lucro" foi configurado no BDI Detalhado.

### Caso A — BDI Detalhado configurado

```
orcamentosAprovadosMesComLucro = aprovadosMes.filter(o =>
  o.configuracoesDetalhadas?.bdi?.lucro?.habilitado === true &&
  (o.configuracoesDetalhadas?.bdi?.lucro?.percentual ?? 0) > 0
)

Para cada orçamento:
  lucroLiquidoOrc = custoDirectoTotal × (lucro.percentual / 100)
  // Nota: lucro.percentual é % sobre o custo direto

somaLucroLiquido = Σ lucroLiquidoOrc
somaTotalVenda = Σ orcamentosAprovadosMesComLucro.totalVenda

margemLiquida = somaLucroLiquido / somaTotalVenda × 100
```

**Meta padrão:** intervalo 10% a 15%

**Semáforo:** Verde 10-15%; Amarelo 8-<10%; Vermelho <8%

### Caso B — BDI Detalhado NÃO configurado (ou nenhum aprovado com lucro)

Exibir card cinza com aviso:
> *"Configure o componente Lucro no BDI Detalhado (aba Dados Gerais do orçamento) para calcular esta margem."*

### Por que não usar `dre.lucroLiquido`?

A função `calcularDRE()` atual tem um bug matemático:
```
lucroBruto = receitaLiquida - custoDirectoTotal = bdiTotal
lucroLiquido = lucroBruto - bdiTotal = bdiTotal - bdiTotal = 0
```
O campo `dre.lucroLiquido` será **sempre 0**. Use obrigatoriamente a fórmula do Caso A.

### Exemplo Caso A:

```
Orçamento aprovado com lucro configurado a 15% sobre custo direto:
  custoDirectoTotal = 1.000.000
  totalVenda = 1.350.000 (inclui BDI 25% + tributos 8%)

  lucroLiquido = 1.000.000 × 15% = 150.000
  margemLiquida = 150.000 / 1.350.000 × 100 = 11.1% → Verde
```

---

## KPI 6 — Ações 5S

**O que mede:** Quantidade de ações 5S registradas manualmente no mês selecionado.

**Fonte de dados:** `localStorage`, chave `kpi_comercial_5s_v1`

**Estrutura do array:**
```json
[
  {
    "id": "uuid-v4",
    "data": "2026-03-15",
    "descricao": "Reorganização do arquivo físico de orçamentos",
    "mes": "2026-03"
  }
]
```

**Fórmula:**
```
acoes5SMes = acoes5S.filter(a => a.mes === mesAno).length
```

**Meta padrão:** 3 ações/mês

**Semáforo:** Verde ≥ 3; Amarelo = 2 (≥ 80% de 3); Vermelho ≤ 1

---

## Metas Configuráveis

Persistidas em `localStorage`, chave `kpi_comercial_metas_v1`:

```json
{
  "qtdOrcamentos": 10,
  "valorOrcamentos": 6000000,
  "taxaConversao": 10,
  "margemBruta": { "min": 20, "max": 25 },
  "margemLiquida": { "min": 10, "max": 15 },
  "acoes5S": 3
}
```

O usuário pode editar via Dialog "Editar Metas" na interface.

---

## Comparativo Mês Anterior

Cada card exibe uma linha auxiliar com a variação em relação ao mês anterior:

```
Mês anterior = mesAno - 1 mês (mesmo cálculo, período anterior)

delta = valorAtual - valorMesAnterior

Exibição:
  delta > 0 → "▲ +{delta}" em verde
  delta < 0 → "▼ {delta}" em vermelho
  delta = 0 → "= Igual ao mês anterior"
  mesAnterior sem dados → não exibir
```

Para KPIs percentuais, o delta é em pontos percentuais (ex: "▲ +2.3 p.p.").

---

## Gráfico de Tendência (6 Meses)

Exibe os últimos 6 meses (incluindo o mês selecionado) com:
- **Barras**: Quantidade de orçamentos (eixo esquerdo)
- **Linha**: Valor total orçado em R$ (eixo direito)
- **Linha tracejada**: meta de Qtd Orçamentos

```
Cálculo dos 6 meses:
for i in [5, 4, 3, 2, 1, 0]:
  mes = mesAno - i meses
  label = "Mar/26", "Fev/26", etc.
  qtd = orcamentos.filter(o => isMesmoMes(o.createdAt, mes)).length
  valor = Σ orcamentos[mes].totalVenda
```

---

## Resumo Executivo das Fórmulas

| KPI | Fonte | Campo filtro | Fórmula |
|---|---|---|---|
| Qtd Orçamentos | Todos | `createdAt` | `count()` |
| Valor Orçamentos | Todos | `createdAt` | `Σ totalVenda` |
| Taxa Conversão | Aprovados + Rejeitados | `updatedAt` | `aprovados / decididos × 100` |
| Margem Bruta | Aprovados | `updatedAt` | `Σ bdiTotal / Σ receitaLiquida × 100` |
| Margem Líquida | Aprovados c/ BDI detalhado | `updatedAt` | `Σ (custoDir × lucro%) / Σ totalVenda × 100` |
| 5S | localStorage | `mes` | `count(acoes do mes)` |
