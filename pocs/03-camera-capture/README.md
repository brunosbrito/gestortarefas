# POC 3: Captura de Foto via Câmera

**Objetivo**: Validar se `getUserMedia` funciona em navegadores mobile e se usuários conseguem tirar fotos de qualidade aceitável.

**Tempo Estimado**: 6 horas (1 dia)

**Critérios de Sucesso**:
- ✅ Permissão concedida em > 70% dos casos no primeiro pedido
- ✅ Se negada, usuário consegue recuperar seguindo tutorial
- ✅ Foto comprimida (< 500KB) mantém qualidade suficiente (texto legível)
- ✅ UX de captura é mais rápida que upload da galeria

---

## 📋 Como Executar o POC

### Método 1: Abrir Diretamente no Navegador

1. Abra o arquivo `index.html` diretamente no navegador
2. **IMPORTANTE**: Para testar câmera, use dispositivo móvel real (não emulador)
3. Chrome/Edge/Safari recomendados

### Método 2: Servidor Local (Recomendado para HTTPS)

```bash
# Navegue até a pasta do POC
cd pocs/03-camera-capture

# Opção A: Python 3
python -m http.server 8000

# Opção B: Node.js (npx)
npx serve .

# Opção C: Node.js (http-server)
npx http-server -p 8000

# Abra: http://localhost:8000
```

**Nota**: Alguns navegadores (especialmente Safari) podem exigir HTTPS para câmera. Use ngrok se necessário:

```bash
ngrok http 8000
# Use a URL HTTPS gerada (ex: https://abc123.ngrok.io)
```

---

## 🧪 Roteiro de Testes

### FASE 1: Testes Básicos de Permissão (1 hora)

#### Teste 1.1: Primeira Solicitação de Permissão
1. Abra o POC em um navegador **nunca usado antes** para este site
2. Clique em **"📷 Iniciar Câmera"**
3. **Observar**: Popup de permissão aparece
4. Clicar em **"Permitir"**
5. **Verificar**:
   - ✅ Status bar fica **verde**: "Câmera Ativa"
   - ✅ Preview da câmera aparece no vídeo
   - ✅ Botões habilitados: "Capturar Foto", "Trocar Câmera", "Parar Câmera"
   - ✅ Log: `✅ Permissão de câmera concedida`
   - ✅ Estatísticas: Taxa de Permissão = 100%

#### Teste 1.2: Permissão Negada
1. **Se possível**, resetar permissões do site:
   - Chrome: Configurações → Privacidade → Configurações do site → Câmera → Bloquear [este site]
   - Safari: Preferências → Websites → Câmera → Negar
2. Recarregar página
3. Clicar em **"📷 Iniciar Câmera"**
4. Clicar em **"Bloquear"/"Negar"**
5. **Verificar**:
   - ✅ Status bar fica **vermelho**: "Permissão negada"
   - ✅ Alert aparece com tutorial de recuperação
   - ✅ Log: `❌ Permissão de câmera NEGADA`
   - ✅ Guia de instruções é exibida abaixo

#### Teste 1.3: Recuperar Permissão Negada
1. Após negar permissão, seguir instruções do tutorial
2. **Chrome/Edge**:
   - Clicar no ícone 🔒 ao lado da URL
   - Câmera → Permitir
   - Recarregar página
3. **Safari iOS**:
   - Ajustes → Safari → Câmera → Permitir
   - Recarregar Safari
4. Clicar novamente em **"Iniciar Câmera"**
5. **Verificar**:
   - ✅ Permissão concedida após recuperação
   - ✅ Câmera funciona normalmente

---

### FASE 2: Testes de Captura de Foto (2 horas)

#### Teste 2.1: Capturar Foto de Dano no Veículo (Simulado)
1. Com câmera ativa, apontar para um objeto qualquer simulando "dano"
   - Exemplo: arranhão na mesa, marca na parede, mancha no chão
2. Posicionar dentro do quadro tracejado
3. Clicar em **"📸 Capturar Foto"**
4. **Verificar**:
   - ✅ Foto aparece na galeria abaixo
   - ✅ Log: `📸 Foto capturada (X KB)`
   - ✅ Popup pergunta: "A foto está LEGÍVEL?"
5. Ampliar foto (clicar nela) e verificar se "dano" é visível
6. Responder **Sim** ou **Não** no popup
7. **Critério**: Foto deve ter > 80% de chance de mostrar dano claramente

#### Teste 2.2: Capturar Foto de Documento (CRLV, Nota Fiscal)
1. Com câmera ativa, apontar para um **documento real com texto**
   - Exemplo: conta de luz, boleto, contrato impresso
2. Posicionar dentro do quadro tracejado
3. Capturar foto
4. **Verificar**:
   - ✅ Texto do documento é **legível** na foto (pode ler números/palavras)
   - ✅ Tamanho < 500KB
   - ✅ Foto não está borrada ou com reflexo
5. **Critério**: 90%+ do texto deve estar legível

#### Teste 2.3: Foto em Baixa Luz
1. Reduzir iluminação do ambiente (fechar cortinas, apagar luzes)
2. Capturar foto do mesmo documento
3. **Verificar**:
   - ✅ Foto ainda é legível (pode estar mais escura, mas texto visível)
   - ❌ Se totalmente preta/ilegível, marcar como "Não Legível"
4. **Critério**: Pelo menos 60% de legibilidade em baixa luz

#### Teste 2.4: Verificar Compressão (80% Quality)
1. Capturar foto de um documento em boa luz
2. **Verificar estatísticas**:
   - ✅ Tamanho médio < 500KB
   - ✅ Texto ainda legível (compressão não degradou muito)
3. Baixar foto (botão 💾) e abrir em visualizador externo
4. **Verificar**: Qualidade aceitável para uso profissional

#### Teste 2.5: Recapturar Foto (Se Não Ficou Boa)
1. Capturar foto de documento (propositalmente borrada ou com reflexo)
2. Marcar como "Não Legível"
3. Deletar a foto (botão 🗑️)
4. Capturar novamente, desta vez com boa iluminação e foco
5. **Verificar**:
   - ✅ Sistema permite recapturar quantas vezes necessário
   - ✅ Fotos ruins podem ser deletadas facilmente

---

### FASE 3: Testes de Funcionalidades Extras (1 hora)

#### Teste 3.1: Trocar Câmera (Frontal/Traseira)
1. Com câmera ativa, clicar em **"🔄 Trocar Câmera"**
2. **Verificar**:
   - ✅ Câmera alterna entre frontal e traseira
   - ✅ Preview atualiza instantaneamente
   - ✅ Log: `🔄 Câmera trocada para [frontal/traseira]`
3. Capturar foto com câmera frontal
4. **Verificar**: Foto é capturada normalmente
5. **Nota**: Se dispositivo tem apenas 1 câmera, botão não funcionará (esperado)

#### Teste 3.2: Upload da Galeria
1. Clicar em **"🖼️ Upload da Galeria"**
2. Selecionar uma foto existente do dispositivo
3. **Verificar**:
   - ✅ Foto é importada
   - ✅ Compressão é aplicada (tamanho reduzido)
   - ✅ Log: `📁 Upload de arquivo: [nome] (X KB)`
   - ✅ Foto aparece na galeria com badge "📁 Galeria"
4. **Critério**: Upload deve ser alternativa viável se câmera falhar

#### Teste 3.3: Parar e Reiniciar Câmera
1. Com câmera ativa, clicar em **"⏹️ Parar Câmera"**
2. **Verificar**:
   - ✅ Preview de vídeo fica preto
   - ✅ Botões desabilitados exceto "Iniciar Câmera"
   - ✅ Log: `⏹️ Câmera desligada`
3. Clicar novamente em **"📷 Iniciar Câmera"**
4. **Verificar**: Câmera reinicia normalmente (sem pedir permissão novamente)

#### Teste 3.4: Baixar Foto
1. Após capturar foto, clicar no botão **"💾 Baixar"** na galeria
2. **Verificar**:
   - ✅ Foto é baixada para Downloads do dispositivo
   - ✅ Nome do arquivo: `foto-[ID].jpg`
   - ✅ Log: `💾 Foto #[ID] baixada`

---

### FASE 4: Testes Automatizados (30 minutos)

#### Executar Bateria de Testes
1. Clicar em **"🧪 Executar Testes Automáticos"**
2. Aguardar ~5 segundos
3. **Verificar logs**:
   - ✅ TESTE 1: `getUserMedia` disponível
   - ✅ TESTE 2: Permissão verificada
   - ✅ TESTE 3: Foto capturada e comprimida < 500KB (se câmera ativa)
   - ✅ TESTE 4: Dispositivos de vídeo enumerados
4. **Critério**: Todos os testes devem passar

---

### FASE 5: Testes de Dispositivos e Navegadores (2 horas)

Testar em **pelo menos 5 dispositivos diferentes**:

#### Dispositivo 1: [Ex: iPhone 13, Safari]
- [ ] Permissão concedida no 1º pedido?
- [ ] Foto de documento legível?
- [ ] Compressão < 500KB?
- [ ] Trocar câmera funciona?
- [ ] Upload da galeria funciona?
- **Taxa de Sucesso**: [X/5]

#### Dispositivo 2: [Ex: Samsung Galaxy S21, Chrome]
- [ ] Permissão concedida no 1º pedido?
- [ ] Foto de documento legível?
- [ ] Compressão < 500KB?
- [ ] Trocar câmera funciona?
- [ ] Upload da galeria funciona?
- **Taxa de Sucesso**: [X/5]

#### Dispositivo 3: [Ex: Motorola Moto G9, Chrome]
- [ ] Permissão concedida no 1º pedido?
- [ ] Foto de documento legível?
- [ ] Compressão < 500KB?
- [ ] Trocar câmera funciona?
- [ ] Upload da galeria funciona?
- **Taxa de Sucesso**: [X/5]

#### Dispositivo 4: [Ex: Xiaomi Redmi Note 8, Chrome]
- [ ] Permissão concedida no 1º pedido?
- [ ] Foto de documento legível?
- [ ] Compressão < 500KB?
- [ ] Trocar câmera funciona?
- [ ] Upload da galeria funciona?
- **Taxa de Sucesso**: [X/5]

#### Dispositivo 5: [Ex: iPhone 8, Safari]
- [ ] Permissão concedida no 1º pedido?
- [ ] Foto de documento legível?
- [ ] Compressão < 500KB?
- [ ] Trocar câmera funciona?
- [ ] Upload da galeria funciona?
- **Taxa de Sucesso**: [X/5]

**Taxa Global de Sucesso**: [Y/25] = [Z]%

---

## 📊 Matriz de Decisão

Após executar todos os testes, preencher esta tabela:

| Critério | Meta | Resultado | Passou? |
|----------|------|-----------|---------|
| Taxa de permissão (1º pedido) | > 70% | -% | ⏸️ |
| Recuperação após negação | 100% | -% | ⏸️ |
| Texto legível em boa luz | > 90% | -% | ⏸️ |
| Texto legível em baixa luz | > 60% | -% | ⏸️ |
| Compressão < 500KB | 100% | -% | ⏸️ |
| Qualidade após compressão | Boa | - | ⏸️ |
| Trocar câmera funciona | Sim | - | ⏸️ |
| Upload galeria funciona | Sim | - | ⏸️ |
| Funciona em 5+ dispositivos | > 80% | -% | ⏸️ |

**Decisão**:
- ✅ **VIÁVEL** se >= 8/9 critérios passarem
- ⚠️ **VIÁVEL COM RESSALVAS** se 6-7/9 critérios passarem
- ❌ **NÃO VIÁVEL** se < 6/9 critérios

---

## 🎯 Critérios de Aceitação

### Must-Have (Obrigatórios):
- ✅ Permissão concedida em > 70% dos casos
- ✅ Foto de documento com texto legível
- ✅ Compressão mantém qualidade (< 500KB)
- ✅ Upload da galeria como alternativa

### Nice-to-Have (Desejáveis):
- ✅ Trocar câmera frontal/traseira
- ✅ Funciona em baixa luz (> 60% legibilidade)
- ✅ Recapturar foto se não ficou boa
- ✅ Baixar foto capturada

---

## 🔧 Ferramentas de Debug

### Chrome DevTools (Mobile):
1. Conectar dispositivo via USB
2. Chrome Desktop → chrome://inspect
3. Inspecionar página no dispositivo
4. Verificar console para erros

### Simular Dispositivo no Desktop:
1. Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
2. Selecionar dispositivo (iPhone, Galaxy, etc.)
3. **Limitação**: Câmera do desktop será usada (não é teste real)

### Verificar Permissões:
```javascript
// Cole no Console:
navigator.permissions.query({ name: 'camera' })
  .then(permission => console.log('Permissão:', permission.state));

// Listar dispositivos de vídeo:
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(d => d.kind === 'videoinput');
    console.log(`Câmeras encontradas: ${cameras.length}`, cameras);
  });
```

---

## 🚨 Troubleshooting

### Problema: "getUserMedia não é uma função"
**Solução**: Navegador não suporta. Usar Chrome 90+, Safari 14+, Edge 90+

### Problema: Permissão negada automaticamente (sem popup)
**Solução**: Permissão foi bloqueada anteriormente. Ir em configurações do site e resetar permissões.

### Problema: Foto fica de cabeça para baixo
**Solução**: Bug conhecido em iOS. Usar biblioteca EXIF.js para corrigir orientação (não implementado neste POC).

### Problema: Câmera não abre em HTTP
**Solução**: Usar HTTPS (localhost funciona em HTTP, mas domínios externos requerem HTTPS). Use ngrok.

### Problema: Compressão não reduz tamanho suficiente
**Solução**: Ajustar quality de 0.8 para 0.6 ou 0.5 no código (linha do `canvas.toBlob`).

---

## 📝 Documentar Resultados

Após concluir todos os testes, preencher o arquivo **`RESULTADO.md`** com:

1. **Tabela de Dispositivos Testados**
2. **Taxa de Permissão Concedida**
3. **Taxa de Legibilidade** (boa luz vs baixa luz)
4. **Tamanho Médio de Arquivo** (após compressão)
5. **Decisão de Viabilidade**
6. **Recomendações** ou **Alternativas**

---

## ✅ Checklist de Conclusão

- [ ] Testado em 5+ dispositivos diferentes
- [ ] Testado em 3+ navegadores (Chrome, Safari, Edge)
- [ ] Permissões testadas (conceder + negar + recuperar)
- [ ] Fotos de documento testadas (legibilidade verificada)
- [ ] Fotos de danos testadas (visibilidade verificada)
- [ ] Baixa luz testada
- [ ] Compressão verificada (< 500KB)
- [ ] Upload da galeria testado
- [ ] Trocar câmera testado
- [ ] Testes automatizados executados
- [ ] Matriz de decisão preenchida
- [ ] Arquivo RESULTADO.md preenchido

---

**Próximo Passo**: Se POC 3 for **VIÁVEL**, incluir Captura de Foto em v2.0 do módulo SUPRIMENTOS. Se **NÃO VIÁVEL**, usar apenas Upload da Galeria como alternativa.
