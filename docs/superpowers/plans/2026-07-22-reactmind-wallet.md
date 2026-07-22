# ReactMind Wallet (React 19) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a SPA ReactMind Wallet (carteira digital de estudo) com React 19, Vite, TanStack Query, MSW e testes essenciais — pronta para plugar `vuemind-api` depois.

**Architecture:** SPA feature-first (`auth`, `wallet`, `transfers`, `beneficiaries`) falando com `/api/v1` via `shared/http` (`fetch`). Em dev/test, MSW atende o contrato; depois, proxy/`baseUrl` aponta para Spring. Server state com TanStack Query; sessão com `AuthContext` + `sessionStorage`. Sem Redux, sem Next.js, sem i18n/tema elaborados.

**Tech Stack:** React 19, Vite, TypeScript, React Router 7, TanStack Query 5, MSW 2, Vitest, Testing Library, CSS variables, npm.

## Global Constraints

- Package manager: **npm** (`package-lock.json`)
- React **19** + Vite; TypeScript estrito
- Valores monetários no contrato em **centavos** (`integer`)
- Base path API: `/api/v1`
- Erros API: `{ code, message, correlationId }`
- Login mock: `demo@vuemind.dev` / `demo123`
- Token mock: `mock-jwt-demo` em `sessionStorage` (chave `reactmind.token`)
- PIX MVP: favorecido existente obrigatório
- Header `Idempotency-Key` só no confirm do PIX
- Sem Next.js, sem Redux, sem UI kit pesada, sem i18n/tema elaborados
- Comentários curtos só nos pontos de entrevista (Query, Context, guard, executePix)
- Sem rastros de IA em commits/código versionado
- Spec: `docs/superpowers/specs/2026-07-22-reactmind-wallet-design.md`
- Contrato fonte (copiar): `/home/frm/Documentos/wks-poc/vuemind/docs/contracts/vuemind-wallet-openapi.yaml`

---

## File Structure (mapa)

```
reactmind/
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  index.html
  docs/
    contracts/vuemind-wallet-openapi.yaml
    guides/entrevista-react.md
    superpowers/specs/...
    superpowers/plans/...
  public/
    mockServiceWorker.js
  src/
    main.tsx
    App.tsx
    styles.css
    vite-env.d.ts
    app/
      providers.tsx
      router.tsx
      layout/AppShell.tsx
    features/
      auth/
        types.ts
        api.ts
        AuthContext.tsx
        RequireAuth.tsx
        LoginPage.tsx
        auth.test.tsx
      wallet/
        types.ts
        api.ts
        hooks.ts
        DashboardPage.tsx
        TransactionsPage.tsx
      beneficiaries/
        types.ts
        api.ts
        hooks.ts
        BeneficiariesPage.tsx
      transfers/
        types.ts
        api.ts
        hooks.ts
        pixValidation.ts
        pixValidation.test.ts
        TransferPixPage.tsx
    shared/
      types/api.ts
      utils/money.ts
      utils/money.test.ts
      utils/id.ts
      http/client.ts
      http/errors.ts
      ui/Button.tsx
      ui/Input.tsx
      ui/LoadingBlock.tsx
      ui/ErrorBanner.tsx
      ui/EmptyState.tsx
    mocks/
      browser.ts
      data/db.ts
      handlers/
        auth.handlers.ts
        wallet.handlers.ts
        beneficiaries.handlers.ts
        transfers.handlers.ts
        transfers.handlers.test.ts
        index.ts
```

Path alias em `vite.config.ts` + `tsconfig.app.json`:

```ts
resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
```

```json
"paths": { "@/*": ["src/*"] }
```

---

### Task 1: Scaffold Vite React 19 + contrato + money utils (TDD)

**Files:**
- Create (via CLI): app Vite React-TS em `/home/frm/Documentos/wks-poc/reactmind` (já tem `.git` e `docs/`)
- Create: `docs/contracts/vuemind-wallet-openapi.yaml` (cópia)
- Create: `src/shared/utils/money.ts`, `src/shared/utils/money.test.ts`, `src/shared/utils/id.ts`, `src/shared/types/api.ts`
- Modify: `vite.config.ts`, `tsconfig.app.json`, `package.json` (scripts test)

**Interfaces:**
- Consumes: nada
- Produces: `formatCents(cents, locale?, currency?)`, `parseReaisToCents(input)`, `createCorrelationId()`, `createIdempotencyKey()`, `ApiErrorBody`

- [ ] **Step 1: Scaffold Vite sem destruir docs**

```bash
cd /home/frm/Documentos/wks-poc
npm create vite@latest reactmind-tmp -- --template react-ts
# Copiar artefatos do scaffold para reactmind SEM apagar docs/ nem .git
cp -n /home/frm/Documentos/wks-poc/reactmind-tmp/package.json /home/frm/Documentos/wks-poc/reactmind/
cp -rn /home/frm/Documentos/wks-poc/reactmind-tmp/{index.html,vite.config.ts,tsconfig*.json,src,public,.gitignore} /home/frm/Documentos/wks-poc/reactmind/ 2>/dev/null || true
# Se cp -n falhar por arquivos existentes, copiar seletivamente os do scaffold
rsync -a --ignore-existing /home/frm/Documentos/wks-poc/reactmind-tmp/ /home/frm/Documentos/wks-poc/reactmind/ \
  --exclude .git --exclude docs
cd /home/frm/Documentos/wks-poc/reactmind
npm install
npm install react@19 react-dom@19
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
rm -rf /home/frm/Documentos/wks-poc/reactmind-tmp
```

Garantir React 19 em `package.json` (`"react": "^19..."`). Remover boilerplate `App.css` / conteúdo default depois (Task 4).

- [ ] **Step 2: Copiar OpenAPI**

```bash
mkdir -p docs/contracts
cp /home/frm/Documentos/wks-poc/vuemind/docs/contracts/vuemind-wallet-openapi.yaml \
  docs/contracts/vuemind-wallet-openapi.yaml
```

- [ ] **Step 3: Configurar alias `@` + Vitest**

`vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

`src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest'
```

Em `tsconfig.app.json`, em `compilerOptions`:

```json
{
  "baseUrl": ".",
  "paths": { "@/*": ["src/*"] },
  "types": ["vitest/globals"]
}
```

Em `package.json`, scripts:

```json
{
  "test": "vitest run",
  "typecheck": "tsc -b --noEmit"
}
```

- [ ] **Step 4: Escrever teste falhando de `money`**

Create `src/shared/utils/money.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { formatCents, parseReaisToCents } from './money'

describe('money', () => {
  it('formatCents formata BRL a partir de centavos', () => {
    expect(formatCents(250_000, 'pt-BR')).toContain('2.500,00')
  })

  it('parseReaisToCents converte string pt-BR simples', () => {
    expect(parseReaisToCents('10,50')).toBe(1050)
    expect(parseReaisToCents('10')).toBe(1000)
  })

  it('parseReaisToCents rejeita entrada inválida', () => {
    expect(() => parseReaisToCents('abc')).toThrowError('INVALID_MONEY')
  })
})
```

- [ ] **Step 5: Rodar teste e ver falha**

```bash
cd /home/frm/Documentos/wks-poc/reactmind
npm test -- src/shared/utils/money.test.ts
```

Expected: FAIL (módulo `./money` inexistente)

- [ ] **Step 6: Implementar money, id, ApiErrorBody**

Create `src/shared/utils/money.ts`:

```typescript
export function formatCents(
  cents: number,
  locale = 'pt-BR',
  currency = 'BRL',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function parseReaisToCents(input: string): number {
  const normalized = input.trim().replace(/\s/g, '').replace(',', '.')
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error('INVALID_MONEY')
  }
  const [reais, frac = ''] = normalized.split('.')
  return Number(reais) * 100 + Number(frac.padEnd(2, '0').slice(0, 2))
}
```

Create `src/shared/utils/id.ts`:

```typescript
export function createCorrelationId(): string {
  return crypto.randomUUID()
}

export function createIdempotencyKey(): string {
  return crypto.randomUUID()
}
```

Create `src/shared/types/api.ts`:

```typescript
export type ApiErrorBody = {
  code: string
  message: string
  correlationId: string
}
```

- [ ] **Step 7: Rodar testes e ver passar**

```bash
npm test -- src/shared/utils/money.test.ts
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig*.json index.html src public docs/contracts .gitignore
git commit -m "$(cat <<'EOF'
chore: scaffold Vite React 19 com money utils e contrato OpenAPI

EOF
)"
```

---

### Task 2: MSW — db, handlers e `executePix` (TDD)

**Files:**
- Create: `src/mocks/data/db.ts`
- Create: `src/mocks/handlers/auth.handlers.ts`
- Create: `src/mocks/handlers/wallet.handlers.ts`
- Create: `src/mocks/handlers/beneficiaries.handlers.ts`
- Create: `src/mocks/handlers/transfers.handlers.ts`
- Create: `src/mocks/handlers/transfers.handlers.test.ts`
- Create: `src/mocks/handlers/index.ts`
- Create: `src/mocks/browser.ts`
- Create: `public/mockServiceWorker.js` (via `npx msw init public/`)
- Modify: `package.json`, `src/main.tsx`

**Interfaces:**
- Consumes: `ApiErrorBody`, `createCorrelationId`
- Produces: `getDb()`, `resetDb()`, `executePix(db, input)`, `handlers`, `worker`

- [ ] **Step 1: Instalar MSW e gerar worker**

```bash
npm install -D msw@2
npx msw init public/ --save
```

- [ ] **Step 2: Escrever teste falhando de `executePix`**

Create `src/mocks/handlers/transfers.handlers.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { executePix } from './transfers.handlers'
import { getDb, resetDb } from '../data/db'

describe('executePix', () => {
  beforeEach(() => resetDb())

  it('debita saldo e registra PIX_OUT', () => {
    const db = getDb()
    const before = db.availableCents
    const transfer = executePix(db, {
      beneficiaryId: 'b1',
      amountCents: 1_000,
      idempotencyKey: 'k1',
    })
    expect(transfer.status).toBe('COMPLETED')
    expect(db.availableCents).toBe(before - 1_000)
    expect(db.transactions[0].type).toBe('PIX_OUT')
  })

  it('rejeita saldo insuficiente', () => {
    const db = getDb()
    expect(() =>
      executePix(db, {
        beneficiaryId: 'b1',
        amountCents: db.availableCents + 1,
        idempotencyKey: 'k2',
      }),
    ).toThrowError('INSUFFICIENT_FUNDS')
  })

  it('é idempotente para a mesma chave', () => {
    const db = getDb()
    const a = executePix(db, {
      beneficiaryId: 'b1',
      amountCents: 500,
      idempotencyKey: 'same',
    })
    const balance = db.availableCents
    const b = executePix(db, {
      beneficiaryId: 'b1',
      amountCents: 500,
      idempotencyKey: 'same',
    })
    expect(b.id).toBe(a.id)
    expect(db.availableCents).toBe(balance)
  })
})
```

- [ ] **Step 3: Rodar e ver falha**

```bash
npm test -- src/mocks/handlers/transfers.handlers.test.ts
```

Expected: FAIL

- [ ] **Step 4: Implementar `db.ts`**

Create `src/mocks/data/db.ts` (igual ao Vue/Angular — seed com `demo@vuemind.dev` / `demo123`, saldo `250_000`, favorecidos `b1`/`b2`):

```typescript
export type MockUser = {
  id: string
  name: string
  email: string
  password: string
}

export type Beneficiary = {
  id: string
  name: string
  pixKey: string
}

export type Transaction = {
  id: string
  type: 'PIX_OUT' | 'PIX_IN' | 'TED'
  amountCents: number
  description: string
  createdAt: string
  counterparty: string
}

export type Transfer = {
  id: string
  beneficiaryId: string
  amountCents: number
  status: 'COMPLETED'
  createdAt: string
}

export type Db = {
  user: MockUser
  availableCents: number
  beneficiaries: Beneficiary[]
  transactions: Transaction[]
  transfers: Transfer[]
  idempotency: Map<string, Transfer>
}

const seed = (): Db => ({
  user: {
    id: 'u1',
    name: 'Marion Demo',
    email: 'demo@vuemind.dev',
    password: 'demo123',
  },
  availableCents: 250_000,
  beneficiaries: [
    { id: 'b1', name: 'Ana Silva', pixKey: 'ana@email.com' },
    { id: 'b2', name: 'Mercado Central', pixKey: '11222333000181' },
  ],
  transactions: [
    {
      id: 't1',
      type: 'PIX_IN',
      amountCents: 50_000,
      description: 'Recebido',
      createdAt: '2026-07-20T10:00:00.000Z',
      counterparty: 'Carlos',
    },
  ],
  transfers: [],
  idempotency: new Map(),
})

let db = seed()

export function getDb(): Db {
  return db
}

export function resetDb(): void {
  db = seed()
}
```

- [ ] **Step 5: Implementar handlers**

Create `src/mocks/handlers/transfers.handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'
import type { Db, Transfer } from '../data/db'
import { getDb } from '../data/db'
import { createCorrelationId } from '@/shared/utils/id'
import type { ApiErrorBody } from '@/shared/types/api'

export type ExecutePixInput = {
  beneficiaryId: string
  amountCents: number
  idempotencyKey: string
}

/** Regra de negócio pura — testável sem rede (espelha PixService no Spring). */
export function executePix(db: Db, input: ExecutePixInput): Transfer {
  const cached = db.idempotency.get(input.idempotencyKey)
  if (cached) return cached

  const beneficiary = db.beneficiaries.find((item) => item.id === input.beneficiaryId)
  if (!beneficiary) throw new Error('BENEFICIARY_NOT_FOUND')
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error('INVALID_AMOUNT')
  }
  if (db.availableCents < input.amountCents) throw new Error('INSUFFICIENT_FUNDS')

  db.availableCents -= input.amountCents
  const transfer: Transfer = {
    id: crypto.randomUUID(),
    beneficiaryId: input.beneficiaryId,
    amountCents: input.amountCents,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
  }
  db.transfers.push(transfer)
  db.transactions.unshift({
    id: crypto.randomUUID(),
    type: 'PIX_OUT',
    amountCents: input.amountCents,
    description: `PIX para ${beneficiary.name}`,
    createdAt: transfer.createdAt,
    counterparty: beneficiary.name,
  })
  db.idempotency.set(input.idempotencyKey, transfer)
  return transfer
}

const ERROR_STATUS: Record<string, number> = {
  BENEFICIARY_NOT_FOUND: 400,
  INVALID_AMOUNT: 400,
  INSUFFICIENT_FUNDS: 409,
}

const ERROR_MESSAGE: Record<string, string> = {
  BENEFICIARY_NOT_FOUND: 'Favorecido não encontrado.',
  INVALID_AMOUNT: 'O valor da transferência deve ser positivo.',
  INSUFFICIENT_FUNDS: 'Saldo insuficiente para completar essa transferência.',
}

function toApiError(code: string, correlationId: string): ApiErrorBody {
  return {
    code,
    message: ERROR_MESSAGE[code] ?? 'Erro ao processar a transferência.',
    correlationId,
  }
}

export const transfersHandlers = [
  http.post('*/api/v1/transfers/pix', async ({ request }) => {
    const db = getDb()
    const correlationId = request.headers.get('X-Correlation-Id') ?? createCorrelationId()
    const idempotencyKey = request.headers.get('Idempotency-Key') ?? crypto.randomUUID()
    const body = (await request.json()) as { beneficiaryId: string; amountCents: number }
    try {
      const transfer = executePix(db, { ...body, idempotencyKey })
      return HttpResponse.json(transfer, { status: 201 })
    } catch (error) {
      const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      return HttpResponse.json(toApiError(code, correlationId), {
        status: ERROR_STATUS[code] ?? 400,
      })
    }
  }),

  http.get('*/api/v1/transfers/:id', ({ params }) => {
    const db = getDb()
    const transfer = db.transfers.find((item) => item.id === params.id)
    if (!transfer) {
      return HttpResponse.json(toApiError('TRANSFER_NOT_FOUND', createCorrelationId()), {
        status: 404,
      })
    }
    return HttpResponse.json(transfer)
  }),
]
```

Create `src/mocks/handlers/auth.handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'
import { getDb } from '../data/db'
import { createCorrelationId } from '@/shared/utils/id'
import type { ApiErrorBody } from '@/shared/types/api'

const MOCK_TOKEN = 'mock-jwt-demo'

export const authHandlers = [
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const correlationId = request.headers.get('X-Correlation-Id') ?? createCorrelationId()
    const { email, password } = (await request.json()) as {
      email: string
      password: string
    }
    const db = getDb()
    if (email !== db.user.email || password !== db.user.password) {
      const error: ApiErrorBody = {
        code: 'INVALID_CREDENTIALS',
        message: 'Email ou senha inválidos.',
        correlationId,
      }
      return HttpResponse.json(error, { status: 401 })
    }
    return HttpResponse.json({
      accessToken: MOCK_TOKEN,
      user: { id: db.user.id, name: db.user.name, email: db.user.email },
    })
  }),
]
```

Create `src/mocks/handlers/wallet.handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'
import { getDb } from '../data/db'

export const walletHandlers = [
  http.get('*/api/v1/wallet/balance', () => {
    const db = getDb()
    return HttpResponse.json({
      availableCents: db.availableCents,
      currency: 'BRL',
    })
  }),

  http.get('*/api/v1/wallet/transactions', ({ request }) => {
    const db = getDb()
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    let items = [...db.transactions]
    if (type) items = items.filter((t) => t.type === type)
    return HttpResponse.json({ items })
  }),
]
```

Create `src/mocks/handlers/beneficiaries.handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'
import { getDb } from '../data/db'
import { createCorrelationId } from '@/shared/utils/id'
import type { ApiErrorBody } from '@/shared/types/api'

export const beneficiariesHandlers = [
  http.get('*/api/v1/beneficiaries', () => {
    const db = getDb()
    return HttpResponse.json({ items: db.beneficiaries })
  }),

  http.post('*/api/v1/beneficiaries', async ({ request }) => {
    const db = getDb()
    const correlationId = request.headers.get('X-Correlation-Id') ?? createCorrelationId()
    const body = (await request.json()) as { name: string; pixKey: string }
    if (!body.name?.trim() || !body.pixKey?.trim()) {
      const error: ApiErrorBody = {
        code: 'INVALID_BENEFICIARY',
        message: 'Nome e chave PIX são obrigatórios.',
        correlationId,
      }
      return HttpResponse.json(error, { status: 400 })
    }
    const created = {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      pixKey: body.pixKey.trim(),
    }
    db.beneficiaries.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.delete('*/api/v1/beneficiaries/:id', ({ params, request }) => {
    const db = getDb()
    const correlationId = request.headers.get('X-Correlation-Id') ?? createCorrelationId()
    const idx = db.beneficiaries.findIndex((b) => b.id === params.id)
    if (idx < 0) {
      const error: ApiErrorBody = {
        code: 'BENEFICIARY_NOT_FOUND',
        message: 'Favorecido não encontrado.',
        correlationId,
      }
      return HttpResponse.json(error, { status: 404 })
    }
    db.beneficiaries.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
```

Create `src/mocks/handlers/index.ts`:

```typescript
import { authHandlers } from './auth.handlers'
import { walletHandlers } from './wallet.handlers'
import { beneficiariesHandlers } from './beneficiaries.handlers'
import { transfersHandlers } from './transfers.handlers'

export const handlers = [
  ...authHandlers,
  ...walletHandlers,
  ...beneficiariesHandlers,
  ...transfersHandlers,
]
```

Create `src/mocks/browser.ts`:

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

- [ ] **Step 6: Bootstrap MSW em `main.tsx`**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './App'

async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
```

- [ ] **Step 7: Rodar testes executePix**

```bash
npm test -- src/mocks/handlers/transfers.handlers.test.ts
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/mocks public/mockServiceWorker.js package.json package-lock.json src/main.tsx
git commit -m "$(cat <<'EOF'
feat: adiciona MSW com executePix e handlers /api/v1

EOF
)"
```

---

### Task 3: HTTP client + AuthContext + guard + Login (TDD)

**Files:**
- Create: `src/shared/http/errors.ts`, `src/shared/http/client.ts`
- Create: `src/features/auth/types.ts`, `api.ts`, `AuthContext.tsx`, `RequireAuth.tsx`, `LoginPage.tsx`, `auth.test.tsx`
- Create: `src/app/providers.tsx`, `src/app/router.tsx`
- Modify: `src/App.tsx`
- Install: `react-router`, `@tanstack/react-query`

**Interfaces:**
- Consumes: `http` client, MSW auth
- Produces: `useAuth()`, `RequireAuth`, `login(email, password)`, token em `sessionStorage` chave `reactmind.token`

- [ ] **Step 1: Instalar deps de rota e query**

```bash
npm install react-router @tanstack/react-query
```

- [ ] **Step 2: HTTP client**

Create `src/shared/http/errors.ts`:

```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public correlationId: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
```

Create `src/shared/http/client.ts`:

```typescript
import type { ApiErrorBody } from '@/shared/types/api'
import { ApiError } from '@/shared/http/errors'
import { createCorrelationId } from '@/shared/utils/id'

const BASE = '/api/v1'

let authTokenAccessor: () => string | null = () => null

export function setAuthTokenAccessor(fn: () => string | null): void {
  authTokenAccessor = fn
}

type HttpOptions = {
  body?: unknown
  idempotencyKey?: string
}

async function request<T>(method: string, path: string, options: HttpOptions = {}): Promise<T> {
  const correlationId = createCorrelationId()
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Correlation-Id': correlationId,
  }
  const token = authTokenAccessor()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    let body: ApiErrorBody | undefined
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      /* ignore */
    }
    throw new ApiError(
      response.status,
      body?.code ?? 'HTTP_ERROR',
      body?.message ?? response.statusText,
      body?.correlationId ?? correlationId,
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown, idempotencyKey?: string) =>
    request<T>('POST', path, { body, idempotencyKey }),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
```

- [ ] **Step 3: Auth feature**

Create `src/features/auth/types.ts`:

```typescript
export type User = {
  id: string
  name: string
  email: string
}

export type LoginResponse = {
  accessToken: string
  user: User
}
```

Create `src/features/auth/api.ts`:

```typescript
import { http } from '@/shared/http/client'
import type { LoginResponse } from './types'

export function loginRequest(email: string, password: string) {
  return http.post<LoginResponse>('/auth/login', { email, password })
}
```

Create `src/features/auth/AuthContext.tsx`:

```typescript
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loginRequest } from './api'
import type { User } from './types'
import { setAuthTokenAccessor } from '@/shared/http/client'

const TOKEN_KEY = 'reactmind.token'
const USER_KEY = 'reactmind.user'

type AuthContextValue = {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => readStoredUser())

  setAuthTokenAccessor(() => sessionStorage.getItem(TOKEN_KEY))

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password)
    sessionStorage.setItem(TOKEN_KEY, res.accessToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setToken(res.accessToken)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

Create `src/features/auth/RequireAuth.tsx`:

```typescript
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
```

Create `src/features/auth/LoginPage.tsx`:

```typescript
import { FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useAuth } from './AuthContext'
import { ApiError } from '@/shared/http/errors'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@vuemind.dev')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha no login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login">
      <h1>ReactMind</h1>
      <p>Carteira digital de estudo</p>
      {error && <ErrorBanner message={error} />}
      <form onSubmit={onSubmit}>
        <Input label="Email" type="email" value={email} onChange={setEmail} />
        <Input label="Senha" type="password" value={password} onChange={setPassword} />
        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </main>
  )
}
```

Nota: se `Button`/`Input`/`ErrorBanner` ainda não existirem, criar stubs mínimos nesta task (implementação visual completa na Task 4) — signatures:

```typescript
// stubs aceitáveis até Task 4
export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />
}
export function Input(props: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label>
      {props.label}
      <input
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  )
}
export function ErrorBanner({ message }: { message: string }) {
  return <div role="alert">{message}</div>
}
```

- [ ] **Step 4: Providers + router**

Create `src/app/providers.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

Create `src/app/router.tsx` (rotas placeholder para features futuras):

```typescript
import { Navigate, Route, Routes } from 'react-router'
import { LoginPage } from '@/features/auth/LoginPage'
import { RequireAuth } from '@/features/auth/RequireAuth'

function Placeholder({ title }: { title: string }) {
  return <h1>{title}</h1>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Placeholder title="Dashboard" />} />
        <Route path="/transactions" element={<Placeholder title="Extrato" />} />
        <Route path="/beneficiaries" element={<Placeholder title="Favorecidos" />} />
        <Route path="/transfers/pix" element={<Placeholder title="PIX" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

`src/App.tsx`:

```typescript
import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
```

- [ ] **Step 5: Teste de auth (falha → passa)**

Create `src/features/auth/auth.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './AuthContext'
import { LoginPage } from './LoginPage'
import { RequireAuth } from './RequireAuth'
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'
import { resetDb } from '@/mocks/data/db'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  sessionStorage.clear()
  resetDb()
})
afterAll(() => server.close())

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<div>Private Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('auth', () => {
  beforeEach(() => {
    sessionStorage.clear()
    resetDb()
  })

  it('redireciona para login sem token', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: /reactmind/i })).toBeInTheDocument()
  })

  it('faz login com credenciais válidas', async () => {
    const user = userEvent.setup()
    renderAt('/login')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(screen.getByText('Private Home')).toBeInTheDocument()
    })
    expect(sessionStorage.getItem('reactmind.token')).toBe('mock-jwt-demo')
  })
})
```

```bash
npm test -- src/features/auth/auth.test.tsx
```

Expected: PASS após implementação.

- [ ] **Step 6: Commit**

```bash
git add src/shared/http src/features/auth src/app src/App.tsx package.json package-lock.json
git commit -m "$(cat <<'EOF'
feat: adiciona HTTP tipado, AuthContext, guard e login

EOF
)"
```

---

### Task 4: Shared UI + AppShell + estilos base

**Files:**
- Create/replace: `src/shared/ui/Button.tsx`, `Input.tsx`, `LoadingBlock.tsx`, `ErrorBanner.tsx`, `EmptyState.tsx`
- Create: `src/app/layout/AppShell.tsx`
- Modify: `src/styles.css`, `src/app/router.tsx` (envolver rotas privadas com shell)

**Interfaces:**
- Consumes: `useAuth().logout`
- Produces: shell com nav Dashboard / Extrato / Favorecidos / PIX / Sair

- [ ] **Step 1: Componentes UI**

```typescript
// src/shared/ui/Button.tsx
import type { ButtonHTMLAttributes } from 'react'

export function Button({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="btn" {...rest}>
      {children}
    </button>
  )
}
```

```typescript
// src/shared/ui/Input.tsx
type Props = {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  id?: string
}

export function Input({ label, type = 'text', value, onChange, id }: Props) {
  const inputId = id ?? label
  return (
    <label className="field" htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
```

```typescript
// src/shared/ui/LoadingBlock.tsx
export function LoadingBlock({ label = 'Carregando…' }: { label?: string }) {
  return <p className="loading" role="status">{label}</p>
}
```

```typescript
// src/shared/ui/ErrorBanner.tsx
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="error-banner" role="alert">
      {message}
    </div>
  )
}
```

```typescript
// src/shared/ui/EmptyState.tsx
export function EmptyState({ message }: { message: string }) {
  return <p className="empty">{message}</p>
}
```

- [ ] **Step 2: AppShell**

```typescript
import { NavLink, Outlet } from 'react-router'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/shared/ui/Button'

export function AppShell() {
  const { user, logout } = useAuth()
  return (
    <div className="shell">
      <header className="shell__header">
        <strong>ReactMind</strong>
        <span>{user?.name}</span>
        <Button type="button" onClick={logout}>
          Sair
        </Button>
      </header>
      <nav className="shell__nav">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/transactions">Extrato</NavLink>
        <NavLink to="/beneficiaries">Favorecidos</NavLink>
        <NavLink to="/transfers/pix">PIX</NavLink>
      </nav>
      <main className="shell__main">
        <Outlet />
      </main>
    </div>
  )
}
```

Atualizar `router.tsx`: rotas privadas usam `<Route element={<RequireAuth />}>` → filho `<Route element={<AppShell />}>` envolvendo as páginas.

- [ ] **Step 3: CSS variables em `src/styles.css`**

Layout limpo (sem cards decorativos): tipografia system-ui ok para app de estudo; variáveis `--bg`, `--fg`, `--accent`, `--danger`, espaçamento, form/nav. Fundo com leve gradiente sutil aceitável; priorizar legibilidade do demo.

- [ ] **Step 4: Commit**

```bash
git add src/shared/ui src/app/layout src/styles.css src/app/router.tsx
git commit -m "$(cat <<'EOF'
feat: adiciona UI base e AppShell com navegação

EOF
)"
```

---

### Task 5: Feature wallet — saldo, dashboard, extrato

**Files:**
- Create: `src/features/wallet/types.ts`, `api.ts`, `hooks.ts`, `DashboardPage.tsx`, `TransactionsPage.tsx`
- Modify: `src/app/router.tsx`

**Interfaces:**
- Consumes: `http.get`, Query
- Produces: `useBalance()`, `useTransactions(type?)`, páginas

- [ ] **Step 1: API + hooks**

```typescript
// types.ts
export type Balance = { availableCents: number; currency: string }
export type TransactionType = 'PIX_OUT' | 'PIX_IN' | 'TED'
export type Transaction = {
  id: string
  type: TransactionType
  amountCents: number
  description: string
  createdAt: string
  counterparty: string
}

// api.ts
import { http } from '@/shared/http/client'
import type { Balance, Transaction, TransactionType } from './types'

export function fetchBalance() {
  return http.get<Balance>('/wallet/balance')
}

export function fetchTransactions(type?: TransactionType) {
  const q = type ? `?type=${encodeURIComponent(type)}` : ''
  return http.get<{ items: Transaction[] }>(`/wallet/transactions${q}`)
}

// hooks.ts
import { useQuery } from '@tanstack/react-query'
import { fetchBalance, fetchTransactions } from './api'
import type { TransactionType } from './types'

export const walletKeys = {
  balance: ['wallet', 'balance'] as const,
  transactions: (type?: TransactionType) => ['wallet', 'transactions', type ?? 'all'] as const,
}

export function useBalance() {
  return useQuery({ queryKey: walletKeys.balance, queryFn: fetchBalance })
}

export function useTransactions(type?: TransactionType) {
  return useQuery({
    queryKey: walletKeys.transactions(type),
    queryFn: () => fetchTransactions(type),
  })
}
```

- [ ] **Step 2: DashboardPage**

Exibir `formatCents(balance.availableCents)`, estados loading/error, links/atalhos para Extrato, Favorecidos, PIX.

- [ ] **Step 3: TransactionsPage**

Select filtro por tipo (`all` | `PIX_OUT` | `PIX_IN` | `TED`); lista com loading/error/empty; valores com `formatCents`.

- [ ] **Step 4: Ligar rotas** `/` → `DashboardPage`, `/transactions` → `TransactionsPage`

- [ ] **Step 5: Smoke manual**

```bash
npm run dev
```

Login → ver saldo R$ 2.500,00 → Extrato mostra PIX_IN seed.

- [ ] **Step 6: Commit**

```bash
git add src/features/wallet src/app/router.tsx
git commit -m "$(cat <<'EOF'
feat: adiciona dashboard de saldo e extrato com TanStack Query

EOF
)"
```

---

### Task 6: Feature beneficiaries — listar / criar / remover

**Files:**
- Create: `src/features/beneficiaries/types.ts`, `api.ts`, `hooks.ts`, `BeneficiariesPage.tsx`
- Modify: router

**Interfaces:**
- Consumes: `http.get/post/delete`
- Produces: `useBeneficiaries()`, `useCreateBeneficiary()`, `useDeleteBeneficiary()` com invalidate da lista

- [ ] **Step 1: API + hooks**

```typescript
export type Beneficiary = { id: string; name: string; pixKey: string }

export function fetchBeneficiaries() {
  return http.get<{ items: Beneficiary[] }>('/beneficiaries')
}
export function createBeneficiary(body: { name: string; pixKey: string }) {
  return http.post<Beneficiary>('/beneficiaries', body)
}
export function deleteBeneficiary(id: string) {
  return http.delete<void>(`/beneficiaries/${id}`)
}

export const beneficiaryKeys = { all: ['beneficiaries'] as const }

export function useBeneficiaries() {
  return useQuery({ queryKey: beneficiaryKeys.all, queryFn: fetchBeneficiaries })
}

export function useCreateBeneficiary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBeneficiary,
    onSuccess: () => qc.invalidateQueries({ queryKey: beneficiaryKeys.all }),
  })
}

export function useDeleteBeneficiary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteBeneficiary,
    onSuccess: () => qc.invalidateQueries({ queryKey: beneficiaryKeys.all }),
  })
}
```

- [ ] **Step 2: BeneficiariesPage**

Lista + form (nome, chave PIX) + botão remover; loading/error/empty; erros de mutation via `ErrorBanner`.

- [ ] **Step 3: Rota `/beneficiaries`**

- [ ] **Step 4: Commit**

```bash
git add src/features/beneficiaries src/app/router.tsx
git commit -m "$(cat <<'EOF'
feat: adiciona CRUD de favorecidos

EOF
)"
```

---

### Task 7: Feature transfers — fluxo PIX (form → confirma → comprovante)

**Files:**
- Create: `src/features/transfers/types.ts`, `api.ts`, `hooks.ts`, `pixValidation.ts`, `pixValidation.test.ts`, `TransferPixPage.tsx`
- Modify: router

**Interfaces:**
- Consumes: `useBeneficiaries`, `useBalance`, `http.post` com `Idempotency-Key`
- Produces: `validatePixAmount(cents, balanceCents)`, `useCreatePix()`, wizard 3 passos

- [ ] **Step 1: Teste falhando de validação client**

```typescript
// pixValidation.test.ts
import { describe, it, expect } from 'vitest'
import { validatePixAmount } from './pixValidation'

describe('validatePixAmount', () => {
  it('aceita valor positivo dentro do saldo', () => {
    expect(validatePixAmount(1000, 250_000)).toBeNull()
  })
  it('rejeita valor <= 0', () => {
    expect(validatePixAmount(0, 250_000)).toBe('INVALID_AMOUNT')
  })
  it('rejeita saldo insuficiente', () => {
    expect(validatePixAmount(300_000, 250_000)).toBe('INSUFFICIENT_FUNDS')
  })
})
```

```bash
npm test -- src/features/transfers/pixValidation.test.ts
```

Expected: FAIL

- [ ] **Step 2: Implementar validação + API**

```typescript
// pixValidation.ts
export function validatePixAmount(amountCents: number, balanceCents: number): string | null {
  if (!Number.isInteger(amountCents) || amountCents <= 0) return 'INVALID_AMOUNT'
  if (amountCents > balanceCents) return 'INSUFFICIENT_FUNDS'
  return null
}

// api.ts
export function createPix(
  body: { beneficiaryId: string; amountCents: number },
  idempotencyKey: string,
) {
  return http.post<Transfer>('/transfers/pix', body, idempotencyKey)
}
```

Mutation `useCreatePix` invalida `walletKeys.balance` e `walletKeys.transactions()`.

- [ ] **Step 3: TransferPixPage — 3 passos**

1. **Form:** select favorecido + valor (string → `parseReaisToCents`); botão Continuar desabilitado se `validatePixAmount` ≠ null ou parse falha.
2. **Confirma:** mostra favorecido + valor formatado; ao confirmar gera `createIdempotencyKey()` **uma vez** e chama mutation.
3. **Comprovante:** id, valor, status, data; link voltar ao dashboard.

Estados loading/error da mutation; mapear `ApiError.code` para mensagem amigável.

- [ ] **Step 4: Smoke de componente (opcional mas desejável)**

Teste: com valor `0`, botão Continuar `disabled`.

- [ ] **Step 5: Rodar testes**

```bash
npm test
```

Expected: PASS (money, executePix, auth, pixValidation)

- [ ] **Step 6: Commit**

```bash
git add src/features/transfers src/app/router.tsx
git commit -m "$(cat <<'EOF'
feat: adiciona fluxo PIX com confirmação e comprovante

EOF
)"
```

---

### Task 8: README, guia de entrevista, build final

**Files:**
- Create: `README.md`, `docs/guides/entrevista-react.md`
- Modify: `package.json` scripts se necessário; `vite.config.ts` proxy opcional documentado

**Interfaces:**
- Consumes: app completo
- Produces: docs de demo &lt; 5 min

- [ ] **Step 1: README.md**

Conteúdo mínimo:

- Como rodar: `npm install`, `npm run dev`, URL Vite
- Credenciais: `demo@vuemind.dev` / `demo123`
- Scripts: `npm test`, `npm run build`, `npm run typecheck`
- Tabela de fluxos → pastas (como Vue/Angular)
- 5 bullets “o que dizer na entrevista” (Query vs Pinia/signals, Context só auth, MSW→Spring, centavos, Idempotency-Key)
- Link para `docs/guides/entrevista-react.md`
- Como apontar para Spring: desligar MSW + proxy Vite `/api/v1` → `http://localhost:8080`

- [ ] **Step 2: `docs/guides/entrevista-react.md`**

- Pitch 60s
- Conceitos: TanStack Query, AuthContext, RequireAuth, `shared/http`, executePix
- Fluxo demo passo a passo
- Arquivos para abrir na tela compartilhada
- Tabela React vs Vue vs Angular (mesmo domínio)

- [ ] **Step 3: Verificação final**

```bash
npm test
npm run typecheck
npm run build
```

Expected: todos PASS / exit 0

Demo manual &lt; 5 min: login → saldo → extrato → criar favorecido → PIX → comprovante (saldo atualiza).

- [ ] **Step 4: Commit**

```bash
git add README.md docs/guides/entrevista-react.md
git commit -m "$(cat <<'EOF'
docs: README e guia de entrevista ReactMind

EOF
)"
```

---

## Self-Review (plano × spec)

| Spec | Task |
|------|------|
| Auth + login + guard | Task 3 |
| Dashboard + saldo | Task 5 |
| Extrato com filtro | Task 5 |
| Favorecidos CRUD | Task 6 |
| PIX form→confirma→comprovante | Task 7 |
| MSW `/api/v1` + OpenAPI | Tasks 1–2 |
| HTTP Bearer + correlation id | Task 3 |
| Idempotency-Key no confirm | Task 7 |
| Testes essenciais (money, auth, PIX) | Tasks 1, 2, 3, 7 |
| README + guia | Task 8 |
| Ligação futura Spring | Task 8 (docs) + main MSW só em DEV |
| Sem Next/Redux/tema/i18n | Global Constraints |

Sem TBD/TODO no plano. Nomes estáveis: `reactmind.token`, `executePix`, `walletKeys`, `beneficiaryKeys`, `validatePixAmount`.
