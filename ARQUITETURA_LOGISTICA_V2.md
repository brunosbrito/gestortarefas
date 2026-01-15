# 🏗️ Arquitetura Técnica: Módulo Logística v2.0

**Data**: 15/01/2026
**Versão**: 1.0
**Status**: 📐 Planejamento Técnico Completo

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Camadas](#arquitetura-de-camadas)
3. [Schemas de Validação](#schemas-de-validação)
4. [Fluxos de Dados](#fluxos-de-dados)
5. [Dependências](#dependências)
6. [Estrutura de Rotas](#estrutura-de-rotas)
7. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
8. [Cronograma Detalhado](#cronograma-detalhado)

---

## 🎯 Visão Geral

### Objetivo
Implementar módulo completo de Logística com features mobile-first:
- ✅ QR Code para identificação de veículos
- ✅ PWA com funcionamento offline
- ✅ Captura de fotos via câmera
- ✅ Sincronização automática de dados

### Stack Tecnológico

```
Frontend:
├── React 18 + TypeScript
├── Vite (Build tool)
├── TanStack Query (Server state)
├── Zustand (Client state)
├── React Router v6 (Routing)
├── Shadcn/ui + Radix UI (Components)
├── Tailwind CSS (Styling)
├── Zod (Validation)
├── React Hook Form (Forms)
│
Mobile Features:
├── qrcode.react (QR generation)
├── jsqr (QR scanning)
├── IndexedDB (idb wrapper)
├── Service Workers (Workbox)
├── getUserMedia API (Camera)
│
Backend (Mock → Real):
└── Axios (HTTP client)
```

---

## 🏗️ Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │    Hooks     │      │
│  │ (React TSX)  │  │  (Shadcn/ui) │  │ (useVehicles)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                          │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │   TanStack Query       │  │    Zustand Stores      │    │
│  │   (Server State)       │  │    (UI State)          │    │
│  │   - Cache              │  │    - Filters           │    │
│  │   - Mutations          │  │    - Modals            │    │
│  │   - Invalidation       │  │    - Offline Status    │    │
│  └────────────────────────┘  └────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Services    │  │  QR Code     │  │  Offline     │      │
│  │  (API calls) │  │  Service     │  │  Sync        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER                           │
│  ┌────────────────────┐         ┌────────────────────┐      │
│  │   IndexedDB        │         │   Service Worker   │      │
│  │   (Offline Data)   │         │   (Cache Assets)   │      │
│  │   - Checklists     │         │   - JS/CSS         │      │
│  │   - Photos         │         │   - Images         │      │
│  │   - Sync Queue     │         │   - Fonts          │      │
│  └────────────────────┘         └────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                             │
│  (Mock em desenvolvimento → Real em produção)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Schemas de Validação (Zod)

### 1. Vehicle Schema

```typescript
// src/lib/validations/vehicleSchema.ts
import { z } from 'zod';

export const vehicleSchema = z.object({
  tipo: z.enum(['carro', 'empilhadeira', 'caminhao'], {
    required_error: 'Tipo de veículo é obrigatório',
  }),
  placa: z
    .string()
    .min(7, 'Placa deve ter 7 caracteres')
    .max(8, 'Placa deve ter no máximo 8 caracteres')
    .regex(/^[A-Z]{3}-?\d{4}$/, 'Formato inválido (ex: ABC-1234)'),
  modelo: z.string().min(2, 'Modelo é obrigatório').max(100),
  marca: z.string().min(2, 'Marca é obrigatória').max(50),
  ano: z
    .number()
    .int()
    .min(1990, 'Ano mínimo: 1990')
    .max(new Date().getFullYear() + 1, 'Ano inválido'),
  cor: z.string().max(30).optional(),
  km_atual: z.number().int().min(0, 'KM não pode ser negativo'),
  km_proxima_manutencao: z
    .number()
    .int()
    .min(0, 'KM não pode ser negativo'),
  renavam: z.string().length(11, 'RENAVAM deve ter 11 dígitos').optional(),
  chassi: z
    .string()
    .min(17, 'Chassi deve ter 17 caracteres')
    .max(17)
    .optional(),
  crlv_validade: z.string().refine((date) => {
    const d = new Date(date);
    return d > new Date();
  }, 'CRLV vencido'),
  seguro_validade: z.string().refine((date) => {
    const d = new Date(date);
    return d > new Date();
  }, 'Seguro vencido'),
  seguro_numero: z.string().max(50).optional(),
  status: z.enum(['disponivel', 'em_uso', 'em_manutencao', 'inativo']),
  observacoes: z.string().max(500).optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

// Validação adicional: km_proxima_manutencao > km_atual
export const validateVehicleKM = (data: VehicleFormData) => {
  if (data.km_proxima_manutencao <= data.km_atual) {
    return {
      isValid: false,
      error: 'KM da próxima manutenção deve ser maior que KM atual',
    };
  }
  return { isValid: true };
};
```

### 2. Driver Schema

```typescript
// src/lib/validations/driverSchema.ts
import { z } from 'zod';

// Validador de CPF
const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false; // Todos dígitos iguais

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;

  return true;
};

export const driverSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto').max(100, 'Nome muito longo'),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato inválido (xxx.xxx.xxx-xx)')
    .refine(validateCPF, 'CPF inválido'),
  cnh_numero: z.string().min(9, 'CNH inválida').max(11, 'CNH inválida'),
  cnh_categoria: z.enum(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'], {
    required_error: 'Categoria da CNH é obrigatória',
  }),
  cnh_validade: z.string().refine((date) => {
    const d = new Date(date);
    return d > new Date();
  }, 'CNH vencida'),
  telefone: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato inválido (xx) xxxxx-xxxx'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  status: z.enum(['ativo', 'inativo', 'ferias', 'afastado']),
  observacoes: z.string().max(500).optional(),
});

export type DriverFormData = z.infer<typeof driverSchema>;
```

### 3. Transportadora Schema

```typescript
// src/lib/validations/transportadoraSchema.ts
import { z } from 'zod';

// Validador de CNPJ
const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let pos = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleaned.charAt(12))) return false;

  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleaned.charAt(13))) return false;

  return true;
};

export const transportadoraSchema = z.object({
  razao_social: z.string().min(3, 'Razão social muito curta').max(200),
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Formato inválido (xx.xxx.xxx/xxxx-xx)')
    .refine(validateCNPJ, 'CNPJ inválido'),
  telefone: z
    .string()
    .regex(/^\(\d{2}\) \d{4}-\d{4}$/, 'Formato inválido (xx) xxxx-xxxx'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  endereco: z.string().max(300).optional(),
  rating: z
    .number()
    .int()
    .min(1, 'Avaliação mínima: 1')
    .max(5, 'Avaliação máxima: 5')
    .optional(),
  observacoes: z.string().max(500).optional(),
});

export type TransportadoraFormData = z.infer<typeof transportadoraSchema>;
```

### 4. Checklist Schema (Futuro - Semana 7-8)

```typescript
// src/lib/validations/checklistSchema.ts
import { z } from 'zod';

export const checklistSaidaSchema = z.object({
  veiculo_id: z.number().int().positive(),
  motorista_id: z.number().int().positive(),
  km_inicial: z.number().int().min(0),
  combustivel_nivel: z.enum(['cheio', '3/4', '1/2', '1/4', 'reserva']),
  destino_id: z.number().int().positive().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      descricao: z.string(),
      checked: z.boolean(),
      observacao: z.string().max(200).optional(),
    })
  ),
  fotos_danos: z.array(z.string()).max(5, 'Máximo 5 fotos'),
  observacoes: z.string().max(500).optional(),
});

export const checklistRetornoSchema = z.object({
  checklist_saida_id: z.number().int().positive(),
  km_final: z.number().int().min(0),
  combustivel_nivel: z.enum(['cheio', '3/4', '1/2', '1/4', 'reserva']),
  items: z.array(
    z.object({
      id: z.string(),
      descricao: z.string(),
      checked: z.boolean(),
      observacao: z.string().max(200).optional(),
    })
  ),
  novos_danos: z.boolean(),
  fotos_danos: z.array(z.string()).max(5),
  limpeza_ok: z.boolean(),
  observacoes: z.string().max(500).optional(),
});

// Validação: km_final > km_inicial
export const validateChecklistKM = (
  kmInicial: number,
  kmFinal: number
): { isValid: boolean; error?: string } => {
  if (kmFinal <= kmInicial) {
    return {
      isValid: false,
      error: 'KM final deve ser maior que KM inicial',
    };
  }
  return { isValid: true };
};
```

---

## 🔄 Fluxos de Dados

### Fluxo 1: CRUD Básico (Online)

```
┌─────────────┐
│   Usuário   │
│  clica em   │
│ "Novo Item" │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Dialog Modal      │
│  (React Hook Form)  │
│  - Validação Zod    │
│  - Máscaras input   │
└──────┬──────────────┘
       │ Submit
       ▼
┌─────────────────────┐
│  useMutation        │
│  (TanStack Query)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Service.create()   │
│  (Axios POST)       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Backend API        │
│  (Mock → Real)      │
└──────┬──────────────┘
       │ Response
       ▼
┌─────────────────────┐
│  invalidateQueries  │
│  (Refetch lista)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Toast Success      │
│  + Close Modal      │
└─────────────────────┘
```

### Fluxo 2: QR Code Scan (Semana 3-4)

```
┌────────────────┐
│  Motorista     │
│  aponta câmera │
│  para QR Code  │
└───────┬────────┘
        │
        ▼
┌────────────────────┐
│ <QRCodeScanner>    │
│  - getUserMedia    │
│  - jsQR library    │
└───────┬────────────┘
        │ Detecta QR
        ▼
┌────────────────────┐
│  parseQRCode()     │
│  - Valida UUID     │
│  - Extrai veiculo_id│
└───────┬────────────┘
        │
        ▼
┌────────────────────┐
│ vehiclesService    │
│  .getById(id)      │
└───────┬────────────┘
        │ Success
        ▼
┌────────────────────┐
│ Abre Check-list    │
│ com dados do       │
│ veículo carregados │
└────────────────────┘

┌────────────────────┐
│ Se scan falhar 3x: │
│ Fallback: Input    │
│ manual de placa    │
└────────────────────┘
```

### Fluxo 3: Offline Sync (Semana 5-6)

```
ONLINE:
┌────────────────┐
│  Criar Item    │
└───────┬────────┘
        │
        ▼
┌────────────────────┐
│  POST /api         │
│  (Axios)           │
└───────┬────────────┘
        │ Success
        ▼
┌────────────────────┐
│  Toast Success     │
└────────────────────┘

OFFLINE:
┌────────────────┐
│  Criar Item    │
└───────┬────────┘
        │
        ▼
┌────────────────────┐
│  Detecta offline   │
│  (navigator.onLine)│
└───────┬────────────┘
        │
        ▼
┌────────────────────┐
│  Salva IndexedDB   │
│  - UUID único      │
│  - Status: pending │
│  - Timestamp       │
└───────┬────────────┘
        │
        ▼
┌────────────────────┐
│  Badge "Pendente"  │
│  + Toast "Offline" │
└────────────────────┘

VOLTA ONLINE:
┌────────────────────┐
│  Detecta online    │
│  (event listener)  │
└───────┬────────────┘
        │
        ▼
┌────────────────────┐
│  Busca pendentes   │
│  (IndexedDB query) │
└───────┬────────────┘
        │
        ▼
┌────────────────────┐
│  Para cada item:   │
│  - POST /api       │
│  - Retry 5x        │
│  - Backoff exp.    │
└───────┬────────────┘
        │ Success
        ▼
┌────────────────────┐
│  Remove IndexedDB  │
│  + Toast "Synced"  │
└────────────────────┘
```

### Fluxo 4: Captura de Foto (Semana 7)

```
┌────────────────┐
│  Click em      │
│  "Tirar Foto"  │
└───────┬────────┘
        │
        ▼
┌────────────────────┐
│  Solicita permissão│
│  (getUserMedia)    │
└───────┬────────────┘
        │
   ┌────┴────┐
   │         │
Granted   Denied
   │         │
   │         ▼
   │    ┌─────────────┐
   │    │ Show Tutorial│
   │    │ + Fallback  │
   │    │ (Upload)    │
   │    └─────────────┘
   │
   ▼
┌────────────────────┐
│  Preview Câmera    │
│  (Fullscreen)      │
└───────┬────────────┘
        │ Capture
        ▼
┌────────────────────┐
│  Canvas.toBlob()   │
│  - JPEG 80%        │
│  - Max 1920x1080   │
└───────┬────────────┘
        │
        ▼
┌────────────────────┐
│  Preview Foto      │
│  + "Recapturar"    │
└───────┬────────────┘
        │ Confirmar
        ▼
┌────────────────────┐
│  Compressão OK?    │
│  (< 500KB)         │
└───────┬────────────┘
        │ Sim
        ▼
┌────────────────────┐
│  Adiciona ao form  │
│  (Base64 ou Blob)  │
└────────────────────┘
```

---

## 📦 Dependências

### Dependências Principais (package.json)

```json
{
  "dependencies": {
    // Já instaladas:
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.14.2",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.2",
    "@hookform/resolvers": "^3.3.3",

    // A instalar (Semana 1-2):
    "input-mask-react": "^1.0.0",  // Máscaras CPF, CNPJ, telefone
    "date-fns": "^2.30.0",          // Manipulação de datas

    // A instalar (Semana 3-4 - QR Code):
    "qrcode.react": "^3.1.0",       // Geração de QR Code
    "jsqr": "^1.4.0",               // Leitura de QR Code

    // A instalar (Semana 5-6 - PWA):
    "idb": "^8.0.0",                // IndexedDB wrapper
    "workbox-webpack-plugin": "^7.0.0",  // Service Workers
    "workbox-window": "^7.0.0"      // Service Worker client
  },
  "devDependencies": {
    // Já instaladas:
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",

    // A instalar (Semana 3-4):
    "@types/jsqr": "^1.4.2"
  }
}
```

### Comandos de Instalação

```bash
# Semana 1-2: Formulários e Validação
npm install input-mask-react date-fns

# Semana 3-4: QR Code
npm install qrcode.react jsqr
npm install -D @types/jsqr

# Semana 5-6: PWA + Offline
npm install idb workbox-webpack-plugin workbox-window

# Semana 7-8: Nenhuma dependência nova (APIs nativas do navegador)
```

---

## 🛣️ Estrutura de Rotas

### Rotas a Adicionar no App.tsx

```typescript
// src/App.tsx
import { lazy } from 'react';

// Lazy loading das páginas de Logística
const VeiculosPage = lazy(() => import('@/pages/suprimentos/logistica/veiculos'));
const MotoristasPage = lazy(() => import('@/pages/suprimentos/logistica/motoristas'));
const TransportadorasPage = lazy(() => import('@/pages/suprimentos/logistica/transportadoras'));
const ManutençõesPage = lazy(() => import('@/pages/suprimentos/logistica/manutencoes'));
const ChecklistSaidaPage = lazy(() => import('@/pages/suprimentos/logistica/check-lists/saida'));
const ChecklistRetornoPage = lazy(() => import('@/pages/suprimentos/logistica/check-lists/retorno'));

// Adicionar dentro de <Routes>:
<Route path="/suprimentos/logistica">
  <Route path="veiculos" element={<VeiculosPage />} />
  <Route path="motoristas" element={<MotoristasPage />} />
  <Route path="transportadoras" element={<TransportadorasPage />} />
  <Route path="manutencoes" element={<ManutençõesPage />} />
  <Route path="check-lists/saida" element={<ChecklistSaidaPage />} />
  <Route path="check-lists/retorno" element={<ChecklistRetornoPage />} />
</Route>
```

### Menu no Sidebar

```typescript
// Adicionar ao menu de Suprimentos:
{
  title: 'Logística',
  icon: Truck,
  items: [
    { title: 'Veículos', href: '/suprimentos/logistica/veiculos' },
    { title: 'Motoristas', href: '/suprimentos/logistica/motoristas' },
    { title: 'Transportadoras', href: '/suprimentos/logistica/transportadoras' },
    { title: 'Manutenções', href: '/suprimentos/logistica/manutencoes' },
    { title: 'Check-list Saída', href: '/suprimentos/logistica/check-lists/saida' },
    { title: 'Check-list Retorno', href: '/suprimentos/logistica/check-lists/retorno' },
  ],
}
```

---

## 🎨 Padrões de Desenvolvimento

### 1. Padrão de Componente com Form

```typescript
// src/pages/suprimentos/logistica/veiculos/components/VehicleCreateDialog.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, VehicleFormData } from '@/lib/validations/vehicleSchema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import vehiclesService from '@/services/suprimentos/logistica/vehiclesService';
import { toast } from '@/hooks/use-toast';

export function VehicleCreateDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      tipo: 'carro',
      status: 'disponivel',
      km_atual: 0,
      km_proxima_manutencao: 5000,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: VehicleFormData) => vehiclesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Veículo criado com sucesso!' });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar veículo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    const kmValidation = validateVehicleKM(data);
    if (!kmValidation.isValid) {
      form.setError('km_proxima_manutencao', {
        message: kmValidation.error,
      });
      return;
    }
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Veículo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campos do formulário */}
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Padrão de Hook Customizado

```typescript
// src/hooks/suprimentos/logistica/useVehicles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vehiclesService from '@/services/suprimentos/logistica/vehiclesService';
import { VehicleCreate, VehicleUpdate } from '@/interfaces/suprimentos/logistica/VehicleInterface';

const QUERY_KEY = ['vehicles'];

export const useVehicles = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => vehiclesService.getAll(),
    select: (data) => data.data.vehicles,
  });
};

export const useVehicle = (id: number) => {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => vehiclesService.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VehicleCreate) => vehiclesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleUpdate }) =>
      vehiclesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vehiclesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
```

### 3. Padrão de Zustand Store (UI State)

```typescript
// src/stores/logisticaStore.ts
import { create } from 'zustand';

interface LogisticaStore {
  // Modals
  vehicleDialogOpen: boolean;
  setVehicleDialogOpen: (open: boolean) => void;

  // Filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;

  // Offline status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  pendingSyncCount: number;
  setPendingSyncCount: (count: number) => void;

  // Actions
  clearFilters: () => void;
}

export const useLogisticaStore = create<LogisticaStore>((set) => ({
  vehicleDialogOpen: false,
  setVehicleDialogOpen: (open) => set({ vehicleDialogOpen: open }),

  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),

  statusFilter: null,
  setStatusFilter: (status) => set({ statusFilter: status }),

  isOnline: navigator.onLine,
  setIsOnline: (online) => set({ isOnline: online }),

  pendingSyncCount: 0,
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),

  clearFilters: () => set({ searchTerm: '', statusFilter: null }),
}));
```

---

## 📅 Cronograma Detalhado (8 semanas)

### ✅ Semana 1 (22-26 Jan): Formulários CRUD Base

**Segunda-feira**:
- [ ] Criar `VehicleCreateDialog.tsx` + validação Zod
- [ ] Criar `VehicleEditDialog.tsx`
- [ ] Hook `useVehicles()` com TanStack Query
- [ ] Integrar na página de listagem

**Terça-feira**:
- [ ] Criar `DriverCreateDialog.tsx` + validação CPF
- [ ] Criar `DriverEditDialog.tsx`
- [ ] Hook `useDrivers()`
- [ ] Máscaras de input (CPF, telefone)

**Quarta-feira**:
- [ ] Criar `TransportadoraCreateDialog.tsx` + validação CNPJ
- [ ] Criar `TransportadoraEditDialog.tsx`
- [ ] Hook `useTransportadoras()`
- [ ] Component de rating (estrelas)

**Quinta-feira**:
- [ ] Adicionar rotas no `App.tsx`
- [ ] Adicionar menu no Sidebar
- [ ] Testes de integração dos 3 CRUDs
- [ ] Ajustes de UX e responsividade

**Sexta-feira**:
- [ ] Code review
- [ ] Correções de bugs
- [ ] Documentação inline (JSDoc)

---

### ⏸️ Semana 2 (29 Jan - 02 Fev): Cadastros Adicionais

**Segunda-terça**:
- [ ] CRUD Tipos de Manutenção (interface, service, página)
- [ ] CRUD Fornecedores de Serviços

**Quarta-quinta**:
- [ ] CRUD Rotas/Destinos
- [ ] Testes de integração

**Sexta**:
- [ ] Review Semana 1-2
- [ ] Preparar ambiente para Semana 3 (instalar deps QR Code)

---

### ⏸️ Semana 3-4 (05-16 Fev): QR Code

**Semana 3**:
- [ ] Geração de QR Codes (UUID único por veículo)
- [ ] Página de impressão (PDF com 20 QR Codes)
- [ ] Component `<QRCodeScanner>`
- [ ] Página de scan (mobile-first)

**Semana 4**:
- [ ] Fallback: Input manual de placa
- [ ] Validação de QR Code (token expiration)
- [ ] Testes em 5+ dispositivos reais
- [ ] Documentar taxa de sucesso

---

### ⏸️ Semana 5-6 (19 Fev - 02 Mar): PWA + Offline

**Semana 5**:
- [ ] Setup PWA (manifest.json, ícones)
- [ ] Service Worker básico (cache assets)
- [ ] IndexedDB wrapper (`offline-db.ts`)
- [ ] Component `<OfflineSyncIndicator>`

**Semana 6**:
- [ ] Sync service (retry + backoff)
- [ ] Event listeners (online/offline)
- [ ] Badge "Pendente Sincronização"
- [ ] Testes dos 10 cenários edge

---

### ⏸️ Semana 7 (05-09 Mar): Captura de Foto

- [ ] Component `<CameraCapture>`
- [ ] Solicitar permissões + tutorial
- [ ] Preview + Recapturar
- [ ] Compressão JPEG 80%
- [ ] Upload da galeria (fallback)
- [ ] Testes em dispositivos reais

---

### ⏸️ Semana 8 (12-16 Mar): Check-lists

- [ ] Check-list de Saída (interface + service)
- [ ] Check-list de Retorno
- [ ] Integração: QR → Câmera → Offline
- [ ] Registro de KM (validação)
- [ ] Fotos de danos
- [ ] Testes E2E completos

---

## ✅ Checklist de Validação (Pós-Implementação)

### Técnico:
- [ ] TypeScript strict mode (0 erros)
- [ ] ESLint pass (0 warnings críticos)
- [ ] Bundle size < 500KB (inicial)
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 95
- [ ] Compatibilidade: Chrome 90+, Safari 14+

### Funcional:
- [ ] Todos os CRUDs funcionam (Create, Read, Update, Delete)
- [ ] Validações Zod previnem dados inválidos
- [ ] Máscaras de input formatam corretamente
- [ ] Toasts aparecem em sucesso/erro
- [ ] Modals abrem/fecham suavemente
- [ ] Busca filtra em tempo real

### Mobile (Semanas 3-8):
- [ ] QR Code lê com > 90% taxa sucesso
- [ ] Offline sync: 0 duplicações, 0 perdas
- [ ] Fotos: qualidade legível, < 500KB
- [ ] PWA instalável (manifest válido)

---

## 📚 Referências Técnicas

### APIs Web Utilizadas:
- [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### Bibliotecas:
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

**Documento de Arquitetura v1.0 Completo ✅**
**Próximo**: Iniciar Implementação - Semana 1 (Segunda-feira, 22/01/2026)

*Última atualização: 15/01/2026*
