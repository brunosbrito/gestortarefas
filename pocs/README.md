# POCs (Proofs of Concept) - Módulo SUPRIMENTOS v2.0

**Objetivo**: Validar tecnologias de alto risco ANTES de incluí-las na versão 2.0 do módulo SUPRIMENTOS - Logística.

**Data de Criação**: 15/01/2026
**Executor**: Daniel (GML Estruturas)
**Status**: ⏸️ **AGUARDANDO EXECUÇÃO**

---

## 📋 Visão Geral

Este diretório contém **3 POCs independentes** criados para validar tecnologias que foram identificadas como de **ALTO RISCO** durante os exercícios de **Pre-Mortem** e **MoSCoW Prioritization** do planejamento do módulo SUPRIMENTOS.

### Por que fazer POCs?

Durante o planejamento, identificamos que algumas tecnologias mobile:
- 🔴 **Alto risco de falha** (ex: QR Code scanner não funciona em dispositivos antigos)
- 🔴 **Complexidade técnica alta** (ex: Offline sync pode duplicar/perder dados)
- 🔴 **Incerteza de UX** (ex: Usuários podem negar permissão de câmera)

**Decisão**: Validar essas tecnologias com POCs de 1-2 dias ANTES de comprometer 5+ semanas de desenvolvimento.

---

## 🧪 POCs Implementados

### POC 1: QR Code Scanner
**Pasta**: [`01-qrcode-scanner/`](./01-qrcode-scanner/)
**Tempo**: 8 horas (1 dia)
**Objetivo**: Validar se scanner de QR Code funciona em diferentes dispositivos e condições de iluminação

**Arquivos**:
- `index.html` - Aplicação de teste interativa
- `README.md` - Instruções de execução
- `RESULTADO.md` - Template para documentar resultados

**Critérios de Sucesso**:
- ✅ Taxa de leitura > 90%
- ✅ Latência < 2s
- ✅ Funciona em 80%+ dos dispositivos

**Como executar**:
```bash
cd 01-qrcode-scanner
# Opção 1: Abrir index.html diretamente no navegador
# Opção 2: Servidor local
python -m http.server 8000
# Abrir: http://localhost:8000
```

---

### POC 2: PWA + Offline Sync
**Pasta**: [`02-pwa-offline-sync/`](./02-pwa-offline-sync/)
**Tempo**: 12 horas (2 dias)
**Objetivo**: Validar se sincronização offline funciona sem duplicar ou perder dados

**Arquivos**:
- `index.html` - Interface de teste
- `db.js` - IndexedDB wrapper
- `sync.js` - Lógica de sincronização com retry
- `app.js` - Aplicação principal
- `manifest.json` - PWA manifest
- `service-worker.js` - Service Worker para cache
- `README.md` - Instruções de execução
- `RESULTADO.md` - Template para documentar resultados

**Critérios de Sucesso**:
- ✅ Taxa de sincronização > 99%
- ✅ 0 duplicações de dados
- ✅ 0 perdas de dados
- ✅ Funciona offline e volta online

**Como executar**:
```bash
cd 02-pwa-offline-sync
# IMPORTANTE: Usar servidor local (Service Worker não funciona via file://)
python -m http.server 8000
# Abrir: http://localhost:8000
```

**Testes Automatizados**: Clique em "Executar TODOS os Testes" na interface (5 testes, ~40s)

---

### POC 3: Captura de Foto via Câmera
**Pasta**: [`03-camera-capture/`](./03-camera-capture/)
**Tempo**: 6 horas (1 dia)
**Objetivo**: Validar se usuários conseguem conceder permissão e capturar fotos de qualidade

**Arquivos**:
- `index.html` - Interface de captura
- `camera.js` - Lógica de câmera e permissões
- `README.md` - Instruções de execução
- `RESULTADO.md` - Template para documentar resultados

**Critérios de Sucesso**:
- ✅ Permissão concedida em > 70% dos casos
- ✅ Foto de documento com texto legível (> 90%)
- ✅ Compressão < 500KB mantém qualidade
- ✅ Upload da galeria como fallback

**Como executar**:
```bash
cd 03-camera-capture
# Opção 1: Abrir index.html diretamente
# Opção 2: Servidor local (recomendado)
python -m http.server 8000
# Abrir: http://localhost:8000

# IMPORTANTE: Testar em dispositivo mobile REAL (não emulador)
# Safari iOS pode exigir HTTPS - use ngrok se necessário
```

---

## 📊 Matriz de Decisão

**Arquivo**: [`MATRIZ_DECISAO.md`](./MATRIZ_DECISAO.md)

Este arquivo consolida os resultados dos 3 POCs e ajuda a decidir:
- Quais tecnologias incluir em v2.0
- Quais descartar e usar alternativas
- Qual o impacto no cronograma

**Cenários possíveis**:
1. ✅✅✅ Todos viáveis → Implementar tudo (8 semanas)
2. ✅❌❌ Só QR Code → Implementar QR + fallbacks (6 semanas)
3. ❌✅❌ Só Offline → PWA + input manual (7 semanas)
4. ❌❌❌ Nenhum → Versão simplificada (4-5 semanas)

---

## 🚀 Como Executar os POCs

### Pré-requisitos
- Navegador moderno (Chrome 90+, Safari 14+, Edge 90+)
- **Dispositivos mobile reais** (não emuladores) para testes finais
- Python 3 OU Node.js (para servidor local)
- (Opcional) ngrok para HTTPS em testes mobile

### Ordem de Execução Recomendada

#### Dia 1: POC 1 (QR Code Scanner)
```bash
cd 01-qrcode-scanner
python -m http.server 8000
# Abrir em navegador: http://localhost:8000
# Seguir instruções do README.md
# Testar em 5+ dispositivos diferentes
# Preencher RESULTADO.md
```

#### Dias 2-3: POC 2 (PWA + Offline Sync)
```bash
cd 02-pwa-offline-sync
python -m http.server 8000
# Abrir em navegador: http://localhost:8000
# Executar 10 cenários edge manualmente
# Executar testes automatizados (botão na interface)
# Preencher RESULTADO.md
```

#### Dia 4: POC 3 (Captura de Foto)
```bash
cd 03-camera-capture
python -m http.server 8000
# Abrir em navegador: http://localhost:8000
# Testar em 5+ dispositivos mobile REAIS
# Testar permissões, legibilidade, compressão
# Preencher RESULTADO.md
```

#### Dia 4 (tarde): Consolidação
```bash
# Abrir MATRIZ_DECISAO.md
# Preencher tabela consolidada
# Escolher cenário final
# Preparar apresentação para Daniel
```

---

## 📝 Template de Resultado

Cada POC tem um arquivo `RESULTADO.md` com estrutura padrão:

1. **Tabela de Resultados** (todos os testes executados)
2. **Análise Estatística** (métricas globais)
3. **Decisão de Viabilidade** (Viável / Com Ressalvas / Não Viável)
4. **Recomendações** (se viável) OU **Alternativas** (se não viável)
5. **Lições Aprendidas**
6. **Evidências** (screenshots, logs)

---

## 🎯 Critérios de Viabilidade

### Viável ✅
- Atende **80%+** dos critérios de sucesso
- Funciona em **80%+** dos dispositivos testados
- **0 bugs críticos** (perda de dados, crashes)
- UX aceitável (usuários conseguem usar sem treinamento extensivo)

**Decisão**: Incluir em v2.0

### Viável com Ressalvas ⚠️
- Atende **60-80%** dos critérios
- Funciona em **60-80%** dos dispositivos
- Bugs não-críticos ou workarounds disponíveis
- UX precisa de melhorias

**Decisão**: Incluir em v2.0 com mitigações documentadas

### Não Viável ❌
- Atende **< 60%** dos critérios
- Funciona em **< 60%** dos dispositivos
- Bugs críticos sem solução
- UX ruim (usuários desistem de usar)

**Decisão**: Descartar e usar alternativa

---

## 📅 Cronograma

**Semana Atual** (15-19 Jan 2026):
- Segunda: Setup POCs + Pre-Mortem + MoSCoW ✅
- Terça: POC 1 (QR Code) ⏸️
- Quarta-Quinta: POC 2 (PWA Offline) ⏸️
- Sexta: POC 3 (Câmera) + Consolidação ⏸️

**Próxima Semana** (22-26 Jan 2026):
- Segunda: Apresentação ao Daniel + Aprovação
- Terça: Atualizar PRD e Plano v2.0
- Quarta-Sexta: Iniciar Fase 1 (Fundação)

---

## 🔧 Troubleshooting Comum

### Problema: Service Worker não registra (POC 2)
**Solução**: Service Worker não funciona via `file://`. Use servidor local (Método 2).

### Problema: Câmera não funciona em HTTPS (POC 3)
**Solução**: Use ngrok para criar túnel HTTPS:
```bash
ngrok http 8000
# Use URL HTTPS gerada (ex: https://abc123.ngrok.io)
```

### Problema: QR Code não lê em dispositivo antigo (POC 1)
**Esperado**: Isso é exatamente o que queremos validar. Documente no RESULTADO.md.

### Problema: IndexedDB não persiste (POC 2)
**Solução**: Verifique se navegador não está em modo privado/anônimo.

---

## 📚 Documentação de Referência

### APIs Web Utilizadas
- **getUserMedia**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- **IndexedDB**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- **Service Workers**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- **Canvas API**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### Bibliotecas Utilizadas
- **jsQR**: [GitHub](https://github.com/cozmo/jsQR) - Leitura de QR Code via canvas
- **react-qr-reader**: [GitHub](https://github.com/react-qr-reader/react-qr-reader) - Alternativa com Zxing

---

## ✅ Checklist Geral

- [ ] POC 1 executado em 5+ dispositivos
- [ ] POC 1 testado em 4 condições de iluminação
- [ ] POC 1 RESULTADO.md preenchido
- [ ] POC 2 executado com 10 cenários edge
- [ ] POC 2 testes automatizados executados
- [ ] POC 2 RESULTADO.md preenchido
- [ ] POC 3 executado em 5+ dispositivos mobile
- [ ] POC 3 permissões testadas (conceder + negar + recuperar)
- [ ] POC 3 RESULTADO.md preenchido
- [ ] MATRIZ_DECISAO.md consolidada
- [ ] Cenário final escolhido
- [ ] Apresentação para Daniel preparada
- [ ] Aprovação obtida
- [ ] Plano v2.0 atualizado

---

## 🎯 Próximos Passos

1. **Executar POCs** (3-4 dias)
2. **Consolidar resultados** (MATRIZ_DECISAO.md)
3. **Apresentar ao Daniel** com evidências
4. **Atualizar Fase 6 do Plano** conforme decisão
5. **Iniciar implementação** da v2.0

---

## 📞 Contato

**Dúvidas sobre POCs**: Daniel (GML Estruturas)
**Referência de Planejamento**: [greedy-twirling-abelson.md](../.claude/plans/greedy-twirling-abelson.md)

---

**Última atualização**: 15/01/2026
**Status**: Estrutura criada, aguardando execução dos testes
