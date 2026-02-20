# 🎨 MELHORIAS DE UX: MÓDULO ORÇAMENTOS (QQP)

**Data:** 2026-02-08
**Branch:** Modulo_Comercial
**Status:** Proposta em Análise

---

## 📊 ANÁLISE DO FLUXO ATUAL

### Fluxo Completo de Criação de Orçamento

```
1. Criar Orçamento (novo/index.tsx)
   └─ Formulário com dados básicos

2. Adicionar Composições (AdicionarComposicaoDialog.tsx)
   └─ Dialog modal para cada composição

3. Adicionar Itens (AdicionarItemDialog.tsx)
   └─ Dialog modal para cada item

4. Visualizar Resultados
   ├─ Cards de resumo financeiro
   ├─ Aba Composições (estrutura detalhada)
   ├─ Aba DRE (demonstrativo de resultado)
   └─ Aba Configurações (tributos)

5. Exportar PDF / Salvar
```

---

## 🎯 MELHORIAS PROPOSTAS

### PRIORIDADE 1: CRÍTICAS (Impacto Alto + Esforço Médio)

#### 1.1 - Grid Inline para Composições ⭐⭐⭐⭐⭐

**Problema Atual:**
- Dialog modal para adicionar cada composição individualmente
- Lento para criar múltiplas composições
- Campos "Nome" e "Tipo" redundantes (geralmente iguais)

**Solução Proposta:**
- **Substituir dialog por tabela inline editável** (estilo Excel)
- **Pre-popular com todas as composições padrão** ao criar orçamento:
  1. Mobilização (BDI 25%)
  2. MO Fabricação (BDI 15%)
  3. MO Montagem (BDI 15%)
  4. Jato/Pintura (BDI 20%)
  5. Ferramentas (BDI 10%)
  6. Consumíveis (BDI 20%)
  7. Materiais (BDI 25%)
  8. Desmobilização (BDI 25%)
- **Usuário deleta** as composições que não vai usar (mais rápido)
- **BDI editável por composição** (permite pricing estratégico)

**Mockup:**
```
┌───────────────────────────────────────────────────────────────────┐
│  COMPOSIÇÕES DE CUSTOS                                            │
├───────────────────────────────────────────────────────────────────┤
│ Tipo            │ Nome              │ BDI (%) │ Custo  │ Ações    │
├─────────────────┼───────────────────┼─────────┼────────┼──────────┤
│ Mobilização     │ [Mobilização]     │ [25]    │ R$ 0   │ [×] [↓]  │
│ MO Fabricação   │ [MO Fabricação]   │ [15]    │ R$ 0   │ [×] [↓]  │
│ MO Montagem     │ [MO Montagem]     │ [15]    │ R$ 0   │ [×] [↓]  │
│ Jato/Pintura    │ [Jato/Pintura]    │ [20]    │ R$ 0   │ [×] [↓]  │
│ Ferramentas     │ [Ferramentas]     │ [10]    │ R$ 0   │ [×] [↓]  │
│ Consumíveis     │ [Consumíveis]     │ [20]    │ R$ 0   │ [×] [↓]  │
│ Materiais       │ [Materiais]       │ [25]    │ R$ 0   │ [×] [↓]  │
│ Desmobilização  │ [Desmobilização]  │ [25]    │ R$ 0   │ [×] [↓]  │
└─────────────────┴───────────────────┴─────────┴────────┴──────────┘
  [×] = Deletar composição     [↓] = Expandir para ver itens
```

**Benefícios:**
- ✅ 10x mais rápido criar orçamento
- ✅ BDI diferenciado por composição (estratégia competitiva)
- ✅ Nome editável inline (ex: "Mobilização - Guindastes")
- ✅ Menos cliques (não precisa abrir dialog)
- ✅ Visão geral de todas as composições

**Arquivos Afetados:**
- `src/pages/comercial/orcamentos/[id]/index.tsx` - Aba Composições
- `src/pages/comercial/orcamentos/[id]/AdicionarComposicaoDialog.tsx` - Remover
- `src/components/orcamento/ComposicoesGrid.tsx` - **NOVO**

**Esforço:** 3-4 horas

---

#### 1.2 - Grid Inline para Itens ⭐⭐⭐⭐⭐

**Problema Atual:**
- Dialog modal para adicionar cada item individualmente
- Muito lento para adicionar dezenas/centenas de itens
- Não permite copiar/colar de Excel

**Solução Proposta:**
- **Grid inline editável** (ao expandir composição)
- **Botão "Adicionar Linha"** adiciona nova linha vazia
- **Campos inline:**
  - Tipo (dropdown): Material, MO, Ferramenta, Consumível
  - Código (texto)
  - Descrição (texto, autocomplete de itens comuns)
  - Quantidade (número)
  - Unidade (dropdown)
  - Valor Unitário (R$)
  - Subtotal (calculado automaticamente)
- **Ações por linha:** Deletar, Duplicar

**Mockup:**
```
▼ Materiais (BDI 25%) - Custo: R$ 150.000,00
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ Tipo     │ Código  │ Descrição          │ Qtd  │ Un │ Val.Unit│ Subtotal│
  ├──────────┼─────────┼────────────────────┼──────┼────┼─────────┼─────────┤
  │ Material │ MAT-001 │ Chapa ASTM A36 3/4 │ 1500 │ kg │ 12,50   │ 18.750  │
  │ Material │ MAT-002 │ Perfil U 6"        │ 500  │ kg │ 15,00   │ 7.500   │
  │ [+ Nova] │         │                    │      │    │         │         │
  └──────────┴─────────┴────────────────────┴──────┴────┴─────────┴─────────┘
```

**Recursos Avançados:**
- **Importar de CSV/Excel** - Botão na composição
- **Autocomplete** - Sugerir itens usados em outros orçamentos
- **Duplicar linha** - Para itens similares

**Benefícios:**
- ✅ 20x mais rápido adicionar itens
- ✅ Permite importar planilhas (usuários já têm materiais em Excel)
- ✅ Edição inline (sem abrir dialog)
- ✅ Copiar/Colar funciona nativamente

**Arquivos Afetados:**
- `src/pages/comercial/orcamentos/[id]/index.tsx` - Renderização de composições
- `src/pages/comercial/orcamentos/[id]/AdicionarItemDialog.tsx` - Remover
- `src/components/orcamento/ItensGrid.tsx` - **NOVO**
- `src/components/orcamento/ImportarItensCSV.tsx` - **NOVO**

**Esforço:** 4-5 horas

---

#### 1.3 - Auto-preenchimento ao Selecionar Tipo ⭐⭐⭐⭐

**Problema Atual:**
- Ao criar composição, usuário digita "Mobilização" no nome
- Depois seleciona "Mobilização" no tipo
- **Redundante!**

**Solução Proposta:**
- Selecionar Tipo → Auto-preenche Nome (mas editável)
- Exemplo: Seleciona "Mobilização" → Nome vira "Mobilização" automaticamente
- Usuário pode editar se quiser: "Mobilização - Guindastes Especiais"

**Benefícios:**
- ✅ Menos digitação
- ✅ Nomes consistentes
- ✅ Usuário pode personalizar se necessário

**Arquivos Afetados:**
- `src/pages/comercial/orcamentos/[id]/AdicionarComposicaoDialog.tsx`
  - Adicionar `useEffect` que observa mudança em `tipo` e atualiza `nome`

**Esforço:** 15 minutos

---

### PRIORIDADE 2: IMPORTANTES (Impacto Médio + Esforço Baixo)

#### 2.1 - Análise ABC Visível ⭐⭐⭐⭐

**Problema Atual:**
- Análise ABC é **calculada** (`lib/calculosOrcamento.ts` linha 104-128)
- Mas **NÃO é exibida** na interface!
- Usuário não vê quais itens são críticos

**O que é Análise ABC:**
- **Classe A (15% dos itens, 80% do valor)** - Itens críticos, focar negociação
- **Classe B (35% dos itens, 15% do valor)** - Itens importantes
- **Classe C (50% dos itens, 5% do valor)** - Itens de baixo valor

**Solução Proposta:**
- **Coluna "ABC"** na grid de itens
- **Badge colorido:**
  - A: Vermelho (alta prioridade)
  - B: Amarelo (média prioridade)
  - C: Verde (baixa prioridade)
- **Filtro por classe** (mostrar só itens A para negociar)

**Benefícios:**
- ✅ Identifica itens críticos para negociação
- ✅ Foca esforços onde tem maior impacto
- ✅ Usa cálculo que já existe!

**Arquivos Afetados:**
- `src/components/orcamento/ItensGrid.tsx` - Adicionar coluna ABC
- `src/lib/calculosOrcamento.ts` - Já calcula, só expor na UI

**Esforço:** 1 hora

---

#### 2.2 - Templates de Composições ⭐⭐⭐

**Problema Atual:**
- `TemplateComposicaoService` existe no código
- Mas **não há UI** para usar templates!

**Solução Proposta:**
- **Botão "Usar Template"** ao adicionar composição
- **Dialog** com lista de templates salvos
- **Criar template** a partir de composição existente

**Exemplo de uso:**
1. Crio orçamento para "Estrutura Metálica Galpão A"
2. Composição "Materiais" tem 50 itens detalhados
3. Salvo como template "Materiais - Galpão Industrial"
4. No próximo orçamento similar → Uso o template
5. **Economiza horas de digitação!**

**Benefícios:**
- ✅ Reutiliza composições comuns
- ✅ Padroniza orçamentos
- ✅ Reduz erros (usar algo já testado)

**Arquivos Afetados:**
- `src/pages/comercial/orcamentos/[id]/SelecionarTemplateDialog.tsx` - **NOVO**
- `src/pages/comercial/orcamentos/[id]/SalvarComoTemplateDialog.tsx` - **NOVO**

**Esforço:** 2 horas

---

#### 2.3 - Importar CSV de Itens ⭐⭐⭐⭐

**Problema Atual:**
- Interface de importação CSV existe (`ImportCSVDialog.tsx`)
- Mas **não está exposta na UI atual**!
- Usuários têm materiais em Excel mas não conseguem importar

**Solução Proposta:**
- **Botão "Importar CSV"** em cada composição
- **Formato esperado:**
  ```csv
  Tipo,Código,Descrição,Quantidade,Unidade,ValorUnitario
  Material,MAT-001,Chapa ASTM A36 3/4,1500,kg,12.50
  Material,MAT-002,Perfil U 6",500,kg,15.00
  MO,MOB-001,Soldador,120,h,45.00
  ```
- **Preview antes de importar**
- **Validação** de dados

**Benefícios:**
- ✅ Importa planilhas existentes
- ✅ Migração de sistema antigo facilitada
- ✅ Economiza horas de digitação

**Arquivos Afetados:**
- `src/pages/comercial/orcamentos/[id]/ImportCSVDialog.tsx` - Já existe!
- `src/pages/comercial/orcamentos/[id]/index.tsx` - Adicionar botão

**Esforço:** 1 hora (só expor na UI)

---

### PRIORIDADE 3: DESEJÁVEIS (Impacto Médio + Esforço Alto)

#### 3.1 - Editor de BDI Detalhado ⭐⭐⭐

**Problema Atual:**
- BDI é só um percentual (ex: 25%)
- **Não mostra o que está incluído no BDI!**
- Usuário não sabe de onde veio o 25%

**O que deveria ter:**
BDI = Lucro + Despesas Indiretas

**Despesas Indiretas típicas:**
- Administração central
- Impostos (COFINS, PIS, IRPJ, CSLL)
- Seguros e garantias
- Riscos e imprevistos
- Custos financeiros

**Solução Proposta:**
- **Dialog "Configurar BDI"** ao editar composição
- **Campos editáveis:**
  ```
  Lucro desejado: 8%
  Administração central: 5%
  Impostos federais: 7.6%
  Seguros: 1%
  Riscos: 2%
  Custos financeiros: 1.4%
  ─────────────────────
  BDI Total: 25%
  ```
- **Cálculo automático** do BDI total

**Benefícios:**
- ✅ Transparência no cálculo
- ✅ Justifica BDI para cliente
- ✅ Permite ajuste fino estratégico

**Arquivos Afetados:**
- `src/pages/comercial/orcamentos/[id]/ConfigurarBDIDialog.tsx` - **NOVO**
- `src/lib/calculosOrcamento.ts` - Adicionar `calcularBDIDetalhado()`

**Esforço:** 3 horas

---

#### 3.2 - Comparação de Orçamentos ⭐⭐⭐

**Problema Atual:**
- Não há forma de comparar dois orçamentos lado a lado
- Útil para analisar variações de escopo

**Solução Proposta:**
- **Página "Comparar Orçamentos"**
- Selecionar 2-3 orçamentos
- **Tabela comparativa:**
  ```
  Composição       │ Orçamento A │ Orçamento B │ Diferença
  ─────────────────┼─────────────┼─────────────┼──────────
  Mobilização      │ R$ 20.000   │ R$ 25.000   │ +25%
  MO Fabricação    │ R$ 120.000  │ R$ 100.000  │ -17%
  Materiais        │ R$ 60.000   │ R$ 80.000   │ +33%
  ─────────────────┼─────────────┼─────────────┼──────────
  TOTAL            │ R$ 200.000  │ R$ 205.000  │ +2.5%
  ```

**Benefícios:**
- ✅ Analisa impacto de mudanças de escopo
- ✅ Compara opções de projeto
- ✅ Justifica diferenças para cliente

**Arquivos Afetados:**
- `src/pages/comercial/orcamentos/comparar/index.tsx` - **NOVO**
- `src/components/orcamento/ComparacaoTable.tsx` - **NOVO**

**Esforço:** 4 horas

---

### PRIORIDADE 4: POLISH (Impacto Baixo + Esforço Baixo)

#### 4.1 - Dark Mode em Formulários ⭐⭐

**Problema Atual:**
- Formulários de criação/edição não estão otimizados para dark mode
- Contraste ruim em alguns campos

**Solução Proposta:**
- Revisar classes Tailwind
- Adicionar `dark:` variants onde necessário
- Testar em modo escuro

**Arquivos Afetados:**
- `src/pages/comercial/orcamentos/novo/index.tsx`
- `src/pages/comercial/orcamentos/[id]/AdicionarComposicaoDialog.tsx`
- `src/pages/comercial/orcamentos/[id]/AdicionarItemDialog.tsx`

**Esforço:** 1-2 horas

---

#### 4.2 - Atalhos de Teclado ⭐⭐

**Problema Atual:**
- Tudo requer mouse/click
- Lento para usuários power

**Solução Proposta:**
- **Ctrl+N** - Nova composição/item
- **Ctrl+S** - Salvar
- **Ctrl+D** - Duplicar item
- **Delete** - Deletar item selecionado
- **Tab/Enter** - Navegar entre células do grid

**Benefícios:**
- ✅ Muito mais rápido para usuários avançados
- ✅ Parece software profissional

**Arquivos Afetados:**
- `src/hooks/useKeyboardShortcuts.ts` - **NOVO**
- Componentes grid

**Esforço:** 2 horas

---

## 📊 RESUMO DE PRIORIDADES

| Melhoria | Impacto | Esforço | ROI | Prioridade |
|----------|---------|---------|-----|------------|
| 1.1 - Grid Composições | ⭐⭐⭐⭐⭐ | 3-4h | Alto | P1 |
| 1.2 - Grid Itens | ⭐⭐⭐⭐⭐ | 4-5h | Alto | P1 |
| 1.3 - Auto-preenchimento | ⭐⭐⭐⭐ | 15min | Altíssimo | P1 |
| 2.1 - Análise ABC | ⭐⭐⭐⭐ | 1h | Alto | P2 |
| 2.2 - Templates | ⭐⭐⭐ | 2h | Médio | P2 |
| 2.3 - Importar CSV | ⭐⭐⭐⭐ | 1h | Alto | P2 |
| 3.1 - BDI Detalhado | ⭐⭐⭐ | 3h | Médio | P3 |
| 3.2 - Comparar Orçamentos | ⭐⭐⭐ | 4h | Médio | P3 |
| 4.1 - Dark Mode | ⭐⭐ | 1-2h | Baixo | P4 |
| 4.2 - Atalhos Teclado | ⭐⭐ | 2h | Baixo | P4 |

**Total Estimado P1:** 7-8 horas
**Total Estimado P1+P2:** 11-12 horas
**Total Geral:** 21-24 horas

---

## 🚀 PLANO DE IMPLEMENTAÇÃO SUGERIDO

### FASE 1: Core UX (P1) - 7-8 horas

**Sessão 1 (3-4h):**
1. Implementar Grid de Composições inline
2. Pre-popular composições ao criar orçamento
3. BDI editável por composição

**Sessão 2 (4h):**
1. Implementar Grid de Itens inline
2. Autocomplete de descrições
3. Cálculos automáticos

**Sessão 3 (15min):**
1. Auto-preenchimento Nome ao selecionar Tipo

---

### FASE 2: Produtividade (P2) - 4 horas

**Sessão 4 (2h):**
1. Expor Importar CSV na UI
2. Adicionar coluna Análise ABC

**Sessão 5 (2h):**
1. UI de Templates
2. Salvar/Carregar templates

---

### FASE 3: Avançado (P3) - 7 horas
*Implementar conforme necessidade*

---

### FASE 4: Polish (P4) - 3-4 horas
*Implementar ao final, antes do merge*

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Após FASE 1 (P1):
- [ ] Criar orçamento com 8 composições leva < 30 segundos
- [ ] Adicionar 10 itens em uma composição leva < 2 minutos
- [ ] BDI diferenciado por composição funciona
- [ ] Cálculos automáticos corretos

### Após FASE 2 (P2):
- [ ] Importar CSV de 50 itens funciona
- [ ] Análise ABC visível e correta
- [ ] Templates salvos e reutilizados

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Bibliotecas Recomendadas

**Para Grid Editável:**
- **Opção 1:** React Table (TanStack Table v8) + edição inline custom
- **Opção 2:** AG Grid Community (mais robusto, mas maior)
- **Opção 3:** Componentes shadcn/ui Table + estado Zustand

**Recomendação:** Opção 3 (shadcn/ui + Zustand)
- ✅ Já usamos no projeto
- ✅ Sem dependências extras
- ✅ Customização total
- ✅ Performance boa para < 1000 linhas

### Padrões de Código

**Estado local de edição:**
```typescript
// Grid de composições
const [composicoes, setComposicoes] = useState<Composicao[]>([]);
const [editandoId, setEditandoId] = useState<string | null>(null);

// Editar célula
const handleEditCell = (id: string, campo: string, valor: any) => {
  setComposicoes(prev => prev.map(c =>
    c.id === id ? { ...c, [campo]: valor } : c
  ));
};
```

**Salvar mudanças:**
```typescript
// Salvar em lote (debounced)
const debouncedSave = useDebouncedCallback(async () => {
  await ComposicaoService.updateBatch(composicoes);
  recalcularOrcamento();
}, 1000);

useEffect(() => {
  debouncedSave();
}, [composicoes]);
```

---

## 🔄 COMPATIBILIDADE

### Dados Existentes
- ✅ Interface `Orcamento` não muda (só adiciona campos opcionais)
- ✅ Orçamentos antigos continuam funcionando
- ✅ Migration automática (BDI composição = BDI padrão se não definido)

### API/Mock
- ✅ Mock em localStorage continua funcionando
- ✅ API backend precisa apenas aceitar novos campos opcionais
- ✅ Sem breaking changes

---

## 📚 REFERÊNCIAS

### Inspiração de UX
- **SAP Business One** - Grid inline de composições
- **TOTVS Protheus** - Importação CSV
- **Oracle Primavera** - Templates de composições
- **Google Sheets** - Edição inline fluida

### Componentes Shadcn/ui Usados
- Table (grid base)
- Input (células editáveis)
- Select (dropdowns inline)
- Dialog (modals quando necessário)
- Badge (análise ABC, status)

---

**Última atualização:** 2026-02-08
**Autor:** Análise conjunta com usuário
**Status:** Aguardando aprovação para implementação
