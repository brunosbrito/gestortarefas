# Implementação de Geração Mock de Relatórios PDF/Excel/CSV

## Resumo

Implementada a geração real de arquivos PDF, Excel e CSV no modo mock do módulo de Relatórios do Suprimentos. Agora, quando o usuário clica em "Download" em `/suprimentos/relatorios`, um arquivo real é gerado e baixado pelo navegador.

## Arquivos Modificados

### `src/services/suprimentos/reportsService.ts`

**Mudanças implementadas:**

1. **Imports adicionados** (linhas 5-7):
   ```typescript
   import jsPDF from 'jspdf';
   import autoTable from 'jspdf-autotable';
   import * as XLSX from 'xlsx';
   ```

2. **Função de geração de dados mock** (linhas 283-483):
   - `generateMockDataForTemplate()` - Gera dados realistas para cada tipo de relatório:
     - `contract-summary`: 5 contratos com valores, status e variações
     - `purchase-analysis`: 5 requisições de compra com fornecedores
     - `supplier-performance`: 5 fornecedores com avaliações e performance
     - `cost-breakdown`: 5 categorias de custo com percentuais
     - `budget-compliance`: 5 contratos com análise de conformidade

3. **Funções de geração de arquivos** (linhas 485-660):
   - `formatCurrency()` - Formata valores em R$
   - `formatPercentage()` - Formata percentuais
   - `generatePDF()` - Gera PDF com cabeçalho, tabela formatada e rodapé
   - `generateExcel()` - Gera Excel com formatação de células, títulos e fórmulas
   - `generateCSV()` - Gera CSV com escape correto de valores
   - `triggerDownload()` - Cria Blob e dispara download no navegador

4. **Método `download()` modificado** (linhas 765-813):
   - Busca o relatório pelo ID
   - Busca o template correspondente
   - Gera dados mock
   - Detecta formato do arquivo (PDF/Excel/CSV) pela extensão
   - Gera o arquivo apropriado
   - Dispara download automático no navegador
   - Incrementa contador de downloads

## Como Funciona

### Fluxo de Download

1. Usuário clica em "Download" na tabela de relatórios
2. `useDownloadReport()` hook chama `reportsService.download(id)`
3. Service verifica `USE_MOCK = true`
4. Busca o relatório e template pelos IDs
5. Gera dados mock baseado no `templateId`
6. Detecta formato pela extensão do `fileUrl` (ex: `.pdf`, `.xlsx`, `.csv`)
7. Chama função de geração apropriada (`generatePDF()`, `generateExcel()`, ou `generateCSV()`)
8. Cria Blob com o conteúdo do arquivo
9. Usa `window.URL.createObjectURL()` para criar URL temporária
10. Cria elemento `<a>` com download e simula clique
11. Remove elemento e libera URL
12. Retorna sucesso com mensagem `"Arquivo PDF/XLSX/CSV baixado com sucesso"`

### Geração de PDF

**Características:**
- Usa jsPDF + jspdf-autotable
- Orientação: portrait ou landscape (conforme template)
- Cabeçalho: Título, descrição e data/hora de geração
- Tabela: Headers coloridos (azul), linhas alternadas (cinza claro)
- Formatação automática: valores em R$, percentuais com %
- Rodapé: Texto configurável + número de páginas
- Tema: grid com padding de 3px

**Exemplo de saída:**
```
Resumo de Contratos
Relatório consolidado de todos os contratos com status, valores e execução
Gerado em: 13/01/2026 às 14:30:00

┌─────────────────────────────────┬────────────┬────────────┬───────────┬────────────────┐
│ Nome do Contrato                 │ Orçamento  │ Gasto      │ Variação  │ Status         │
├─────────────────────────────────┼────────────┼────────────┼───────────┼────────────────┤
│ Fornecimento de Aço Estrutural   │ R$ 450.000 │ R$ 387.500 │ R$ -62.500│ Em Andamento   │
│ Concreto Pré-Moldado             │ R$ 680.000 │ R$ 695.000 │ R$ 15.000 │ Em Andamento   │
│ Pintura Industrial               │ R$ 125.000 │ R$ 125.000 │ R$ 0      │ Concluído      │
└─────────────────────────────────┴────────────┴────────────┴───────────┴────────────────┘

Relatório gerado pelo Sistema de Gestão de Suprimentos        Página 1 de 1
```

### Geração de Excel

**Características:**
- Usa biblioteca xlsx
- Formato: `.xlsx` (Excel 2007+)
- Título e descrição mesclados na primeira linha
- Data de geração na terceira linha
- Headers na quinta linha
- Dados a partir da sexta linha
- Largura de coluna: 20 caracteres
- Formatação de células:
  - Tipo `currency`: Formato `R$ #,##0.00`
  - Tipo `percentage`: Formato `0.0%`
  - Tipo `number`: Número sem formatação
  - Tipo `text`: Texto

**Estrutura:**
```
Linha 1: [Título mesclado em todas as colunas]
Linha 2: [Descrição mesclada]
Linha 3: [Data de geração mesclada]
Linha 4: [Vazia]
Linha 5: [Headers: Coluna 1 | Coluna 2 | Coluna 3 | ...]
Linha 6+: [Dados com formatação apropriada]
```

### Geração de CSV

**Características:**
- Formato: UTF-8 com BOM
- Separador: vírgula `,`
- Headers na primeira linha
- Valores escapados: aspas duplas `"` → `""`
- Formatação de valores:
  - `currency`: R$ 1.234,56
  - `percentage`: 45.0%
  - `text`: "Valor entre aspas"
  - `number`: 123

**Exemplo:**
```csv
Nome do Contrato,Orçamento,Gasto,Variação,Status
"Fornecimento de Aço Estrutural","R$ 450.000,00","R$ 387.500,00","R$ -62.500,00","Em Andamento"
"Concreto Pré-Moldado","R$ 680.000,00","R$ 695.000,00","R$ 15.000,00","Em Andamento"
```

## Dados Mock por Template

### 1. Contract Summary (Resumo de Contratos)
- 5 contratos
- Dados: nome, orçamento, gasto, variação, status
- Variações: negativas (economia) e positivas (estouro)
- Status: Em Andamento, Concluído

### 2. Purchase Analysis (Análise de Compras)
- 5 requisições
- Dados: número, qtd itens, valor total, status, fornecedor
- Status: Aprovada, Pendente, Em Cotação
- Fornecedores: alguns definidos, outros pendentes (-)

### 3. Supplier Performance (Performance de Fornecedores)
- 5 fornecedores
- Dados: nome, qtd pedidos, valor total, nota (0-5), entrega pontual (%)
- Notas: 4.2 a 4.8 (realista)
- Entrega pontual: 88% a 96%

### 4. Cost Breakdown (Detalhamento de Custos)
- 5 categorias
- Dados: categoria, qtd itens, custo total, percentual, ticket médio
- Categorias: Materiais (45%), Mão de Obra (30%), Equipamentos (15%), Serviços (8%), Outros (2%)
- Valores totalizam R$ 5.200.000

### 5. Budget Compliance (Conformidade Orçamentária)
- 5 contratos
- Dados: nome, orçado, realizado, variação (%), status
- Status: Conforme, Atenção (>10% de desvio)
- Variações: -30.4% a +2.2%

## Testes

### Como Testar

1. **Acesse a página de relatórios:**
   ```
   http://localhost:8080/suprimentos/relatorios
   ```

2. **Gere um novo relatório:**
   - Clique em "Gerar Relatório"
   - Selecione um template (ex: "Resumo de Contratos")
   - Configure filtros (opcional)
   - Escolha formato: PDF, Excel ou CSV
   - Clique em "Gerar"

3. **Faça download:**
   - Na tabela "Histórico de Relatórios", localize o relatório gerado
   - Clique no botão "Download" (ícone de download)
   - Arquivo será baixado automaticamente

4. **Verifique o arquivo:**
   - **PDF**: Abra com Adobe Reader / Navegador
   - **Excel**: Abra com Microsoft Excel / LibreOffice Calc
   - **CSV**: Abra com Excel / Editor de texto

### Checklist de Validação

- [ ] PDF abre corretamente
- [ ] PDF tem cabeçalho com título e data
- [ ] PDF tem tabela formatada com dados
- [ ] PDF tem rodapé com texto e página
- [ ] Excel abre sem erros
- [ ] Excel tem título mesclado
- [ ] Excel tem formatação de moeda (R$)
- [ ] Excel tem formatação de percentual (%)
- [ ] CSV pode ser importado no Excel
- [ ] CSV tem separadores corretos
- [ ] Todos os 5 templates funcionam
- [ ] Contador de downloads incrementa
- [ ] Toast de sucesso aparece
- [ ] Nome do arquivo está correto

### Relatórios Existentes (Mock Initial Data)

Há 3 relatórios pré-gerados para teste:

1. **ID: "1"** - `Resumo_Contratos_Jun2024.pdf`
   - Template: contract-summary
   - Formato: PDF

2. **ID: "2"** - `Analise_Compras_Maio2024.xlsx`
   - Template: purchase-analysis
   - Formato: Excel

3. **ID: "3"** - `Performance_Fornecedores_Q2_2024.pdf`
   - Template: supplier-performance
   - Formato: PDF

Clique em "Download" em qualquer um deles para testar imediatamente.

## Impacto no Backend

### ✅ ZERO Impacto

**Por quê?**
- Código isolado dentro de `if (USE_MOCK)`
- Quando `USE_MOCK = false`, o código mock não executa
- API real será usada: `GET /api/suprimentos/reports/:id/download`
- Backend retornará URL ou stream do arquivo real

**Transição para backend:**
```typescript
// Apenas mudar esta linha:
const USE_MOCK = false; // ✅ PRONTO!

// Backend passa a ser usado automaticamente
// Nenhuma outra mudança necessária
```

### Diferença de Comportamento

**Mock (frontend):**
```typescript
download(id) {
  // 1. Gera dados mock
  // 2. Cria PDF/Excel/CSV no navegador
  // 3. Dispara download via Blob
  // 4. Retorna { url: '/fake/path.pdf' }
}
```

**Backend real:**
```typescript
download(id) {
  // 1. Requisição GET para API
  // 2. Backend gera arquivo (ou retorna URL pré-gerado)
  // 3. Frontend recebe URL
  // 4. Abre URL em nova aba (window.open) ou baixa
}
```

**Componente não precisa mudar** - Hook `useDownloadReport()` já funciona para ambos os casos.

## Benefícios

### 1. UX Completo em Modo Demo
- Cliente pode testar fluxo completo
- Download funciona de verdade
- Arquivos podem ser abertos e visualizados
- Dados realistas para validação

### 2. Desenvolvimento Paralelo
- Frontend pode continuar desenvolvimento
- Backend pode ser implementado independentemente
- QA pode testar fluxo de relatórios antes do backend

### 3. Validação de Formatos
- Garante que PDF tem layout correto
- Garante que Excel tem formatação apropriada
- Garante que CSV é importável

### 4. Testes Automatizados
- Pode criar testes E2E para download
- Valida que Blob é criado corretamente
- Valida que arquivo tem conteúdo esperado

### 5. Demonstração para Stakeholders
- Demos para clientes são mais convincentes
- Podem ver relatórios reais em PDF/Excel
- Facilita coleta de feedback sobre layout

## Dependências

### Já Instaladas ✅
```json
{
  "jspdf": "^3.0.0",
  "jspdf-autotable": "^5.0.2",
  "xlsx": "^0.18.5"
}
```

**Bundle size impact:**
- jsPDF: ~50KB (gzipped)
- xlsx: ~240KB (gzipped)
- **Total**: ~290KB adicional

**Nota**: É aceitável para features de relatórios. Pode ser otimizado com dynamic imports se necessário:
```typescript
// Futuro: carregar sob demanda
const jsPDF = await import('jspdf');
```

## Limitações Atuais (Mock Mode)

1. **Dados sempre iguais**: Mock data é estático, não reflete filtros
2. **Sem gráficos**: `formatOptions.includeCharts` é ignorado por enquanto
3. **Sem imagens**: `formatOptions.includeImages` é ignorado
4. **Sem processamento assíncrono**: Geração é síncrona (instantânea)
5. **Tamanho de arquivo fixo**: `fileSize` é aleatório, não real

**Quando backend for implementado**, essas limitações desaparecem:
- Dados dinâmicos baseados em filtros
- Gráficos renderizados
- Imagens incluídas
- Processamento pode demorar segundos
- Tamanho de arquivo real

## Próximos Passos

### Fase 2: Backend Implementation (Futuro)

1. **Criar endpoints de API:**
   ```
   GET  /api/suprimentos/reports/templates
   GET  /api/suprimentos/reports/templates/:id
   POST /api/suprimentos/reports/generate
   GET  /api/suprimentos/reports
   GET  /api/suprimentos/reports/:id
   GET  /api/suprimentos/reports/:id/download
   DELETE /api/suprimentos/reports/:id
   GET  /api/suprimentos/reports/stats
   ```

2. **Implementar geração de relatórios no backend:**
   - Usar biblioteca de PDF/Excel no servidor (Python: reportlab, openpyxl)
   - Buscar dados reais do banco de dados
   - Aplicar filtros configurados
   - Gerar gráficos (Chart.js, Matplotlib)
   - Salvar arquivo em storage (S3, disco, etc.)
   - Retornar URL ou stream

3. **Desabilitar mock:**
   ```typescript
   const USE_MOCK = false;
   ```

4. **Testar integração:**
   - Validar que backend retorna URLs corretas
   - Validar que arquivos são baixáveis
   - Validar que dados são dinâmicos
   - Validar que filtros funcionam

5. **Cleanup (opcional):**
   - Remover funções mock (manter por enquanto para referência)
   - Ou usar dynamic imports para remover do bundle:
     ```typescript
     if (USE_MOCK) {
       const { generatePDF } = await import('./mockGenerators');
     }
     ```

## Troubleshooting

### Problema: Arquivo não baixa

**Causa**: Bloqueador de pop-ups ou permissões do navegador

**Solução**:
1. Verificar console do navegador (F12)
2. Permitir downloads automáticos
3. Verificar se `window.URL.createObjectURL` funciona

### Problema: PDF não abre

**Causa**: Blob vazio ou formato incorreto

**Solução**:
1. Console: verificar se `blob.size > 0`
2. Verificar se `doc.output('blob')` retorna Blob válido
3. Testar com dados menores

### Problema: Excel corrompido

**Causa**: Formatação de célula incorreta

**Solução**:
1. Verificar se `XLSX.write()` não dá erro
2. Validar estrutura de `wsData` (deve ser array 2D)
3. Testar abrir em LibreOffice (mais tolerante)

### Problema: CSV com caracteres estranhos

**Causa**: Encoding UTF-8 sem BOM

**Solução**:
1. Adicionar BOM ao início: `\uFEFF${csvContent}`
2. Ou especificar charset no Blob: `type: 'text/csv;charset=utf-8;'`

### Problema: Build warning sobre chunk size

**Causa**: xlsx é grande (731 KB)

**Solução**:
1. **Ignorar por enquanto** - é esperado
2. Futuro: usar dynamic import:
   ```typescript
   const XLSX = await import('xlsx');
   ```

## Conclusão

A implementação está **completa e funcional**. Relatórios podem ser baixados em PDF, Excel e CSV com dados mock realistas. Quando o backend for implementado, basta mudar `USE_MOCK = false` - zero mudanças no código do componente.

**Status**: ✅ Pronto para testes
**Impacto no backend**: ✅ Zero
**Bundle size**: ✅ Aceitável (~290KB gzip)
**UX**: ✅ Completo e funcional

---

**Implementado em:** 13/01/2026
**Arquivo:** `src/services/suprimentos/reportsService.ts`
**Linhas modificadas:** ~390 linhas adicionadas
**Build status:** ✅ Sucesso (15.06s)
