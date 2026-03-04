# Solicitação: Job Automático para Atualização de Status "Atrasadas"

## Contexto

Atualmente, quando uma atividade tem o status "Planejadas" e a data prevista de início (`plannedStartDate`) já passou, o frontend exibe essa atividade como "Atrasadas" no Kanban. Porém, o status no banco de dados permanece como "Planejadas", causando inconsistência entre o que é exibido e o que está armazenado.

## Requisito

Criar um **job/cron automático** no backend que atualize o status das atividades para "Atrasadas" quando as condições de atraso forem atendidas.

## Regras de Negócio

Uma atividade deve ter seu status alterado para **"Atrasadas"** quando:

### 1. Atraso no Início
- Status atual: `Planejadas` ou `Planejado`
- Campo `plannedStartDate` está preenchido
- `plannedStartDate` < data/hora atual

### 2. Atraso na Execução
- Status atual: `Em andamento` ou `Em execução`
- Campo `endDate` está preenchido
- `endDate` < data/hora atual

## Atividades que NÃO devem ser alteradas

- Status: `Concluídas` ou `Concluída`
- Status: `Paralizadas` ou `Paralizada`
- Status: já é `Atrasadas`

## Sugestão de Implementação

### Opção 1: Cron Job (Recomendado)
```
Frequência: A cada 1 hora (ou a cada 15 minutos)
Horário: 24/7
```

### Opção 2: Trigger no Banco
Criar uma trigger que execute diariamente à meia-noite.

### Exemplo de Query (SQL)

```sql
-- Atualizar atividades com início atrasado
UPDATE activities
SET status = 'Atrasadas', updated_at = NOW()
WHERE status IN ('Planejadas', 'Planejado')
  AND planned_start_date IS NOT NULL
  AND planned_start_date < NOW();

-- Atualizar atividades com execução atrasada
UPDATE activities
SET status = 'Atrasadas', updated_at = NOW()
WHERE status IN ('Em andamento', 'Em execução')
  AND end_date IS NOT NULL
  AND end_date < NOW();
```

## Endpoint Alternativo (Opcional)

Se preferir, criar um endpoint que o frontend possa chamar para forçar a atualização:

```
POST /api/activities/update-delayed-status
```

## Observações

1. O frontend já está preparado para exibir o status "Atrasadas"
2. O Kanban já possui a coluna "Atrasadas"
3. Os filtros já suportam filtrar por "Atrasadas"
4. O dashboard já conta atividades atrasadas

## Prioridade

**Alta** - Afeta a consistência dos dados e relatórios.

## Contato

Para dúvidas sobre as regras de negócio, entrar em contato com a equipe de PCP.
