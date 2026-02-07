# Pipeline de Projetos - Capacidade Produtiva

## 📋 Configuração CCT (Convenção Coletiva de Trabalho - Metalúrgicos)

### Jornada de Trabalho Padrão

**Carga Horária Mensal:** 186 horas/mês por pessoa
**Base Legal:** CCT Sindicato dos Metalúrgicos (NÃO EDITÁVEL)

#### Composição da Jornada:
- **Segunda a Quinta:** 09:00h/dia (07:00 - 17:00 com 1h intervalo)
- **Sexta-feira:** 08:00h/dia (07:00 - 16:00 com 1h intervalo)
- **Total Semanal:** 44 horas

#### Cálculo Mensal:
```
186h/mês = Média anual considerando:
  - 44h/semana × ~4.23 semanas/mês
  - Descontados feriados e dias não úteis
  - Média ponderada de 12 meses
```

---

## 🧮 Cálculo de Pessoas Necessárias

### Fórmula Atual:

```typescript
const HORAS_MES_POR_PESSOA = 186; // CCT - NÃO EDITÁVEL

// Cálculo de pessoas adicionais em caso de sobrecarga
const horasExtras = capacidadeNecessaria - capacidadeDisponivel;
const pessoasAdicionais = Math.ceil(horasExtras / HORAS_MES_POR_PESSOA);
```

### Exemplo Prático:

**Cenário:** Sobrecarga de 450h em Março/2026

```
Pessoas necessárias = 450h ÷ 186h/pessoa
                    = 2.42 pessoas
                    = 3 pessoas (arredondado para cima)
```

**Justificativa:**
- 2 pessoas = 372h (insuficiente ❌)
- 3 pessoas = 558h (suficiente ✅)

---

## 📊 Thresholds de Status

### Critérios de Alerta:

| Utilização | Status | Cor | Descrição |
|------------|--------|-----|-----------|
| ≤ 85% | OK | 🟢 Verde | Capacidade adequada |
| 85% - 95% | Atenção | 🟡 Amarelo | Monitorar de perto |
| 95% - 100% | Gargalo | 🟠 Laranja | Planejar ação |
| > 100% | Sobrecarga | 🔴 Vermelho | AÇÃO URGENTE |

---

## 🎯 Recomendações por Status

### Sobrecarga (>100%)
```
AÇÃO URGENTE: Planejar Xh extras, contratar +Y pessoa(s)
(própria ou terceirizada) ou reduzir escopo
```

### Gargalo (95-100%)
```
Planejar horas extras (aprox. Xh), contratar mão de obra
adicional ou reduzir escopo
```

### Atenção (85-95%)
```
Monitorar de perto. Preparar plano de contingência
(horas extras ou recursos adicionais)
```

### OK (≤85%)
```
Capacidade adequada. Manter monitoramento
```

---

## 🔧 Configurações Futuras (Roadmap)

### Dias Úteis Editáveis por Mês

**Implementação planejada:**
- Input para ajustar dias úteis considerando:
  - Feriados específicos
  - Pontos facultativos
  - Paralisações planejadas

**Cálculo ajustado:**
```typescript
// Exemplo: Março com 20 dias úteis (ao invés dos 21.5 padrão)
const diasUteisMes = 20; // EDITÁVEL pelo usuário
const horasDisponiveis = (44h/semana / 5 dias) × diasUteisMes × numPessoas
```

### Configurações Adicionais Planejadas:
- [ ] Calendário de feriados por região
- [ ] Turnos diferenciados (2° e 3° turno)
- [ ] Configuração de horas extras máximas permitidas
- [ ] Banco de horas (CCT permite?)
- [ ] Configuração de produtividade por setor (%)

---

## 📈 Filtros Implementados

### Filtros Disponíveis:

1. **Período**
   - Data início (mês/ano)
   - Data fim (mês/ano)

2. **Tipo de Projeto**
   - Estrutura Metálica
   - Caldeiraria
   - Equipamento
   - Manutenção

3. **Responsável**
   - João Silva
   - Maria Santos
   - Carlos Pereira

4. **Status** (já existia)
   - Leads
   - Propostas
   - Negociação
   - Vendidos
   - Em Execução
   - Concluídos

---

## 🔜 Próximos Passos (Backend)

1. **Criar tabela de configuração:**
   ```sql
   CREATE TABLE configuracao_capacidade (
     id SERIAL PRIMARY KEY,
     mes_ano VARCHAR(7), -- ex: "2026-03"
     dias_uteis INTEGER DEFAULT 21,
     horas_mes_padrao INTEGER DEFAULT 186, -- CCT (readonly)
     observacoes TEXT,
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```

2. **API Endpoints necessários:**
   - `GET /api/pcp/capacidade/config/:mes` - Obter config do mês
   - `PUT /api/pcp/capacidade/config/:mes/dias-uteis` - Ajustar dias úteis
   - `GET /api/pcp/capacidade/timeline?filtros=...` - Timeline com filtros

3. **Validações Backend:**
   - Não permitir alterar `horas_mes_padrao` (CCT)
   - Validar `dias_uteis` entre 15-23 (razoável para um mês)
   - Log de alterações para auditoria

---

## 📝 Notas Técnicas

### Ajuste de Março/2026 (Mock):
- Forçado sobrecarga de 450h para evidenciar problema
- Equipe reduzida de 10 para 8 pessoas
- Resultado: 1.890h necessárias vs 1.440h disponíveis
- **Status:** SOBRECARGA CRÍTICA 🔴
- **Recomendação:** Contratar +3 pessoas ou 450h extras

### Precisão dos Cálculos:
- Sistema usa `Math.ceil()` para arredondar pessoas para cima
- Melhor sobrar capacidade do que faltar
- Considera apenas números inteiros de pessoas (não pode contratar 2.5 pessoas)

---

## 📚 Referências

- CCT Sindicato dos Metalúrgicos 2024/2025
- Carga horária: 44h semanais (CLT Art. 58)
- Intervalos: 1h (CLT Art. 71)
