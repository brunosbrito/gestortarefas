# 🚛 Módulo de Logística - SUPRIMENTOS v2.0

**Status**: ✅ Estrutura Base Criada - Pronto para Implementação
**Data**: 15/01/2026
**Cronograma**: 8 semanas (Fase 6)

---

## 📁 Estrutura de Arquivos Criada

```
src/pages/suprimentos/logistica/
├── veiculos/
│   └── index.tsx                    ✅ CRUD Veículos (lista)
├── motoristas/
│   └── index.tsx                    ✅ CRUD Motoristas (lista)
├── transportadoras/
│   └── index.tsx                    ✅ CRUD Transportadoras (lista)
├── manutencoes/
│   └── (a criar)                    ⏸️ CRUD Manutenções
├── check-lists/
│   ├── saida/
│   │   └── (a criar)                ⏸️ Check-list Saída
│   ├── retorno/
│   │   └── (a criar)                ⏸️ Check-list Retorno
│   └── components/
│       └── (a criar)                ⏸️ Componentes mobile
└── components/
    └── (a criar)                    ⏸️ Componentes compartilhados

src/services/suprimentos/logistica/
├── vehiclesService.ts               ✅ Service de Veículos (MOCK)
├── driversService.ts                ✅ Service de Motoristas (MOCK)
└── transportadorasService.ts        ✅ Service de Transportadoras (MOCK)

src/interfaces/suprimentos/logistica/
├── VehicleInterface.ts              ✅ Tipos de Veículos
├── DriverInterface.ts               ✅ Tipos de Motoristas
└── TransportInterface.ts            ✅ Tipos de Transportadoras
```

---

## 🎯 Cronograma Detalhado (8 semanas)

### ✅ Semana 1-2: Cadastros Base (ATUAL)

**Já Criado**:
- [x] Estrutura de pastas completa
- [x] Interfaces TypeScript (Vehicle, Driver, Transportadora)
- [x] Services com mock data
- [x] Páginas de listagem (Veículos, Motoristas, Transportadoras)

**A Fazer**:
- [ ] Páginas de criação/edição (formulários)
- [ ] CRUD de Tipos de Manutenção
- [ ] CRUD de Fornecedores de Serviços
- [ ] CRUD de Rotas/Destinos
- [ ] Validação de formulários (Zod)
- [ ] Testes de integração

---

### ⏸️ Semana 3-4: QR Code

**Objetivos**:
- [ ] Geração de QR Codes para veículos (UUID único)
- [ ] Página de impressão de QR Codes (PDF - 20 por página)
- [ ] Component `<QRCodeScanner>` (jsqr)
- [ ] Fallback: Input manual de placa
- [ ] Testes em 5+ dispositivos reais

**Arquivos a Criar**:
```typescript
// src/pages/suprimentos/logistica/veiculos/[id]/qrcode.tsx
// src/components/suprimentos/logistica/QRCodeScanner.tsx
// src/services/suprimentos/logistica/qrcodeService.ts
// src/lib/logistica/qrcode-utils.ts
```

**Dependências**:
```bash
npm install qrcode.react jsqr
```

---

### ⏸️ Semana 5-6: PWA + Offline Sync

**Objetivos**:
- [ ] Service Worker setup (manifest.json, cache)
- [ ] IndexedDB wrapper (CRUD check-lists)
- [ ] Sync service (retry + exponential backoff)
- [ ] Offline indicator na UI
- [ ] Badge "Pendente Sincronização"
- [ ] Testes dos 10 cenários edge

**Arquivos a Criar**:
```typescript
// public/manifest.json
// public/service-worker.js
// src/lib/logistica/offline-db.ts
// src/lib/logistica/sync-service.ts
// src/components/suprimentos/logistica/OfflineSyncIndicator.tsx
```

**Dependências**:
```bash
npm install idb workbox-webpack-plugin
```

---

### ⏸️ Semana 7: Captura de Foto

**Objetivos**:
- [ ] Component `<CameraCapture>` (getUserMedia)
- [ ] Preview antes de confirmar
- [ ] Botão "Recapturar"
- [ ] Compressão automática (JPEG 80%)
- [ ] Upload da galeria como alternativa
- [ ] Tutorial de permissões

**Arquivos a Criar**:
```typescript
// src/components/suprimentos/logistica/CameraCapture.tsx
// src/lib/logistica/camera-utils.ts
```

---

### ⏸️ Semana 8: Check-lists Completos

**Objetivos**:
- [ ] Check-list de Saída (pré-viagem)
- [ ] Check-list de Retorno (pós-viagem)
- [ ] Integração: QR Code → Câmera → Offline
- [ ] Registro de KM (início/fim)
- [ ] Campo de observações
- [ ] Fotos de danos (opcional)

**Arquivos a Criar**:
```typescript
// src/pages/suprimentos/logistica/check-lists/saida/index.tsx
// src/pages/suprimentos/logistica/check-lists/retorno/index.tsx
// src/components/suprimentos/logistica/ChecklistForm.tsx
// src/interfaces/suprimentos/logistica/ChecklistInterface.ts
// src/services/suprimentos/logistica/checklistsService.ts
```

---

## 💾 Mock Data Disponível

### Veículos (3 registros)
```typescript
[
  { id: 1, tipo: 'caminhao', placa: 'ABC-1234', km_atual: 85000, ... },
  { id: 2, tipo: 'empilhadeira', placa: 'EMP-001', km_atual: 12000, ... },
  { id: 3, tipo: 'carro', placa: 'XYZ-5678', km_atual: 35000, ... }
]
```

### Motoristas (3 registros)
```typescript
[
  { id: 1, nome: 'João Silva', cnh_categoria: 'D', status: 'ativo', ... },
  { id: 2, nome: 'Maria Santos', cnh_categoria: 'B', status: 'ativo', ... },
  { id: 3, nome: 'Carlos Oliveira', cnh_categoria: 'E', status: 'ferias', ... }
]
```

### Transportadoras (3 registros)
```typescript
[
  { id: 1, razao_social: 'Transportadora Rápida Ltda', rating: 5, ... },
  { id: 2, razao_social: 'Logística Express S.A.', rating: 4, ... },
  { id: 3, razao_social: 'Transporte Nacional Ltda', rating: 3, ... }
]
```

---

## 🎨 Componentes Shadcn/ui Utilizados

- ✅ `Button` - Botões de ação
- ✅ `Table` - Listagem de dados
- ✅ `Badge` - Status visual
- ✅ `Input` - Campos de busca
- ✅ `Loader2` - Loading spinner
- 📋 `Dialog` - Modais (a usar)
- 📋 `Form` - Formulários (a usar)
- 📋 `Select` - Dropdowns (a usar)

---

## 🔄 Fluxo de Dados Completo (Planejado)

```
1. Motorista escaneia QR Code do veículo
   └─> QRCodeScanner detecta UUID
       └─> Carrega dados do veículo via vehiclesService

2. Abre Check-list de Saída
   └─> Formulário preenche campos
       └─> Tira fotos de danos (CameraCapture)
           └─> Salva offline (IndexedDB)

3. Veículo em uso → Status muda para 'em_uso'

4. Ao voltar, escaneia QR Code novamente
   └─> Sistema detecta viagem aberta
       └─> Abre Check-list de Retorno
           └─> Registra KM final
               └─> Salva offline

5. Quando conectar, sincroniza automaticamente
   └─> Sync service envia para backend
       └─> Retry com backoff se falhar
           └─> Marca como 'synced'
```

---

## 🚀 Como Executar Localmente

### 1. Instalar Dependências (Futuro - Semanas 3-4)
```bash
npm install qrcode.react jsqr idb workbox-webpack-plugin
```

### 2. Rodar Servidor de Desenvolvimento
```bash
npm run dev
# Acesse: http://localhost:8080
```

### 3. Acessar Módulo de Logística
```
http://localhost:8080/suprimentos/logistica/veiculos
http://localhost:8080/suprimentos/logistica/motoristas
http://localhost:8080/suprimentos/logistica/transportadoras
```

---

## 📝 Próximos Passos Imediatos

### Semana 1 (Esta semana):
1. [ ] Criar formulários de criação/edição de Veículos
2. [ ] Criar formulários de criação/edição de Motoristas
3. [ ] Criar formulários de criação/edição de Transportadoras
4. [ ] Adicionar validação com Zod
5. [ ] Implementar toasts de sucesso/erro

### Semana 2:
6. [ ] CRUD de Tipos de Manutenção
7. [ ] CRUD de Fornecedores de Serviços
8. [ ] CRUD de Rotas/Destinos
9. [ ] Testes de integração
10. [ ] Revisar UX e responsividade

---

## 🎯 Métricas de Sucesso

**Após 8 semanas**:
- [ ] 100% dos cadastros funcionando
- [ ] QR Code com taxa de leitura > 90%
- [ ] Offline sync com 0 duplicações/perdas
- [ ] Fotos com qualidade legível
- [ ] Sistema mobile instalável (PWA)

**Após 1 mês em produção**:
- [ ] Adoção de 80%+ dos motoristas
- [ ] 70%+ de check-lists digitais (vs papel)
- [ ] Redução de 30% no tempo de lançamento
- [ ] NPS > 7/10

---

## 📚 Referências

- [POC QR Code Scanner](../../../../../pocs/01-qrcode-scanner/)
- [POC PWA Offline Sync](../../../../../pocs/02-pwa-offline-sync/)
- [POC Captura de Foto](../../../../../pocs/03-camera-capture/)
- [Decisão Final](../../../../../pocs/DECISAO_FINAL.md)
- [Plano v2.0](../.claude/plans/greedy-twirling-abelson.md)

---

**Última atualização**: 15/01/2026
**Status**: Estrutura base criada, Semana 1 iniciada 🚀
