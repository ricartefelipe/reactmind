# ReactMind Wallet — Design Spec (React 19)

**Data:** 2026-07-22  
**Status:** aprovado para plano de implementação  
**Repositório:** `reactmind`  
**Produto:** carteira digital de estudo (login, saldo, extrato, PIX, favorecidos)  
**Profundidade:** meio-termo — mesmo escopo do AngularMind (sem tema/i18n elaborados)

---

## 1. Contexto e objetivo

Parte da trilha de preparação técnica iniciada em `vuemind`. Reutiliza o **mesmo domínio** e o **mesmo contrato OpenAPI** (`/api/v1`). O Vue cobre o demo completo; Angular e React cobrem o que o CV precisa demonstrar em cada stack web, sem repetir tema, i18n e cobertura didática ampla do Vue.

### Objetivos didáticos do React v1

1. Consolidar React moderno: React 19 + TypeScript, hooks, React Router com guard, TanStack Query para server state.
2. Manter arquitetura feature-first alinhada ao Vue/Angular e ao contrato estável.
3. Simular rede com MSW até apontar para `vuemind-api` (Spring).
4. Deixar pitch de entrevista curto (README + guia) — foco nas diferenças vs Vue/Angular (Query, Context, hooks).

### Fora de escopo (React v1)

- i18n (pt-BR/en) e tema claro/escuro elaborados
- Next.js / SSR, Redux / Redux Toolkit, UI kit pesada (MUI, Chakra, etc.)
- Deploy cloud, banco real, pagamentos reais
- Cobertura de testes alta; review loops elaborados
- Apps Ionic / RN / Flutter (outros repos)

---

## 2. Decisões travadas

| Tema | Decisão |
|------|---------|
| Domínio | Carteira digital (mesmo do Vue/Angular) |
| Escopo | Meio-termo: auth + saldo + extrato + PIX + favorecidos |
| Contrato | Cópia de `vuemind-wallet-openapi.yaml` em `docs/contracts/` |
| Mock de API | MSW (paths `/api/v1`) |
| Arquitetura | Feature-first |
| UI kit | Sem lib pesada; CSS variables + componentes próprios enxutos |
| Linguagem | TypeScript estrito |
| Framework | React 19 + Vite |
| Server state | TanStack Query |
| Sessão / auth | `AuthContext` + token em `sessionStorage` |
| HTTP | `fetch` tipado em `shared/http` + Bearer + correlation id |
| Rotas | React Router + guard de autenticação |
| Testes | Essencial: utils de dinheiro, auth, regra PIX; 1–2 smokes de componente |
| Credenciais mock | `demo@vuemind.dev` / `demo123` |

---

## 3. Personas e fluxos principais

**Usuário de estudo:** operador da carteira (dados mock).

### Fluxos

1. **Login** — credenciais mock → token → redireciona ao dashboard.
2. **Dashboard** — exibe saldo e atalhos (PIX, extrato, favorecidos).
3. **Extrato** — lista transações com filtro por tipo; estados loading/error/empty.
4. **Transferência PIX** — escolhe/informa favorecido + valor → confirma → comprovante.
5. **Favorecidos** — listar / criar / remover.

Credenciais (iguais ao Vue/Angular/MSW/API):

- `demo@vuemind.dev` / `demo123`

---

## 4. Arquitetura

### 4.1 Visão geral

```
Browser (React SPA)
    │
    ▼
features/*  →  shared/http (fetch)  →  rede
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
                 MSW (dev/test)          vuemind-api (Spring)
                    │
                    ▼
              fixtures in-memory
```

Features e camada HTTP **não sabem** se a resposta veio do MSW ou do Spring. Troca futura = desligar MSW + proxy/`baseUrl`.

### 4.2 Estrutura de pastas

```
reactmind/
  docs/
    contracts/                 # OpenAPI (cópia canônica)
    guides/                    # entrevista-react.md
    superpowers/specs/         # este design
    superpowers/plans/         # plano de implementação
  src/
    app/                       # providers, router, layout/shell
    features/
      auth/                    # login, AuthContext, guard
      wallet/                  # saldo, extrato
      beneficiaries/           # CRUD favorecidos
      transfers/               # PIX (form → confirma → comprovante)
    shared/
      http/                    # client fetch, headers, erros
      ui/                      # button, input, loading, error, empty
      utils/                   # money, id
      types/                   # ApiError, Money, etc.
    mocks/
      browser.ts
      handlers/
      data/
  index.html
  vite.config.ts
```

Cada feature tipicamente contém:

- `api.ts` — funções que chamam `shared/http`
- hooks (`use*.ts`) — Query/mutations da feature
- páginas / componentes roteados
- `types.ts` — tipos do domínio da feature

### 4.3 Fronteiras e responsabilidades

| Unidade | Faz | Depende de |
|---------|-----|------------|
| `shared/http` | `fetch` tipado, Authorization, correlation id, parse de erro | nada de feature |
| `features/*/api` | endpoints e DTOs | `shared/http`, types |
| hooks Query/mutation | cache, loading, invalidate | api da feature |
| `AuthContext` | token, login/logout, persistência | auth api |
| páginas | composição de UI | hooks + shared/ui |
| `mocks` | handlers MSW + fixtures | contrato OpenAPI |

Regra: **páginas não chamam `fetch` direto**; passam por `api` + hooks.

### 4.4 Mapeamento Vue / Angular → React (para entrevista)

| Vue | Angular | React |
|-----|---------|-------|
| Pinia store | service com signals | TanStack Query (+ Context só p/ auth) |
| Vue Router + `meta.requiresAuth` | `CanActivateFn` | React Router + guard/component wrapper |
| `shared/http` client | `HttpClient` + interceptor | `shared/http` (`fetch`) |
| composables | métodos do service | hooks |
| MSW handlers | mesmos paths/contratos | mesmos paths/contratos |

---

## 5. Contrato e dados

- Fonte: cópia de `vuemind/docs/contracts/vuemind-wallet-openapi.yaml`.
- Endpoints usados: `POST /auth/login`, `GET /wallet/balance`, `GET /wallet/transactions`, CRUD favorecidos, `POST /transfers/pix`.
- Dinheiro sempre em **centavos** (inteiro); formatação na UI com `Intl.NumberFormat` (`pt-BR`).
- PIX envia `Idempotency-Key` **apenas no confirm**, não a cada keystroke.
- Token opaco mock persistido em `sessionStorage`.
- Mutations (PIX, CRUD favorecidos) invalidam as Query keys afetadas (saldo, extrato, lista de favorecidos).

---

## 6. UI e estados

- Shell simples com nav (Dashboard, Extrato, Favorecidos, PIX, Sair).
- Componentes shared mínimos: botão, input, loading block, error banner, empty state.
- Cada lista/form trata: loading / error / empty / success.
- Login 401 → mensagem clara; sessão expirada / 401 em rota privada → limpa token e redireciona ao login.
- PIX saldo insuficiente → erro de negócio visível (client + possível 4xx da API).
- Sem cards decorativos desnecessários; layout limpo, CSS variables para cor/espaçamento.

---

## 7. Testes

Cobertura **essencial**, não ampla (Vitest + Testing Library):

1. `money` utils (parse/format/centavos).
2. Auth (login sucesso/falha; ausência de token bloqueia rota privada).
3. Regra de domínio do PIX (valor > 0 e ≤ saldo) — função pura testável sem rede.
4. Até 1–2 smokes de componente (ex.: login; botão confirmar PIX desabilitado com valor inválido).

Não bloquear entrega por cobertura ampla de componentes.

---

## 8. Documentação de entrega

- `README.md` — como rodar, credenciais, bullets “o que dizer na entrevista”.
- `docs/guides/entrevista-react.md` — pitch 60s, conceitos (Query, Context, guard), fluxo demo, arquivos para abrir.
- Spec e plano em `docs/superpowers/`.

---

## 9. Critério de pronto

1. `npm run dev` sobe; login com credenciais demo funciona.
2. Demo &lt; 5 min: login → saldo → extrato → criar favorecido → PIX → comprovante (saldo atualiza).
3. Testes essenciais passam; `npm run build` sem erro.
4. README + guia de entrevista presentes.
5. Features isoladas do mock: apontar para Spring não exige reescrever pages/hooks de domínio.

---

## 10. Ligação futura ao Spring (`vuemind-api`)

1. Não iniciar MSW em dev (flag ou remoção do bootstrap).
2. Proxy do Vite (`/api/v1` → `http://localhost:8080`) **ou** `baseUrl` absoluto com CORS.
3. Manter OpenAPI; não mudar contratos nas features.
