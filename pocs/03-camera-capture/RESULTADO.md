# Resultado do POC 3: Captura de Foto via Câmera

**Data de Execução**: [A PREENCHER]
**Executado por**: Daniel (GML Estruturas)
**Status**: ⏸️ **AGUARDANDO EXECUÇÃO**

---

## 📊 Resultados dos Testes

### Tabela de Dispositivos Testados

| # | Dispositivo | Navegador | Versão | Permissão 1º Pedido | Legibilidade Documento | Tamanho < 500KB | Trocar Câmera | Upload Galeria | Score |
|---|-------------|-----------|--------|---------------------|------------------------|-----------------|---------------|----------------|-------|
| 1 | - | - | - | - | - | - | - | - | -/5 |
| 2 | - | - | - | - | - | - | - | - | -/5 |
| 3 | - | - | - | - | - | - | - | - | -/5 |
| 4 | - | - | - | - | - | - | - | - | -/5 |
| 5 | - | - | - | - | - | - | - | - | -/5 |

*(Adicionar mais linhas se necessário)*

---

## 📈 Análise Estatística

### Métricas Globais
- **Total de Dispositivos Testados**: [X]
- **Dispositivos com Permissão Concedida (1º pedido)**: [Y]
- **Taxa de Permissão Global**: [Y/X × 100]% (meta: > 70%)
- **Total de Fotos Capturadas**: [Z]
- **Fotos com Texto Legível**: [W]
- **Taxa de Legibilidade**: [W/Z × 100]% (meta: > 90% boa luz, > 60% baixa luz)
- **Tamanho Médio de Arquivo**: [V] KB (meta: < 500KB)

### Por Tipo de Foto
| Tipo | Fotos | Legíveis | Taxa | Tamanho Médio |
|------|-------|----------|------|---------------|
| Documentos (boa luz) | - | - | -% | - KB |
| Documentos (baixa luz) | - | - | -% | - KB |
| Danos no veículo | - | - | -% | - KB |
| Upload da galeria | - | - | -% | - KB |

### Por Navegador
| Navegador | Testes | Permissão Concedida | Taxa | Observações |
|-----------|--------|---------------------|------|-------------|
| Chrome (Android) | - | - | -% | - |
| Chrome (Desktop) | - | - | -% | - |
| Safari (iOS) | - | - | -% | - |
| Edge (Desktop) | - | - | -% | - |
| Firefox (Android) | - | - | -% | - |

---

## 🎯 Decisão de Viabilidade

### Checklist de Critérios

| Critério | Meta | Resultado | Status |
|----------|------|-----------|--------|
| Taxa de permissão (1º pedido) | > 70% | -% | [ ] ✅ [ ] ❌ |
| Recuperação após negação | 100% | -% | [ ] ✅ [ ] ❌ |
| Texto legível em boa luz | > 90% | -% | [ ] ✅ [ ] ❌ |
| Texto legível em baixa luz | > 60% | -% | [ ] ✅ [ ] ❌ |
| Compressão < 500KB | 100% | -% | [ ] ✅ [ ] ❌ |
| Qualidade após compressão | Boa | - | [ ] ✅ [ ] ❌ |
| Trocar câmera funciona | Sim | - | [ ] ✅ [ ] ❌ |
| Upload galeria funciona | Sim | - | [ ] ✅ [ ] ❌ |
| Funciona em 5+ dispositivos | > 80% | -% | [ ] ✅ [ ] ❌ |

**Critérios Atendidos**: [X/9] = [Y]%

### Status: [ESCOLHER UMA OPÇÃO]

- [ ] ✅ **VIÁVEL** - Atende >= 8/9 critérios
- [ ] ⚠️ **VIÁVEL COM RESSALVAS** - Atende 6-7/9 critérios
- [ ] ❌ **NÃO VIÁVEL** - Atende < 6/9 critérios

---

### ✅ Se VIÁVEL:

**Tecnologias Validadas**:
- [ ] `navigator.mediaDevices.getUserMedia()` funcional
- [ ] Permissões concedidas em 70%+ dos casos
- [ ] Compressão JPEG 80% mantém qualidade
- [ ] Canvas API para processamento de imagem
- [ ] Upload da galeria como fallback

**Requisitos Mínimos**:
- **Navegador**: Chrome 90+, Safari 14+, Edge 90+
- **Dispositivo**: Câmera traseira com resolução mínima 5MP
- **Iluminação**: Boa iluminação recomendada (luz natural ou artificial 500+ lux)
- **Protocolo**: HTTPS obrigatório (exceto localhost)
- **Permissões**: Câmera deve ser permitida pelo usuário

**Configurações Recomendadas**:

```javascript
// Constraints otimizadas:
const constraints = {
  video: {
    facingMode: 'environment', // Câmera traseira
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  audio: false
};

// Compressão otimizada:
canvas.toBlob(
  (blob) => { /* ... */ },
  'image/jpeg',
  0.8 // 80% quality - balanço entre tamanho e qualidade
);
```

**Recomendações para Implementação v2.0**:
1. **UX de Permissão**: Exibir modal explicando POR QUE precisa da câmera ANTES de solicitar permissão
2. **Tutorial de Recuperação**: Se permissão negada, exibir passo-a-passo com screenshots
3. **Preview Antes de Confirmar**: Permitir usuário ver foto capturada antes de salvar
4. **Botão "Recapturar"**: Sempre visível se foto não ficou boa
5. **Upload da Galeria**: SEMPRE disponível como fallback
6. **Orientação de Uso**:
   - Overlay com guia visual (quadro tracejado)
   - Dicas de iluminação: "Evite sombras e reflexos"
   - Distância recomendada: "Posicione a 20-30cm do documento"
7. **Compressão Inteligente**:
   - Documentos: quality 0.85 (mais qualidade)
   - Fotos de danos: quality 0.75 (menos qualidade ok)
   - Auto-redimensionar se > 1920x1080
8. **Validação de Qualidade**:
   - Detectar blur (API de detecção de foco - opcional)
   - Avisar se foto muito escura (analisar histograma)
9. **Acessibilidade**:
   - Botões grandes (min 44x44px)
   - Labels claros e descritivos
   - Suporte a leitores de tela

**Estimativa de Esforço**: [X semanas] para implementar captura de foto completa

---

### ⚠️ Se VIÁVEL COM RESSALVAS:

**Problemas Identificados**:
1. [Problema 1 - ex: Taxa de permissão < 70% em Safari iOS]
2. [Problema 2 - ex: Fotos ficam borradas em baixa luz]
3. [Problema 3 - ex: Compressão degrada qualidade em alguns casos]

**Mitigações Propostas**:
1. [Mitigação 1 - ex: UX melhorada para explicar necessidade de permissão]
2. [Mitigação 2 - ex: Detectar baixa luz e avisar usuário para melhorar iluminação]
3. [Mitigação 3 - ex: Ajustar quality de 0.8 para 0.85 em documentos]

**Requisitos Especiais**:
- [Requisito 1 - ex: Apenas dispositivos com câmera > 8MP]
- [Requisito 2 - ex: HTTPS obrigatório (ngrok em desenvolvimento)]
- [Requisito 3 - ex: Iluminação mínima de 300 lux]

**Cenários de Uso Recomendados**:
- ✅ Usar quando: Boa iluminação, documento plano, câmera estável
- ❌ Evitar quando: Baixa luz, documento amassado, mão tremendo

**Treinamento Necessário**: [Sim/Não] - [Descrição: ex: "Vídeo de 2 minutos mostrando como tirar foto corretamente"]

**Versão Simplificada para v2.0**:
- [Descrever versão reduzida - ex: "Apenas upload da galeria, sem captura direta via câmera"]

---

### ❌ Se NÃO VIÁVEL:

**Motivos da Inviabilidade**:
1. [Motivo 1 - ex: Taxa de permissão < 50% (muito baixa)]
2. [Motivo 2 - ex: 60%+ das fotos ficam ilegíveis]
3. [Motivo 3 - ex: getUserMedia não funciona em 40%+ dos dispositivos testados]

**Evidências**:
- Taxa de permissão: [X]% (< 70% - abaixo do mínimo)
- Taxa de legibilidade: [Y]% (< 90% - abaixo do aceitável)
- Tamanho médio: [Z] KB (> 500KB - muito grande)
- Dispositivos com falha: [W/5] (> 20% - inaceitável)

**Alternativas Propostas**:

#### Alternativa 1: Apenas Upload da Galeria
- **Descrição**: Remover captura direta via câmera, usar apenas `<input type="file" accept="image/*">`
- **Implementação**:
  - Botão "📷 Tirar Foto" abre app de câmera nativo do dispositivo
  - Usuário tira foto, salva na galeria, volta pro app e faz upload
  - Compressão aplicada após upload
- **Tempo de implementação**: 1 semana
- **Vantagens**:
  - 100% compatível (não requer getUserMedia)
  - Permissões gerenciadas pelo SO
  - Usuário tem controle total (pode editar foto antes de enviar)
- **Desvantagens**:
  - UX pior (mais passos)
  - Não tem preview em tempo real
  - Usuário pode esquecer de fazer upload

#### Alternativa 2: Captura via App Nativo (React Native)
- **Descrição**: Desenvolver app nativo com React Native Camera
- **Implementação**:
  - Biblioteca `react-native-camera`
  - Acesso nativo à câmera (sem limitações de navegador)
  - Controle total de qualidade, foco, flash
- **Tempo de implementação**: 4 semanas
- **Vantagens**:
  - Melhor UX (controles nativos)
  - Permissões mais claras (gerenciadas pelo SO)
  - Funcionalidades extras (flash, foco manual, zoom)
- **Desvantagens**:
  - Custo muito maior (3x)
  - Manutenção de app nativo

#### Alternativa 3: Descrição Textual Obrigatória + Foto Opcional
- **Descrição**: Tornar foto opcional, campo de texto obrigatório
- **Implementação**:
  - Campo "Descrição do Dano" obrigatório
  - Campo "Foto (opcional)" com upload da galeria
  - Motorista descreve dano em texto, foto é complemento
- **Tempo de implementação**: 1 semana
- **Vantagens**:
  - Funciona sempre (não depende de câmera)
  - Texto pode ser mais detalhado que foto
- **Desvantagens**:
  - Perda de evidência visual
  - Mais trabalhoso para motorista (digitar texto)

#### Alternativa 4: QR Code com Link para Upload
- **Descrição**: Motorista escaneia QR Code que abre link para upload de foto
- **Implementação**:
  - QR Code gera link único: `https://app.gml.com/upload/[viagem_id]/[token]`
  - Link abre em navegador nativo
  - Upload de foto via `<input type="file">`
  - Foto é associada à viagem automaticamente
- **Tempo de implementação**: 2 semanas
- **Vantagens**:
  - Não requer app instalado
  - Compatibilidade 100%
  - Simples de usar
- **Desvantagens**:
  - Requer conexão de internet
  - UX de "abrir navegador" pode confundir

---

## 💡 Lições Aprendidas

### O que funcionou bem:
- [...]
- [...]
- [...]

### O que não funcionou:
- [...]
- [...]
- [...]

### Surpresas (positivas ou negativas):
- [...]
- [...]
- [...]

### Comparação com Upload da Galeria:
- **Captura Direta**: Vantagens [...]  |  Desvantagens [...]
- **Upload Galeria**: Vantagens [...]  |  Desvantagens [...]
- **Vencedor**: [Captura Direta / Upload Galeria / Ambos]

### Recomendações para implementação futura:
- [...]
- [...]
- [...]

---

## 🔧 Detalhes Técnicos

### Navegadores Testados:
- [ ] Chrome [versão] - Desktop - [Resultado]
- [ ] Chrome [versão] - Android - [Resultado]
- [ ] Edge [versão] - Desktop - [Resultado]
- [ ] Safari [versão] - iOS - [Resultado]
- [ ] Safari [versão] - macOS - [Resultado]
- [ ] Firefox [versão] - Desktop - [Resultado]
- [ ] Firefox [versão] - Android - [Resultado]

### Dispositivos Testados (Mobile):
- [ ] [Dispositivo 1: ex iPhone 13] - [Câmera: 12MP] - [Resultado: ✅/❌]
- [ ] [Dispositivo 2: ex Galaxy S21] - [Câmera: 64MP] - [Resultado: ✅/❌]
- [ ] [Dispositivo 3: ex Moto G9] - [Câmera: 48MP] - [Resultado: ✅/❌]
- [ ] [Dispositivo 4: ex Xiaomi Redmi] - [Câmera: 48MP] - [Resultado: ✅/❌]
- [ ] [Dispositivo 5: ex iPhone 8] - [Câmera: 12MP] - [Resultado: ✅/❌]

### Condições de Iluminação Testadas:
- [ ] Luz natural (dia, janela) - [Resultado: Legível? ✅/❌]
- [ ] Luz artificial (lâmpada LED 500 lux) - [Resultado: Legível? ✅/❌]
- [ ] Baixa luz (ambiente escuro < 100 lux) - [Resultado: Legível? ✅/❌]
- [ ] Luz direta (solar, causando reflexo) - [Resultado: Legível? ✅/❌]

---

## 📸 Evidências

*(Incluir prints/fotos/logs, se possível)*

### Screenshot 1: Permissão Concedida
[Anexar screenshot do popup de permissão + status bar verde]

### Screenshot 2: Preview da Câmera Ativa
[Anexar screenshot mostrando vídeo com overlay de quadro tracejado]

### Screenshot 3: Foto de Documento Capturada (Legível)
[Anexar foto exemplo de documento com texto legível após compressão]

### Screenshot 4: Foto de Dano Capturada
[Anexar foto exemplo de "dano" (arranhão, marca, etc.) visível claramente]

### Screenshot 5: Galeria de Fotos
[Anexar screenshot da galeria mostrando múltiplas fotos capturadas]

### Screenshot 6: Estatísticas Finais
[Anexar screenshot das estatísticas (Total, Legível, Tamanho Médio, Taxa de Permissão)]

### Log de Teste Completo:
```
[Colar log completo de uma sessão de teste aqui]
Exemplo:
[14:23:45] 🚀 POC 3: Captura de Foto via Câmera - Pronto para uso
[14:24:10] 📷 Solicitando permissão de câmera...
[14:24:12] ✅ Permissão de câmera concedida
[14:24:15] 📸 Foto capturada (347 KB)
[14:24:18] ✅ Foto #1705334658 marcada como LEGÍVEL
...
```

---

## 📊 Métricas de Qualidade da Imagem

### Tamanhos de Arquivo (KB):
- Mínimo: [X] KB
- Máximo: [Y] KB
- Média: [Z] KB
- Mediana: [W] KB
- % < 500KB: [V]%

### Resolução das Fotos:
- Resolução típica capturada: [X]x[Y] px
- Resolução após redimensionamento (se aplicado): [W]x[V] px

### Taxa de Compressão:
- Tamanho original médio: [X] KB
- Tamanho após compressão 80%: [Y] KB
- Taxa de compressão: [Z]%

---

## 🎯 Análise de UX

### Tempo Médio por Tarefa:
- Conceder permissão (1ª vez): [X] segundos
- Capturar 1 foto: [Y] segundos
- Upload 1 foto da galeria: [Z] segundos
- Deletar foto: [W] segundos
- Trocar câmera: [V] segundos

**Vencedor em Velocidade**: [Captura Direta / Upload Galeria]

### Feedback dos Usuários (se aplicável):
- "Fácil de usar": [X/5] estrelas
- "Qualidade das fotos boa": [Y/5] estrelas
- "Preferiu câmera direta ou upload?": [Câmera / Upload / Tanto faz]
- Comentários adicionais: [...]

---

## ✅ Checklist de Conclusão

- [ ] Testado em 5+ dispositivos mobile
- [ ] Testado em 3+ navegadores diferentes
- [ ] Permissão concedida testada
- [ ] Permissão negada + recuperação testada
- [ ] Fotos de documentos com texto legível
- [ ] Fotos de danos visíveis claramente
- [ ] Baixa luz testada
- [ ] Compressão verificada (< 500KB)
- [ ] Upload da galeria testado
- [ ] Trocar câmera testado
- [ ] Testes automatizados executados
- [ ] Matriz de decisão preenchida
- [ ] Evidências anexadas (screenshots, fotos)
- [ ] Decisão de viabilidade definida

---

## 📋 Aprovação

**Revisado por**: [Nome]
**Data**: [Data]
**Aprovado para**: [ ] v2.0 | [ ] Descartar | [ ] Mais testes necessários

**Comentários finais**:
[...]

---

**Documento gerado em**: [Data]
**Baseado no plano**: [greedy-twirling-abelson.md](../../.claude/plans/greedy-twirling-abelson.md)
