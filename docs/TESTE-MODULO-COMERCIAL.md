# 🧪 GUIA DE TESTES: MÓDULO COMERCIAL

**Data**: 2026-02-08
**Branch**: Modulo_Comercial
**Objetivo**: Validar todas as refatorações implementadas no Módulo Comercial

---

## 📋 RESUMO DAS REFATORAÇÕES

### 1. **GenericListPage Component** ✅
- Componente reutilizável para listas com filtros, ordenação e paginação
- Elimina 99% de código duplicado entre Orçamentos e Propostas
- Redução: ~240 linhas por página

### 2. **NovoOrcamento com react-hook-form + Zod** ✅
- Validação automática com Zod schema
- Componentes FormField do shadcn/ui
- Padrão consistente com NovaPropostaForm

### 3. **Componentes Reutilizáveis Extraídos** ✅
- **PageHeader**: Header com ícone, título e botão voltar
- **GenericStatusBadge**: Badge de status type-safe
- **ComposicaoCard**: Card para exibir composições de orçamento

---

## 🔍 CHECKLIST DE TESTES

### **FASE 1: Teste de Criação de Orçamento**

#### Pré-requisitos:
- [ ] Servidor dev rodando em http://localhost:8081
- [ ] Backend API funcionando
- [ ] Login realizado no sistema

#### Passos:
1. **Navegar para Orçamentos**
   - [ ] Acessar `/comercial/orcamentos`
   - [ ] Verificar que a lista carrega corretamente
   - [ ] Verificar que filtros (busca, status) funcionam
   - [ ] Verificar que ordenação por coluna funciona
   - [ ] Verificar que paginação funciona

2. **Criar Novo Orçamento**
   - [ ] Clicar em "Novo Orçamento"
   - [ ] Verificar que PageHeader aparece com ícone azul e título "Novo Orçamento"
   - [ ] Verificar que botão "Voltar" funciona

3. **Preencher Formulário (Validação Zod)**
   - [ ] Deixar "Nome" vazio e tentar submeter → Erro: "Nome deve ter no mínimo 3 caracteres"
   - [ ] Preencher nome: "Estrutura Metálica Teste"
   - [ ] Selecionar tipo: "Serviço" (padrão)
   - [ ] Preencher cliente: "Empresa Teste Ltda"
   - [ ] Preencher código projeto: "T-2026-001"
   - [ ] Preencher peso total: 5000
   - [ ] Preencher área total: 500
   - [ ] Preencher metros lineares: 200

4. **Configurar Tributos**
   - [ ] Marcar "Incluir ISS"
   - [ ] Verificar que campo "Alíquota ISS" fica habilitado
   - [ ] Alíquota ISS: 3.00 (padrão)
   - [ ] Alíquota Simples: 11.80 (padrão)

5. **Submeter Formulário**
   - [ ] Clicar em "Criar Orçamento"
   - [ ] Verificar loading state (botão mostra "Criando...")
   - [ ] Verificar toast de sucesso: "Orçamento criado com sucesso"
   - [ ] Verificar redirecionamento para página de edição (`/comercial/orcamentos/{id}`)

6. **Verificar Orçamento Criado na Lista**
   - [ ] Voltar para `/comercial/orcamentos`
   - [ ] Verificar que novo orçamento aparece na lista
   - [ ] Verificar que dados estão corretos (nome, tipo, valores)
   - [ ] Verificar badge de status (deve ser "Rascunho")

---

### **FASE 2: Teste de Edição de Orçamento**

#### Passos:
1. **Abrir Orçamento para Edição**
   - [ ] Na lista, clicar em "Editar" no orçamento criado
   - [ ] Verificar que página de edição carrega
   - [ ] Verificar que dados pré-preenchidos estão corretos

2. **Adicionar Composição de Custos**
   - [ ] Clicar em "Nova Composição"
   - [ ] Preencher nome: "Mobilização"
   - [ ] Selecionar tipo: "Mobilização"
   - [ ] Preencher BDI: 25%
   - [ ] Salvar composição
   - [ ] Verificar que ComposicaoCard aparece na tela

3. **Adicionar Itens à Composição**
   - [ ] Clicar em "Adicionar Item" no ComposicaoCard
   - [ ] Preencher:
     - Código: MOB-001
     - Descrição: Transporte de Equipamentos
     - Quantidade: 1
     - Unidade: VB (Verba)
     - Valor Unitário: 5000.00
   - [ ] Salvar item
   - [ ] Verificar que item aparece listado no card
   - [ ] Verificar que valores calculados estão corretos (subtotal, percentual)

4. **Adicionar Segunda Composição**
   - [ ] Adicionar composição "Materiais"
   - [ ] Adicionar 3 itens de materiais diferentes
   - [ ] Verificar cálculos automáticos

5. **Calcular BDI**
   - [ ] Ir para aba "BDI"
   - [ ] Preencher despesas indiretas
   - [ ] Calcular BDI
   - [ ] Verificar que valor é aplicado às composições

6. **Salvar Alterações**
   - [ ] Clicar em "Salvar"
   - [ ] Verificar toast de sucesso
   - [ ] Verificar que dados persistem após refresh

---

### **FASE 3: Teste de Propostas**

#### Passos:
1. **Navegar para Propostas**
   - [ ] Acessar `/comercial/propostas`
   - [ ] Verificar que GenericListPage carrega corretamente
   - [ ] Testar filtros e ordenação

2. **Criar Nova Proposta**
   - [ ] Clicar em "Nova Proposta"
   - [ ] Verificar que NovaPropostaDialog abre
   - [ ] Preencher todos os campos obrigatórios:
     - Título: "Proposta Teste Estrutura Metálica"
     - Cliente (Razão Social, CNPJ, Email, Telefone, Endereço, Cidade, UF, CEP)
     - Vendedor (Nome, Telefone, Email)
     - Datas (Emissão, Validade, Previsão Entrega)
     - Valor Total: 150000.00
     - Moeda: BRL
     - Forma de Pagamento: "A Combinar"

3. **Validação de Proposta**
   - [ ] Tentar submeter sem preencher campos obrigatórios
   - [ ] Verificar mensagens de erro do Zod
   - [ ] Verificar validação de email
   - [ ] Verificar validação de data (validade > emissão)

4. **Salvar Proposta**
   - [ ] Preencher todos os campos
   - [ ] Clicar em "Criar Proposta"
   - [ ] Verificar toast de sucesso
   - [ ] Verificar que proposta aparece na lista

5. **Testar StatusBadge Genérico**
   - [ ] Verificar que badge "Rascunho" aparece cinza
   - [ ] Editar proposta e mudar status para "Em Análise"
   - [ ] Verificar que badge fica azul
   - [ ] Testar todos os status (Aprovada=verde, Rejeitada=vermelho, Cancelada=cinza)

---

### **FASE 4: Teste de Exportação PDF**

#### Pré-requisitos:
- [ ] Orçamento com composições e itens criado
- [ ] Proposta criada e vinculada a orçamento

#### Passos:

1. **Exportar PDF de Orçamento**
   - [ ] Abrir orçamento criado
   - [ ] Clicar em "Exportar PDF"
   - [ ] Verificar loading state
   - [ ] Verificar que PDF é gerado e baixado
   - [ ] Abrir PDF e verificar:
     - Header com logo e dados da empresa
     - Informações do orçamento (nome, número, data)
     - Todas as composições listadas
     - Itens de cada composição
     - Valores calculados corretamente
     - BDI aplicado
     - Totais finais

2. **Exportar PDF de Proposta**
   - [ ] Abrir proposta criada
   - [ ] Clicar em "Exportar PDF (GMX)"
   - [ ] Verificar que PDF formato GMX é gerado
   - [ ] Abrir PDF e verificar:
     - Formato padrão GMX
     - Dados do cliente
     - Dados do vendedor
     - Valores e condições de pagamento
     - Observações padrão

---

### **FASE 5: Teste de Integração Dashboard**

#### Passos:
1. **Acessar Dashboard Comercial**
   - [ ] Navegar para `/comercial`
   - [ ] Verificar KPIs:
     - Total de orçamentos
     - Total de propostas
     - Valor total em propostas
     - Taxa de conversão

2. **Cards Rápidos**
   - [ ] Verificar que cards de Orçamentos e Propostas mostram totais corretos
   - [ ] Clicar em "Acessar Orçamentos" → Redireciona corretamente
   - [ ] Clicar em "Acessar Propostas" → Redireciona corretamente

3. **Gráficos**
   - [ ] Verificar gráfico de orçamentos por status
   - [ ] Verificar gráfico de propostas por status
   - [ ] Verificar gráfico de valor mensal

---

## 🐛 REGISTRO DE BUGS ENCONTRADOS

### Bug 1: [Descrever bug se encontrado]
- **Onde**:
- **Como reproduzir**:
- **Esperado**:
- **Obtido**:
- **Severidade**: Alta / Média / Baixa

### Bug 2: [Descrever bug se encontrado]
...

---

## ✅ TESTES DE REGRESSÃO

### Funcionalidades Antigas (Verificar se não quebraram):
- [ ] Listagem de orçamentos (antes da refatoração)
- [ ] Listagem de propostas (antes da refatoração)
- [ ] Criação de orçamento (formulário antigo foi refatorado)
- [ ] Edição de composições
- [ ] Cálculo de BDI
- [ ] Exportação de PDF
- [ ] Dashboard KPIs

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

Para considerar a refatoração **APROVADA**, todos os itens devem estar ✅:

### Funcionalidade:
- [ ] Todos os fluxos principais funcionam sem erros
- [ ] Validações Zod funcionam corretamente
- [ ] Componentes reutilizáveis renderizam corretamente
- [ ] PDFs são gerados com sucesso
- [ ] Dados persistem no backend

### Performance:
- [ ] Listas carregam em < 2 segundos
- [ ] Filtros respondem instantaneamente
- [ ] Formulários submetem em < 1 segundo
- [ ] PDFs geram em < 5 segundos

### Código:
- [ ] Sem erros no console do navegador
- [ ] Sem warnings de TypeScript
- [ ] Sem warnings do ESLint
- [ ] Dev server roda sem erros

### UX:
- [ ] PageHeader consistente entre páginas
- [ ] StatusBadges com cores corretas
- [ ] Loading states funcionam
- [ ] Toasts de sucesso/erro aparecem
- [ ] Navegação entre páginas fluida

---

## 📊 RESULTADO FINAL

### Status: [ ] APROVADO / [ ] REPROVADO

### Resumo:
- **Total de testes**: 100+
- **Testes passados**: __/__
- **Bugs encontrados**: __
- **Bugs críticos**: __

### Notas Adicionais:
```
[Espaço para observações do testador]
```

---

## 📝 PRÓXIMOS PASSOS

### Se APROVADO:
1. [ ] Merge da branch `Modulo_Comercial` para `develop`
2. [ ] Push para origin
3. [ ] Criar PR com descrição detalhada
4. [ ] Deploy em ambiente de homologação

### Se REPROVADO:
1. [ ] Documentar bugs encontrados como issues
2. [ ] Priorizar correções
3. [ ] Executar novo ciclo de testes

---

**Testado por**: _______________
**Data**: _______________
**Assinatura**: _______________
