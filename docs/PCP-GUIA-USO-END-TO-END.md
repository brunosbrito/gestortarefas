# GUIA DE USO END-TO-END: Módulo PCP

**Sistema**: Gestor Master - GMX Soluções Industriais
**Módulo**: Production Planning and Control (PCP)
**Versão**: 1.0.0
**Data**: 04/02/2026

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [FASE 1: Integração Orçamento → Execução](#fase-1-integração-orçamento--execução)
3. [FASE 2: MRP - Material Requirements Planning](#fase-2-mrp---material-requirements-planning)
4. [FASE 3: Capacidade Produtiva Multi-Projeto](#fase-3-capacidade-produtiva-multi-projeto)
5. [Fluxo Completo de Uso](#fluxo-completo-de-uso)
6. [FAQ e Troubleshooting](#faq-e-troubleshooting)

---

## 🎯 Visão Geral

O módulo PCP completo integra 3 fases fundamentais para planejamento e controle de produção:

```
FASE 1                    FASE 2                    FASE 3
   ↓                        ↓                         ↓
Orçamento → OS    →    MRP calcula       →    Capacidade valida
+ Atividades          necessidades          se há recursos
                      de materiais          disponíveis
```

### Componentes Implementados

| Fase | Status | Funcionalidade Principal | URL |
|------|--------|--------------------------|-----|
| FASE 1 | ✅ 100% | Vincular Orçamento a OS e rastrear custos | `/obras/:projectId/os` |
| FASE 2 | ✅ 100% | Calcular necessidades de materiais (MRP) | `/pcp/mrp` |
| FASE 3 | ✅ 100% | Analisar capacidade produtiva | `/pcp/capacidade` |

**Modo Atual**: Mock (Frontend-only) - Todos os dados são mockados para desenvolvimento

---

## FASE 1: Integração Orçamento → Execução

### Objetivo
Conectar o BOM do Orçamento (ComposicaoCustos → ItemComposicao) com a execução real (Service Orders e Atividades) para rastrear custo planejado vs real.

### Passo a Passo

#### 1. Criar Orçamento (Comercial)

**Navegação**: `Comercial → Orçamentos → Novo Orçamento`

1. Preencha dados básicos:
   - Nome do orçamento
   - Cliente
   - Código do projeto (ex: M-15706)
   - Peso total do projeto

2. Adicione Composições de Custo:
   - **Materiais**: Chapas, perfis, tubos, etc.
   - **Mão de Obra Fabricação**: Soldadores, ajudantes
   - **Mão de Obra Montagem**
   - **Jato e Pintura**
   - **Ferramentas e Consumíveis**

3. Para cada composição, adicione itens:
   - Código do item (ex: MAT-CH-001)
   - Descrição (ex: "Chapa ASTM A 36 - 6mm")
   - Quantidade e Unidade
   - Valor unitário
   - Especificação técnica

4. Revise cálculos automáticos:
   - Custo Direto
   - BDI (Despesas Operacionais)
   - Margem de Lucro
   - Total de Venda

5. Salve o orçamento

#### 2. Criar Service Order (Obras)

**Navegação**: `Obras → [Selecionar Projeto] → Service Orders → Nova OS`

1. Preencha dados da OS:
   - Número da OS (auto-gerado)
   - Descrição
   - Quantidade/Peso
   - Data de início
   - Observações

2. Salve a OS

#### 3. Vincular Orçamento à OS

**Localização**: Dialog "Visualizar OS" → Aba "Orçamento vs Real"

1. Clique em **"Vincular Orçamento"**

2. No dialog que abre:
   - Selecione o orçamento na lista
   - Visualize dados do orçamento (cliente, código, peso)
   - Escolha quais **Composições de Custo** esta OS executará (checkbox)
   - Observe o **Custo Planejado Total** calculado automaticamente

3. Clique em **"Vincular e Gerar Atividades"**

4. Sistema:
   - Vincula OS.orcamentoId = orçamento.id
   - Vincula OS.composicaoIds = [comp-001, comp-002]
   - Calcula OS.custoPlanejado
   - **Gera automaticamente Atividades** para cada item da composição
   - Mostra progresso: "Gerando atividades... (2/3)"

#### 4. Visualizar Orçamento vs Real

**Localização**: Dialog "Visualizar OS" → Aba "Orçamento vs Real"

**KPIs Exibidos**:
- 💰 **Custo Planejado**: Soma das composições vinculadas
- 💸 **Custo Real**: Acumulado de atividades executadas
- 📊 **Variance**: Diferença (Real - Planejado) em R$ e %
  - 🟢 Verde se negativo (economizou)
  - 🔴 Vermelho se positivo (gastou mais)

**Gráfico**:
- BarChart (Recharts) comparando Planejado vs Real

**Lista de Composições**:
- Mostra quais composições estão vinculadas
- Valor de cada uma
- Quantidade de itens

#### 5. Registrar Consumo nas Atividades

**Navegação**: `Atividades → [Selecionar Atividade]`

**Novos Campos PCP**:
- **Vínculo Orçamento**: Mostra se está vinculada a item de orçamento
- **Quantidade Planejada**: Do orçamento
- **Quantidade Realizada**: Executada de fato
- **Custo Planejado**: Do item do orçamento
- **Custo Real**: Calculado com base no consumo

---

## FASE 2: MRP - Material Requirements Planning

### Objetivo
Calcular necessidades de materiais para TODOS os projetos em execução simultânea, agregando demanda e gerando sugestões consolidadas de compra.

### Passo a Passo

#### 1. Acessar Dashboard MRP

**Navegação**: `PCP → MRP`

**Modo Atual**: Mock (dados simulados)

#### 2. Visualizar KPIs

**Indicadores Principais**:
1. **Total de Itens Necessários**: Quantidade de materiais diferentes
2. **Valor Total de Compras**: R$ total das sugestões
3. **Itens em Falta**: Materiais com estoque insuficiente
4. **Itens Críticos (Classe A)**: Alta importância na Análise ABC
5. **Taxa de Atendimento**: % de itens disponíveis em estoque

#### 3. Analisar Necessidades Consolidadas

**Tabela de Necessidades**:

Colunas principais:
- **Código**: MAT-CH-001, MAT-PF-001, etc.
- **Descrição**: Chapa ASTM A 36, Perfil I ASTM A 572
- **Quantidade Necessária Bruta**: Total demandado
- **Estoque Disponível**: Atual em almoxarifado
- **Necessidade Líquida**: Bruta - Disponível
- **Origem (Pegging)**: Quais projetos/OS demandam
- **Classe ABC**: A (crítico), B (importante), C (normal)

**Exemplo de Pegging**:
```
Material: Chapa ASTM A 36 - 6mm
Necessidade Total: 1.200 kg
  ├─ Projeto A (OS-0001): 500 kg
  ├─ Projeto B (OS-0002): 400 kg
  └─ Projeto C (OS-0003): 300 kg
```

#### 4. Filtrar Necessidades

**Filtros Disponíveis**:
- Por Projeto
- Por Classe ABC
- Por Status (Em Falta, Disponível)
- Por Período (Datas de necessidade)

#### 5. Gerar Sugestões de Compra

**Botão**: "Consolidar Compra" ou "Gerar Requisições"

Sistema:
1. Agrupa materiais iguais de vários projetos
2. Calcula quantidade total necessária
3. Considera lead time de fornecedores
4. Gera sugestão de compra consolidada

**Integração Futura**:
- Criar Requisição de Compra automaticamente no módulo Suprimentos
- Vincular requisição à origem (MRP)

#### 6. Detectar Conflitos

**Conflitos Identificados**:
- Material necessário em 2+ projetos na mesma data
- Falta de material crítico
- Prazo de entrega incompatível

---

## FASE 3: Capacidade Produtiva Multi-Projeto

### Objetivo
Calcular se há capacidade de recursos (colaboradores, máquinas) para executar TODOS os projetos simultâneos. Identificar gargalos e validar viabilidade de novos projetos.

### Passo a Passo

#### 1. Acessar Dashboard de Capacidade

**Navegação**: `PCP → Capacidade`

**Modo Atual**: Mock (dados simulados)

#### 2. Visualizar KPIs Principais

**8 Indicadores**:

1. **Taxa de Utilização Média**: % de capacidade ocupada
   - 🟢 50-70% = Saudável
   - 🟡 70-90% = Alta utilização
   - 🔴 >90% = Sobrecarga

2. **Gargalos Detectados**: Quantidade de recursos sobrecarregados

3. **Recursos Ociosos**: Com utilização < 50%

4. **Horas Disponíveis**: Total de horas/semana

5. **Horas Alocadas**: Total alocado em projetos

6. **Horas Extras Necessárias**: Para cumprir prazos

7. **Projetos Ativos**: Quantidade em execução

8. **Centros de Trabalho**: Quantidade de setores

#### 3. Analisar Recursos por Tipo

**Gráfico 1**: Capacidade vs Demanda (BarChart)

- Eixo X: Recursos (Soldadores, Montadores, Máquinas)
- Eixo Y: Horas
- Barras:
  - 🔵 Azul = Disponível
  - 🟠 Laranja = Alocado

**Interpretação**:
- Barra laranja > azul = Sobrecarga (GARGALO)
- Barra laranja << azul = Ociosidade

#### 4. Identificar Gargalos

**Tabela de Recursos**:

Colunas:
- **Recurso**: Nome/Identificação
- **Tipo**: Colaborador, Máquina, Equipe
- **Especialização**: Soldador, Montador, etc.
- **Horas Disponíveis**: Semana/Mês
- **Horas Alocadas**: Em projetos
- **Taxa Utilização**: % (colorido por severidade)
- **Status**:
  - 🟢 OK (< 70%)
  - 🟡 Alto (70-90%)
  - 🔴 GARGALO (> 90%)

#### 5. Visualizar Timeline de Capacidade

**Gráfico 2**: Capacidade ao Longo do Tempo (LineChart)

- Eixo X: Semanas/Meses
- Eixo Y: Taxa de Utilização (%)
- Linhas:
  - 🔵 Capacidade Total
  - 🟠 Demanda Agregada
  - 🔴 Linha de Gargalo (90%)

**Uso**: Identificar quando haverá sobrecarga futura

#### 6. Simular Novo Projeto

**Botão**: "Simular Novo Projeto"

**Formulário**:
1. Nome do projeto
2. Horas totais estimadas
3. Data de início desejada
4. Data de fim desejada

**Sistema Calcula**:
- Impacto na capacidade atual
- Taxa de utilização resultante
- Viabilidade (SIM/NÃO)
- Se NÃO viável:
  - Data ideal para início
  - Sugestões (contratar, postergar, etc.)

**Exemplo de Resultado**:
```
❌ PROJETO NÃO VIÁVEL
Motivo: Capacidade em 105% (sobrecarga)

Sugestões:
1. Postergar início para 2026-04-01
2. Contratar 2 soldadores temporários
3. Realocar equipe de Projeto B (baixa prioridade)
```

#### 7. Ver Conflitos de Alocação

**Detecção Automática**:
- Mesmo recurso alocado em 2+ tarefas simultâneas
- Prioridade do conflito (Crítica, Alta, Média, Baixa)

#### 8. Sugestões de Nivelamento

**Sistema Sugere**:
- Mover Tarefa X do Recurso A para Recurso B
- Postergar Tarefa Y em 1 semana
- Trabalhar em horas extras

---

## 🔄 Fluxo Completo de Uso

### Cenário: "Novo Projeto Aceito - Do Orçamento à Execução"

#### Etapa 1: Comercial (Pré-Venda)

1. **Criar Proposta Comercial**
   - Definir escopo e prazo
   - Estimar horas e materiais

2. **Criar Orçamento (QQP)**
   - Composições de Custo detalhadas
   - BOM completo (materiais + MO)
   - Cálculos de BDI e Margem

3. **Proposta Aprovada pelo Cliente**
   - Status: "Aceita"
   - Vínculo a Projeto/Obra

#### Etapa 2: PCP - Planejamento

4. **FASE 3: Simular Viabilidade de Capacidade**
   - Acessar: `PCP → Capacidade → Simular Novo Projeto`
   - Input: Horas estimadas, datas
   - Output: Viável? Data ideal?

5. **Se Viável**: Criar Projeto/Obra
   - Confirmar datas com cliente
   - Criar no sistema

6. **Criar Service Order**
   - Navegação: `Obras → [Projeto] → Nova OS`
   - Preencher dados básicos

7. **FASE 1: Vincular Orçamento à OS**
   - Dialog "Visualizar OS" → "Vincular Orçamento"
   - Selecionar composições
   - Sistema gera atividades automaticamente

8. **FASE 2: Rodar MRP**
   - Acessar: `PCP → MRP`
   - Visualizar necessidades consolidadas
   - Gerar requisições de compra

#### Etapa 3: Suprimentos (Compras)

9. **Processar Requisições**
   - Navegação: `Suprimentos → Requisições`
   - Criar cotações
   - Emitir Ordens de Compra

10. **Receber Materiais**
    - Almoxarifado registra entrada
    - Estoque atualizado

#### Etapa 4: Execução (Produção)

11. **Alocar Recursos no Cronograma**
    - `Cronograma → Gantt`
    - Alocar colaboradores em tarefas
    - Sistema valida capacidade (FASE 3)

12. **Executar Atividades**
    - `Atividades → [Selecionar]`
    - Registrar consumo de materiais
    - Registrar horas trabalhadas
    - Atualizar progresso

13. **Baixar Materiais do Estoque**
    - Automático via vínculo com atividade

#### Etapa 5: Controle (Acompanhamento)

14. **Monitorar Variance (FASE 1)**
    - `Obras → OS → Visualizar → Orçamento vs Real`
    - Verificar se está no orçamento
    - Analisar desvios

15. **Monitorar MRP (FASE 2)**
    - `PCP → MRP`
    - Verificar se há materiais em falta
    - Antecipar compras se necessário

16. **Monitorar Capacidade (FASE 3)**
    - `PCP → Capacidade`
    - Verificar gargalos
    - Realocar recursos se necessário

#### Etapa 6: Encerramento

17. **Concluir OS**
    - Todas as atividades finalizadas
    - Materiais baixados
    - Status: "Concluída"

18. **Análise Final**
    - Relatório de Variance
    - Lições aprendidas
    - Atualizar templates de orçamento

---

## FAQ e Troubleshooting

### Perguntas Frequentes

#### Q1: Os dados são reais ou mockados?
**R**: Atualmente, TODAS as 3 fases estão em **mock mode** (`useMock = true`). Os dados são simulados para desenvolvimento frontend. A integração real com backend será feita na FASE 3.5.

#### Q2: Como sei se a OS está vinculada a um orçamento?
**R**:
1. No card da OS, há um badge "Vinculado" se houver orçamento
2. No dialog "Visualizar OS", aba "Orçamento vs Real" mostra os dados
3. Na tabela de atividades, coluna "Vínculo Orçamento" indica se está vinculada

#### Q3: Posso vincular mais de um orçamento à mesma OS?
**R**: Não. Cada OS tem apenas 1 orçamento vinculado (`orcamentoId`), mas pode executar múltiplas composições desse orçamento (`composicaoIds[]`).

#### Q4: O que acontece se eu desvincular um orçamento?
**R**:
- As atividades já geradas permanecem (não são deletadas)
- Os vínculos `itemComposicaoId` nas atividades são mantidos
- Você pode vincular um novo orçamento

#### Q5: Como o MRP sabe quais materiais eu preciso?
**R**: O MRP explode o BOM de todas as OS ativas:
1. Busca todas as OS com `orcamentoId` definido
2. Acessa o orçamento via `OrcamentoExecucaoService`
3. Percorre `composicoes` → `itens`
4. Consolida materiais iguais de diferentes projetos

#### Q6: A Capacidade considera feriados?
**R**: Sim! O `CalendarioTrabalho` tem:
- Turnos de trabalho (ex: 07:00-17:00)
- Dias úteis da semana (seg-sex ou seg-sáb)
- Feriados nacionais de 2026 (mockados)

#### Q7: Como interpretar a Taxa de Utilização?
**R**:
- **0-50%**: Ocioso (pode alocar mais trabalho)
- **50-70%**: Ideal (boa produtividade)
- **70-90%**: Alta (monitorar de perto)
- **>90%**: GARGALO (risco de atraso)
- **>100%**: SOBRECARGA (impossível sem horas extras)

### Problemas Comuns

#### Problema 1: "Orçamento não aparece na lista para vincular"
**Causa**: Orçamento não foi criado ou está incompleto
**Solução**:
1. Ir em `Comercial → Orçamentos`
2. Verificar se orçamento existe e tem composições
3. Se necessário, criar novo orçamento

#### Problema 2: "Atividades não foram geradas automaticamente"
**Causa**: Composição selecionada não tem itens
**Solução**:
1. Editar orçamento
2. Adicionar itens à composição
3. Tentar vincular novamente

#### Problema 3: "Variance está sempre 0%"
**Causa**: Modo mock retorna valores fixos
**Solução**:
- Normal em mock mode
- Variance real será calculada com backend
- Para testar: simule dados diferentes no mock

#### Problema 4: "MRP mostra 'Nenhum projeto ativo'"
**Causa**: Nenhuma OS tem orçamento vinculado
**Solução**:
1. Criar OS
2. Vincular orçamento
3. Acessar MRP novamente

#### Problema 5: "Capacidade mostra todos os recursos como ociosos"
**Causa**: Sem cronograma com alocações
**Solução**:
- Em mock mode, usa alocações mockadas
- Com backend real: criar cronograma e alocar recursos

---

## 🔧 Modo Mock vs Modo Real

### Modo Mock (Atual)

**Vantagens**:
- ✅ Desenvolvimento frontend independente
- ✅ Testes rápidos de UI/UX
- ✅ Demonstrações para cliente
- ✅ Prototipagem de funcionalidades

**Limitações**:
- ❌ Dados fixos (não reflete sistema real)
- ❌ Sem persistência (refresh perde dados)
- ❌ Sem integração entre módulos
- ❌ Cálculos simplificados

### Modo Real (FASE 3.5 - Futuro)

**Mudanças**:
1. `useMock = false` em todos os services
2. Endpoints de API implementados no backend
3. Banco de dados persistindo tudo
4. Integração real entre FASE 1, 2 e 3

**Exemplo**:
```typescript
// Mock Mode (Atual)
const planejado = 16132.50; // Valor fixo

// Real Mode (Futuro)
const response = await api.get(`/service-orders/${osId}/custo-planejado`);
const planejado = response.data.custoPlanejado; // Do banco de dados
```

---

## 📊 Métricas de Sucesso

Após implementação completa (backend), o PCP deve responder:

1. **"Esta OS está dentro do orçamento?"**
   → Dashboard OS: Planejado R$ 50k, Real R$ 48k, Variance -4% 🟢

2. **"Quanto material preciso comprar este mês?"**
   → MRP Dashboard: Lista consolidada de 15 itens, R$ 120k total

3. **"Posso alocar Soldador X nesta tarefa?"**
   → Capacidade: Soldador X está 85% alocado 🟢 (OK)

4. **"Posso aceitar este novo projeto para Março?"**
   → Simulador: NÃO 🔴, capacidade em 105% (sobrecarga)

5. **"Por que o custo divergiu do orçado?"**
   → Relatório Variance: Item MAT-001 consumiu 120kg vs 100kg planejado

---

## 🚀 Próximos Passos

1. **FASE 3.5**: Integração Backend
   - Implementar APIs reais
   - Conectar com banco de dados
   - Substituir mock por dados reais

2. **FASE 4**: Pipeline de Projetos
   - Kanban de propostas
   - Timeline de projetos futuros
   - Simulação de portfolio

3. **Testes E2E**
   - Fluxo completo com dados reais
   - Validação de cálculos
   - Performance e otimização

---

**Desenvolvido por**: GMX Soluções Industriais
**Contato**: suporte@gmxindustrial.com.br
**Versão**: 1.0.0 - Fevereiro 2026
