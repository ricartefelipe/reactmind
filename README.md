# ReactMind Wallet

Carteira digital de estudo em **React 19** (hooks + TypeScript) — Mind Wallet 2.0, mesmo contrato `/api/v1` da trilha VueMind/AngularMind.

## Como rodar

```bash
npm install
npm run dev
```

Abra a URL do Vite (geralmente `http://localhost:5173`).

**Login demo:** `demo@vuemind.dev` / `demo123`

```bash
npm test          # testes unitários (Vitest)
npm run test:e2e  # smoke Playwright
npm run build     # build de produção
npm run typecheck
```

## O que o app cobre

| Fluxo | Onde estudar |
|-------|----------------|
| Login + guard de rota | `src/features/auth/`, `src/app/router.tsx` |
| Saldo, bloqueado, limite diário, extrato paginado | `src/features/wallet/` |
| Favorecidos com `pixKeyType` | `src/features/beneficiaries/` |
| PIX (destino → valor → agendar → confirmar → comprovante + QR) | `src/features/transfers/` |
| Notificações + badge | `src/features/notifications/` |
| Onboarding checklist | `src/features/onboarding/` |
| Tema + i18n pt-BR/en | `src/features/settings/`, `src/app/i18n/` |
| API mock (MSW via mind-shared) | `src/mocks/`, contrato `docs/contracts/` |
| HTTP tipado + Bearer + correlation id | `src/shared/http/` |

## O que dizer na entrevista (5 bullets)

1. **TanStack Query vs Pinia/signals** — server state (saldo, extrato, favorecidos, notificações, onboarding) fica no cache do Query com keys tipadas; mutations invalidam o que mudou. Sem Redux.
2. **Context só para auth** — `AuthContext` guarda token/usuário em `sessionStorage`; preferências de tema/idioma ficam em `SettingsContext`.
3. **MSW → Spring** — handlers vindos de `@ricartefelipe/mind-wallet-shared`; features chamam `/api/v1` via `shared/http`.
4. **Dinheiro em centavos** — inteiro na API e no mock; `formatCents`/`parseReaisToCents` na UI com `Intl`.
5. **Idempotency-Key no confirm** — gerada ao entrar no passo confirmar; “Tentar de novo” reutiliza a mesma chave.

## Guia rápido para entrevista

Leia: [docs/guides/entrevista-react.md](docs/guides/entrevista-react.md)

## Apontar para o Spring

Por padrão o MSW atende `/api/v1` no browser durante o desenvolvimento (`src/main.tsx`). Builds de produção Pages desligam o MSW (`VITE_ENABLE_MSW=false`). Para usar o backend Spring (`localhost:8080`) no dev:

1. Desabilite o bloco que inicia o worker em `src/main.tsx` (mantenha o `createRoot`).
2. Adicione proxy no Vite — exemplo em `vite.config.ts`:

   ```ts
   export default defineConfig({
     // ...
     server: {
       proxy: {
         '/api/v1': {
           target: 'http://localhost:8080',
           changeOrigin: true,
         },
       },
     },
   })
   ```

3. Suba com `npm run dev` e garanta o Spring ouvindo na porta 8080.

Contrato: `docs/contracts/vuemind-wallet-openapi.yaml`.
