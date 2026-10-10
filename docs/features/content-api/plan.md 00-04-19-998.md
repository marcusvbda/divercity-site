# Plano — Content API

Spec: [`docs/features/content-api/spec.md`](./spec.md)

## Diagnóstico (spec × código em 2026-10-10)

| Requisito | Estado |
| --- | --- |
| Página em settings para criar, listar e revogar API tokens (nome, valor exibido uma vez, hash SHA-256, último uso, sem expiração) | Ausente |
| Armazenamento dos tokens (model + migration) | Ausente |
| Autenticação por `Authorization: Bearer <token>` | Ausente |
| `getEntity`: `GET /api/v1/content/[entity]` (lista paginada com filtros) | Ausente |
| `findEntity`: `GET /api/v1/content/[entity]/[id]` (1 registro) | Ausente |
| Entidade `prices` = `Service` (filtros `id`, `name`, `key`; campos `id`, `key`, `name`, `weekdayPrice`, `weekendPrice`), somente leitura | Ausente |
| Swagger UI em `/api-docs` (pública) + `GET /api/v1/openapi.json` (público) | Ausente |

**Contagem:** 7 ausentes · 0 parciais · 0 divergentes · 0 implementados.

## Premissas (assumidas no plano, não decididas pelo usuário)

- **Acesso à página de tokens:** só `admin`. `/admin/settings/*` já é bloqueado para `operator` pelo `proxy.ts`, e as server actions também conferem a role `admin`, no mesmo padrão de `src/app/admin/(panel)/settings/features/actions.ts`.
- **Filtro `name`:** busca por trecho sem diferenciar maiúsculas (`contains`, `mode: 'insensitive'`), igual à busca do admin em `src/app/api/admin/services/route.ts`.
- **Filtro `id`:** igualdade (inteiro). **Filtro `key`:** igualdade exata.
- **Paginação:** query `page` (padrão 1) e `perPage` (padrão 15, máximo 100); ordenação fixa por `name asc`. Resposta: `{ data, pagination: { page, perPage, total, totalPages } }`, no mesmo formato das rotas admin.
- **`findEntity`:** resposta `{ data: <registro> }`.
- **Erros (JSON `{ error: string }`):** 401 `"Token inválido"` para token ausente, desconhecido ou revogado; 404 `"Entidade não encontrada"` para `entity` não registrada; 404 `"Registro não encontrado"` para id inexistente; 400 com detalhes para filtro, paginação ou id inválido (ex.: `id=abc`). Parâmetros de query desconhecidos são ignorados.
- **Preços:** `weekdayPrice` e `weekendPrice` são serializados como string decimal (`"80.00"`), igual ao JSON atual do Prisma `Decimal` nas rotas admin.
- **Formato do token:** `dvc_` + 32 bytes aleatórios em base64url (`crypto.randomBytes`). O banco guarda o `tokenHash` (SHA-256 hex, único) e um `tokenPrefix` (primeiros 8 caracteres após `dvc_`) para identificar o token na lista.
- **Revogação:** grava `revokedAt` em vez de apagar a linha. Token revogado responde 401. A lista mostra ativos e revogados (badge "Revogado").
- **Último uso:** `lastUsedAt` é atualizado a cada request autenticado, sem bloquear a resposta (falha ao gravar não derruba a request).
- **Registry de entidades:** o mapeamento `entity → model/filtros/campos` fica num registry em código (`src/lib/content-api/entities.ts`), para que novas entidades entrem sem criar rotas.
- **OpenAPI:** documento 3.1 escrito em código (`src/lib/content-api/openapi.ts`). Os schemas dos parâmetros podem vir de `z.toJSONSchema` (Zod 4). A Swagger UI usa `swagger-ui-react` (dependência nova), carregada só no client.
- **CORS:** sem headers CORS por enquanto (o consumo previsto é servidor a servidor). Se precisar de consumo pelo browser, isso vira um ponto novo no spec.

## Antes de começar (ação do usuário)

- ⚠️ `prisma/migrations/20261010120000_features/migration.sql` (não versionado, da feature site-settings) começa com 2 linhas de log do dotenv (`◇ injected env (26) from .env.local …`), que não são SQL válido. Remova essas linhas antes de aplicar qualquer migration, inclusive a da Fase 1. A causa provável é o `prisma migrate diff` imprimindo o log do dotenv no stdout. A Fase 1 já leva isso em conta.

---

- [x] Fase 1 — Model `ApiToken` e migration

**Camadas:** dados · **Agente:** `backend`

**Requisitos atendidos:** "o banco guarda apenas o hash SHA-256"; "a página lista os tokens (nome, criação, último uso) e permite revogar"; "tokens não expiram".

**Origem:** diferença spec × código.

**Gap → desejado:** não existe tabela de tokens → model `ApiToken` em `prisma/schema.prisma`, com tabela `api_tokens`:

```prisma
model ApiToken {
  id          String    @id @default(cuid())
  name        String
  tokenHash   String    @unique
  tokenPrefix String
  lastUsedAt  DateTime?
  revokedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("api_tokens")
}
```

**Arquivos:** `prisma/schema.prisma`, `prisma/migrations/<YYYYMMDDHHMMSS>_api_tokens/migration.sql` (timestamp depois de `20261010120000`).

**Migration:** sim. Cria a tabela `api_tokens` com índice único em `tokenHash`, sem efeito em registros existentes. Gere com `npx prisma migrate diff --from-schema <scratchpad>/schema.before.prisma --to-schema prisma/schema.prisma --script`, seguindo `.claude/skills/prisma/SKILL.md`. **Confira se o arquivo começa com SQL (`-- CreateTable`) e remova qualquer linha de log do dotenv (`◇ injected env …`).** Não aplicar a migration: quem aplica é o usuário.

**Pronto quando:** `npx prisma validate` e `npx prisma generate` passam, o `migration.sql` contém só SQL válido e `npx tsc --noEmit` continua limpo.

**Como verificar:** `npx prisma validate`; `npx prisma generate`; `head -3` do `migration.sql`; `npx tsc --noEmit`.

**Ação do usuário:** aplicar a migration (depois de corrigir a migration `20261010120000_features`).

Arquivos alterados:

- `prisma/schema.prisma` (model `ApiToken` acrescentado ao final)
- `prisma/migrations/20261010130000_api_tokens/migration.sql` (novo; não aplicado)

---

- [x] Fase 2 — Autenticação por token e rotas `getEntity` / `findEntity`

**Camadas:** regra + API · **Agente:** `backend`

**Requisitos atendidos:** "Com o token, o usuário acessa duas URLs de API: `getEntity` e `findEntity`"; "`getEntity`: lista paginada, com filtros"; "`findEntity`: recebe apenas o id e retorna apenas 1 registro"; "somente leitura"; "rota única com valores dinâmicos (entity + filtros)"; "`prices` = `Service`, filtros `id`, `name`, `key`; campos `id`, `key`, `name`, `weekdayPrice`, `weekendPrice`"; "token no header `Authorization: Bearer <token>`".

**Origem:** diferença spec × código.

**Gap → desejado:** nada existe →

1. `src/lib/content-api/tokens.ts`:
   - `generateApiToken()` → `{ token, tokenHash, tokenPrefix }` (`dvc_` + 32 bytes base64url; hash SHA-256 hex; prefixo com os 8 primeiros caracteres após `dvc_`);
   - `hashApiToken(token)`;
   - `authenticateApiToken(req: NextRequest)`: lê `Authorization: Bearer <token>`, busca por `tokenHash` com `revokedAt: null` e devolve o token ou `null`. Atualiza `lastUsedAt` sem bloquear a resposta, com `.catch(() => {})`.
2. `src/lib/content-api/entities.ts`: registry `CONTENT_ENTITIES` com a entrada `prices`:
   - schema Zod dos filtros (`id` como inteiro positivo coerced, `name` string, `key` string), mais `page` e `perPage` (padrão 1/15, máximo 100);
   - `buildWhere(filters)` (id igualdade, name `contains` insensitive, key igualdade);
   - `select: { id, key, name, weekdayPrice, weekendPrice }`, `orderBy: { name: 'asc' }`;
   - `parseId` (inteiro positivo; senão 400);
   - funções `list` e `find` com `prisma.service.findMany`, `count` e `findUnique`, com o `select` acima.
3. `src/app/api/v1/content/[entity]/route.ts`: `GET` → autentica (401), resolve a entidade (404 `"Entidade não encontrada"`), valida a query (400 com `error` e `details: z.flattenError`) e responde `{ data, pagination: { page, perPage, total, totalPages } }`.
4. `src/app/api/v1/content/[entity]/[id]/route.ts`: `GET` → autentica, resolve a entidade, valida o id (400) e responde `{ data }` ou 404 `"Registro não encontrado"`.
5. Só `GET` é exportado: outros métodos recebem 405 automático do Next.

Parâmetros de rota no padrão do Next 16 (`{ params }: { params: Promise<{ entity: string; id: string }> }`, com `await params`). Antes de escrever, consultar `node_modules/next/dist/docs/01-app` (route handlers + `cacheComponents`). As rotas leem headers, logo são dinâmicas: não usar `'use cache'` nem `force-dynamic`. `/api/v1/*` não passa pelo `proxy.ts` (o matcher é só `/admin`), então a autorização é só o token.

**Arquivos:** `src/lib/content-api/tokens.ts`, `src/lib/content-api/entities.ts`, `src/app/api/v1/content/[entity]/route.ts`, `src/app/api/v1/content/[entity]/[id]/route.ts`.

**Migration:** não (depende da Fase 1 aplicada).

**Contrato:** não há tela que consuma estas rotas nesta fase. O contrato público é o OpenAPI da Fase 4, que deve refletir exatamente as premissas acima.

**Pronto quando:** as rotas respondem conforme as premissas de paginação e erros. Token revogado ou desconhecido → 401. `entity` diferente de `prices` → 404.

**Como verificar:** `npx tsc --noEmit`; `npx eslint src/lib/content-api src/app/api/v1`. Com `npm run dev` e um token de teste (inserido manualmente pelo usuário ou criado depois da Fase 3):
- `curl -H "Authorization: Bearer <token>" "localhost:3000/api/v1/content/prices?name=sal&perPage=5"` → lista paginada;
- `?key=party_salon` → 1 item;
- `/api/v1/content/prices/<id>` → `{ data }`;
- sem header → 401;
- `/api/v1/content/foo` → 404;
- `/api/v1/content/prices/abc` → 400.

**Ação do usuário:** migration da Fase 1 aplicada.

Arquivos alterados:

- `src/lib/content-api/tokens.ts` (novo)
- `src/lib/content-api/entities.ts` (novo)
- `src/app/api/v1/content/[entity]/route.ts` (novo)
- `src/app/api/v1/content/[entity]/[id]/route.ts` (novo)

---

- [x] Fase 3 — Página de API tokens em settings

**Camadas:** API (server actions) + UI · **Agentes:** `backend` (actions) → `frontend` (página)

**Requisitos atendidos:** "Em settings, uma página para criar API tokens"; "cada token tem um nome"; "o valor é exibido uma única vez, na criação"; "a página lista os tokens (nome, criação, último uso) e permite revogar".

**Origem:** diferença spec × código.

**Gap → desejado:** não existe página → `/admin/settings/api-tokens`, no mesmo padrão de `src/app/admin/(panel)/settings/features/`:

- **backend:** `src/app/admin/(panel)/settings/api-tokens/actions.ts` (`'use server'`):
  - `createApiToken(name: string)`: confere sessão e role `admin` via `getAuthenticatedSession` (padrão de `features/actions.ts`); valida `name` com Zod (trim, 1–80 caracteres); usa `generateApiToken()` da Fase 2; grava; retorna `{ id, name, token }`. O `token` em texto só existe nesse retorno.
  - `revokeApiToken(id: string)`: confere `admin`; grava `revokedAt = now()` se ainda não estiver revogado.
- **frontend:**
  - `page.tsx` (Server Component): `prisma.apiToken.findMany({ orderBy: { createdAt: 'desc' }, select: { id, name, tokenPrefix, createdAt, lastUsedAt, revokedAt } })` → `ApiTokensContent`. **Nunca selecionar `tokenHash`.**
  - `ApiTokensContent.tsx` (Client):
    - título "API tokens" e link para a documentação (`/api-docs`, Fase 4);
    - botão "Novo token" abre um `Dialog` (`@/components/admin/ui/dialog`) com campo Nome (`Field`/`Input` do kit admin);
    - ao criar, o mesmo dialog mostra o token com botão copiar e o aviso de que ele não será exibido de novo;
    - tabela (`@/components/admin/ui/table`) com Nome, Prefixo (`dvc_xxxxxxxx…`), Criado em, Último uso ("Nunca" se nulo), Status (`Badge` Ativo/Revogado) e ação Revogar (com confirmação, só para os ativos);
    - estado vazio "Nenhum token criado";
    - `useTransition` + `router.refresh()` + `toast` (sonner), como em `FeaturesContent.tsx`;
    - datas em pt-BR.
  - `src/components/admin/layout/nav-config.ts`: adicionar o subitem `{ label: 'API tokens', href: '/admin/settings/api-tokens', activePath: '/admin/settings/api-tokens' }` em "Configurações".
- Usar só o kit `src/components/admin/ui/*` (não importar `@/components/ui/*`) e não adicionar `useMemo`/`useCallback`.

**Arquivos:** `src/app/admin/(panel)/settings/api-tokens/{page.tsx,ApiTokensContent.tsx,actions.ts}`, `src/components/admin/layout/nav-config.ts`.

**Migration:** não.

**Contrato:** não. São server actions, sem endpoint HTTP novo. As assinaturas estão acima.

**Pronto quando:**
- criar um token mostra o valor uma vez e ele funciona nas rotas da Fase 2;
- depois de fechar o dialog, o valor não aparece mais em lugar nenhum;
- revogar muda o status e a rota passa a responder 401;
- `lastUsedAt` aparece depois de uma chamada;
- `operator` é redirecionado (proxy) e as actions recusam quem não é admin.

**Como verificar:** `npx tsc --noEmit`; eslint nos arquivos alterados. `npm run dev` → `/admin/settings/api-tokens`: criar, copiar e testar com `curl` (Fase 2), recarregar para ver "Último uso", revogar e repetir o `curl` (401).

**Ação do usuário:** nenhuma.

Arquivos alterados:

- `src/app/admin/(panel)/settings/api-tokens/actions.ts` (novo)
- `src/app/admin/(panel)/settings/api-tokens/page.tsx` (novo)
- `src/app/admin/(panel)/settings/api-tokens/ApiTokensContent.tsx` (novo)
- `src/components/admin/layout/nav-config.ts` (subitem "API tokens")

---

- [x] Fase 4 — Documentação Swagger (OpenAPI)

**Camadas:** API + UI · **Agentes:** `backend` (OpenAPI + rota) → `frontend` (Swagger UI)

**Requisitos atendidos:** "Swagger UI em `/api-docs`, pública, com 'Authorize' (Bearer) para testar as rotas"; "documento OpenAPI em `GET /api/v1/openapi.json`, público".

**Origem:** diferença spec × código (pedido do usuário durante o `/plan-feature`).

**Gap → desejado:** sem documentação →

- **backend:**
  - `src/lib/content-api/openapi.ts`: `buildOpenApiDocument()`, que retorna um OpenAPI 3.1 com:
    - `info` ("Divercity Content API", versão `1.0.0`);
    - `servers: [{ url: '/' }]`;
    - `securitySchemes.bearerAuth` (`type: http, scheme: bearer`) com `security` global;
    - paths gerados a partir do registry `CONTENT_ENTITIES` da Fase 2: `GET /api/v1/content/prices` (query `id`, `name`, `key`, `page`, `perPage` com descrições: `name` é busca por trecho, `perPage` vai até 100) e `GET /api/v1/content/prices/{id}`;
    - schemas `Price` (`id` integer, `key` string nullable, `name` string, `weekdayPrice`/`weekendPrice` string decimal), `Pagination`, `PriceList`, `PriceItem` e `Error`;
    - respostas 200/400/401/404 conforme as premissas.
    Pode usar `z.toJSONSchema` nos schemas Zod do registry para não duplicar a definição dos filtros.
  - `src/app/api/v1/openapi.json/route.ts`: `GET` público que retorna `buildOpenApiDocument()`. Pode ser estático (sem request data).
- **frontend:**
  - instalar `swagger-ui-react` (+ `@types/swagger-ui-react` se necessário);
  - `src/app/admin/(panel)/settings/api-tokens/docs/page.tsx` (título "Documentação da API") renderizando um Client Component `SwaggerDocs.tsx`, que carrega `swagger-ui-react` só no client (`next/dynamic` com `ssr: false` dentro do Client Component) e importa `swagger-ui-react/swagger-ui.css`;
  - a Swagger UI usa `url="/api/v1/openapi.json"`, com `persistAuthorization` e "Try it out" funcionando contra as rotas reais via Bearer;
  - a página fica sob `/admin/settings`, então já é só admin pelo `proxy.ts`.
  - Link "Documentação" na página da Fase 3 (se a Fase 3 ainda não tiver o link).

**Arquivos:** `src/lib/content-api/openapi.ts`, `src/app/api/v1/openapi.json/route.ts`, `src/app/api-docs/{page.tsx,SwaggerDocs.tsx}`, `package.json`/`package-lock.json`.

**Migration:** não.

**Contrato:** o próprio `openapi.json` é o contrato. Ele precisa bater com o comportamento real das rotas da Fase 2 (o `reviewer` confere campo a campo).

**Pronto quando:**
- `GET /api/v1/openapi.json` responde sem autenticação com um documento válido;
- `/api-docs` mostra as 2 operações;
- "Authorize" com um token + "Try it out" retornam dados reais;
- sem hydration error no console;
- `operator` não acessa a página.

**Como verificar:** `npx tsc --noEmit`; eslint nos arquivos alterados; `curl localhost:3000/api/v1/openapi.json | jq .paths`; validar o JSON (ex.: colar em editor.swagger.io ou `npx @redocly/cli lint` sem instalar no projeto). `npm run dev` → abrir a página, autorizar e executar as duas operações.

**Ação do usuário:** nenhuma.

Arquivos alterados:

- `src/lib/content-api/openapi.ts` (novo)
- `src/app/api/v1/openapi.json/route.ts` (novo)
- `src/app/api-docs/page.tsx` (novo; movido para rota pública a pedido do usuário)
- `src/app/api-docs/SwaggerDocs.tsx` (novo)
- `package.json`, `package-lock.json` (`swagger-ui-react`, `@types/swagger-ui-react`; o lock também subiu `axios` e `js-yaml` transitivos)
- `yarn.lock` (atualizado pelo `npm install`; reverter se o projeto usa só npm)
