# POC 1: QR Code Scanner

**Objetivo**: Validar se a leitura de QR Code via câmera funciona em dispositivos antigos e em diferentes condições de iluminação.

## 🎯 Critérios de Sucesso

- ✅ Taxa de leitura > 90% em todos os dispositivos
- ✅ Latência < 2s (scan → reconhecimento)
- ✅ Funciona em 100% das condições de luz testadas
- ✅ QR Code sujo ainda é legível

## 📱 Como Executar

### Método 1: Abrir Diretamente (Mais Simples)
1. Abra o arquivo `index.html` diretamente no navegador
2. Permita acesso à câmera quando solicitado
3. Teste a leitura dos QR Codes gerados

### Método 2: Servidor Local (Recomendado para HTTPS)
```bash
# No terminal, a partir desta pasta:
npx serve .
# Acesse http://localhost:3000 no navegador
```

**Nota**: Alguns navegadores exigem HTTPS para acesso à câmera. Se tiver problemas, use o método 2.

## 🧪 Roteiro de Testes

### Teste 1: Dispositivos
Teste em pelo menos 5 dispositivos diferentes:
- [ ] iPhone 13+ ou equivalente (câmera moderna)
- [ ] Samsung Galaxy S21+ ou equivalente (câmera moderna)
- [ ] Motorola Moto G9 ou similar (câmera básica)
- [ ] Xiaomi Redmi Note 8 ou similar (dispositivo antigo)
- [ ] iPhone 8 ou similar (iOS/Safari antigo)

### Teste 2: Condições de Iluminação
Para cada dispositivo, teste em 4 condições:
- [ ] ☀️ Luz solar direta (pátio às 12h)
- [ ] 🌥️ Sombra/nublado
- [ ] 💡 Luz artificial (galpão/escritório)
- [ ] 🧹 QR Code sujo/danificado (simular uso real)

### Teste 3: Tamanhos de QR Code
Imprima QR Codes em diferentes tamanhos:
- [ ] 5x5 cm (mínimo planejado)
- [ ] 7x7 cm (médio)
- [ ] 10x10 cm (grande)

### Teste 4: Distância e Ângulo
- [ ] Distância: 10cm, 30cm, 50cm, 100cm
- [ ] Ângulo: Frontal, 45°, lateral

## 📊 Registro de Resultados

Use a interface web para registrar cada teste. Os dados incluem:
- **Timestamp**: Data e hora do teste
- **Dispositivo**: Nome do dispositivo usado
- **Condição**: Iluminação, estado do QR Code, etc.
- **Tempo de Leitura**: Latência em milissegundos
- **Status**: Sucesso ou Falha
- **Observações**: Detalhes adicionais

Os resultados são salvos no `localStorage` do navegador e podem ser exportados.

## 📈 Análise de Resultados

Após os testes, calcule:
1. **Taxa de Sucesso Global**: (Sucessos / Total de Testes) × 100
2. **Tempo Médio de Leitura**: Média de todos os tempos bem-sucedidos
3. **Taxa por Dispositivo**: Taxa de sucesso para cada dispositivo
4. **Taxa por Condição**: Taxa de sucesso para cada condição

### Decisão de Viabilidade

**VIÁVEL se**:
- Taxa de sucesso global > 90%
- Tempo médio < 2000ms
- Funciona em 80%+ dos dispositivos testados
- Funciona em todas as condições de luz

**NÃO VIÁVEL se**:
- Taxa de sucesso < 70%
- Tempo médio > 3000ms
- Não funciona em dispositivos antigos comuns (Moto G, Xiaomi)
- Falha consistentemente em luz solar ou sombra

**VIÁVEL COM RESSALVAS se**:
- Taxa entre 70-90%
- Requer tamanho mínimo de QR Code maior (ex: 8x8cm)
- Requer treinamento dos usuários

## 🎯 Próximos Passos

Após completar os testes, preencher o [RESULTADO.md](./RESULTADO.md) com:
- Tabela completa de resultados
- Análise estatística
- Recomendação final (Viável/Não Viável/Com Ressalvas)
- Alternativas caso não seja viável
- Requisitos mínimos caso seja viável
