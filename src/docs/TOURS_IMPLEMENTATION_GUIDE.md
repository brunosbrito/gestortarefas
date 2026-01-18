# Guia de Implementação de Tours Guiados

Este guia descreve como implementar tours guiados (onboarding) em novas páginas do sistema usando a infraestrutura existente.

## 📚 Infraestrutura Disponível

### Componentes
- **`<TourButton>`** ([src/components/tour/TourButton.tsx](../components/tour/TourButton.tsx))
  - Botão reutilizável para iniciar tours
  - Variantes: `default`, `outline`, `ghost`
  - Tamanhos: `default`, `sm`, `lg`, `icon`
  - Tooltip automático com "Iniciar tour guiado (Ctrl+?)"

- **`<HelpTooltip>`** ([src/components/help/HelpTooltip.tsx](../components/help/HelpTooltip.tsx))
  - Tooltip de ajuda inline para campos complexos
  - Variante compacta: `<HelpTooltipInline>`
  - Configurável: posição, tamanho, título, conteúdo

### Hooks
- **`useTour()`** ([src/hooks/useTour.ts](../hooks/useTour.ts))
  - Gerencia o tour com driver.js
  - Callbacks: `onComplete`, `onClose`
  - Configurações: `showProgress`, `allowClose`
  - Retorna: `{ startTour, endTour, highlightElement, driverInstance }`

- **`useFirstVisitTour()`** ([src/hooks/useTour.ts](../hooks/useTour.ts))
  - Inicia tour automaticamente na primeira visita
  - Armazena estado em localStorage (`tour_completed_${tourKey}`)
  - Útil para onboarding inicial

- **`useResetTours()`** ([src/hooks/useTour.ts](../hooks/useTour.ts))
  - Reseta todos os tours (útil para desenvolvimento)
  - Limpa localStorage

### Arquivo de Configuração
- **`src/lib/tourSteps.ts`**
  - Centraliza todos os steps dos tours
  - Cada tour é um array de `DriveStep[]`
  - Tours existentes:
    - `dashboardTourSteps` (Dashboard PCP)
    - `atividadesTourSteps` (Atividades)
    - `obrasTourSteps` (Obras)
    - `rncTourSteps` (RNC/Não Conformidades)
    - `welcomeTourSteps` (Tour inicial do sistema)

---

## 🚀 Como Implementar um Novo Tour

### Passo 1: Adicionar atributos `data-tour` nos elementos

Identifique os elementos-chave da página e adicione o atributo `data-tour` com um ID único:

```tsx
// ❌ Antes
<div className="filters-section">
  <h2>Filtros</h2>
  {/* ... */}
</div>

<Card>
  <CardHeader>Dashboard KPIs</CardHeader>
  {/* ... */}
</Card>

// ✅ Depois
<div data-tour="filters" className="filters-section">
  <h2>Filtros</h2>
  {/* ... */}
</div>

<Card data-tour="dashboard-kpis">
  <CardHeader>Dashboard KPIs</CardHeader>
  {/* ... */}
</Card>
```

**Convenções para IDs:**
- Use kebab-case: `dashboard-kpis`, `activity-status`, `nova-rnc-button`
- Seja descritivo: `filters` não `div1`
- Para botões de ação: sufixo `-button` (ex: `create-button`)
- Para cards: sufixo `-card` (ex: `rnc-card`)
- Para gráficos: sufixo `-chart` (ex: `macro-tasks-chart`)

### Passo 2: Criar os steps do tour em `tourSteps.ts`

Adicione um novo array de steps no arquivo `src/lib/tourSteps.ts`:

```typescript
/**
 * Configuração dos steps do tour guiado de [Nome do Módulo]
 */
export const [moduloName]TourSteps: DriveStep[] = [
  {
    popover: {
      title: 'Bem-vindo ao [Nome]! 👋',
      description: 'Breve descrição do módulo. Vamos fazer um tour rápido?',
    }
  },
  {
    element: '[data-tour="filters"]',
    popover: {
      title: 'Filtros',
      description: 'Descrição clara e objetiva do que são os filtros.',
      side: 'bottom', // 'top' | 'right' | 'bottom' | 'left'
      align: 'start'  // 'start' | 'center' | 'end'
    }
  },
  // ... mais steps
  {
    popover: {
      title: 'Pronto! 🎉',
      description: 'Você pode iniciar este tour novamente clicando no botão "Iniciar Tour".',
    }
  }
];
```

**Boas Práticas para Steps:**
1. **Ordem lógica**: Siga o fluxo visual da página (top-down, left-right)
2. **Quantidade ideal**: 5-8 steps (não mais que 10)
3. **Título**: Máximo 3-4 palavras
4. **Descrição**: 1-2 frases curtas (máximo 120 caracteres)
5. **Posicionamento**: Use `side` e `align` para evitar sobr posição
6. **Emojis**: Use com moderação para dar personalidade (apenas no primeiro e último step)

### Passo 3: Integrar o tour na página

```tsx
import { useTour } from '@/hooks/useTour';
import { [moduloName]TourSteps } from '@/lib/tourSteps';
import { TourButton } from '@/components/tour/TourButton';

const MinhaPage = () => {
  // Hook do tour (chamar ANTES de qualquer return)
  const { startTour } = useTour({
    steps: [moduloName]TourSteps,
    onComplete: () => {
      console.log('✅ Tour concluído!');
    }
  });

  return (
    <div>
      {/* Header com TourButton */}
      <div className="flex justify-between items-center">
        <h1>Título da Página</h1>
        <TourButton onClick={startTour} variant="outline" size="default" />
      </div>

      {/* Elementos com data-tour */}
      <div data-tour="filters">
        {/* ... */}
      </div>
    </div>
  );
};
```

### Passo 4: Testar o tour

1. **Teste manual**:
   - Clique no botão "Iniciar Tour"
   - Navegue por todos os steps
   - Verifique se destacam os elementos corretos
   - Confirme que os popovers não ficam cortados/sobrepostos

2. **Teste de responsividade**:
   - Mobile (< 768px)
   - Tablet (768px - 1024px)
   - Desktop (> 1024px)

3. **Teste de edge cases**:
   - Elementos que não existem (página vazia, sem dados)
   - Elementos collapsed (filtros retraídos, acordeons fechados)
   - Scroll necessário para ver elemento

4. **Resetar tour** (para testar novamente):
   ```javascript
   // No console do navegador:
   localStorage.removeItem('tour_completed_[tourKey]');
   ```

---

## 🎨 Como Adicionar Tooltips de Ajuda

Tooltips são recomendados para campos complexos de formulários:

### Quando usar Tooltips?
- ✅ Campos técnicos (CFOP, SKU, NCM, etc.)
- ✅ Termos do negócio (RNC, Bitributação, 5 Porquês, etc.)
- ✅ Campos com regras de validação complexas
- ✅ Diferenças sutis entre opções (ex: "Responsável pela RNC" vs "Identificado por")
- ❌ Campos óbvios (Nome, E-mail, Telefone)
- ❌ Campos com placeholder explicativo suficiente

### Exemplo de uso

```tsx
import { HelpTooltipInline } from '@/components/help/HelpTooltip';

<FormLabel>
  CFOP <span className="text-destructive">*</span>
  <HelpTooltipInline
    title="O que é CFOP?"
    content="Código Fiscal de Operações e Prestações. Define a natureza da circulação de mercadorias."
  />
</FormLabel>
```

**Props de `<HelpTooltip>`**:
- `content` (obrigatório): Texto da explicação
- `title` (opcional): Título do tooltip
- `side` (opcional): Posição do tooltip (`'top'` | `'right'` | `'bottom'` | `'left'`)
- `align` (opcional): Alinhamento (`'start'` | `'center'` | `'end'`)
- `iconSize` (opcional): Tamanho do ícone (`'sm'` | `'md'` | `'lg'`)
- `className` (opcional): Classes CSS adicionais

### Variantes

```tsx
// HelpTooltip (padrão)
<HelpTooltip
  title="Título"
  content="Explicação detalhada"
  side="right"
  iconSize="md"
/>

// HelpTooltipInline (para labels)
<HelpTooltipInline
  content="Explicação curta"
  side="right"
/>
```

---

## 📋 Checklist de Implementação

Ao implementar tours em novos módulos (Qualidade, Suprimentos, etc.), seguir esta checklist:

### Planejamento
- [ ] Identificar as 5-8 funcionalidades principais da página
- [ ] Definir a ordem lógica do tour (fluxo natural do usuário)
- [ ] Listar campos complexos que precisam de tooltips (meta: 5-10 por módulo)

### Implementação
- [ ] Adicionar atributos `data-tour` nos elementos-chave
- [ ] Criar array de steps em `src/lib/tourSteps.ts`
- [ ] Importar e usar `useTour()` hook na página
- [ ] Adicionar `<TourButton>` no header da página
- [ ] Adicionar `<HelpTooltipInline>` nos campos complexos

### Testes
- [ ] Tour funciona do início ao fim sem erros
- [ ] Todos os elementos são destacados corretamente
- [ ] Popovers não ficam cortados ou sobrepostos
- [ ] Funciona em mobile, tablet e desktop
- [ ] Tooltips exibem as informações corretas

### Documentação
- [ ] Atualizar este guia se encontrar novos padrões
- [ ] Documentar decisões de UX/conteúdo (se relevante)

---

## 🎯 Tours Planejados para Módulos Futuros

### Módulo Qualidade

**Páginas prioritárias:**
1. **Dashboard Qualidade** (`/qualidade/indicadores`)
   - KPIs de qualidade
   - Gráficos de conformidade
   - Alertas de não conformidades

2. **Inspeções** (`/qualidade/inspecoes`)
   - Criação de inspeção
   - Aprovação/Reprovação
   - Ressalvas

3. **Certificados** (`/qualidade/certificados`)
   - Emissão de certificados
   - Rastreabilidade
   - Validade

4. **Calibração** (`/qualidade/calibracao`)
   - Cadastro de equipamentos
   - Controle de vencimentos
   - Histórico de calibrações

5. **Ações Corretivas** (`/qualidade/acoes-corretivas`)
   - Análise dos 5 Porquês
   - Plano de ação
   - Eficácia da ação

**Tooltips importantes:**
- "O que é Inspeção de Recebimento?"
- "Aprovado com Ressalvas vs Reprovado"
- "Certificado de Qualidade vs Certificado de Conformidade"
- "Calibração Interna vs Externa"
- "Metodologia dos 5 Porquês"
- "Taxa de Conformidade vs Taxa de Aprovação"

### Módulo Suprimentos

**Páginas prioritárias:**
1. **Dashboard Suprimentos** (`/suprimentos/dashboard`)
   - Visão geral de compras
   - Pedidos pendentes
   - Fornecedores

2. **Requisições de Compra** (`/suprimentos/requisicoes`)
   - Criação de requisição
   - Aprovação
   - Status

3. **Cotações** (`/suprimentos/cotacoes`)
   - Envio de cotação para fornecedores
   - Comparação de propostas
   - Mapa de cotação

4. **Ordens de Compra** (`/suprimentos/ordens-compra`)
   - Geração de OC
   - Acompanhamento
   - Recebimento

5. **Mapa de Cotação** (`/suprimentos/mapa-cotacao`)
   - Comparação lado a lado
   - Score automático
   - Negociação

**Tooltips importantes:**
- "Requisição de Compra vs Ordem de Compra"
- "CFOP (Código Fiscal)"
- "Prazo de Entrega vs Prazo de Pagamento"
- "Score de Fornecedor (preço/prazo/pagamento)"
- "Bitributação (Compras Diretas)"
- "Conta Corrente de Contrato"

---

## 🔧 Troubleshooting

### Problema: Tour não destaca o elemento corretamente

**Solução**:
1. Verificar se o atributo `data-tour` está escrito corretamente (sem typos)
2. Verificar se o seletor no step está correto: `'[data-tour="id"]'`
3. Verificar se o elemento existe no DOM quando o tour inicia
4. Se o elemento está em um modal/dialog, considerar usar callback para aguardar abertura

### Problema: Popover fica cortado ou fora da tela

**Solução**:
1. Ajustar `side` e `align` no step
2. Usar `side: 'top'` para elementos próximos ao rodapé
3. Usar `side: 'bottom'` para elementos próximos ao topo
4. Garantir que há espaço suficiente (min 200px) ao redor do elemento

### Problema: Tooltip não aparece

**Solução**:
1. Verificar se `TooltipProvider` está envolvendo a aplicação (deve estar em `main.tsx`)
2. Verificar se o componente `HelpTooltip` foi importado corretamente
3. Verificar console para erros

### Problema: Tour não funciona em mobile

**Solução**:
1. driver.js funciona em mobile, mas elementos pequenos podem ser difíceis de destacar
2. Considerar usar elementos maiores em mobile (buttons com `size="default"` não `size="sm"`)
3. Testar em dispositivo real, não apenas DevTools

---

## 📚 Recursos Adicionais

- [Driver.js Documentation](https://driverjs.com/)
- [Radix UI Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)
- [UX Best Practices for Product Tours](https://www.appcues.com/blog/product-tour-examples)

---

**Última atualização**: Janeiro 2026
**Mantenedor**: Claude Code
