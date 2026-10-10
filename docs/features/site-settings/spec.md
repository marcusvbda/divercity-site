# Site Settings

## 1. O que é

Configurações do site editáveis pelo admin, no menu "Configurações":

- **Integrações** (`/admin/settings`): credenciais externas (Google, Instagram e Stripe). Os valores ficam no banco, na tabela `settings`, e o app lê as credenciais de lá em runtime, não de variáveis de ambiente.
- **Features** (`/admin/settings/features`): liga e desliga funcionalidades do site público (Compra antecipada e Orçamento de festa). Ficam na tabela `features`.

### Modelo

`Setting` (`prisma/schema.prisma`, tabela `settings`):

| Campo       | Tipo     | Notas                  |
| ----------- | -------- | ---------------------- |
| `key`       | String   | PK                     |
| `value`     | String   | texto puro, sem criptografia |
| `updatedAt` | DateTime | `@updatedAt`           |

Não há seed de valores padrão, exceto as credenciais do Stripe (ver "Seed").

### Modelo `Feature`

`Feature` (`prisma/schema.prisma`, tabela `features`):

| Campo       | Tipo     | Notas                                  |
| ----------- | -------- | -------------------------------------- |
| `key`       | String   | PK                                     |
| `name`      | String   | nome exibido no admin                  |
| `enabled`   | Boolean  | padrão `true`                          |
| `updatedAt` | DateTime | `@updatedAt`                           |

Chaves fixas, definidas em `FEATURES` (`src/lib/features.ts`):

| Chave              | Nome padrão          | Controla                                                      |
| ------------------ | -------------------- | ------------------------------------------------------------- |
| `advance_purchase` | Compra antecipada    | Seção na home, `/compra-antecipada`, `POST /api/tickets/quote` e `/checkout` |
| `party_budget`     | Orçamento de festa   | `/orcamento`, `/api/party-budget/*`, CTA `ctaBudget` da seção Festas |

A migration `20261010120000_features` cria a tabela e insere as 2 linhas (`enabled = true`); `prisma/seed.ts` (`seedFeatures`) faz `upsert` sem sobrescrever o que o admin escolheu.

### Chaves de `settings`

| Chave                                | Aba       | Usada por                                         |
| ------------------------------------ | --------- | ------------------------------------------------- |
| `google_places_api_key`              | Google    | `GET /api/reviews`                                |
| `google_place_id`                    | Google    | `GET /api/reviews`                                |
| `google_testimonials_minimum_rating` | Google    | `GET /api/reviews`                                |
| `instagram_access_token`             | Instagram | `GET /api/instagram`, crons de renovação do token |
| `instagram_url`                      | Instagram | `GET /api/instagram`                              |
| `stripe_publishable_key`             | Stripe    | nenhum consumidor no código (só gravada e exibida) |
| `stripe_secret_key`                  | Stripe    | `getStripeClient()` em `src/lib/stripe.ts`        |
| `stripe_webhook_secret`              | Stripe    | `getStripeWebhookSecret()` em `src/lib/stripe.ts` |

## 2. Requisitos

### Acesso

- `/admin/settings` fica sob `/admin`, protegida por `proxy.ts` (`withAuth`): exige sessão válida.
- A role `operator` só acessa `/admin/login` e `/admin/operacao`; qualquer outra rota é redirecionada para `/admin/operacao`. Portanto só `admin` chega às configurações.
- A server action `updateSettings` não checa sessão nem role por conta própria.
- `/admin/settings/features` segue a mesma regra de `proxy.ts` (só `admin`), e a action `updateFeature` confere sessão e role `admin` por conta própria.

### Tela "Integrações"

- `page.tsx` (Server Component) lê todas as linhas de `settings` via `prisma.setting.findMany()` e passa a `SettingsContent` (Client Component).
- Título "Integrações", com o texto: "Configure as integrações externas. Após salvar, o cache é limpo automaticamente."
- Três abas (`Tabs`, variante `line`), aba inicial Google. Cada aba é um `Card` com botão de salvar próprio, que grava só as chaves daquela aba:
  - **Google** (botão "Salvar Google"):
    - API Key (campo secreto, placeholder `AIzaSy...`; descrição: console.cloud.google.com → Credenciais → Places API);
    - Place ID (placeholder `ChIJ...`);
    - Rating mínimo para exibir (1–5): input numérico `min=1`, `max=5`; valor inicial `4` se a chave não existir.
  - **Instagram** (botão "Salvar Instagram"):
    - Access Token (campo secreto, placeholder `IGAAc…`; descrição: token de longa duração (~60 dias), o cron renova automaticamente no dia 1 de cada mês);
    - URL do Perfil (input `type=url`, placeholder `https://www.instagram.com/divercity.park`).
  - **Stripe** (botão "Salvar Stripe"):
    - Publishable Key (campo visível, placeholder `pk_live_...`);
    - Secret Key (campo secreto, placeholder `sk_live_...`);
    - Webhook Signing Secret (campo secreto, placeholder `whsec_...`).
- Campos secretos são `password` com botão de mostrar/ocultar (`aria-label` "Mostrar"/"Ocultar"). O valor atual vem preenchido do banco.
- Estados:
  - Durante o salvamento (`useTransition`), os botões ficam desabilitados e mostram "Salvando…".
  - Sucesso: toast "Configurações salvas com sucesso!" e `router.refresh()`.
  - Erro: toast "Erro ao salvar configurações".
- Chave sem valor no banco aparece como string vazia.

### Tela "Features"

- `page.tsx` (Server Component) lê `prisma.feature.findMany()` direto, sem cache, junta com `FEATURES` (sem linha no banco, a feature é considerada **ativa**; o nome vem do banco, senão da lista) e passa `{ key, name, enabled }[]` a `FeaturesContent` (Client Component).
- Título "Features" e um `Card` com uma linha por feature: nome e `Switch` (kit `@/components/admin/ui`).
- O toggle grava na hora, sem botão salvar: `useTransition`, switch desabilitado enquanto salva, toast "Feature atualizada" e `router.refresh()` em caso de sucesso; toast "Erro ao atualizar feature" em caso de falha. Não há update otimista.
- No menu, "Features" fica ao lado de "Integrações"; "Integrações" tem `exact: true` para que só um dos dois fique ativo.

### Salvamento das features (`updateFeature`)

- Server action `updateFeature(key, enabled)` em `src/app/admin/(panel)/settings/features/actions.ts`.
- Lança erro se não houver sessão ("Não autenticado"), se a role não for `admin` ("Acesso negado"), se a `key` não estiver em `FEATURES` ou se `enabled` não for boolean.
- Faz `upsert` por `key` (cria com o nome padrão) e chama `updateTag('features')`, que expira o cache na hora.

### Leitura das features no site

- `getFeatures()` e `isFeatureEnabled(key)` (`src/lib/features.ts`) usam `'use cache'`, `cacheTag('features')` e `cacheLife('max')`. Sem linha no banco, a feature é ativa.
- **Compra antecipada desativada:** a seção `CompraAntecipada` some da home; `/compra-antecipada` responde 404 (`notFound()`); `POST /api/tickets/quote` e `POST /api/tickets/checkout` respondem 403 "Compra antecipada indisponível no momento.". A confirmação (`/compra-antecipada/confirmacao/[shortCode]`), o webhook do Stripe e a operação no admin continuam funcionando. A variável de ambiente `ADVANCE_PURCHASE_ENABLED` não existe mais.
- **Orçamento de festa desativado:** `/orcamento` responde 404 (`notFound()`); `GET /api/party-budget/availability`, `GET /api/party-budget/quote` e `POST /api/party-budget/reservations` respondem 403 "Orçamento de festa indisponível no momento." antes de qualquer validação; o CTA `ctaBudget` some da seção Festas (prop `budgetEnabled`), que continua visível com galeria e `ctaPrices`. `/c/<token>`, `/api/client/contract/*` e o admin não são afetados.

### Salvamento (`updateSettings`)

- Recebe `{ key, value }[]` e faz `upsert` de cada item por `key`, em paralelo.
- Não valida chaves (aceita qualquer `key`) nem valores (nem o rating entre 1 e 5 no servidor).
- Valor vazio é gravado como string vazia (não remove a linha).
- Depois de gravar, invalida o cache com `revalidateTag(tag, 'max')` para as tags mapeadas:

| Chaves                                                                     | Tag               |
| -------------------------------------------------------------------------- | ----------------- |
| `google_places_api_key`, `google_place_id`, `google_testimonials_minimum_rating` | `google-reviews`  |
| `instagram_access_token`, `instagram_url`                                  | `instagram-posts` |
| `stripe_publishable_key`, `stripe_secret_key`, `stripe_webhook_secret`     | `stripe-config`   |

- A tag `stripe-config` não é usada por nenhum `fetch` ou cache no código, então invalidá-la não tem efeito. O Stripe lê do banco a cada chamada.

### Consumo pelas integrações

- **Google (`GET /api/reviews`):**
  - lê `google_places_api_key`, `google_place_id` e `google_testimonials_minimum_rating` do banco;
  - sem API key ou em caso de erro, responde `[]`;
  - sem `google_place_id`, procura o lugar por texto ("Divercity Park Maringá");
  - filtra avaliações com `rating >= minRating` (padrão 4);
  - cache do `fetch` com tag `google-reviews`.
- **Instagram (`GET /api/instagram`):**
  - lê `instagram_access_token` e `instagram_url`;
  - `instagram_url` assume `https://www.instagram.com/divercity.park` quando a chave não existe;
  - sem token, ou se a API falhar ou não retornar posts, responde 6 posts de fallback (imagens `placehold.co`) com `permalink` apontando para a URL do perfil;
  - cache do `fetch` com tag `instagram-posts`; busca até 12 posts.
- **Stripe (`src/lib/stripe.ts`):**
  - `getStripeClient()` lê `stripe_secret_key` do banco e lança erro "Stripe não configurado. Cadastre as credenciais em /admin/settings." se ausente;
  - `getStripeWebhookSecret()` lê `stripe_webhook_secret` e lança erro equivalente se ausente;
  - mantém em memória o último cliente criado, reaproveitado enquanto a secret key não muda;
  - usado por `api/tickets/checkout`, `api/tickets/confirmation/[shortCode]` e `api/webhooks/stripe`.

### Renovação do token do Instagram

- `vercel.json` agenda `GET /api/cron` todo dia às 00:00.
- `/api/cron`:
  - executa `SELECT keep_alive()` todo dia para evitar hibernação do Supabase;
  - no dia 1 do mês, renova o token do Instagram:
    - sem token em `settings`, pula;
    - com token, chama `graph.instagram.com/refresh_access_token` e grava o novo valor em `instagram_access_token`;
    - em caso de erro, registra no resultado e no log.
- `GET /api/cron/refresh-instagram-token` renova o token a qualquer momento: responde `{ ok: false }` com status 500 se não há token ou se a API falha, e `{ ok: true }` em caso de sucesso. Não está agendada em `vercel.json`.
- Nenhum dos dois crons verifica autenticação (`CRON_SECRET` não é usado).
- A renovação grava direto no banco e não invalida a tag `instagram-posts`.

### Seed

- `prisma/seed.ts` (`seedStripeSettings`) grava `stripe_secret_key`, `stripe_publishable_key` e `stripe_webhook_secret` em `settings` a partir de `SEED_STRIPE_SECRET_KEY`, `SEED_STRIPE_PUBLISHABLE_KEY` e `SEED_STRIPE_WEBHOOK_SECRET` do `.env.local`, só para as variáveis definidas. É atalho de setup local; em runtime o app não lê dessas variáveis.

## 3. Anexos e referências

Nenhum.

## 4. Pontos em aberto

- Features:
  - Links do CMS (menu da Navbar, CTAs do Hero) que apontem para `#compra-antecipada` ou `/orcamento` não são escondidos automaticamente; dependem de ajuste manual no CMS.
  - O link "voltar à compra" da confirmação (`ConfirmationView`, pagamento falhou) leva a 404 quando a compra antecipada está desativada.
  - Atualizar os specs de `party-contracts` e `ticket-in-advance` (via `/update-feature-spec`) para registrar o controle por Features.

- Bugs e riscos observados no código (descritos, não corrigidos):
  - `updateSettings` não checa sessão nem role e aceita qualquer chave.
  - `page.tsx` envia ao client o valor em texto puro de todos os segredos (Stripe, Google, Instagram), e eles ficam guardados sem criptografia.
  - `/api/cron` e `/api/cron/refresh-instagram-token` não verificam autenticação.
  - `/api/cron/refresh-instagram-token` fica exposta publicamente e não está agendada, o que pode ser sobra de versão anterior.
  - A renovação do token (ambos os crons) não invalida a tag `instagram-posts`.
  - A tag `stripe-config` é invalidada, mas ninguém a consome.
  - Mensagem de erro do `refresh-instagram-token` ainda cita `INSTAGRAM_ACCESS_TOKEN` (env), embora a leitura seja do banco.
- `stripe_publishable_key` é gravada e editável, mas nada no código a consome. Confirmar se deve ser usada (ex.: checkout no cliente) ou removida da tela.
