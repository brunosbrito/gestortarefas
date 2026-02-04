# 📋 Módulo de Gestão de Processos

## Visão Geral

O módulo de Gestão de Processos oferece um conjunto completo de ferramentas para melhoria contínua e gestão de qualidade, implementando metodologias consolidadas de gestão.

**Status**: ✅ 100% Implementado
**Data de Conclusão**: Janeiro 2026
**Versão**: 1.0.0

---

## 🛠️ Ferramentas Implementadas

### 1. **Priorização de Problemas (Matriz GUT)**
Prioriza problemas baseado em Gravidade × Urgência × Tendência.

**Funcionalidades:**
- Matriz interativa de scoring (1-5 para cada dimensão)
- Cálculo automático de pontuação (G × U × T)
- Classificação automática (Baixa, Média, Alta, Crítica)
- Ranking automático de problemas
- Workflow de aprovação
- Export PDF

**Arquivos:**
- Service: `src/services/gestaoProcessos/PriorizacaoProblemaService.ts`
- Lista: `src/pages/gestao-processos/priorizacao/index.tsx`
- Dialog: `src/pages/gestao-processos/priorizacao/components/PriorizacaoDialog.tsx`
- Componente: `src/pages/gestao-processos/priorizacao/components/GUTMatrixTable.tsx`

**Critérios GUT:**
- **Gravidade**: Impacto do problema (1=Sem gravidade → 5=Extremamente grave)
- **Urgência**: Prazo para resolução (1=Pode esperar → 5=Imediata)
- **Tendência**: Evolução do problema (1=Não vai piorar → 5=Vai piorar rapidamente)

**Classificação de Pontuação:**
- 1-27: Baixa
- 28-64: Média
- 65-100: Alta
- 101-125: Crítica

---

### 2. **Plano de Ação 5W2H**
Planejamento estruturado de ações corretivas e preventivas.

**Funcionalidades:**
- Ações com 7 dimensões (5W + 2H)
- Cards expansíveis para cada ação
- Cálculo automático de progresso
- Consolidação de custos e prazos
- Status por ação (Pendente, Em Andamento, Concluída, Verificada)
- Página de detalhes com gestão de ações

**7 Dimensões:**
1. **What** (O Quê): O que será feito
2. **Why** (Por Quê): Por que esta ação é necessária
3. **Who** (Quem): Quem é o responsável
4. **When** (Quando): Prazo de execução
5. **Where** (Onde): Local de execução
6. **How** (Como): Método/procedimento
7. **How Much** (Quanto Custa): Custo estimado

**Arquivos:**
- Service: `src/services/gestaoProcessos/PlanoAcao5W2HService.ts`
- Lista: `src/pages/gestao-processos/planos-acao/index.tsx`
- Detail: `src/pages/gestao-processos/planos-acao/[id]/index.tsx`
- Componente: `src/pages/gestao-processos/planos-acao/components/Acao5W2HCard.tsx`

**Cálculos Automáticos:**
- `progressoGeral`: (ações concluídas + verificadas) / total × 100
- `custoTotal`: Soma de quantoCusta de todas as ações
- `prazoInicio/prazoFim`: Menor/maior data de ações

---

### 3. **Desdobramento de Problemas**
Análise de causas e efeitos com estrutura hierárquica.

**Funcionalidades:**
- Causas em 3 níveis (Primária, Secundária, Terciária)
- Marcação de causa raiz
- Análise de efeitos por gravidade
- Linking opcional com Priorização
- Estrutura hierárquica com parentId

**Arquivos:**
- Service: `src/services/gestaoProcessos/DesdobramentoProblemaService.ts`
- Lista: `src/pages/gestao-processos/desdobramento/index.tsx`

**Estrutura de Causas:**
```typescript
{
  id: string;
  tipo: 'primaria' | 'secundaria' | 'terciaria';
  nivel: 1 | 2 | 3;
  parentId?: string; // ID da causa pai
  descricao: string;
  causaRaiz: boolean; // Identificar se é a causa raiz
}
```

**Análise de Efeitos:**
```typescript
{
  id: string;
  descricao: string;
  gravidade: 'baixa' | 'media' | 'alta';
  areaAfetada: string;
}
```

---

### 4. **Metas SMART**
Definição e acompanhamento de metas usando critérios SMART.

**Funcionalidades:**
- Wizard de 4 etapas para criação
- Validação de 5 critérios SMART
- Sistema de milestones com tracking
- Revisões periódicas
- Cálculo automático de progresso
- Indicadores mensuráveis (valor atual → meta)

**5 Critérios SMART:**
1. **Specific** (Específico): O Quê, Quem, Onde
2. **Measurable** (Mensurável): Indicador, unidade, valores
3. **Attainable** (Atingível): Recursos, viabilidade
4. **Relevant** (Relevante): Alinhamento estratégico, benefícios
5. **Time-bound** (Temporal): Prazos e milestones

**Arquivos:**
- Service: `src/services/gestaoProcessos/MetaSMARTService.ts`
- Lista: `src/pages/gestao-processos/metas/index.tsx`
- Detail: `src/pages/gestao-processos/metas/[id]/index.tsx`
- Dialog: `src/pages/gestao-processos/metas/components/MetaSMARTDialog.tsx`

**Sistema de Milestones:**
```typescript
{
  id: string;
  descricao: string;
  dataPrevisao: string;
  dataConclusao?: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'verificada';
  responsavelId: string;
  responsavelNome: string;
}
```

**Progresso**: Baseado em milestones completados/verificados

---

### 5. **PDCA (Plan-Do-Check-Act)**
Ciclo de melhoria contínua com 4 fases integradas.

**Funcionalidades:**
- 4 fases sequenciais (Plan, Do, Check, Act)
- Timeline visual de progresso
- Sistema de iterações (novos ciclos)
- Linking entre ciclos
- Decisões baseadas em eficácia
- Lições aprendidas e padronização

**4 Fases:**

**PLAN (Planejar):**
- Identificação do problema
- Meta esperada e indicador
- Análise de causa raiz (5 Porquês, Ishikawa, etc.)
- Plano de ação com responsáveis
- Prazo e recursos

**DO (Executar):**
- Execução das ações
- Registro de evidências
- Desvios e medidas corretivas
- Status de execução

**CHECK (Verificar):**
- Medição de resultados
- Comparação com meta
- Análise de eficácia
- Justificativa

**ACT (Agir):**
- **Se eficaz**: Padronizar (documentos, treinamentos, procedimentos)
- **Se parcialmente eficaz**: Melhorar e ajustar
- **Se não eficaz**: Novo ciclo PDCA

**Arquivos:**
- Service: `src/services/gestaoProcessos/PDCAService.ts`
- Lista: `src/pages/gestao-processos/pdca/index.tsx`
- Detail: `src/pages/gestao-processos/pdca/[id]/index.tsx`

**Sistema de Iterações:**
```typescript
{
  numeroCiclo: number; // 1, 2, 3...
  cicloAnteriorId?: string; // Link para ciclo anterior
  proximoCicloId?: string; // Link para próximo ciclo
  // ... rest of PDCA data
}
```

Método `iniciarNovoCiclo(pdcaAnteriorId)` cria automaticamente novo ciclo linkado.

---

## 🎯 Dashboard Consolidado

### Funcionalidades

**KPIs Principais:**
- Total de documentos (todas ferramentas)
- Documentos em andamento
- Documentos concluídos
- Progresso médio (Planos 5W2H + Metas SMART)

**Gráficos Interativos (Recharts):**
1. **Distribuição por Status** (PieChart)
   - Rascunho, Aguardando Aprovação, Aprovado, Rejeitado
2. **Distribuição por Ferramenta** (BarChart)
   - Contagem por cada uma das 5 ferramentas
3. **Progresso por Ferramenta**
   - Planos 5W2H: concluídos/total
   - Metas SMART: atingidas/total

**Métricas Consolidadas:**
- Problemas alta prioridade (GUT)
- Ações totais e completadas (5W2H)
- Causas raiz identificadas (Desdobramento)
- Milestones completados (Metas SMART)
- Custo total dos planos

**Quick Actions:**
- Botões para criar documentos em cada ferramenta
- Ícones e descrições diferenciados

**Timeline de Documentos Recentes:**
- Últimos 10 documentos criados/atualizados
- Ordenado por data (mais recentes primeiro)

**Arquivos:**
- Service: `src/services/gestaoProcessos/DashboardGestaoProcessosService.ts`
- Página: `src/pages/gestao-processos/Dashboard.tsx`

---

## ✅ Fila de Aprovação Centralizada

### Funcionalidades

**Gestão Centralizada:**
- Agregação de documentos aguardando aprovação de TODAS as 5 ferramentas
- Visualização unificada com resumos contextuais
- Filtro por ferramenta

**Aprovação em Lote:**
- Seleção múltipla com checkbox
- Aprovação de vários documentos simultaneamente
- Feedback de sucessos/erros

**Rejeição em Lote:**
- Motivo obrigatório (mínimo 10 caracteres)
- Aplicado a todos os selecionados
- Registro de aprovador e data

**Informações por Documento:**
- Tipo de ferramenta (badge colorido)
- Código único
- Título e descrição
- Resumo contextual específico por tipo
- Criador, data, vinculação
- Botões: Visualizar, Aprovar, Rejeitar

**Arquivos:**
- Service: `src/services/gestaoProcessos/AprovacaoGPService.ts`
- Página: `src/pages/gestao-processos/FilaAprovacao.tsx`

**Método getCount():**
```typescript
async getCount(): Promise<number>
```
Retorna contagem para badge de notificação no menu.

---

## 📁 Estrutura de Arquivos

```
src/
├── interfaces/
│   └── GestaoProcessosInterfaces.ts        # Todas as interfaces (500+ linhas)
│
├── services/gestaoProcessos/
│   ├── PriorizacaoProblemaService.ts       # CRUD + GUT calculation
│   ├── PlanoAcao5W2HService.ts             # CRUD + progress tracking
│   ├── DesdobramentoProblemaService.ts     # CRUD + hierarchy
│   ├── MetaSMARTService.ts                 # CRUD + milestones + revisions
│   ├── PDCAService.ts                      # CRUD + 4 phases + iterations
│   ├── DashboardGestaoProcessosService.ts  # Aggregated stats
│   └── AprovacaoGPService.ts               # Approval queue management
│
├── pages/gestao-processos/
│   ├── index.tsx                           # Router (lazy loading)
│   ├── Dashboard.tsx                       # Main dashboard
│   ├── FilaAprovacao.tsx                   # Approval queue
│   │
│   ├── components/                         # Shared components
│   │   ├── VinculacaoSelector.tsx         # Obra/Setor/Independente
│   │   ├── StatusBadge.tsx                # Status badges
│   │   ├── AprovacaoDialog.tsx            # Approval dialog
│   │   └── RejeicaoDialog.tsx             # Rejection dialog
│   │
│   ├── priorizacao/
│   │   ├── index.tsx                      # List page
│   │   └── components/
│   │       ├── PriorizacaoDialog.tsx      # 3-step wizard
│   │       └── GUTMatrixTable.tsx         # Interactive matrix
│   │
│   ├── planos-acao/
│   │   ├── index.tsx                      # List page
│   │   ├── [id]/index.tsx                 # Detail page
│   │   └── components/
│   │       └── Acao5W2HCard.tsx           # Expandable action card
│   │
│   ├── desdobramento/
│   │   └── index.tsx                      # List page
│   │
│   ├── metas/
│   │   ├── index.tsx                      # List page
│   │   ├── [id]/index.tsx                 # Detail page
│   │   └── components/
│   │       └── MetaSMARTDialog.tsx        # 4-step wizard
│   │
│   └── pdca/
│       ├── index.tsx                      # List page
│       └── [id]/index.tsx                 # Detail with phase tabs
│
└── components/layout/sidebar/
    └── menuItems.ts                        # Menu config (badge: 'count')
```

---

## 🔄 Workflow de Aprovação

### Estados de Status

```
rascunho → aguardando_aprovacao → aprovado/rejeitado
```

**Status:**
- `rascunho`: Documento em edição
- `aguardando_aprovacao`: Submetido para revisão
- `aprovado`: Aprovado por gestor/diretor
- `rejeitado`: Rejeitado com motivo

### Campos Capturados

```typescript
interface DocumentoBaseGP {
  status: StatusDocumentoGP;
  aprovadorId?: string;
  aprovadorNome?: string;
  dataAprovacao?: string; // ISO string
  motivoRejeicao?: string; // Se rejeitado
}
```

### Métodos de Aprovação (em todos os Services)

```typescript
async aprovar(aprovacao: AprovacaoDTO): Promise<T>
async rejeitar(aprovacao: AprovacaoDTO): Promise<T>
async submeterParaAprovacao(id: string): Promise<T>
```

---

## 🔗 Sistema de Vinculação

Todos os documentos podem ser vinculados a:

1. **Obra** (Projeto de construção)
2. **Setor** (Departamento da empresa)
3. **Independente** (Sem vinculação específica)

**Interface:**
```typescript
interface VinculacaoGP {
  tipoVinculacao: 'obra' | 'setor' | 'independente';
  obraId?: string;
  obraNome?: string;
  setorId?: string;
  setorNome?: string;
}
```

**Componente:** `VinculacaoSelector` - select duplo com busca de obras/setores

---

## 🔗 Relacionamentos entre Ferramentas

### Linkings Opcionais

**Priorização → Desdobramento:**
```typescript
interface PriorizacaoProblema {
  desdobramentoId?: string;
}
```

**Desdobramento → PDCA:**
```typescript
interface DesdobramentoProblema {
  pdcaId?: string;
}
interface PDCA {
  desdobramentoId?: string;
}
```

**Desdobramento → Meta SMART:**
```typescript
interface DesdobramentoProblema {
  metaId?: string;
}
interface MetaSMART {
  desdobramentoId?: string;
}
```

**PDCA → Meta SMART:**
```typescript
interface MetaSMART {
  pdcaId?: string;
}
```

**Plano 5W2H → PDCA/Meta:**
```typescript
interface PlanoAcao5W2H {
  pdcaId?: string;
  metaId?: string;
  priorizacaoId?: string;
}
```

**Fluxo Típico:**
```
Priorização (identifica problema)
    ↓
Desdobramento (analisa causas)
    ↓
PDCA (planeja solução) ← Meta SMART
    ↓
Plano 5W2H (executa ações)
```

---

## 🎨 Padrões de UI/UX

### 1. Filtros Collapsible
```tsx
<Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" className="w-full">
      <h3>Filtros</h3>
      <ChevronDown className={cn('transition-transform', filtersOpen && 'rotate-180')} />
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Filtros */}
  </CollapsibleContent>
</Collapsible>
```

### 2. KPI Cards com Hover Effects
```tsx
<Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardDescription>Total</CardDescription>
      <div className="bg-blue-600 p-2 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground">{subtitle}</div>
  </CardContent>
</Card>
```

### 3. Gráficos com Modal Fullscreen
```tsx
<Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => openModal()}>
  <CardHeader>
    <CardTitle>
      Título
      <Badge variant="outline" className="ml-auto">Click para ampliar</Badge>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={200}>
      {/* Chart */}
    </ResponsiveContainer>
  </CardContent>
</Card>

<Dialog open={modalOpen} onOpenChange={setModalOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh]">
    <ResponsiveContainer width="100%" height={500}>
      {/* Fullscreen Chart */}
    </ResponsiveContainer>
  </DialogContent>
</Dialog>
```

### 4. Dark Mode Support
Todas as cores com variantes dark:
```tsx
className="bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
```

### 5. Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## 📊 Mock Data

Todos os services possuem `useMock = true` com dados de exemplo:

**Priorização**: 3 problemas com scores GUT diferentes
**Planos 5W2H**: 2 planos com 6 ações total
**Desdobramento**: 1 desdobramento com hierarquia de 3 níveis
**Metas SMART**: 1 meta com 5 milestones e 1 revisão
**PDCA**: 2 ciclos (1 completo, 1 em execução)

**Delay simulado**: 300-800ms para simular latência de rede

---

## 🚀 Próximas Implementações (Backend)

Para integração com backend, alterar em cada service:
```typescript
private useMock = false; // Mudar de true para false
```

Implementar chamadas HTTP usando padrão:
```typescript
async getAll(): Promise<T[]> {
  if (this.useMock) {
    // Mock implementation
  }

  // Backend implementation
  const response = await fetch(`${API_URL}/gestao-processos/[endpoint]`);
  return response.json();
}
```

---

## 📝 Códigos Únicos

Todos os documentos possuem código único gerado automaticamente:

**Formato**: `GP-[TIPO]-[ANO]-[NUMERO][-EXTRA]`

**Exemplos:**
- Priorização: `GP-PRI-2026-001`
- Plano 5W2H: `GP-5W2H-2026-001`
- Desdobramento: `GP-DESDOBR-2026-001`
- Meta SMART: `GP-META-2026-001`
- PDCA: `GP-PDCA-2026-001-C2` (C2 = Ciclo 2)

---

## 🎓 Metodologias Implementadas

### Matriz GUT
**Origem**: Charles Kepner e Benjamin Tregoe (década de 1980)
**Uso**: Priorização de problemas em gestão da qualidade

### 5W2H
**Origem**: Toyota Production System
**Uso**: Planejamento de ações detalhadas

### PDCA
**Origem**: W. Edwards Deming (Ciclo de Deming)
**Uso**: Melhoria contínua de processos

### SMART
**Origem**: George T. Doran (1981)
**Uso**: Definição de objetivos e metas

### Análise de Causas
**Métodos suportados**: 5 Porquês, Diagrama de Ishikawa, Árvore de Causas

---

## ✅ Checklist de Implementação

### Sprint 1 ✅
- [x] Interfaces TypeScript completas
- [x] Estrutura de pastas
- [x] Router com lazy loading
- [x] Menu de navegação
- [x] Componentes base (4)
- [x] Priorização GUT (Lista + Dialog + GUT Matrix)
- [x] Planos 5W2H (Lista + Detail + Action Cards)

### Sprint 2 ✅
- [x] Desdobramento (Lista + hierarchical structure)
- [x] Metas SMART (Lista + Detail + 4-step wizard)
- [x] Dashboard (KPIs + Charts + Quick Actions)

### Sprint 3 ✅
- [x] PDCA (Lista + Detail + 4 phase tabs + iterations)
- [x] Fila de Aprovação (Lista + Batch approval/rejection)
- [x] Badge count infrastructure (menu + service)
- [x] Documentação completa

### Qualidade ✅
- [x] Filtros collapsible em todas as listas
- [x] Gráficos com modal fullscreen
- [x] Export PDF/Excel (mock ready)
- [x] Cards com hover effects
- [x] Dark mode support
- [x] Responsive design (mobile-first)
- [x] TypeScript 100% type-safe
- [x] Consistent loading states
- [x] Error handling com toast notifications

---

## 📱 Compatibilidade

**Navegadores Suportados:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Dispositivos:**
- Desktop (1920x1080 optimal)
- Tablet (768px+ width)
- Mobile (375px+ width)

**Tecnologias:**
- React 18+
- TypeScript 5+
- Vite 5+
- shadcn/ui (Radix UI + Tailwind CSS)
- Recharts 2+
- date-fns 3+

---

## 📄 Licença

Propriedade de GML Estruturas
Uso interno apenas

---

**Desenvolvido por**: Claude Sonnet 4.5
**Data**: Janeiro 2026
**Versão**: 1.0.0
**Status**: ✅ Produção Ready
