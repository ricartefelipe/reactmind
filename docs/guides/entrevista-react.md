# ReactMind — o que estudar na entrevista (rápido)

## Como falar do projeto em 60s

> “Montei uma carteira digital em React 19 + TypeScript: login com guard, saldo/extrato, favorecidos e PIX. A API é mockada com MSW no mesmo contrato `/api/v1` que depois pluga no Spring. Usei TanStack Query para server state, Context só para auth, React Router com `RequireAuth`, client `fetch` tipado e testes Vitest.”

## Conceitos que costumam cair

1. **TanStack Query** — cache de saldo/extrato/favorecidos; `useQuery`/`useMutation`; invalidação após PIX ou CRUD (`walletKeys`, `beneficiaryKeys`); loading/error automáticos.
2. **AuthContext** — token e usuário em `sessionStorage` (`reactmind.token`); `login`/`logout`; registra accessor no `shared/http` para Bearer.
3. **RequireAuth** — wrapper de rota que lê `isAuthenticated` e redireciona para `/login` com `state.from`.
4. **`shared/http`** — um client (`fetch`) centraliza Bearer, `X-Correlation-Id`, parse de `ApiError` e `Idempotency-Key` opcional; features só importam `http.get`/`http.post`.
5. **`executePix`** — regra de domínio pura no mock (`src/mocks/handlers/transfers.handlers.ts`): valida saldo, idempotência e atualiza extrato; testável sem rede.
6. **Dinheiro em centavos** — evita float; formata na UI com `Intl`.
7. **Idempotency-Key** — no confirm do PIX (não a cada keystroke); gerada na mutation e reutilizada em retry.
8. **Estados de UI** — loading / error / empty / success (extrato, favorecidos, PIX).

## Fluxo demo ao vivo (2–3 min)

1. Login com `demo@vuemind.dev` / `demo123`
2. Ver saldo no dashboard
3. Abrir Extrato (filtrar tipo)
4. Favorecidos → adicionar um
5. PIX → escolher favorecido → valor → confirmar → comprovante
6. Voltar ao Extrato / saldo (saldo caiu)

## Perguntas prontas (respostas curtas)

**Por que MSW e não json-server?**  
Mesma camada `fetch`/client que a API real; handlers no mesmo repo; fácil nos testes.

**Por que feature-first?**  
Cada domínio (auth, wallet, transfers) fica isolado — espelha microsserviços e facilita Vue/Angular no mesmo contrato.

**Como liga o Spring depois?**  
Comenta `worker.start` em `main.tsx`, usa proxy `/api/v1` → `http://localhost:8080` no Vite, mantém OpenAPI.

**Query vs Context para tudo?**  
Context só para sessão (auth); dados da API ficam no Query — evita re-render global e duplica estado do servidor.

**O que testa?**  
Utils de dinheiro, auth (login/guard), regra `validatePixAmount`/`executePix` (saldo insuficiente) e smoke da página PIX.

## Arquivos “abra na entrevista”

- `src/shared/http/client.ts`
- `src/features/auth/AuthContext.tsx`
- `src/features/auth/RequireAuth.tsx`
- `src/app/router.tsx`
- `src/mocks/handlers/transfers.handlers.ts` (`executePix`)
- `src/features/transfers/TransferPixPage.tsx`

## React vs Vue vs Angular (mesmo domínio)

| Tema | Vue (VueMind) | Angular (AngularMind) | React (ReactMind) |
|------|---------------|----------------------|-------------------|
| Server state | Pinia stores | Services + signals | TanStack Query |
| Sessão / auth | Pinia `authStore` | `AuthService` + signals | `AuthContext` + `sessionStorage` |
| Guard de rota | `meta.requiresAuth` | `CanActivateFn` | `RequireAuth` + `<Outlet />` |
| HTTP | `shared/http` (fetch) | `HttpInterceptorFn` | `shared/http` (fetch) |
| Lógica reutilizável | composables | métodos do service | hooks (`useWallet`, `usePixTransfer`) |
| Mock / contrato | MSW `/api/v1` | MSW `/api/v1` | MSW `/api/v1` |
| PIX idempotente | header no confirm | header no confirm | header no confirm |
| Dinheiro | centavos + `Intl` | centavos + `Intl` | centavos + `Intl` |
