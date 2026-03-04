# Integração Backend — Módulo Comercial

**Branch:** `Modulo_Comercial`
**Data:** 2026-03-02
**Destinatário:** Equipe Backend

---

## TL;DR — O que o frontend precisa do backend

| Prioridade | O que | Endpoint |
|---|---|---|
| Alta | CRUD completo de Orçamentos | `POST/GET/PUT/DELETE /api/orcamentos` |
| Alta | Detalhes e composições do orçamento | `GET /api/orcamentos/:id` |
| Alta | Clonar orçamento | `POST /api/orcamentos/:id/clonar` |
| Média | Numeração sequencial | `GET /api/orcamentos/numero/proximo` |
| Média | Busca por cliente | `GET /api/orcamentos/cliente/:cnpj` |
| Baixa | Análise ABC | `GET /api/orcamentos/:id/analise-abc` |
| Baixa | DRE calculado | `GET /api/orcamentos/:id/dre` |
| — | Assistente IA | **Não precisa de backend** (OpenAI direto do browser) |

---

## 1. Estado atual do frontend (modo mock)

O frontend opera hoje com **`VITE_USE_MOCK_DATA=true`** — todos os dados vêm do `localStorage`.

Para migrar para o backend real: basta remover/alterar essa variável de ambiente. O `OrcamentoService` já tem os dois caminhos (`USE_MOCK ? localStorage : axios`) prontos em cada método.

```
# .env.local (desenvolvimento com backend)
# VITE_USE_MOCK_DATA=true   ← comentar ou remover esta linha

# .env.local (mock local)
VITE_USE_MOCK_DATA=true
```

Base URL configurada em `src/config.ts`:
```
Produção : https://api.gmxindustrial.com.br
Local    : http://localhost:3000
```

---

## 2. Contratos de API esperados

### `POST /api/orcamentos` — Criar orçamento

**Request body (`CreateOrcamento`):**
```json
{
  "nome": "Estrutura Galpão XYZ",
  "tipo": "servico",
  "clienteNome": "Acme Ltda",
  "codigoProjeto": "M-15706",
  "areaTotalM2": 1500.0,
  "metrosLineares": null,
  "pesoTotalProjeto": 45000,
  "tributos": {
    "temISS": false,
    "aliquotaISS": 3.0,
    "aliquotaSimples": 11.8
  }
}
```

**`tipo`** — obrigatório, controla a numeração:
- `"servico"` → numeração `S-2026-001`
- `"produto"` → numeração `P-2026-001`

**Response:** objeto `Orcamento` completo (ver seção 4).

O backend deve criar automaticamente as **10 composições padrão** com os BDIs pré-definidos (ver seção 3).

---

### `GET /api/orcamentos` — Listar todos

**Response:** `Orcamento[]`

O frontend espera os campos calculados (`custoDirectoTotal`, `subtotal`, `bdiMedio`, `dre`) já presentes na resposta. Esses valores são derivados das composições — o cálculo pode ser feito no backend ou retornado como calculados no momento da leitura.

---

### `GET /api/orcamentos/:id` — Detalhe completo

**Response:** `Orcamento` com todas as composições e itens populados.

O campo `composicoes[].itens` deve estar completo. O frontend **não faz chamadas separadas** para buscar itens de composição.

---

### `PUT /api/orcamentos/:id` — Atualizar

**Request body:** `Partial<Orcamento>` — o frontend envia o objeto completo do orçamento (incluindo composições e itens editados).

> **Importante:** o frontend gerencia e envia composições + itens juntos no `PUT`. O backend deve aceitar o objeto aninhado completo e persistir tudo em cascata (upsert em composições e itens).

**Response:** `Orcamento` recalculado e atualizado.

---

### `DELETE /api/orcamentos/:id` — Excluir

**Response:** `204 No Content`

---

### `POST /api/orcamentos/:id/clonar` — Clonar orçamento

Cria uma cópia do orçamento (com nova numeração sequencial, nome sufixado com "(Cópia)") mantendo todas as composições e itens.

**Response:** novo `Orcamento` (cópia completa).

---

### `GET /api/orcamentos/numero/proximo` — Próximo número

**Response:**
```json
{ "numero": "S-2026-004" }
```

Usado no formulário de novo orçamento para exibir o número que será atribuído.

---

### `GET /api/orcamentos/cliente/:cnpj` — Por cliente

**Response:** `Orcamento[]` filtrados pelo CNPJ do cliente.

---

### `GET /api/orcamentos/:id/analise-abc` *(baixa prioridade)*

**Response:** análise ABC das composições do orçamento. Formato livre — o frontend ainda não consome este endpoint diretamente na UI final.

---

### `GET /api/orcamentos/:id/dre` *(baixa prioridade)*

**Response:** DRE calculado. Formato livre — o frontend calcula DRE localmente via `calcularDRE()` em `src/lib/calculosOrcamento.ts` e pode ignorar este endpoint por ora.

---

## 3. Composições padrão — criadas automaticamente ao criar orçamento

Ao criar um orçamento, o backend deve inicializar as seguintes 10 composições vazias:

| `tipo` | `nome` | BDI padrão |
|---|---|---|
| `mobilizacao` | Mobilização | 10% |
| `desmobilizacao` | Desmobilização | 10% |
| `mo_fabricacao` | MO Fabricação | 25% |
| `mo_montagem` | MO Montagem | 25% |
| `mo_terceirizados` | MO Terceirizada | 20% |
| `jato_pintura` | Jato/Pintura | 12% |
| `ferramentas` | Ferramentas Manuais | 15% |
| `ferramentas_eletricas` | Ferramentas Elétricas | 15% |
| `consumiveis` | Consumíveis | 10% |
| `materiais` | Materiais | 25% |

Cada composição começa com `itens: []`, `custoDirecto: 0`, `subtotal: 0`.

---

## 4. Tipos principais

### `Orcamento` (objeto completo retornado pela API)

```typescript
{
  id: string,
  numero: string,              // "S-2026-001" ou "P-2026-001"
  nome: string,
  tipo: "servico" | "produto",
  status?: "rascunho" | "em_analise" | "aprovado" | "rejeitado",
  clienteNome?: string,
  codigoProjeto?: string,
  areaTotalM2?: number,
  metrosLineares?: number,
  pesoTotalProjeto?: number,

  composicoes: ComposicaoCustos[],   // 10 composições com itens

  configuracoes: {
    bdi: number,               // BDI médio total (calculado)
    tributos: { iss, simples, total },
    encargos: number,          // 58.724%
  },

  qqpSuprimentos: {
    materiais, pintura, ferramentas, consumiveis, total
  },
  qqpCliente: {
    suprimentos, maoObra, bdi, subtotal, tributos, total,
    area?, precoM2?
  },

  tributos: { temISS, aliquotaISS, aliquotaSimples },

  // Campos calculados (derivados das composições)
  custoDirectoTotal: number,
  bdiTotal: number,
  subtotal: number,
  tributosTotal: number,
  totalVenda: number,
  bdiMedio: number,            // % médio ponderado
  custoPorM2?: number,

  dre: {
    receitaLiquida, lucroBruto, margemBruta,
    lucroLiquido, margemLiquida
  },

  createdAt: string,           // ISO 8601
  updatedAt: string,
  createdBy: number            // userId
}
```

### `ComposicaoCustos`

```typescript
{
  id: string,
  orcamentoId: string,
  nome: string,
  tipo: "mobilizacao" | "desmobilizacao" | "mo_fabricacao" | "mo_montagem" |
        "mo_terceirizados" | "jato_pintura" | "ferramentas" |
        "ferramentas_eletricas" | "consumiveis" | "materiais",
  itens: ItemComposicao[],
  bdi: { percentual: number, valor: number },  // percentual editável, valor calculado
  custoDirecto: number,        // soma dos itens.subtotal
  subtotal: number,            // custoDirecto + bdi.valor
  percentualDoTotal: number,   // % do custoDirectoTotal do orçamento
  ordem: number
}
```

### `ItemComposicao`

```typescript
{
  id: string,
  composicaoId: string,
  codigo?: string,             // "MAT-001"
  descricao: string,
  quantidade: number,
  unidade: string,             // "kg", "h", "un", "m²", "m", etc.
  peso?: number,               // kg (materiais)
  material?: string,           // "ASTM A 36", "AISI 304"
  especificacao?: string,
  valorUnitario: number,
  subtotal: number,            // quantidade * valorUnitario (calculado)
  percentual: number,          // % da composição
  tipoItem: "material" | "mao_obra" | "ferramenta" | "consumivel" | "outros",
  tipoCalculo?: "kg" | "hh" | "un" | "m2" | "m",
  cargo?: string,              // "Soldador", "Ajudante"
  encargos?: { percentual: number, valor: number },
  classeABC?: "A" | "B" | "C",
  ordem: number
}
```

---

## 5. Cálculos que o frontend espera prontos na resposta

O frontend possui lógica de recálculo local (`src/lib/calculosOrcamento.ts`) como fallback no modo mock. No modo backend, esperamos que a API retorne os campos já calculados:

| Campo | Fórmula |
|---|---|
| `ItemComposicao.subtotal` | `quantidade × valorUnitario` |
| `ComposicaoCustos.custoDirecto` | `Σ itens.subtotal` |
| `ComposicaoCustos.bdi.valor` | `custoDirecto × (bdi.percentual / 100)` |
| `ComposicaoCustos.subtotal` | `custoDirecto + bdi.valor` |
| `Orcamento.custoDirectoTotal` | `Σ composicoes.custoDirecto` |
| `Orcamento.bdiTotal` | `Σ composicoes.bdi.valor` |
| `Orcamento.subtotal` | `custoDirectoTotal + bdiTotal` |
| `Orcamento.bdiMedio` | `bdiTotal / custoDirectoTotal` |
| `Orcamento.dre.receitaLiquida` | `subtotal × (1 - aliquotaSimples)` |
| `Orcamento.dre.margemBruta` | `(receitaLiquida - custoDirectoTotal) / receitaLiquida` |

---

## 6. O que NÃO precisa de backend — Assistente IA

O módulo de IA em `/comercial/assistente-ia` é **100% client-side**:

- Comunicação direta com **OpenAI Chat Completions API** pelo browser do usuário
- API Key armazenada no `localStorage` do usuário (nunca passa pelo backend)
- Histórico de chat armazenado no `localStorage`
- Extração de PDF/DXF/DWG processada no browser (pdfjs-dist, dxf-parser)

**Nenhum endpoint backend** é necessário para o Assistente IA.

O único dado que o IA busca do backend é o retorno de `GET /api/orcamentos` para montar o contexto analítico — o mesmo endpoint já usado no resto do módulo.

---

## 7. Checklist de entrega backend

- [ ] `POST /api/orcamentos` — cria orçamento + 10 composições padrão
- [ ] `GET /api/orcamentos` — lista com campos calculados
- [ ] `GET /api/orcamentos/:id` — detalhe com composições + itens
- [ ] `PUT /api/orcamentos/:id` — atualiza em cascata (composições + itens)
- [ ] `DELETE /api/orcamentos/:id` — exclui orçamento
- [ ] `POST /api/orcamentos/:id/clonar` — clona com nova numeração
- [ ] `GET /api/orcamentos/numero/proximo` — próxima numeração
- [ ] Campos calculados retornados na resposta (ver seção 5)
- [ ] Status `rascunho | em_analise | aprovado | rejeitado` suportados
- [ ] `createdBy` populado com o `userId` do token JWT

---

## 8. Como ativar o backend no frontend

1. Remover (ou comentar) `VITE_USE_MOCK_DATA=true` no `.env.local`
2. Confirmar que `API_URL` em `src/config.ts` aponta para o ambiente correto
3. Reiniciar o servidor de desenvolvimento (`npm run dev`)

Nenhuma outra alteração de código é necessária — o `OrcamentoService` já está preparado.
