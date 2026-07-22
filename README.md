# ReactMind Wallet

Carteira digital de estudo em **React 19** (hooks + TypeScript) — mesmo contrato `/api/v1` da trilha VueMind/AngularMind.

## Como rodar

```bash
npm install
npm run dev
```

Abra a URL do Vite (geralmente `http://localhost:5173`).

**Login demo:** `demo@vuemind.dev` / `demo123`

```bash
npm test          # testes unitários (Vitest)
npm run build     # build de produção
npm run typecheck
```

## O que o app cobre

| Fluxo | Onde estudar |
|-------|----------------|
| Login + guard de rota | `src/features/auth/`, `src/app/router.tsx` |
| Saldo + extrato com filtros | `src/features/wallet/` |
| Favorecidos (CRUD) | `src/features/beneficiaries/` |
| PIX (form → confirma → comprovante) | `src/features/transfers/` |
| API mock (MSW) | `src/mocks/`, contrato `docs/contracts/` |
| HTTP tipado + Bearer + correlation id | `src/shared/http/` |

## O que dizer na entrevista (5 bullets)

1. **TanStack Query vs Pinia/signals** — server state (saldo, extrato, favorecidos) fica no cache do Query com `walletKeys`/`beneficiaryKeys`; mutations invalidam o que mudou. Sem Redux.
2. **Context só para auth** — `AuthContext` guarda token/usuário em `sessionStorage`; o resto do estado vem da API via hooks Query.
3. **MSW → Spring** — features chamam `/api/v1` via `shared/http`; trocar mock por backend é desligar MSW + proxy Vite, sem reescrever páginas.
4. **Dinheiro em centavos** — inteiro na API e no mock; `formatCents`/`parseReaisToCents` na UI com `Intl` (pt-BR).
5. **Idempotency-Key no confirm** — header enviado só no `POST /transfers/pix`, não a cada keystroke; retry seguro no mock (`executePix`).

## Guia rápido para entrevista

Leia: [docs/guides/entrevista-react.md](docs/guides/entrevista-react.md)

## Apontar para o Spring

Por padrão o MSW atende `/api/v1` no browser durante o desenvolvimento (`src/main.tsx`, bloco `import.meta.env.DEV`). Builds de produção já ignoram o MSW. Para usar o backend Spring (`localhost:8080`) no dev:

1. Comente/desabilite o bloco que inicia o worker em `src/main.tsx` (mantenha o `createRoot`).
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

As features continuam chamando `/api/v1/*`; só troca quem responde (MSW → Spring). Contrato: `docs/contracts/vuemind-wallet-openapi.yaml`.
