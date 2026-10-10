# Plano — Site Settings

Spec: [`docs/features/site-settings/spec.md`](spec.md)

Alvo: `## Mudanças pendentes` do spec (feature "Carousel do Instagram"). O resto do spec é invariante a preservar.

## Diagnóstico

| Estado             | Qtd |
| ------------------ | --- |
| Implementado       | 0   |
| Parcial            | 0   |
| Divergente         | 0   |
| Ausente            | 4   |
| Não verificável    | 0   |

| Requisito (Mudanças pendentes)                                         | Estado  | Evidência                                                         |
| ---------------------------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| Feature `instagram_carousel` ("Carousel do Instagram") em `FEATURES`   | Ausente | `src/lib/features.ts` só tem `advance_purchase` e `party_budget`  |
| Linha inicial ativa no banco (migration + seed)                        | Ausente | `prisma/migrations/20261010120000_features/migration.sql`, `prisma/seed.ts` (`seedFeatures`) |
| `GET /api/instagram` responde 403 com a feature desativada             | Ausente | `src/app/api/instagram/route.ts` não consulta features            |
| Seção `Galeria` não renderizada na home com a feature desativada       | Ausente | `src/app/page.tsx` renderiza `<Galeria />` sempre                 |

A tela `/admin/settings/features` e a action `updateFeature` já iteram/validam por `FEATURES`, então passam a exibir e aceitar a nova chave sem alteração.

## Premissas

- Mensagem do 403: `"Carousel do Instagram indisponível no momento."`, no mesmo formato `{ error }` das outras features.
- Os crons de renovação do token do Instagram (`/api/cron`, `/api/cron/refresh-instagram-token`) **não** são afetados pela feature: o token continua sendo renovado mesmo com o carousel desligado.
- Links de Instagram em `Contato` e `Footer` (vêm do CMS) **não** são afetados.

## Código sem respaldo no spec (só sinalizado)

- `Galeria.tsx` usa a URL fixa `https://www.instagram.com/divercity.park` no badge `@divercity.park`, em vez da chave `instagram_url` de `settings`.

---

- [x] Fase 1 — Feature `instagram_carousel`: dados e API

**Camadas:** dados, API. **Agente:** `backend`.

**Origem (Mudanças pendentes):** "Em Features (`/admin/settings/features`), adicionar uma configuração para habilitar ou não o carousel do Instagram no site." com as decisões: nome "Carousel do Instagram", chave `instagram_carousel`; valor inicial ativa; desativada → `GET /api/instagram` responde 403.

**Gap → desejado:**

1. `src/lib/features.ts`: adicionar `{ key: "instagram_carousel", name: "Carousel do Instagram", enabled: true }` ao array `FEATURES` (o tipo `FeatureKey` passa a incluir a chave).
2. Nova migration `prisma/migrations/20261011120000_feature_instagram_carousel/migration.sql`, só de dados, no mesmo padrão de `20261010120000_features`:
   ```sql
   INSERT INTO "features" ("key", "name", "enabled", "updatedAt") VALUES
       ('instagram_carousel', 'Carousel do Instagram', true, now())
   ON CONFLICT ("key") DO NOTHING;
   ```
   Sem alteração em `prisma/schema.prisma`.
3. `prisma/seed.ts` (`seedFeatures`): incluir `{ key: 'instagram_carousel', name: 'Carousel do Instagram' }` na lista (o `upsert` com `update: {}` não sobrescreve a escolha do admin).
4. `src/app/api/instagram/route.ts`: no início do `GET`, antes de ler `settings`:
   ```ts
   if (!(await isFeatureEnabled('instagram_carousel'))) {
     return NextResponse.json(
       { error: 'Carousel do Instagram indisponível no momento.' },
       { status: 403 }
     )
   }
   ```
   Referência de padrão: `src/app/api/party-budget/availability/route.ts`.

**Migration:** sim, só `INSERT` (nenhum registro existente muda). O usuário aplica com `npx prisma migrate deploy` (ou o fluxo usual do projeto). Sem a linha no banco, o código já trata a feature como ativa, então não há quebra entre deploy e migration.

**Contrato:** não precisa. O único consumidor (`Galeria`) deixa de ser renderizado quando a feature está desligada (Fase 2), então não precisa tratar o 403.

**Critério de pronto:**
- `/admin/settings/features` lista "Carousel do Instagram" com switch ligado.
- Ao desligar, `GET /api/instagram` responde 403 com a mensagem acima; ao religar, volta a responder os posts (ou o fallback).
- As outras duas features continuam iguais.

**Como verificar:**
- `npx tsc --noEmit`
- `npx eslint src/lib/features.ts src/app/api/instagram/route.ts prisma/seed.ts`
- `npm run dev`: abrir `/admin/settings/features` (como `admin`), alternar o switch e chamar `curl -i http://localhost:3000/api/instagram`.

**Ações do usuário:** aplicar a migration no Supabase.

Arquivos alterados:
- `src/lib/features.ts`
- `src/app/api/instagram/route.ts`
- `prisma/seed.ts`
- `prisma/migrations/20261011120000_feature_instagram_carousel/migration.sql` (novo)

Ações pendentes do usuário: aplicar a migration (`npx prisma migrate deploy`). Sem ela, o código trata a feature como ativa.

Validação: `npx eslint` limpo; `npx tsc --noEmit` só acusa erro pré-existente em `.next/types/validator.ts` (cache `.next` obsoleto apontando para `settings/api-tokens/docs/page.js`), sem erro em `src/`. Reviewer: PASS na 1ª iteração.

---

- [x] Fase 2 — Esconder a seção `Galeria` na home

**Camadas:** UI. **Agente:** `frontend`. **Depende de:** Fase 1 (chave `instagram_carousel` em `FEATURES`).

**Origem (Mudanças pendentes):** decisão "Desativada: a seção `Galeria` inteira (título "Siga nosso Instagram", link @divercity.park e carousel) não é renderizada na home".

**Gap → desejado:** `src/app/page.tsx` renderiza `<Galeria />` sempre. Passar a incluir `isFeatureEnabled('instagram_carousel')` no `Promise.all` existente e renderizar `<Galeria />` só quando ativa, no mesmo padrão de `advancePurchaseEnabled && <CompraAntecipada … />`. Não alterar `src/components/sections/Galeria.tsx`.

O cache da home já é invalidado por `updateTag('features')` em `updateFeature`, sem mudança extra.

**Migration:** não.

**Contrato:** não.

**Critério de pronto:**
- Feature ativa: home igual à atual, com a seção "Siga nosso Instagram".
- Feature desativada: a seção não aparece e nenhuma chamada a `/api/instagram` é feita pelo navegador.
- Desktop e mobile sem espaço vazio entre `CompraAntecipada`/`Precos` e `Depoimentos`.

**Como verificar:**
- `npx tsc --noEmit`
- `npx eslint src/app/page.tsx`
- `npm run dev`: abrir `/`, desligar a feature em `/admin/settings/features`, recarregar `/` e conferir a aba Network (sem request a `/api/instagram`).

**Ações do usuário:** nenhuma.

Arquivos alterados:
- `src/app/page.tsx`

Ações pendentes do usuário: nenhuma além da migration da Fase 1. Validar manualmente no navegador (sem espaço vazio na home e sem request a `/api/instagram` com a feature desligada).

Validação: `npx eslint src/app/page.tsx` limpo; `npx tsc --noEmit` só com o erro pré-existente de `.next`. Reviewer: PASS na 1ª iteração.
