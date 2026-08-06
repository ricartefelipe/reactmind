# ReactMind — o que estudar na entrevista (rápido)

## Como falar do projeto em 60s

> “Montei uma carteira digital Mind Wallet 2.0 em React 19 + TypeScript: login com guard, saldo com limite diário, extrato paginado, favorecidos com tipo de chave PIX, PIX com agendamento/QR/idempotência, notificações e onboarding. A API é mockada com MSW do pacote mind-shared no contrato `/api/v1`. Usei TanStack Query para server state, Context só para auth, React Router com `RequireAuth`, client `fetch` tipado, i18n/tema e smoke Playwright.”

## Conceitos que costumam cair

1. **TanStack Query** — cache de saldo/extrato/favorecidos/notificações/onboarding; `useQuery`/`useInfiniteQuery`/`useMutation`; invalidação após PIX ou CRUD.
2. **AuthContext** — token e usuário em `sessionStorage` (`reactmind.token`); `login`/`logout`; registra accessor no `shared/http` para Bearer.
3. **RequireAuth** — wrapper de rota que lê `isAuthenticated` e redireciona para `/login`.
4. **`shared/http`** — um client (`fetch`) centraliza Bearer, `X-Correlation-Id`, parse de `ApiError` e `Idempotency-Key` opcional.
5. **mind-shared MSW** — `createMindHandlers` cobre balance/limits, PIX agendado, notificações e onboarding; validação de chave via `pixKey`.
6. **Dinheiro em centavos** — evita float; formata na UI com `Intl`.
7. **Idempotency-Key** — gerada ao entrar no confirm do PIX; retry reutiliza a mesma chave.
8. **Estados de UI** — loading / error / empty / success (extrato, favorecidos, PIX, notificações).

## Fluxo demo ao vivo (2–3 min)

1. Login com `demo@vuemind.dev` / `demo123`
2. Ver saldo, bloqueado e barra de limite no dashboard + checklist
3. Abrir Extrato (busca “mercado”, carregar mais)
4. Favorecidos → adicionar com tipo EMAIL
5. PIX → favorecido → valor → enviar agora → confirmar → comprovante
6. Notificações → marcar lida / marcar todas
7. Ajustes → tema e idioma

## Perguntas prontas (respostas curtas)

**Por que MSW e não json-server?**  
Mesma camada `fetch`/client que a API real; handlers compartilhados com a trilha Mind; fácil nos testes.

**Por que feature-first?**  
Cada domínio (auth, wallet, transfers) fica isolado — espelha microsserviços e facilita Vue/Angular no mesmo contrato.

**Como liga o Spring depois?**  
`VITE_ENABLE_MSW=false` + `VITE_API_BASE_URL` apontando para o Spring HTTPS, mantém OpenAPI.

**Query vs Context para tudo?**  
Context só para sessão (auth) e preferências locais (tema/idioma); dados da API ficam no Query.

**O que testa?**  
Utils de dinheiro, validação PIX/limite, auth, smoke das páginas e e2e Playwright do fluxo completo.

## Arquivos “abra na entrevista”

- `src/shared/http/client.ts`
- `src/features/auth/AuthContext.tsx`
- `src/features/auth/RequireAuth.tsx`
- `src/app/router.tsx`
- `src/mocks/handlers/index.ts`
- `src/features/transfers/TransferPixPage.tsx`

## React vs Vue vs Angular (mesmo domínio)

| Tema | Vue (VueMind) | Angular (AngularMind) | React (ReactMind) |
|------|---------------|----------------------|-------------------|
| Server state | Pinia stores | Services + signals | TanStack Query |
| Sessão / auth | Pinia `authStore` | `AuthService` + signals | `AuthContext` + `sessionStorage` |
| Guard de rota | `meta.requiresAuth` | `CanActivateFn` | `RequireAuth` + `<Outlet />` |
| HTTP | `shared/http` (fetch) | `HttpInterceptorFn` | `shared/http` (fetch) |
