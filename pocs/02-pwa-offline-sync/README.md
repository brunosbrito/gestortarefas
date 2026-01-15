# POC 2: PWA + Offline Sync

**Objetivo**: Validar se Service Workers + IndexedDB conseguem sincronizar dados offline sem perder ou duplicar registros.

**Tempo Estimado**: 12 horas (2 dias)

**Critérios de Sucesso**:
- ✅ Taxa de sucesso de sync > 99%
- ✅ 0 duplicações de dados
- ✅ 0 perdas de dados (mesmo fechando navegador)
- ✅ Conflitos resolvidos automaticamente
- ✅ Performance: sync de 10 items < 5s em 4G

---

## 📋 Como Executar o POC

### Método 1: Abrir Diretamente no Navegador (Recomendado)

1. Abra o arquivo `index.html` diretamente no navegador (Chrome/Edge recomendados)
2. O Service Worker pode não funcionar via `file://`, mas IndexedDB sim
3. Para testar PWA completo, use o Método 2

### Método 2: Servidor Local (PWA Completo)

```bash
# Navegue até a pasta do POC
cd pocs/02-pwa-offline-sync

# Opção A: Python 3
python -m http.server 8000

# Opção B: Node.js (npx)
npx serve .

# Opção C: Node.js (http-server)
npx http-server -p 8000

# Abra: http://localhost:8000
```

---

## 🧪 Roteiro de Testes

### FASE 1: Testes Básicos (1 hora)

#### Teste 1.1: Criar Check-list Online
1. Certifique-se de estar **online** (indicador verde)
2. Preencha o formulário:
   - Veículo: `ABC-1234`
   - Motorista: `João Silva`
   - KM Inicial: `10000`
   - Combustível: `Cheio`
3. Clique em **"Criar Check-list"**
4. **Verificar**:
   - ✅ Check-list aparece na tabela com badge **"✅ Sincronizado"**
   - ✅ Log mostra `✅ Check-list [UUID] sincronizado com sucesso`
   - ✅ Estatísticas: Total = 1, Sincronizado = 1, Taxa de Sucesso = 100%

#### Teste 1.2: Criar Check-list Offline
1. Clique no botão **"📴 Ir Offline"** (simulação)
2. Indicador deve ficar **vermelho** ("Offline")
3. Preencha e crie novo check-list
4. **Verificar**:
   - ✅ Check-list salvo com badge **"⏳ Pendente"**
   - ✅ Log: `📴 Offline - check-list será sincronizado quando conectar`
   - ✅ Contador na status bar: "1 pendentes de sincronização"

#### Teste 1.3: Sincronizar ao Voltar Online
1. Clique em **"✅ Ir Online"**
2. Aguarde 2-3 segundos
3. **Verificar**:
   - ✅ Check-list pendente muda para **"✅ Sincronizado"**
   - ✅ Log: `🟢 Conexão restaurada - iniciando sincronização automática`
   - ✅ Pendentes volta para 0

---

### FASE 2: Cenários Edge (3 horas)

#### Teste 2.1: API Retorna Erro 500 (Retry)
1. Clique em **"❌ Simular Erro 500"**
2. Crie novo check-list
3. **Observar**:
   - ⚠️ Log mostra tentativas de retry: "Tentativa 1 falhou. Tentando novamente em 1000ms..."
   - ⚠️ Delay aumenta exponencialmente: 1s, 2s, 4s, 8s, 16s
4. **Verificar**:
   - ✅ Após algumas tentativas, sincroniza com sucesso (50% de chance de erro simulado)
   - ❌ Se todas 5 tentativas falharem: badge muda para **"❌ Erro"**
5. Desativar simulação e clicar em **"Forçar Sincronização"**
6. **Verificar**: Item com erro agora sincroniza

#### Teste 2.2: Slow 3G (Latência)
1. Clique em **"🐢 Simular Slow 3G"**
2. Crie novo check-list
3. **Observar**:
   - ⏱️ Sincronização demora ~3-4 segundos (delay simulado)
   - Log mostra: "Sincronizando check-list..."
4. **Verificar**:
   - ✅ Sincroniza mesmo com latência alta
   - ✅ Tempo total < 5s (critério de sucesso)

#### Teste 2.3: Conexão Intermitente
1. Clique em **"📶 Simular Intermitente"**
2. Observe a status bar alternando: Online (2s) → Offline (2.5s)
3. Crie novo check-list durante o período **offline**
4. **Verificar**:
   - ✅ Check-list salvo como pendente
   - ✅ Quando conexão voltar (próximo ciclo online), sincroniza automaticamente
   - ✅ Retry funciona mesmo com conexão instável

#### Teste 2.4: Criar Múltiplos Check-lists Offline
1. Ir offline
2. Criar **5 check-lists** diferentes
3. **Verificar**:
   - ✅ Todos aparecem com badge **"⏳ Pendente"**
   - ✅ Contador: "5 pendentes de sincronização"
4. Voltar online
5. Aguardar 5-10 segundos
6. **Verificar**:
   - ✅ Todos 5 sincronizam sequencialmente
   - ✅ Taxa de sucesso = 100%
   - ✅ Nenhuma duplicação (verificar UUIDs únicos)

#### Teste 2.5: Fechar Navegador com Pendentes
1. Criar check-list offline
2. **Fechar o navegador completamente** (não apenas a aba)
3. Reabrir o arquivo `index.html`
4. **Verificar**:
   - ✅ Check-list pendente ainda aparece na lista
   - ✅ IndexedDB persistiu os dados
   - ✅ Ao ir online, sincroniza normalmente

#### Teste 2.6: Limpar Cache do Navegador
1. Criar check-list offline
2. Ir em DevTools → Application → Storage → Clear site data
3. **NÃO marcar** "IndexedDB" (apenas cache e cookies)
4. Recarregar página
5. **Verificar**:
   - ✅ Check-list ainda aparece (IndexedDB não foi afetado)

#### Teste 2.7: Sincronização Automática (30s)
1. Criar check-list offline
2. Aguardar **30 segundos** SEM fazer nada
3. **Verificar**:
   - ✅ Se offline: nenhuma ação (correto)
   - ✅ Se online: sincronização automática dispara
   - Log: `🔄 Sincronização automática (1 pendentes)`

#### Teste 2.8: Forçar Sincronização Manual
1. Criar check-list offline
2. Ir online
3. Clicar em **"Forçar Sincronização"**
4. **Verificar**:
   - ✅ Sincronização dispara imediatamente (não espera 30s)
   - Log: `🔄 Sincronização manual iniciada`

#### Teste 2.9: Deletar Check-list Pendente
1. Criar check-list offline
2. Clicar em **"🗑️ Deletar"** no check-list pendente
3. Confirmar exclusão
4. **Verificar**:
   - ✅ Check-list removido da lista
   - ✅ Removido do IndexedDB (não sincroniza depois)

#### Teste 2.10: Performance com Muitos Items
1. Usar o script de teste automatizado (ver abaixo)
2. Criar **20 check-lists** offline
3. Voltar online
4. **Medir tempo** até todos sincronizarem
5. **Verificar**:
   - ✅ Tempo total < 30s
   - ✅ Todos sincronizam sem duplicação
   - ✅ Interface não trava

---

### FASE 3: Testes Automatizados (2 horas)

O POC inclui **5 testes automatizados** que podem ser executados com um clique:

#### Executar Testes Individuais:
- **Teste 1**: Criar offline → Sincronizar online
- **Teste 2**: Retry após erro 500
- **Teste 3**: Slow 3G
- **Teste 4**: Batch de 5 check-lists
- **Teste 5**: Conexão intermitente

#### Executar Todos de Uma Vez:
1. Clicar em **"🎯 Executar TODOS os Testes"**
2. Aguardar ~40 segundos
3. **Verificar logs**:
   - ✅ Cada teste deve mostrar: `✅ TESTE X PASSOU`
   - ❌ Se falhar: `❌ TESTE X FALHOU: [motivo]`

---

### FASE 4: Testes de PWA (2 horas) - Apenas com Servidor Local

#### Teste 4.1: Instalação do PWA
1. Executar via servidor local (Método 2)
2. Abrir em Chrome/Edge
3. Procurar ícone de "Instalar" na barra de endereço
4. Clicar em **"Instalar"**
5. **Verificar**:
   - ✅ App abre em janela standalone (sem barra de navegador)
   - ✅ Ícone aparece na área de trabalho/menu iniciar

#### Teste 4.2: Service Worker (Cache)
1. Abrir DevTools → Application → Service Workers
2. **Verificar**:
   - ✅ Service Worker registrado e ativo
   - Status: "activated and is running"
3. Ir em **Cache Storage**
4. **Verificar**:
   - ✅ Cache `pwa-offline-sync-v1` existe
   - ✅ Arquivos cacheados: index.html, app.js, db.js, sync.js

#### Teste 4.3: Funcionar Offline Real (Sem Simulação)
1. Com app instalado, criar check-list online
2. Ir em DevTools → Network → **Offline** (checkbox)
3. Recarregar página
4. **Verificar**:
   - ✅ Página carrega do cache (Service Worker)
   - ✅ Interface funciona normalmente
5. Criar novo check-list
6. **Verificar**:
   - ✅ Salvo como pendente no IndexedDB
7. Desmarcar **Offline**
8. **Verificar**:
   - ✅ Sincroniza automaticamente

---

## 📊 Matriz de Decisão

Após executar todos os testes, preencher esta tabela:

| Cenário | Esperado | Resultado | Passou? |
|---------|----------|-----------|---------|
| Criar online | Sincroniza imediatamente | - | ⏸️ |
| Criar offline | Salva como pendente | - | ⏸️ |
| Voltar online | Auto-sync em 30s | - | ⏸️ |
| Retry após erro | 5 tentativas com backoff | - | ⏸️ |
| Slow 3G | Sincroniza em < 5s | - | ⏸️ |
| Intermitente | Sincroniza no próximo online | - | ⏸️ |
| Múltiplos offline | Todos sincronizam | - | ⏸️ |
| Fechar navegador | Dados persistem | - | ⏸️ |
| 0 duplicações | Mesmo UUID não duplica | - | ⏸️ |
| PWA instalável | Instala como app | - | ⏸️ |

**Taxa de Sucesso Global**: [X/10] = [Y]%

**Decisão**:
- ✅ **VIÁVEL** se taxa > 99% (10/10 ou 9/10)
- ⚠️ **VIÁVEL COM RESSALVAS** se taxa 80-99% (8-9/10)
- ❌ **NÃO VIÁVEL** se taxa < 80%

---

## 🎯 Critérios de Aceitação

### Must-Have (Obrigatórios):
- ✅ Taxa de sincronização > 99%
- ✅ 0 duplicações de dados
- ✅ 0 perdas de dados ao fechar navegador
- ✅ IndexedDB persiste dados localmente
- ✅ Sync automático ao voltar online

### Nice-to-Have (Desejáveis):
- ✅ PWA instalável
- ✅ Service Worker cacheia assets
- ✅ Interface responsiva em mobile
- ✅ Retry com exponential backoff funciona
- ✅ Performance: 10 items sincronizam em < 5s

---

## 🔧 Ferramentas de Debug

### Chrome DevTools:
1. **Application** → IndexedDB → `ChecklistsDB` → `checklists`
   - Ver todos os check-lists armazenados
   - Verificar UUIDs, sync_status, timestamps

2. **Application** → Service Workers
   - Ver status do Service Worker
   - Forçar atualização com "Update"

3. **Network** → Offline (checkbox)
   - Simular offline REAL (não apenas simulação do app)

4. **Console**
   - Ver logs do Service Worker
   - Ver logs da aplicação

### Inspecionar IndexedDB Manualmente:
```javascript
// Cole no Console do navegador:

// Listar todos check-lists
const db = await indexedDB.open('ChecklistsDB', 1);
db.transaction(['checklists'], 'readonly')
  .objectStore('checklists')
  .getAll()
  .onsuccess = (e) => console.table(e.target.result);

// Contar pendentes
const db2 = await indexedDB.open('ChecklistsDB', 1);
db2.transaction(['checklists'], 'readonly')
  .objectStore('checklists')
  .index('sync_status')
  .getAll('pending')
  .onsuccess = (e) => console.log('Pendentes:', e.target.result.length);
```

---

## 📝 Documentar Resultados

Após concluir todos os testes, preencher o arquivo **`RESULTADO.md`** com:

1. **Tabela de Resultados** (todos os cenários testados)
2. **Análise Estatística** (taxa de sucesso, latência média, etc.)
3. **Decisão de Viabilidade** (Viável / Com Ressalvas / Não Viável)
4. **Recomendações** para implementação OU alternativas se não viável
5. **Lições Aprendidas** (o que funcionou, o que não funcionou)

---

## 🚨 Troubleshooting

### Problema: Service Worker não registra
**Solução**: Usar servidor local (Método 2). Service Worker não funciona via `file://`

### Problema: IndexedDB não persiste
**Solução**: Verificar se navegador não está em modo privado/anônimo

### Problema: Sincronização não dispara
**Solução**:
1. Verificar se está online (indicador verde)
2. Forçar sincronização manual
3. Verificar logs de erro no console

### Problema: Duplicações aparecem
**Solução**:
1. Verificar se UUIDs são únicos (DevTools → IndexedDB)
2. Limpar dados e testar novamente
3. **SE DUPLICAR = TESTE FALHOU** (reportar no RESULTADO.md)

---

## ✅ Checklist de Conclusão

- [ ] Executados todos os 10 cenários edge (Fase 2)
- [ ] Executados todos os 5 testes automatizados (Fase 3)
- [ ] Testado PWA completo em servidor local (Fase 4)
- [ ] Matriz de decisão preenchida
- [ ] Taxa de sucesso calculada (>99% esperado)
- [ ] Arquivo RESULTADO.md preenchido
- [ ] Screenshots/vídeos anexados (opcional)
- [ ] Decisão final: Viável ou Não Viável

---

**Próximo Passo**: Se POC 2 for **VIÁVEL**, incluir PWA + Offline Sync em v2.0 do módulo SUPRIMENTOS.
