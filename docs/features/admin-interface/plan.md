# Plano — site-settings

Spec: [`docs/features/site-settings/spec.md`](./spec.md). O alvo é `## Mudanças pendentes`, com as decisões de 2026-10-10. O resto do spec (Integrações, crons, Stripe) é invariante e não muda.

## Diagnóstico (spec × código em 2026-10-10)

| Estado | Qtde | Itens |
| --- | --- | --- |
| Implementado e alinhado | 0 | — |
| Parcial | 1 | Ajuste da condicional em `ticket-in-advance`/`party-contracts`: a condicional existe só em `ticket-in-advance`, via env |
| Divergente | 2 | Compra antecipada controlada por env (`src/lib/advance-purchase.ts`); `ADVANCE_PURCHASE_ENABLED` ainda existe (`.env.example`) |
| Ausente | 3 | Página "Features" + menu; model/dados das features; bloqueio do Orçamento de festa (rota, APIs, CTA) |
| Não verificável | 1 | Links do CMS (menu da Navbar, CTAs do Hero) que apontem para `#compra-antecipada`/`/orcamento`: dependem do banco |

Hoje `ADVANCE_PURCHASE_ENABLED` é usada em: `src/app/page.tsx` (seção da home), `src/app/compra-antecipada/page.tsx` (`notFound()`), `src/app/api/tickets/quote/route.ts` e `src/app/api/tickets/checkout/route.ts` (403). Todos esses pontos são de `ticket-in-advance`. `party-contracts` não usa a variável.

## Premissas

- Chaves fixas: `advance_purchase` ("Compra antecipada") e `party_budget` ("Orçamento de festa"). O código tem uma lista `FEATURES` com `key`, `name` padrão e `enabled` padrão `true`. O nome exibido vem do banco e, se não houver linha, da lista.
- A leitura no site usa `'use cache'` + `cacheTag('features')` + `cacheLife('max')`, igual a `getActivePassportTypes`. Ao salvar, a action chama `updateTag('features')`, que expira o cache na hora (Next 16, só em server actions). `revalidateTag(…, 'max')` não serve aqui porque ainda entrega uma resposta antiga.
- A página fica em `/admin/settings/features`. No menu, "Integrações" passa a ter `exact: true`; senão, as duas ficariam ativas, porque o `Sidebar` usa `startsWith` em `activePath`.
- O toggle grava na hora (sem botão salvar), com `useTransition`: toasts "Feature atualizada" / "Erro ao atualizar feature", `router.refresh()` no sucesso. São textos de UI, não dados de negócio.
- A action nova confere sessão e role `admin` por conta própria (a `updateSettings` atual não confere; ela não muda neste plano).
- Fica de fora deste plano (está em "Pontos em aberto" do spec): os links do CMS e o link "voltar à compra" da confirmação.

---

- [x] Fase 1 — Dados e leitura das features

  - **Camadas / agente:** dados + lib · `backend`
  - **Requisitos:** "Cada feature tem o nome e se está ativa ou não (`enabled`)"; Decisões: "Modelo", "Padrão".
  - **Origem:** Mudanças pendentes, "A página 'Features' terá 2 itens: Compra antecipada; Orçamento de festa." e "Cada feature tem o nome e se está ativa ou não (`enabled`)."
  - **Gap → desejado:** não existe model nem leitura → model `Feature`, migration, seed e helper com cache.
  - **Arquivos:**
    - `prisma/schema.prisma`: `model Feature { key String @id; name String; enabled Boolean @default(true); updatedAt DateTime @updatedAt; @@map("features") }`.
    - `prisma/migrations/<timestamp>_features/migration.sql`: `CREATE TABLE "features"` e `INSERT` das 2 linhas (`advance_purchase`/"Compra antecipada", `party_budget`/"Orçamento de festa", `enabled = true`, `updatedAt = now()`) com `ON CONFLICT ("key") DO NOTHING`, para que produção já tenha as linhas sem rodar o seed.
    - `prisma/seed.ts`: nova `seedFeatures()` chamada em `main()`, `upsert` com `update: {}`, para não sobrescrever o que o admin escolheu.
    - `src/lib/features.ts` (novo):
      - `FEATURES` (`as const`) e o tipo `FeatureKey`;
      - `FEATURES_CACHE_TAG = 'features'`;
      - `getFeatures()` (`'use cache'`, `cacheTag`, `cacheLife('max')`) retorna as 2 features, juntando o banco com a lista, e usa `enabled: true` quando não há linha;
      - `isFeatureEnabled(key: FeatureKey): Promise<boolean>`.
  - **Migration:** sim. Cria a tabela `features` e insere 2 linhas; não afeta registros existentes. **O usuário aplica** (`npx prisma migrate deploy` ou pelo fluxo de sempre) e roda `npx prisma generate`.
  - **Contrato:** não.
  - **Pronto quando:** `prisma.feature` está tipado; `isFeatureEnabled('advance_purchase')` retorna `true` sem linha no banco; o seed é idempotente.
  - **Verificar:** `npx prisma validate`; `npx prisma generate`; `npx tsc --noEmit`; `npx eslint src/lib/features.ts prisma/seed.ts`.
  - **Ações do usuário:** aplicar a migration; opcionalmente `npx tsx prisma/seed.ts`.

  Arquivos alterados: `prisma/schema.prisma`, `prisma/migrations/20261010120000_features/migration.sql`, `prisma/seed.ts`, `src/lib/features.ts`.
  Pendente do usuário: aplicar a migration `20261010120000_features` antes de subir as Fases 2 e 3 (a leitura falha sem a tabela).

- [x] Fase 2 — Compra antecipada passa a usar a feature (remove `ADVANCE_PURCHASE_ENABLED`)

  - **Camadas / agente:** API + páginas server · `backend` (APIs) e `frontend` (`page.tsx`, `/compra-antecipada`)
  - **Depende de:** Fase 1.
  - **Requisitos:** Decisões: "Compra antecipada desativada", "Acesso direto a feature desativada".
  - **Origem:** Mudanças pendentes, "A compra antecipada hoje é controlada pela variável de ambiente `ADVANCE_PURCHASE_ENABLED`. Após este ajuste, essa variável **não deve mais existir**…" e "a condicional que hoje usa `ADVANCE_PURCHASE_ENABLED` precisa ser ajustada nas features `party-contracts` e `ticket-in-advance`…" (lado `ticket-in-advance`).
  - **Gap → desejado:** `isAdvancePurchaseEnabled()` lê do env → `await isFeatureEnabled('advance_purchase')` em todos os pontos, e a env some.
  - **Arquivos:**
    - `src/app/page.tsx`: incluir `isFeatureEnabled('advance_purchase')` no `Promise.all` e condicionar `<CompraAntecipada>`.
    - `src/app/compra-antecipada/page.tsx`: `if (!(await isFeatureEnabled('advance_purchase'))) notFound()`.
    - `src/app/api/tickets/quote/route.ts` e `src/app/api/tickets/checkout/route.ts`: mesma checagem, mantendo 403 `{ error: "Compra antecipada indisponível no momento." }`.
    - Remover `src/lib/advance-purchase.ts`.
    - `.env.example`: remover o bloco `ADVANCE_PURCHASE_ENABLED` (linhas 49-51).
    - Não mexer em `/compra-antecipada/confirmacao/[shortCode]`, `api/tickets/confirmation`, `api/webhooks/stripe` nem `/admin/operacao`.
  - **Migration:** não.
  - **Contrato:** não (o contrato das APIs não muda).
  - **Pronto quando:** `grep -rn "ADVANCE_PURCHASE_ENABLED\|advance-purchase" src .env.example` não acha nada. Com `advance_purchase.enabled=false`: a seção some da home, `/compra-antecipada` dá 404, quote/checkout dão 403 e a confirmação continua abrindo. Com `true`, tudo funciona como antes.
  - **Verificar:** `npx tsc --noEmit`; eslint nos arquivos; `npm run dev`, trocando o valor na tabela (ou pela Fase 4) e abrindo `/`, `/compra-antecipada` e `POST /api/tickets/quote`.
  - **Ações do usuário:** remover `ADVANCE_PURCHASE_ENABLED` do `.env.local` e das env vars da Vercel (Production/Preview).

  Arquivos alterados: `src/app/page.tsx`, `src/app/compra-antecipada/page.tsx`, `src/app/api/tickets/quote/route.ts`, `src/app/api/tickets/checkout/route.ts`, `src/lib/advance-purchase.ts` (removido), `.env.example` (remoção do bloco já estava no working tree antes da execução).
  Pendente do usuário: remover `ADVANCE_PURCHASE_ENABLED` do `.env.local` e da Vercel. Até a Fase 4, alterar `enabled` direto na tabela só reflete após o cache `features` expirar ou o servidor reiniciar.

- [x] Fase 3 — Bloqueio do Orçamento de festa

  - **Camadas / agente:** API + páginas/UI · `backend` (APIs) e `frontend` (`/orcamento`, home, `Festas`)
  - **Depende de:** Fase 1.
  - **Requisitos:** Decisões: "Orçamento de festa desativado", "Acesso direto a feature desativada".
  - **Origem:** Mudanças pendentes, "No frontend do site, a feature só é mostrada e só fica acessível se estiver ativa no admin." e a parte `party-contracts` do item de ajuste da condicional.
  - **Gap → desejado:** orçamento sempre no ar → controlado por `party_budget`.
  - **Arquivos:**
    - `src/app/orcamento/page.tsx`: `if (!(await isFeatureEnabled('party_budget'))) notFound()`.
    - `src/app/api/party-budget/availability/route.ts`, `quote/route.ts` e `reservations/route.ts`: no início, 403 `{ error: "Orçamento de festa indisponível no momento." }` se estiver desativado.
    - `src/app/page.tsx`: incluir `isFeatureEnabled('party_budget')` no `Promise.all` e passar `budgetEnabled` para `<Festas>`.
    - `src/components/sections/Festas.tsx`: novo prop `budgetEnabled: boolean`; só renderiza `ctaBudget` quando for `true`. A seção, a galeria e `ctaPrices` continuam.
    - Não mexer em `/c/[hash]`, `/api/client/contract/*`, `/api/webhooks/docusign` nem no admin de festas.
  - **Migration:** não.
  - **Contrato:** não.
  - **Pronto quando:** com `party_budget.enabled=false`: `/orcamento` dá 404, as 3 APIs dão 403, o botão "Faça já o seu orçamento" some e a seção Festas continua. Com `true`, tudo funciona como antes.
  - **Verificar:** `npx tsc --noEmit`; eslint nos arquivos; `npm run dev`, abrindo `/`, `/orcamento` e `GET /api/party-budget/availability?date=…` com o valor alternado.
  - **Ações do usuário:** nenhuma.

  Arquivos alterados: `src/app/orcamento/page.tsx`, `src/app/api/party-budget/availability/route.ts`, `src/app/api/party-budget/quote/route.ts`, `src/app/api/party-budget/reservations/route.ts`, `src/app/page.tsx`, `src/components/sections/Festas.tsx`.

- [x] Fase 4 — Página "Features" no admin

  - **Camadas / agente:** server action + UI admin · `backend` (action) e `frontend` (página, menu)
  - **Depende de:** Fase 1.
  - **Requisitos:** "Em Configurações, ao lado de 'Integrações', criar uma página chamada **Features**"; Decisões: "Acesso".
  - **Origem:** Mudanças pendentes, "Em Configurações, ao lado de 'Integrações', criar uma página chamada **Features**." e "A página 'Features' terá 2 itens…".
  - **Gap → desejado:** não há tela → `/admin/settings/features` lista as 2 features, cada uma com nome e `Switch`.
  - **Arquivos:**
    - `src/components/admin/layout/nav-config.ts`: em "Configurações", "Integrações" passa a ter `exact: true` e entra o item `{ label: 'Features', href: '/admin/settings/features', activePath: '/admin/settings/features' }`.
    - `src/app/admin/(panel)/settings/features/page.tsx` (Server Component): lê `prisma.feature.findMany()` direto, sem cache, no mesmo padrão de `settings/page.tsx`. Junta com `FEATURES` de `src/lib/features.ts` (sem linha = ativa) e passa `{ key, name, enabled }[]` para o client.
    - `src/app/admin/(panel)/settings/features/FeaturesContent.tsx` (Client): título "Features" e um `Card` com uma linha por feature (nome + `Switch` de `@/components/admin/ui/switch`). O toggle chama a action dentro de `useTransition`, deixa o switch desabilitado enquanto salva e mostra os toasts da premissa (`sonner`) + `router.refresh()`. Usar só o kit `@/components/admin/ui/*`.
    - `src/app/admin/(panel)/settings/features/actions.ts` (`'use server'`), `updateFeature(key, enabled)`:
      - `getAuthenticatedSession()` de `src/lib/authz.ts`; lança erro se não houver sessão ou se `role !== 'admin'`;
      - valida `key` contra `FEATURES`;
      - `prisma.feature.upsert` (`create` com o `name` padrão);
      - `updateTag(FEATURES_CACHE_TAG)`.
  - **Migration:** não.
  - **Contrato:** não (é server action, sem endpoint HTTP).
  - **Pronto quando:** como `admin`, "Configurações → Features" aparece com o item ativo certo, e desligar "Compra antecipada" ou "Orçamento de festa" reflete no site no próximo request. O `operator` é redirecionado (`proxy.ts`), e chamar a action sem sessão `admin` falha.
  - **Verificar:** `npx tsc --noEmit`; eslint nos arquivos; `npm run dev`: abrir `/admin/settings/features`, alternar as features, conferir `/`, `/compra-antecipada` e `/orcamento` em outra aba, e conferir que "Integrações" continua ativo só em `/admin/settings`.
  - **Ações do usuário:** nenhuma.

  Arquivos alterados: `src/components/admin/layout/nav-config.ts`, `src/app/admin/(panel)/settings/features/page.tsx`, `src/app/admin/(panel)/settings/features/FeaturesContent.tsx`, `src/app/admin/(panel)/settings/features/actions.ts`.

---

## Depois do plano

- Rodar `/update-feature-spec site-settings`, `/update-feature-spec ticket-in-advance` e `/update-feature-spec party-contracts` para registrar o controle por Features nos três specs.
